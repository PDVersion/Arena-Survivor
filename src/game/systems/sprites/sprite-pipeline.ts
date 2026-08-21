import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

export interface SpriteBuildDefinition {
  readonly source: string;
  readonly output: string;
  readonly atlasOutput?: string;
  readonly atlasJsonOutput?: string;
  readonly contentId: string;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly frames: number;
}

interface Bounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const alphaDetectionThreshold = 32;
const opaqueThreshold = 128;
const frameInset = 2;

// The Plastic Bottle has two material regions. Each is snapped to exactly four
// values, as required by SPRITE_STYLE_GUIDE.md §2. The blue base is the theme's
// exact enemy token; the neutral ramp is for the cap and label.
const blueRamp = ["#173b73", "#356fae", "#60a5fa", "#9ac8fb"] as const;
const neutralRamp = ["#4b5563", "#9ca3af", "#e2e8f0", "#f8fafc"] as const;
const allowedPalette = [...blueRamp, ...neutralRamp] as const;
const outline = hexToRgb(blueRamp[0]);
const palette = allowedPalette.map(hexToRgb);

export async function buildSpriteSheet(definition: SpriteBuildDefinition): Promise<void> {
  const source = await readPng(definition.source);
  const bounds = detectHorizontalFrames(source.data, source.width, source.height);
  if (bounds.length !== definition.frames) {
    throw new Error(
      `${definition.contentId}: expected ${definition.frames} horizontal subjects, found ${bounds.length}`,
    );
  }

  const contentWidth = definition.frameWidth - frameInset * 2;
  const contentHeight = definition.frameHeight - frameInset * 2;
  const scale = Math.min(
    contentWidth / Math.max(...bounds.map((entry) => entry.width)),
    contentHeight / Math.max(...bounds.map((entry) => entry.height)),
  );
  const sheetWidth = definition.frameWidth * definition.frames;
  const composed = Buffer.alloc(sheetWidth * definition.frameHeight * 4);
  for (const [index, entry] of bounds.entries()) {
    const width = Math.max(1, Math.round(entry.width * scale));
    const height = Math.max(1, Math.round(entry.height * scale));
    const left = index * definition.frameWidth + Math.floor((definition.frameWidth - width) / 2);
    const top = Math.floor((definition.frameHeight - height) / 2);
    blitNearest(source, entry, composed, sheetWidth, left, top, width, height);
  }
  const snapped = snapPaletteAndCloseOutline(composed, sheetWidth, definition.frameHeight);

  await mkdir(dirname(definition.output), { recursive: true });
  await writePng(definition.output, snapped, sheetWidth, definition.frameHeight);

  if (definition.atlasOutput) {
    await mkdir(dirname(definition.atlasOutput), { recursive: true });
    await writePng(definition.atlasOutput, snapped, sheetWidth, definition.frameHeight);
  }
  if (definition.atlasJsonOutput) {
    await mkdir(dirname(definition.atlasJsonOutput), { recursive: true });
    const states = ["idle", "move", "hit", "death"];
    const frames = Object.fromEntries(
      states.slice(0, definition.frames).map((state, index) => [
        `${definition.contentId}/${state}`,
        {
          frame: {
            x: index * definition.frameWidth,
            y: 0,
            w: definition.frameWidth,
            h: definition.frameHeight,
          },
          rotated: false,
          trimmed: false,
          spriteSourceSize: {
            x: 0,
            y: 0,
            w: definition.frameWidth,
            h: definition.frameHeight,
          },
          sourceSize: { w: definition.frameWidth, h: definition.frameHeight },
        },
      ]),
    );
    await writeFile(
      definition.atlasJsonOutput,
      `${JSON.stringify({ frames, meta: { image: "atlas.png", format: "RGBA8888" } }, null, 2)}\n`,
      "utf8",
    );
  }
}

