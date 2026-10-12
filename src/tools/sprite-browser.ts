import { themeRegistry } from "../game/content/theme-registry";
import type { ContentId } from "../game/core/archetypes/ids";
import type { SpriteDefinition, SpriteState, ThemeManifest } from "../game/core/archetypes/contracts";
import { runtimeFrame } from "../game/systems/sprites/runtime-sprite";
import { difficultyIds, type DifficultyId } from "../game/core/archetypes/difficulty";
import { resolveDifficultyTheme } from "../game/systems/difficulty/resolve-difficulty";
import { contentStatRows } from "./content-stats";
import "./sprite-browser.css";

type Verdict = "unreviewed" | "good" | "bad" | "review";
interface Review { verdict: Verdict; note: string }
interface Entry { id: ContentId; name: string; category: string; diameter: number; sprite?: SpriteDefinition }
interface AtlasFrame { frame: { x: number; y: number; w: number; h: number } }
const root = document.querySelector<HTMLDivElement>("#sprite-browser")!;
root.innerHTML = `<header><h1>Sprite browser</h1><p>Inspect every pose, compare the set, and record what needs fixing. Reviews do not change game assets.</p></header>
<nav><label>Theme <select id="theme"></select></label><label>Search <input id="search" placeholder="Name or stable ID"></label><label>Art <select id="art"><option value="all">All content</option><option value="sprite" selected>Sprites</option><option value="fallback">Missing sprite / fallback</option></select></label><label>Review <select id="filter"><option value="all">All reviews</option><option>unreviewed</option><option>good</option><option>bad</option><option>review</option></select></label><label>Set pose <select id="pose"><option>idle</option><option>move</option><option>hit</option><option>death</option></select></label><button id="export">Export reviews</button><a href="/build/ARCHITECTURE_MAP.html">Architecture atlas</a><a href="/">Back to game</a></nav>
<p id="summary" role="status"></p><main><section id="set" aria-label="Sprite set"></section><aside id="detail" aria-label="Selected sprite"></aside></main>`;
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const themeSelect = element<HTMLSelectElement>("theme");
const difficultyLabel = document.createElement("label"); difficultyLabel.textContent = "Starting difficulty";
const difficultySelect = document.createElement("select"); difficultySelect.id = "difficulty";
for (const id of difficultyIds) difficultySelect.add(new Option(id, id));
difficultySelect.value = "normal"; difficultyLabel.append(difficultySelect);
root.querySelector("nav")!.prepend(difficultyLabel);
difficultySelect.onchange = () => { stop(); renderDetail(); };
for (const pack of themeRegistry) themeSelect.add(new Option(pack.key, pack.theme.id));
themeSelect.value = "eco_guardian";
let selected: ContentId | undefined;
let timer: number | undefined;
let frame = 0;
let zoom = 8;
let mirrored = false;
let statsExpanded = false;
const reviews: Record<string, Review> = {};
const storageKey = "arena-sprite-reviews-v1";
try {
  const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
  if (parsed && typeof parsed === "object") for (const [key, value] of Object.entries(parsed)) {
    if (value && typeof value === "object" && "verdict" in value && ["unreviewed", "good", "bad", "review"].includes(String(value.verdict))) {
      reviews[key] = { verdict: value.verdict as Verdict, note: "note" in value && typeof value.note === "string" ? value.note.slice(0, 4000) : "" };
    }
  }
} catch { /* Reviews still work in memory if browser storage is unavailable. */ }
const assets = new Map<string, Promise<{ image: HTMLImageElement; frames?: Record<string, AtlasFrame> }>>();
const theme = (): ThemeManifest => themeRegistry.find(({ theme }) => theme.id === themeSelect.value)!.theme;
const reviewKey = (id: ContentId) => `${theme().id}:${id}`;
const review = (id: ContentId): Review => reviews[reviewKey(id)] ?? { verdict: "unreviewed", note: "" };
function entries(): Entry[] {
  const pack = theme();
  return [pack.characters, pack.enemies, pack.weapons, pack.pickups, pack.shrines, pack.hazards].flatMap((definitions) =>
    definitions.map((definition) => ({ id: definition.id, name: pack.copy.content[definition.id]?.name ?? definition.id,
      category: definition.id.split(".")[0]!, diameter: "displayDiameter" in definition ? definition.displayDiameter : "radius" in definition ? definition.radius * 2 : 32,
      sprite: pack.tokens.sprites?.[definition.id] })),
  );
}
function asset(sprite: SpriteDefinition) {
  if (!assets.has(sprite.path)) assets.set(sprite.path, (async () => {
    const image = new Image(); image.src = `/${sprite.path}`; await image.decode();
    const frames = sprite.path.endsWith("/atlas.png")
      ? (await fetch(`/${sprite.path.replace(/\.png$/, ".json")}`).then((response) => { if (!response.ok) throw new Error("Atlas unavailable"); return response.json(); })).frames as Record<string, AtlasFrame>
      : undefined;
    return { image, frames };
  })());
  return assets.get(sprite.path)!;
}
async function draw(canvas: HTMLCanvasElement, entry: Entry, index: number, scale: number, flip = false) {
  const context = canvas.getContext("2d")!;
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!entry.sprite) return;
  try {
    const { image, frames } = await asset(entry.sprite);
    if (!canvas.isConnected) return;
    const source = frames?.[String(runtimeFrame(entry.sprite, index))]?.frame ?? {
      x: index * entry.sprite.frameWidth, y: 0, w: entry.sprite.frameWidth, h: entry.sprite.frameHeight,
    };
    if (frames && !frames[String(runtimeFrame(entry.sprite, index))]) throw new Error("Missing atlas frame");
    context.imageSmoothingEnabled = false;
    context.save(); context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(flip ? -1 : 1, 1);
    context.drawImage(image, source.x, source.y, source.w, source.h, -source.w * scale / 2, -source.h * scale / 2, source.w * scale, source.h * scale);
    context.restore(); canvas.dataset.frame = String(index); canvas.dataset.loaded = "true";
  } catch (error) { canvas.dataset.loaded = "error"; canvas.title = String(error); element("summary").textContent = `Asset error: ${String(error)}`; }
}
function save(entry: Entry, patch: Partial<Review>) {
  reviews[reviewKey(entry.id)] = { ...review(entry.id), ...patch };
  try { localStorage.setItem(storageKey, JSON.stringify(reviews)); } catch { /* Export remains available. */ }
  renderSet();
}
function stop() { if (timer !== undefined) window.clearInterval(timer); timer = undefined; }
function renderSet() {
  const search = element<HTMLInputElement>("search").value.toLowerCase();
  const art = element<HTMLSelectElement>("art").value;
  const verdict = element<HTMLSelectElement>("filter").value;
  const state = element<HTMLSelectElement>("pose").value as SpriteState;
  const roster = entries();
  const visible = roster.filter((entry) => `${entry.name} ${entry.id}`.toLowerCase().includes(search) &&
    (art === "all" || Boolean(entry.sprite) === (art === "sprite")) && (verdict === "all" || review(entry.id).verdict === verdict));
  const set = element("set"); set.replaceChildren();
  for (const entry of visible) {
    const card = document.createElement("button"); card.className = "card"; card.dataset.id = entry.id;
    card.classList.toggle("selected", selected === entry.id);
    const canvas = document.createElement("canvas"); canvas.width = 192; canvas.height = 160;
    const title = document.createElement("strong"); title.textContent = entry.name;
    const subtitle = document.createElement("small"); subtitle.textContent = `${entry.id} · ${review(entry.id).verdict}`;
    const badge = document.createElement("span"); badge.textContent = entry.sprite ? entry.sprite.atlasFrameKey ? "Reused accepted pose" : "Sprite" : "Primitive fallback";
    card.append(canvas, title, subtitle, badge);
    card.onclick = () => { stop(); selected = entry.id; frame = entry.sprite?.states[state] ?? 0; renderSet(); renderDetail(); };
    set.append(card);
    if (entry.sprite) void draw(canvas, entry, entry.sprite.states[state], entry.diameter * 2 / entry.sprite.frameWidth);
    else { const ctx = canvas.getContext("2d")!; ctx.fillStyle = "#879d99"; ctx.font = "14px system-ui"; ctx.fillText("No sprite authored", 28, 86); }
  }
  element("summary").textContent = `${visible.length} shown · ${roster.filter((entry) => entry.sprite).length} sprite bindings · ${roster.filter((entry) => !entry.sprite).length} fallbacks. Set shown at game proportions and 2× world zoom.`;
}
function renderDetail() {
  const detail = element("detail");
  // Read the live state before replacing it: native toggle events can arrive
  // after a difficulty change, so the queued event alone is not authoritative.
  const previousStats = detail.querySelector<HTMLDetailsElement>("#stats-panel");
  if (previousStats) statsExpanded = previousStats.open;
  detail.replaceChildren();
  const entry = entries().find((entry) => entry.id === selected);
  if (!entry) { detail.textContent = "Select a sprite to freeze, step through frames, animate, or review."; return; }
  const title = document.createElement("h2"); title.textContent = entry.name;
  const metadata = document.createElement("p"); metadata.className = "metadata";
  metadata.textContent = entry.sprite ? `${entry.id} · ${entry.sprite.frameWidth}×${entry.sprite.frameHeight} · ${entry.sprite.frames} poses · world diameter ${entry.diameter}\nFacing: ${entry.sprite.authoredFacing ?? "legacy left"}${entry.sprite.atlasFrameKey ? `\nReused row: ${entry.sprite.atlasFrameKey}` : ""}` : `${entry.id}\nPrimitive fallback; no bitmap exists yet.`;
  detail.append(title, metadata);
  const rows = contentStatRows(resolveDifficultyTheme(theme(), difficultySelect.value as DifficultyId), entry.id);
  if (rows.length) {
    const stats = document.createElement("details"); stats.id = "stats-panel"; stats.open = statsExpanded;
    stats.ontoggle = () => { if (stats.isConnected) statsExpanded = stats.open; };
    const heading = document.createElement("summary");
    const health = rows.find((row) => row.label === theme().copy.stats.health);
    const hits = rows.find((row) => row.label === "Starter hits (non-critical)");
    heading.textContent = `Starting stats${health ? ` · ${health.label} ${Number(health.value.toFixed(2))}` : ""}${hits ? ` · Starter hits ${hits.value}` : ""}`;
    const scope = document.createElement("p"); scope.className = "metadata";
    scope.textContent = `Ordinary starting values before time, site pressure, elites or upgrades. Rates use simulation seconds (gameplay rate ${theme().tuning.pace.gameplayRate}×).`;
    const table = document.createElement("table"); table.id = "content-stats"; table.ariaLabel = "Starting stats";
    for (const row of rows) {
      const tr = document.createElement("tr"); const label = document.createElement("th"); label.scope = "row"; label.textContent = row.label;
      const value = document.createElement("td"); value.textContent = `${Number(row.value.toFixed(2))}${row.unit ? ` ${row.unit}` : ""}`;
      tr.append(label, value); table.append(tr);
    }
    stats.append(heading, scope, table); detail.append(stats);
  }
  if (entry.sprite) {
    const sprite = entry.sprite;
    const stage = document.createElement("div"); stage.className = "stage checker";
    const canvas = document.createElement("canvas"); canvas.id = "selected-pose"; canvas.width = 480; canvas.height = 480; stage.append(canvas);
    const caption = document.createElement("p"); caption.id = "frame-caption";
    const redraw = () => { caption.textContent = `Frame ${frame} · ${Object.entries(sprite.states).filter(([, value]) => value === frame).map(([state]) => state).join(" / ") || "walk / extra pose"}`; void draw(canvas, entry, frame, zoom, mirrored); };
    const controls = document.createElement("div"); controls.className = "controls";
    const button = (text: string, action: () => void) => { const button = document.createElement("button"); button.textContent = text; button.onclick = action; controls.append(button); };
    button("Previous frame", () => { stop(); frame = (frame + sprite.frames - 1) % sprite.frames; redraw(); });
    button("Next frame", () => { stop(); frame = (frame + 1) % sprite.frames; redraw(); });
    button("Play walk", () => { stop(); const cycle = sprite.walkAnimation?.frames ?? [sprite.states.idle, sprite.states.move]; let step = 0;
      timer = window.setInterval(() => { frame = cycle[step++ % cycle.length]!; redraw(); }, 1000 / Number(element<HTMLInputElement>("fps").value)); });
    button("Pause", stop);
    button("Mirror", () => { mirrored = !mirrored; redraw(); });
    const speed = document.createElement("label"); speed.textContent = "FPS "; const fps = document.createElement("input"); fps.id = "fps"; fps.type = "number"; fps.min = "1"; fps.max = "30"; fps.value = "5"; fps.onchange = () => { fps.value = String(Math.min(30, Math.max(1, Number(fps.value) || 5))); stop(); }; speed.append(fps); controls.append(speed);
    const magnification = document.createElement("select"); magnification.ariaLabel = "Zoom"; for (const value of [1, 2, 4, 8]) magnification.add(new Option(`${value}× native`, String(value))); magnification.value = String(zoom); magnification.onchange = () => { zoom = Number(magnification.value); redraw(); }; controls.append(magnification);
    const background = document.createElement("select"); background.ariaLabel = "Background"; for (const name of ["checker", "dark", "light"]) background.add(new Option(name)); background.onchange = () => { stage.className = `stage ${background.value}`; }; controls.append(background);
    detail.append(stage, caption, controls);
    const strip = document.createElement("div"); strip.className = "strip";
    for (let index = 0; index < sprite.frames; index += 1) {
      const item = document.createElement("button"); item.ariaLabel = `Frame ${index}`;
      const thumbnail = document.createElement("canvas"); thumbnail.width = 112; thumbnail.height = 112;
      const label = document.createElement("span"); label.textContent = String(index); item.append(thumbnail, label);
      item.onclick = () => { stop(); frame = index; redraw(); }; strip.append(item); void draw(thumbnail, entry, index, 2);
    }
    detail.append(strip); redraw();
  }
  const assessment = document.createElement("select"); assessment.ariaLabel = "Assessment";
  for (const value of ["unreviewed", "good", "bad", "review"]) assessment.add(new Option(value));
  assessment.value = review(entry.id).verdict; assessment.onchange = () => save(entry, { verdict: assessment.value as Verdict });
  const note = document.createElement("textarea"); note.ariaLabel = "Review notes"; note.placeholder = "Artifacts, facing, silhouette, consistency…"; note.value = review(entry.id).note; note.maxLength = 4000; note.onchange = () => save(entry, { note: note.value });
  detail.append(assessment, note);
}
for (const id of ["theme", "search", "art", "filter", "pose"]) element(id).addEventListener("input", () => { stop(); renderSet(); if (id === "theme") { selected = undefined; renderDetail(); } });
element("export").onclick = () => {
  const blob = new Blob([JSON.stringify({ version: 1, reviewedAt: new Date().toISOString(), reviews }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "arena-sprite-reviews.json"; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
window.addEventListener("pagehide", stop);
document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
renderSet(); renderDetail();
