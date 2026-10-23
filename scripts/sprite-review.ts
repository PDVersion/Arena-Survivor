/** Build an explicitly configured review sheet without writing accepted/public assets.
 * npx vite-node scripts/sprite-review.ts build/sprites/raw/{id}.aN.review.json
 */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  buildSpriteSheet, checkSpriteSheet, readSpritePng, type SpriteBuildDefinition,
} from "../src/game/systems/sprites/sprite-pipeline";

const recipePath = process.argv[2];
if (!recipePath) throw new Error("Pass a review recipe JSON path");
const recipe: SpriteBuildDefinition = JSON.parse(await readFile(recipePath, "utf8"));
if (!recipe.output.startsWith("build/sprites/review/") || recipe.acceptedOutput
  || recipe.atlasOutput || recipe.atlasJsonOutput) {
  throw new Error("Review conversion must write only build/sprites/review/");
}
await buildSpriteSheet(recipe);
const issues = await checkSpriteSheet(recipe);
if (issues.length) throw new Error(issues.join("\n"));
const image = await readSpritePng(recipe.output);
const frames = Array.from({ length: recipe.frames }, (_, frame) => {
  let left = recipe.frameWidth, right = -1, top = image.height, bottom = -1;
  let opaquePixels = 0;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < recipe.frameWidth; x += 1) {
      if (!image.data[(y * image.width + frame * recipe.frameWidth + x) * 4 + 3]) continue;
      opaquePixels += 1;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  return { frame, left, top, width: right - left + 1, height: bottom - top + 1, opaquePixels };
});
const digest = async (path: string) => createHash("sha256").update(await readFile(path)).digest("hex");
const report = { source: recipe.source, sourceSha256: await digest(recipe.source),
  output: recipe.output, outputSha256: await digest(recipe.output),
  width: image.width, height: image.height, issues, frames, recipe };
await writeFile(recipe.output.replace(/\.png$/, ".checks.json"), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