export async function checkSpriteSheet(
  definition: SpriteBuildDefinition,
): Promise<readonly string[]> {
  const issues: string[] = [];
  let image: Awaited<ReturnType<typeof readRaw>>;
  try {
    image = await readRaw(definition.output);
  } catch {
    return [`${definition.contentId}: missing built sheet ${definition.output}`];
  }
  const expectedWidth = definition.frameWidth * definition.frames;
  if (image.width !== expectedWidth || image.height !== definition.frameHeight) {
    issues.push(
      `${definition.contentId}: expected ${expectedWidth}x${definition.frameHeight}, got ${image.width}x${image.height}`,
    );
  }

  const seenColours = new Set<string>();
  for (let offset = 0; offset < image.data.length; offset += 4) {
    const alpha = image.data[offset + 3];
    if (alpha !== 0 && alpha !== 255) {
      issues.push(`${definition.contentId}: alpha must be binary`);
      break;
    }
    if (alpha === 255) {
      seenColours.add(rgbKey(image.data[offset]!, image.data[offset + 1]!, image.data[offset + 2]!));
    }
  }
  const allowed = new Set(palette.map(([r, g, b]) => rgbKey(r, g, b)));
  for (const colour of seenColours) {
    if (!allowed.has(colour)) issues.push(`${definition.contentId}: unexpected colour ${colour}`);
  }

  for (let frame = 0; frame < definition.frames; frame += 1) {
    if (!frameHasOpaquePixel(image, definition, frame)) {
      issues.push(`${definition.contentId}: frame ${frame} is empty`);
    }
  }
  if (!hasClosedOutline(image)) {
    issues.push(`${definition.contentId}: silhouette outline is not closed`);
  }
  return issues;
}

async function readRaw(path: string): Promise<{
  readonly data: Buffer;
  readonly width: number;
  readonly height: number;
}> {
  return readPng(path);
}

function blitNearest(
  source: { readonly data: Buffer; readonly width: number },
  bounds: Bounds,
  output: Buffer,
  outputWidth: number,
  left: number,
  top: number,
  width: number,
  height: number,
): void {
  for (let y = 0; y < height; y += 1) {
    const sourceY = bounds.top + Math.min(bounds.height - 1, Math.floor((y * bounds.height) / height));
    for (let x = 0; x < width; x += 1) {
      const sourceX = bounds.left + Math.min(bounds.width - 1, Math.floor((x * bounds.width) / width));
      const sourceOffset = (sourceY * source.width + sourceX) * 4;
      const outputOffset = ((top + y) * outputWidth + left + x) * 4;
      source.data.copy(output, outputOffset, sourceOffset, sourceOffset + 4);
    }
  }
}

function detectHorizontalFrames(data: Buffer, width: number, height: number): Bounds[] {
  const occupiedColumns: number[] = [];
  for (let x = 0; x < width; x += 1) {
    let occupied = false;
    for (let y = 0; y < height; y += 1) {
      if (data[(y * width + x) * 4 + 3]! > alphaDetectionThreshold) {
        occupied = true;
        break;
      }
    }
    if (occupied) occupiedColumns.push(x);
  }
  if (occupiedColumns.length === 0) return [];

  const runs: Array<readonly [number, number]> = [];
  let start = occupiedColumns[0]!;
  let previous = start;
  for (const x of occupiedColumns.slice(1)) {
    if (x > previous + 1) {
      runs.push([start, previous]);
      start = x;
    }
    previous = x;
  }
  runs.push([start, previous]);

  return runs
    .filter(([left, right]) => right - left >= 2)
    .map(([left, right]) => verticalBounds(data, width, height, left, right));
}

function verticalBounds(
  data: Buffer,
  width: number,
  height: number,
  left: number,
  right: number,
): Bounds {
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = left; x <= right; x += 1) {
      if (data[(y * width + x) * 4 + 3]! > alphaDetectionThreshold) {
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function snapPaletteAndCloseOutline(data: Buffer, width: number, height: number): Buffer {
  const output = Buffer.alloc(data.length);
  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset + 3]! < opaqueThreshold) continue;
    const nearest = nearestPaletteColour(data[offset]!, data[offset + 1]!, data[offset + 2]!);
    output[offset] = nearest[0];
    output[offset + 1] = nearest[1];
    output[offset + 2] = nearest[2];
    output[offset + 3] = 255;
  }

  const outlined = Buffer.from(output);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      if (output[offset + 3] !== 255 || !touchesTransparency(output, width, height, x, y)) continue;
      outlined[offset] = outline[0];
      outlined[offset + 1] = outline[1];
      outlined[offset + 2] = outline[2];
    }
  }
  return outlined;
}

