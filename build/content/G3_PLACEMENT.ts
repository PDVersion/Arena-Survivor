import { writeFileSync } from "node:fs";
import { themeRegistry } from "../../src/game/content/theme-registry";
import { placeShrine } from "../../src/game/systems/shrines/shrine-placement";
import { createSeededRandom } from "../../src/game/systems/upgrades";
const cases = [];
for (const { key, theme } of themeRegistry) for (const player of [{ x: 1800, y: 1200 }, { x: 160, y: 160 }, { x: 3440, y: 2240 }]) {
  for (let seed = 1; seed <= 16; seed++) {
    const random = createSeededRandom(seed), placed = [];
    for (const arrival of theme.tuning.shrines.arrivals) {
      let calls = 0;
      const point = placeShrine(theme.tuning.shrines, { width: 3600, height: 2400 }, player, placed, () => { calls++; return random(); });
      placed.push(point);
      cases.push({ theme: key, seed, player, id: arrival.shrineId, point, calls, distance: Math.hypot(point.x - player.x, point.y - player.y) });
    }
  }
}
writeFileSync(process.argv[2]!, JSON.stringify({ cases, minDistance: Math.min(...cases.map((c) => c.distance)),
  maxDistance: Math.max(...cases.map((c) => c.distance)), maxCalls: Math.max(...cases.map((c) => c.calls)),
  withinInteraction: cases.filter((c) => c.distance <= 120).length }, null, 2) + "\n");
