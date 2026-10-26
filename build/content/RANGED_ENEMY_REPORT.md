# Takeaway Cup — scoped live draft verification /2026-10-23

Owner selects one new eco ranged enemy, enemy sheet, generated art and live
integration. Implementation on codex/v0.4.4; no push/PR/merge or deployment.
[Enemy sheet](../enemies/TAKEAWAY_CUP.md) owns design and copyable prompt links.

## Implementation and decisions

- Optional neutral `enemy.ranged_attacker` role, eco-only. Legacy content/copy
  requirements stay frozen; each actual registered enemy must have copy.
  No knight file/content changed. No profile field/schema/migration change.
- Approach → locked-bearing1000ms warning → one shot/180ms release →1820ms
  recovery. Theme owns health/body/harm/movement/spawn/projectile/cue tuning.
  Actor-local state never reads sprite data. Old movement roles are unaffected.
- Hostile shots use a separate finite set, max32,1800ms lifetime and swept-circle
  first-impact ordering against player and solid obstacles. Armour/world/elite
  scaling, shared invulnerability, shot consumption, expiry and source death
  attribution are explicit. Shots never enter the player's projectile group.
- The actor cancels uncommitted shots on defeat. Committed shots survive their
  shooter. Pause/overlays freeze updates; terminal/quit/shutdown clear; clearing
  waits for hostile shots. Newly spawned shots first advance on the next tick.
- Low spawn weight, intro one at66%. Preserve all prior role/boss/elite timing;
  this selected addition has18 simulation seconds before mini at72%, reducing
  its previous last-role30-second learning gap. The encounter test records the
  narrow new-role exception; other spacing gates remain. Playtest pacing open.
- Seven64px frames,448×64 strip, standalone nearest-filtered texture. Optional
  prepare/release/recover metadata is driven by real attack phase; hit transient
  takes priority and death detaches. Measured base anchors/facing hold position.
- a1–a4 untouched generated sources/prompts/metadata retained. a3 is the live
  draft. Fixed equal323×400 cells use explicit virtual transparent side margins:
  out-of-image samples stay transparent; no row wrapping, no per-pose fitting or
  painting. Atlas rebuild excludes standalone textures; old five sheets/atlas
  remain byte-identical. Build/check now cover six configured sheets.

## Verified

- `npm test -- --run`:719 tests /75 files pass. Added timing/locked aim/paused
  and long-tick behavior, swept impacts/order, optional role/content validation,
  virtual padding and no wrapping; shared director/parity/lifecycle tests updated.
- `npm run typecheck`, `npm run lint`, `npm run build`: pass. Existing production
  chunk-size advisory persists. `npm run sprites -- build --theme eco-guardian`
  and `check`: six sheets pass; review/public/accepted cup SHA256 match and raw
  deterministic recipe rebuild passes. Five pre-existing outputs/atlas unchanged.
- `tests/e2e/ranged-enemy.spec.ts --workers=1 --retries=0`: **3 unique Chromium
  cases pass**. Default + Low/reduced-motion actual Phaser fixtures verify64px
  frame/14body/40display, warning4,release5,recover6, full warning, no movement,
  actual harm8, miss after sidestep, expiry, cancelled pre-release death,32cap,
  pause, menu shutdown and clean restart. A third case runs the ordinary playing
  scene update loop: warns first, fires a live shot and reduces health naturally.
- Five screenshots under [browser evidence](RANGED_ENEMY_BROWSER/) inspected:
  both quality warning/recovery and ordinary live shot. Cup remains recognizable
  beside shipped player at real game scale; bearing and brown/gold shot readable.
  Initial two cases failed at the fixture's incorrectly constructed pause
  menu, after combat assertions passed. Replaced that fixture call with the
  actual scene pause method; final run zero retries. No runtime bypass added.
- [Balance output](RANGED_ENEMY_BALANCE.txt): all eco build models ×3 difficulties,
  five simulated minutes each; 30 deterministic scenarios complete. New role
  contributes low roster share (~1% at end, depending world/difficulty). Existing
  weak builds may reach enemy cap. This coarse throughput/contact model does
  **not** simulate ranged shots, dodging or attack cycles; it cannot prove ranged
  fairness, survival, performance or a balanced live build.

## Remaining limits / handoff

Live draft is functional acceptance, not owner art approval. Idle/hit have small
generated contour differences; full pixel-identical continuity, mirrored art and
extended pacing/roster playtest remain open. Owner explicitly wants drafting and
integration now, with later individual art fixes. Original26 style2 subjects
remain review-only; no mass live promotion. Full local regression/stress, other
browser/device/native Safari/older integrated GPU campaigns deferred under owner
resource budget; prior external waiver/unverified state retained. No future
knight work until explicit reopening. No owned browser/server remains running.
