import Phaser from "phaser";
import { activeTheme } from "../game/content/active-theme";
import type { ThemeManifest, WeaponDefinition } from "../game/core/archetypes/contracts";
import type { EnemyId, UpgradeId, WeaponId } from "../game/core/archetypes/ids";
import type { TestingAreaController } from "../game/core/testing-area";
import type { DropKind } from "../game/systems/economy/economy";
import { initializeProfile, getProfile, buyImpactUpgrade } from "../game/systems/persistence/profile-service";
import { loadThemeSprites } from "../game/systems/sprites/load-sprites";
import { createGameConfig } from "../game/config";
import { RunScene } from "../game/scenes/run-scene";
import { clearToolBranches, toggleTreeLevel } from "./upgrade-tree";
import { shopCost } from "../game/systems/economy/economy";
import "./testing-area.css";
const theme: ThemeManifest = activeTheme;
const root = document.getElementById("testing-area")!;
root.innerHTML = `<header><h1>Cleanup testing area</h1><p>Build a loadout, place waste, and try it in the real arena.</p><p class="notice">Sandbox progress and Impact stay in this tab. Your normal save is untouched. Level-ups here stay open for manual builds.</p><nav><a href="/">Game</a><a href="/sprite-browser.html">Sprite browser</a><a href="/impact-shop.html">Impact Shop</a><button id="trees-open">Tools &amp; upgrade trees</button></nav></header>
<main class="testing-layout"><aside class="controls">
<section><h2>Run controls</h2><div class="row"><button id="pause">Pause</button><button id="clear">Clear field</button><button id="reset">Reset sandbox</button></div><label class="weapon-label"><input type="checkbox" id="natural"> Natural arrivals</label><label class="weapon-label"><input type="checkbox" id="invincible" checked> Invincible player</label><p class="notice">Move with WASD / arrows. Escape opens the regular pause menu.</p></section>
<section><h2>Character &amp; currencies</h2><div class="row"><label>Level <input type="number" id="level" min="1" max="100" value="1"></label><label>Health <input type="number" id="health" min="1" max="100000" value="100"></label></div><div class="row"><label>Money <input type="number" id="money" min="0" max="1000000" value="0"></label><label>Impact <input type="number" id="impact" min="0" max="1000000000" value="0"></label></div><p class="notice">Money is progress toward the next level. Level alone grants no automatic stat picks; select those in the tree menu.</p><div id="weapons"></div><button id="apply">Apply loadout</button></section>
<section><h2>Spawn waste</h2><label class="stacked">Enemy type <select id="enemy"></select></label><div class="row"><label>Count <input type="number" id="enemy-count" min="1" max="100" value="1"></label><label>Distance <input type="number" id="distance" min="0" max="900" value="180"></label></div><button id="spawn">Spawn enemies</button><div class="row"><label>Hit damage <input type="number" id="hit-damage" min="1" max="1000000" value="10"></label><button id="hit">Hit all enemies</button></div></section>
<section><h2>Test pickups</h2><label class="stacked">Pickup type <select id="pickup"><option value="money">Money</option><option value="magnet">Money Magnet</option><option value="food">Drumstick (+20 health)</option><option value="impact">Impact Point</option></select></label><div class="row"><label>Value <input type="number" id="pickup-value" min="1" max="1000000" value="1"></label><label>Distance <input type="number" id="pickup-distance" min="0" max="900" value="300"></label></div><button id="drop">Place pickup</button></section>
</aside><section aria-label="Live arena"><div id="game-container"></div><output id="live-status" aria-live="off">Loading arena…</output><p id="action-status" role="status"></p></section></main>
<dialog id="trees"><div class="dialog-heading"><div><h2>Tools &amp; upgrade trees</h2><p class="notice">Select an end node to acquire its path. Select an acquired node to remove it and later levels. Level 1 clears that tool's branches. Gold outlines show the next available pick.</p></div><button id="trees-close">Return to arena</button></div><div id="tool-trees"></div><h2>General upgrades &amp; items</h2><p class="notice">These apply their normal common-quality value. Infinite tracks can be set up to 100 picks here.</p><div id="general-upgrades" class="general-grid"></div><h2>Sandbox Impact Shop</h2><p class="notice">Test purchases using this tab's Impact balance, then apply the loadout to include their bonuses.</p><div id="sandbox-shop" class="general-grid"></div></dialog>`;
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const value = (id: string) => Number(element<HTMLInputElement>(id).value);
let controller: TestingAreaController | undefined;
let upgrades: Partial<Record<UpgradeId, number>> = {};
let paused = false;
const weapons = new Set<WeaponId>(["weapon.starter"]);
const dialog = element<HTMLDialogElement>("trees");
const message = (text: string) => { element("action-status").textContent = text; };
for (const enemy of theme.enemies) element<HTMLSelectElement>("enemy").add(new Option(theme.copy.content[enemy.id]?.name ?? enemy.id, enemy.id));
element<HTMLSelectElement>("enemy").value = "enemy.cluster_fodder";
function refreshWeapons(): void {
  const target = element("weapons"); target.replaceChildren();
  for (const weapon of theme.weapons) {
    const label = document.createElement("label"); label.className = "weapon-label";
    const input = document.createElement("input"); input.type = "checkbox"; input.checked = weapons.has(weapon.id); input.dataset.weapon = weapon.id;
    input.onchange = () => {
      if (input.checked) {
        if (weapons.size >= theme.weaponSlotCount && !((weapon.id === "weapon.secondary" && weapons.has("weapon.secondary_evolved")) || (weapon.id === "weapon.secondary_evolved" && weapons.has("weapon.secondary")))) { input.checked = false; message(`Choose up to ${theme.weaponSlotCount} tools.`); return; }
        if (weapon.id === "weapon.secondary") weapons.delete("weapon.secondary_evolved");
        if (weapon.id === "weapon.secondary_evolved") weapons.delete("weapon.secondary");
        weapons.add(weapon.id);
      } else weapons.delete(weapon.id);
      refreshWeapons(); renderTrees();
    };
    label.append(input, document.createTextNode(theme.copy.content[weapon.id]?.name ?? weapon.id)); target.append(label);
  }
}
function apply(useFields = false): void {
  const live = !useFields ? controller?.read() : undefined;
  const chosen = { level: live?.level ?? value("level"), health: live?.health ?? value("health"), money: live?.money ?? value("money"), impact: live?.impact ?? value("impact") };
  controller?.configure({ ...chosen, weapons: [...weapons], upgrades });
  for (const key of ["level", "health", "money", "impact"] as const) element<HTMLInputElement>(key).value = String(chosen[key]);
  message("Loadout applied. Changes to trees use the same upgrades as a normal run.");
}
function statText(weapon: WeaponDefinition, id: UpgradeId, picks: number): string {
  const track = weapon.cleanup?.tracks.find((track) => track.id === id);
  if (!track || !weapon.cleanup) {
    const upgrade = theme.upgrades.find((upgrade) => upgrade.id === id);
    const range = upgrade?.effects.find((effect) => effect.kind === "stat.add" && effect.target === "weapon.range");
    if (range?.kind === "stat.add") return `${weapon.range + range.value * picks} range`;
    return `Skill level ${picks}`;
  }
  const amount = weapon.cleanup[track.stat] + picks * track.step;
  return track.stat === "slow" ? `${Math.round(amount * 100)}% slow` : `${Number(amount.toFixed(2))} ${track.stat === "tickMs" ? "ms" : track.stat === "speed" ? "rad/s" : track.stat === "dotDamage" ? "DOT damage" : track.stat}`;
}
function renderTrees(): void {
  const target = element("tool-trees"); target.replaceChildren();
  for (const weapon of theme.weapons.filter((weapon) => (weapon.upgrades?.length ?? 0) > 0)) {
    const equipped = weapons.has(weapon.id) || (weapon.upgrades ?? []).some((u) => u.additionalOwnerWeaponIds?.some((id) => weapons.has(id)));
    const displayWeapon = theme.weapons.find((w) => weapons.has(w.id) && (weapon.upgrades ?? []).some((u) => u.additionalOwnerWeaponIds?.includes(w.id))) ?? weapon;
    const section = document.createElement("section"); section.className = "tool-tree"; section.dataset.tool = weapon.id;
    const base = document.createElement("button"); base.className = `tree-root ${equipped ? "acquired" : ""}`;
    base.textContent = `${theme.copy.content[displayWeapon.id]?.name} · Level 1`;
    base.onclick = () => { upgrades = clearToolBranches(upgrades, weapon.upgrades!.map((upgrade) => upgrade.id)); renderTrees(); apply(); };
    section.append(base);
    if (!equipped) { const hint = document.createElement("p"); hint.className = "notice"; hint.textContent = "Equip this tool in the character panel to test its branches."; section.append(hint); }
    for (const upgrade of weapon.upgrades ?? []) {
      const row = document.createElement("div"); row.className = "branch";
      const branches = upgrade.maxLevel ?? 4;
      row.style.gridTemplateColumns = `180px repeat(${branches}, minmax(100px, 1fr))`;
      row.style.minWidth = `${180 + branches * 113}px`;
      const name = document.createElement("span"); name.textContent = theme.copy.content[upgrade.id]?.name ?? upgrade.id; row.append(name);
      const current = upgrades[upgrade.id] ?? 0;
      for (let pick = 1; pick <= (upgrade.maxLevel ?? 4); pick++) {
        const button = document.createElement("button"); button.dataset.upgrade = upgrade.id; button.dataset.level = String(pick + 1);
        button.className = pick <= current ? "acquired" : pick === current + 1 && equipped ? "available" : "";
        button.title = theme.copy.content[upgrade.id]?.description ?? "";
        button.setAttribute("aria-pressed", String(pick <= current)); button.disabled = !equipped;
        const title = document.createElement("span"); title.textContent = `Level ${pick + 1}`;
        const detail = document.createElement("span"); detail.className = "node-value"; detail.textContent = statText(displayWeapon, upgrade.id, pick);
        button.append(title, detail);
        button.onclick = () => { upgrades[upgrade.id] = toggleTreeLevel(current, pick + 1, upgrade.maxLevel ?? 4); renderTrees(); apply(); };
        row.append(button);
      }
      section.append(row);
    }
    target.append(section);
  }
  const general = element("general-upgrades"); general.replaceChildren();
  for (const upgrade of theme.upgrades.filter((upgrade) => upgrade.track === "general")) {
    const card = document.createElement("label"); card.className = "item-card stacked";
    const title = document.createElement("strong"); title.textContent = theme.copy.content[upgrade.id]?.name ?? upgrade.id;
    const detail = document.createElement("small"); detail.textContent = theme.copy.content[upgrade.id]?.description ?? "";
    const input = document.createElement("input"); input.type = "number"; input.min = "0"; input.max = String(upgrade.maxLevel ?? 100); input.value = String(upgrades[upgrade.id] ?? 0); input.setAttribute("aria-label", `${title.textContent} picks`);
    input.onchange = () => { upgrades[upgrade.id] = Math.floor(Math.max(0, Math.min(Number(input.max), Number(input.value) || 0))); apply(); };
    card.append(title, detail, input); general.append(card);
  }
  renderShop();
}
function renderShop(): void {
  const target = element("sandbox-shop"); target.replaceChildren();
  for (const item of theme.economy?.shop ?? []) {
    const level = getProfile().economy.upgrades[item.id] ?? 0;
    const card = document.createElement("article"); card.className = "item-card";
    const name = document.createElement("h3"); name.textContent = item.name;
    const detail = document.createElement("p"); detail.textContent = `${item.description} Level ${level}/${item.maxLevel}`;
    const button = document.createElement("button"); button.textContent = `Buy for ${shopCost(item, level)} Impact`;
    button.disabled = level >= item.maxLevel || getProfile().economy.impact < shopCost(item, level);
    button.onclick = () => { buyImpactUpgrade(item.id); element<HTMLInputElement>("impact").value = String(getProfile().economy.impact); apply(); renderShop(); };
    card.append(name, detail, button); target.append(card);
  }
}
const memory = new Map<string, string>();
initializeProfile(theme, { getItem: (key) => memory.get(key) ?? null, setItem: (key, text) => { memory.set(key, text); }, removeItem: (key) => { memory.delete(key); } });
class TestingBoot extends Phaser.Scene {
  private failed = false;
  constructor() { super("testing-boot"); }
  preload(): void { this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, () => { this.failed = true; }); loadThemeSprites(this, theme); }
  create(): void { if (this.failed) message("An arena asset could not load. Reload to try again."); else this.scene.start("run"); }
}
class TestingRun extends RunScene {
  create(): void { super.create(); controller = this.openTestingArea(); refreshWeapons(); renderTrees(); apply(); }
}
const game = new Phaser.Game({ ...createGameConfig("game-container"), scene: [TestingBoot, TestingRun] });
const interval = window.setInterval(() => {
  const scene = game.scene.getScene("run") as RunScene | undefined;
  if (!controller && scene?.scene.isActive()) { try { controller = scene.openTestingArea(); refreshWeapons(); renderTrees(); apply(); } catch { return; } }
  if (!controller) return;
  const data = controller.read(), status = element("live-status");
  status.dataset.ready = "true";
  for (const [key, value] of Object.entries(data)) status.dataset[key] = String(value);
  status.replaceChildren(...[`Time ${(data.elapsedMs / 1000).toFixed(1)}s`, `Level ${data.level}`, `Money ${data.money.toFixed(2)}`, `Impact ${data.impact}`, `Health ${data.health.toFixed(1)}`, `Enemies ${data.enemies}`, `Dropped money ${data.moneyOnGround.toFixed(2)}`, `Pickups ${data.pickupCount}`].map((text) => { const span = document.createElement("span"); span.textContent = text; return span; }));
}, 150);
element("apply").onclick = () => { apply(true); renderShop(); };
element("spawn").onclick = () => controller?.spawn(element<HTMLSelectElement>("enemy").value as EnemyId, value("enemy-count"), value("distance"));
element("drop").onclick = () => controller?.pickup(element<HTMLSelectElement>("pickup").value as DropKind, value("pickup-value"), value("pickup-distance"));
element("hit").onclick = () => controller?.hit(value("hit-damage"));
element("clear").onclick = () => controller?.clear();
element("reset").onclick = () => window.location.reload();
element("pause").onclick = () => { paused = !paused; controller?.pause(paused); element("pause").textContent = paused ? "Resume" : "Pause"; };
element<HTMLInputElement>("natural").onchange = (event) => controller?.natural((event.target as HTMLInputElement).checked);
element<HTMLInputElement>("invincible").onchange = (event) => controller?.invincible((event.target as HTMLInputElement).checked);
element("trees-open").onclick = () => { controller?.pause(true); dialog.showModal(); renderTrees(); };
element("trees-close").onclick = () => dialog.close();
dialog.addEventListener("close", () => controller?.pause(paused));
window.addEventListener("pagehide", () => { clearInterval(interval); game.destroy(true); });