function nearestPaletteColour(r: number, g: number, b: number): readonly [number, number, number] {
  let nearest = palette[0]!;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of palette) {
    const distance =
      (candidate[0] - r) ** 2 + (candidate[1] - g) ** 2 + (candidate[2] - b) ** 2;
    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function touchesTransparency(
  data: Buffer,
  width: number,
  height: number,
  x: number,
  y: number,
): boolean {
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const nextX = x + dx;
      const nextY = y + dy;
      if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) return true;
      if (data[(nextY * width + nextX) * 4 + 3] === 0) return true;
    }
  }
  return false;
}

function frameHasOpaquePixel(
  image: { readonly data: Buffer; readonly width: number; readonly height: number },
  definition: SpriteBuildDefinition,
  frame: number,
): boolean {
  const left = frame * definition.frameWidth;
  const right = left + definition.frameWidth;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = left; x < right; x += 1) {
      if (image.data[(y * image.width + x) * 4 + 3] === 255) return true;
    }
  }
  return false;
}

function hasClosedOutline(image: {
  readonly data: Buffer;
  readonly width: number;
  readonly height: number;
}): boolean {
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;
      if (image.data[offset + 3] !== 255) continue;
      if (!touchesTransparency(image.data, image.width, image.height, x, y)) continue;
      if (
        image.data[offset] !== outline[0] ||
        image.data[offset + 1] !== outline[1] ||
        image.data[offset + 2] !== outline[2]
      ) {
        return false;
      }
    }
  }
  return true;
}

function hexToRgb(hex: string): readonly [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbKey(r: number, g: number, b: number): string {
  return `${r},${g},${b}`;
}

async function readPng(path: string): Promise<{
  readonly data: Buffer;
  readonly width: number;
  readonly height: number;
}> {
  const png = await readFile(path);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!png.subarray(0, 8).equals(signature)) throw new Error(`${path}: not a PNG`);

  let width = 0;
  let height = 0;
  const compressed: Buffer[] = [];
  for (let offset = 8; offset < png.length; ) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) {
        throw new Error(`${path}: expected a non-interlaced 8-bit RGBA PNG`);
      }
    }
    if (type === "IDAT") compressed.push(data);
    offset += length + 12;
    if (type === "IEND") break;
  }
  if (width === 0 || height === 0 || compressed.length === 0) {
    throw new Error(`${path}: incomplete PNG`);
  }

  const scanlines = inflateSync(Buffer.concat(compressed));
  const stride = width * 4;
  const output = Buffer.alloc(stride * height);
  let inputOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = scanlines[inputOffset]!;
    inputOffset += 1;
    for (let x = 0; x < stride; x += 1) {
      const raw = scanlines[inputOffset + x]!;
      const left = x >= 4 ? output[y * stride + x - 4]! : 0;
      const above = y > 0 ? output[(y - 1) * stride + x]! : 0;
      const upperLeft = y > 0 && x >= 4 ? output[(y - 1) * stride + x - 4]! : 0;
      output[y * stride + x] = unfilter(raw, filter, left, above, upperLeft);
    }
    inputOffset += stride;
  }
  return { data: output, width, height };
}

function unfilter(raw: number, filter: number, left: number, above: number, upperLeft: number): number {
  if (filter === 0) return raw;
  if (filter === 1) return (raw + left) & 255;
  if (filter === 2) return (raw + above) & 255;
  if (filter === 3) return (raw + Math.floor((left + above) / 2)) & 255;
  if (filter === 4) return (raw + paeth(left, above, upperLeft)) & 255;
  throw new Error(`unsupported PNG filter ${filter}`);
}

function paeth(left: number, above: number, upperLeft: number): number {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

async function writePng(path: string, pixels: Buffer, width: number, height: number): Promise<void> {
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 4 + 1);
    scanlines[rowOffset] = 0;
    pixels.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(scanlines)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
  await writeFile(path, png);
}

function pngChunk(type: string, data: Buffer): Buffer {
  const name = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  name.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([name, data])), data.length + 8);
  return chunk;
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
