# Arena Survivor V0.3 Build Plan — Feel, Pacing, and Readability

This is the implementation plan for the milestone after the completed V0.2 interaction milestone. Where [`BUILD_PLAN_V0.2.md`](./BUILD_PLAN_V0.2.md) added mechanics, V0.3 makes the existing mechanics **feel** like a modern bullet-heaven: a progression curve that keeps climbing, enemies with physical presence, a spawn director that escalates on a schedule, upgrade cards that state exactly what they do, and on-kill effects that grow with investment.

Every work session must read this file and then [`../RECONCILIATION.md`](../RECONCILIATION.md) before changing code.

## Why this milestone exists

The V0.2 build is mechanically complete but reads as flat during play:

- levels arrive at a constant pace because the XP requirement is linear while XP income is not;
- enemies occupy the same pixel and the swarm reads as one blob rather than a crowd;
- enemies appear inside the visible screen;
- every enemy is worth roughly the same, so killing a Tank feels identical to killing a Grunt;
- difficulty only rises when the player activates a shrine, so a cautious run has a flat five minutes;
- upgrade cards say "Increase damage dealt" and never say by how much, from what, to what;
- Detonation is one fixed 96-unit, 15-damage blast forever, no matter how invested the build is.

Reference points for the target feel: Vampire Survivors, Risk of Rain 2, HoloCure. All three share a property this build does not yet have — **the same action performed at minute four is visibly and numerically bigger than at minute one**, and the game tells you so.

## Relationship to the product plan

[`PLAN.md`](./PLAN.md) previously described V0.3 as content growth — additional weapons, bosses, unlocks, persistence, endless mode. That list is **re-sequenced, not cancelled**: it is now the V0.4 section of `PLAN.md`, and V0.3 is this rebalancing milestone. Balancing the loop before adding more content to it is the cheaper order — every new weapon, boss, and unlock inherits whatever curve exists when it lands, and re-tuning them later costs more than tuning the core now.

The re-sequencing is already recorded: `PLAN.md` carries the new V0.3 and V0.4 sections, `SAVE_DATA.md` moves its export/import expectation to V0.4, and [REC-043](../RECONCILIATION.md) states the decision and its evidence.

`AGENTS.md` and `README.md` still point every session at the completed V0.2 plan. They are repointed in **Phase 1 of this milestone**, deliberately not before, so no session begins V0.3 work against a plan that has not been approved.

## Delivery contract

- Begin from `main` after the merged V0.2 milestone.
- Build V0.3 on `claude/v0.3` and deliver it as one pull request into `main`. The `claude/` prefix records that this milestone is built with Claude Code; see the branch-naming convention in [`../AGENTS.md`](../AGENTS.md).
- Complete phases in order. Each numbered phase ends in one reviewable commit using the listed subject.
- Keep implementation, tests, plan status, and material reconciliation findings in the same phase commit.
- Run a phase's short verification before marking it complete or starting the next.
- Preserve all V0.1 and V0.2 acceptance paths unless a changed V0.3 requirement is explicitly recorded in reconciliation.
- Keep themed content behind the contracts in [`THEME_ARCHETYPES.md`](./THEME_ARCHETYPES.md). Every balance value introduced here is theme-owned data, never a literal inside a system or scene.
- Keep persistent shapes compatible with [`SAVE_DATA.md`](./SAVE_DATA.md).

## Phase tracker

- [ ] Phase 1 — Tuning seams, balance simulator, and plan re-sequencing
- [ ] Phase 2 — Progression curve, per-role rewards, and upgrade tallies
- [ ] Phase 3 — Spawn director, timer gating, and off-screen spawning
- [ ] Phase 4 — Physical presence, spatial index, and crowd separation
- [ ] Phase 5 — Time and Chaos difficulty scaling
- [ ] Phase 6 — Skill levels, scaling Detonation, and upgrade pool repair
- [ ] Phase 7 — Informative upgrade cards, pause menu, and HUD
- [ ] Phase 8 — Survivability stats, pickup pressure, and the balance pass

---

# Findings from the V0.2 code

Each requested change below is anchored to what the code does today. These are the facts the plan is built on.

| # | Observation | Location |
| --- | --- | --- |
| 1 | `xpRequiredForLevel(level) = 2 + (level - 1) * 2` — strictly linear, so level 30 costs 15× level 1 while XP income grows far faster than that | `src/game/systems/xp.ts:20` |
| 2 | `selectedUpgradeIds` is an append-only list; nothing counts repeats and the end screen never shows upgrades | `src/game/state/run-state.ts:49`, `src/game/state/statistics.ts:44` |
| 3 | Enemies are added to a physics group with **no collider** — only two overlaps exist (player↔enemy, projectile↔enemy), so enemies fully interpenetrate | `src/game/scenes/run-scene.ts:334` |
| 4 | `SPAWN_RADIUS = 360` while a 1920×1080 window shows ±960×±540 of world, so spawns are always on screen; `pointOnSpawnRing` then *clamps* into the arena, dragging edge spawns even closer | `src/game/scenes/run-scene.ts:66`, `src/game/systems/spawning.ts:18` |
| 5 | XP rewards are per-definition (1 / 1 / 4 / 3) but never scale with run time, enemy buffs, or role beyond that constant | `src/game/content/themes/knight-magic/enemies.ts` |
| 6 | Enemy health scales only with Chaos (`1 + 0.20p`); elapsed time contributes nothing | `src/game/systems/chaos/world-modifiers.ts:48` |
| 7 | Level-up cards render `name\ndescription` only; no numbers, no level, no new-vs-repeat indicator | `src/game/ui/level-up-choice-ui.ts:61` |
| 8 | Spawn cadence is a constant `SPAWN_INTERVAL_MS = 400` divided by the shrine/Chaos multiplier; roster gating is `unlockAtMs` at 8 s / 16 s / 24 s, so the full roster is present within half a minute | `src/game/scenes/run-scene.ts:65`, `enemies.ts` |
| 9 | Pause sets a status and prints one HUD string; there is no pause UI | `src/game/scenes/run-scene.ts:1394`, `src/game/ui/hud.ts:52` |
| 10 | Detonation is a boolean skill with one fixed `{ radius: 96, damage: 15 }`; damage is flat regardless of what died | `src/game/content/themes/knight-magic/skills.ts:9` |
| ★ | `eliteChance = min(0.4, (chaos - 1) * 0.04)` → **zero elites** in any run without shrine activation | `world-modifiers.ts:58` |
| ★ | `selectUpgradeChoices` draws uniformly from all 13 upgrades with no filtering; re-picking an already-enabled skill is a **completely wasted level-up** | `src/game/systems/upgrades.ts:36`, `upgrades.ts:65` |
| ★ | `armour`, `regeneration`, and `luck` exist in `PlayerBaseStats` and are validated, but **no system reads them** — contact damage is applied raw | `player-stats.ts`, `run-scene.ts:1276` |
| ★ | Invulnerability is one global `lastContactDamageAtMs`, so standing in a crowd of 40 costs the same health as touching one Grunt | `run-scene.ts:161` |
| ★ | Every kill drops a pickup actor with no cap, so a 300-enemy chain produces a pickup storm | `run-scene.ts:1187` |
| ★ | `targetsWithinRadius` and `findNearestTarget` are O(n) scans over all live enemies, called per explosion and per shot | `on-kill-effects.ts:14`, `targeting.ts` |

---

# V0.3 acceptance

V0.3 is complete when a player can:

1. Complete every V0.1 and V0.2 path without regression.
2. Watch level-ups start fast and visibly slow into deliberate milestones, while per-kill XP visibly grows, so late levels feel earned rather than automatic.
3. See a per-upgrade tally on the run-end screen showing each upgrade taken and how many times.
4. Push through a crowd where small enemies bunch and overlap slightly, large enemies block movement, and neither the player nor enemies pass through a Tank.
5. Never see an enemy appear inside the visible viewport during normal play.
6. Earn clearly different XP from a Grunt, a Runner, a Tank, a Broodmother, and an elite, with tougher late-run variants worth more than early ones.
7. Face enemies that get measurably tougher as the timer runs down and as Chaos rises, from one declared curve.
8. Watch the roster unlock on telegraphed timer milestones (Grunts, then Runners, then Tanks and Broodmothers, then elites), with Chaos raising both rate and the share of dangerous roles.
9. Read exactly what an upgrade does before taking it — current value, resulting value, its level, and whether it is new — with a pause-menu toggle to hide the numbers.
10. Open the pause menu mid-run and read current stats, every upgrade owned with counts, active skills, and world modifiers.
11. Take Detonation early for a small blast and grow it into a large one, with blast damage scaling from the killed enemy's health rather than a flat number.
12. Never be offered an upgrade that does nothing, and never lose a level-up to a duplicate skill pick.
13. Sustain the 300-enemy representative load with separation, the spawn director, and scaling effects active, within the recorded frame budget.
14. Pass the rename-only alternate-theme test and architecture guard with every new balance value living in theme data.

---

# Architecture additions

V0.3 adds five seams. Each exists because more than one phase needs it.

### Theme-owned tuning packs

All numbers introduced by this milestone live in new theme files, not in systems or scenes:

```text
content/themes/knight-magic/
  progression.ts   XP curve bands, per-role reward weights, toughness reward share
  director.ts      Spawn phases, intervals, batch sizes, role weights, wave events
  difficulty.ts    Time and Chaos curves for enemy health/damage/speed/elite chance
  bodies.ts        Per-role separation radius scale, mass, and solidity
```

`SPAWN_INTERVAL_MS`, `SPAWN_RADIUS`, and the `unlockAtMs` fields move out of the scene and the enemy definitions into `director.ts`. The scene reads a resolved plan; it never holds a cadence literal.

### Spatial index

One `systems/spatial/spatial-hash.ts` uniform grid, rebuilt once per frame from live enemies, consumed by crowd separation, explosion radius queries, nearest-target selection, and pickup magnetism. It replaces four independent O(n) scans with one build plus bounded neighbourhood lookups, and it is the enabler for separation at 300 enemies rather than an optimisation added afterwards.

### Skill levels

`RunState` gains `skillLevels: Readonly<Partial<Record<SkillId, number>>>`. `skill.enable` becomes `skill.level` (+1, capped by the skill's `maxLevel`). Effect resolution takes a level and returns resolved values. This is what makes Detonation grow, and it is what removes wasted duplicate picks.

### Upgrade description selectors

One pure module, `systems/upgrades/describe-upgrade.ts`, answers "what does taking this do to the current state?" and returns structured before/after lines. It is consumed by the level-up card, the pause menu, and the run-end tally — three surfaces, one source of truth, fully unit-testable without Phaser.

### Settings state

`settings: { detailedUpgradeCards, reducedMotion, muted }` in a serializable slice shaped for [`SAVE_DATA.md`](./SAVE_DATA.md). Session-only by default; the localStorage adapter is a marked seam that Phase 7 may fill if the decision below says yes.

---

# Phase 1 — Tuning seams, balance simulator, and plan re-sequencing

**Commit:** `build(v0.3): establish balance instrumentation and tuning seams`

The reason this is first: a five-minute run takes five minutes to evaluate. Every later phase in this milestone is a numbers change, and iterating numbers by playing is the slowest possible loop. A headless simulator turns a tuning question into a sub-second test.

Deliver:

- Create the four theme tuning files above with the current values, so this phase is behaviour-neutral and reviewable as a pure move.
- Add `systems/simulation/pacing-simulator.ts`: a deterministic, Phaser-free model that steps a full run at a fixed timestep and reports, per 15-second bucket — enemies spawned by role, live enemy estimate, player DPS from a supplied build model, kills, XP earned, level, and cumulative XP. It consumes the same tuning data and the same pure selectors as the game.
- Add a `npm run balance` script that prints the pacing table for a named build model (`passive`, `damage-rush`, `crit`, `explosion`) as a readable text report.
- Add telemetry fields for pacing: current director phase, spawn interval in effect, live count by role, XP earned per bucket, level timestamps.
- Repoint `AGENTS.md` and `README.md` from the completed V0.2 plan to this one, including the `codex/v0.3` branch and delivery workflow. `PLAN.md`, `SAVE_DATA.md`, and REC-043 already carry the re-sequencing.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/content tests/unit/architecture tests/unit/simulation
npm run build
npm run test:e2e -- --grep "boots|load harness"
```

Manual smoke: run `npm run balance` and confirm the simulated level curve matches a real five-minute run within roughly one level at the 1, 3, and 5 minute marks.

Exit gate: no behaviour changed, every V0.2 test passes untouched, and a tuning question can be answered without opening a browser.

---

# Phase 2 — Progression curve, per-role rewards, and upgrade tallies

**Commit:** `feat(v0.3): rebuild the progression curve and reward scaling`

Covers requests 1, 2, and 5.

### The XP curve (request 1)

Replace the linear requirement with banded geometric growth. Growth is fast early so the opening minute is generous, then compounds so late levels are milestones.

```text
xpRequiredForLevel(1) = 4
band 1  levels  1–4    growth ×1.35
band 2  levels  5–11   growth ×1.22
band 3  levels 12–24   growth ×1.16
band 4  levels 25+     growth ×1.12
```

Resulting requirements (rounded):

| Level | 1 | 2 | 3 | 4 | 5 | 8 | 10 | 12 | 15 | 20 | 25 | 30 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Need | 4 | 5 | 7 | 10 | 13 | 24 | 36 | 53 | 83 | 175 | 368 | 649 |
| Cumulative | 4 | 9 | 16 | 26 | 39 | 99 | 164 | 261 | 478 | 1,143 | 2,539 | 5,252 |

The curve is data (`progression.ts`), the formula is pure, and both are covered by table-driven tests including the exact boundary levels.

Target pacing, asserted by the simulator: roughly level 8–10 at 1:00, 14–17 at 2:30, and 26–31 at 5:00 for an average build. That lands close to the `PLAN.md` example run-end screen (level 28) and gives ~30 upgrade choices per run.

### Reward scaling (request 5)

Per-role base XP, separated so a Tank is genuinely worth killing:

| Role | Current | Proposed | Rationale |
| --- | --- | --- | --- |
| Grunt (`enemy.swarm_basic`) | 1 | 1 | The unit of account |
| Runner (`enemy.fast_fragile`) | 1 | 2 | Harder to hit, forces movement |
| Tank (`enemy.slow_durable`) | 4 | 7 | 4× the health of a Grunt and blocks space |
| Broodmother (`enemy.death_spawner`) | 3 | 5 | Plus its brood, see below |
| Broodmother offspring | 0 | 1 | The brood is part of the package |
| Fracture children | 0 | 0 | Unchanged — a player skill must not mint XP |
| Elite | ×2 | ×2.5 | Already a reward multiplier |

Add a **toughness share**: an enemy's XP is snapshotted at spawn as
`xpReward × (1 + (effectiveHealthMultiplier − 1) × 0.5)`.
A Grunt spawned at minute four with a 1.5× health multiplier is worth 1.25 XP; the same Grunt at minute zero is worth 1. This is what keeps the exponential requirement fed without inflating the early game, and it makes the late-run swarm feel like a payday rather than a wall.

Giving Broodmother offspring non-zero XP changes the provisional data behind REC-030; update that entry rather than silently diverging. There is no XP loop risk because offspring are Runners, which do not spawn on death.

### Upgrade tallies (request 2)

- Add `upgradeCounts: Readonly<Partial<Record<UpgradeId, number>>>` to run statistics, incremented at the same commit point as `selectedUpgradeIds`.
- `selectRunSummaryValues` gains an `upgrades` section: theme display name, count, and — where meaningful — the resulting value ("Tempered Power ×4 — +100% damage").
- The run-end overlay grows a third column, or a second page when the list exceeds the panel; the same selector feeds the pause menu in Phase 7.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/xp tests/unit/statistics tests/unit/simulation tests/unit/enemies
npm run build
npm run test:e2e -- --grep "level up|statistics"
npm run balance
```

Manual smoke: play a full run and confirm level-ups slow down without stalling, that a Tank kill is visibly worth more than a Grunt kill, and that the end screen lists every upgrade with an accurate count.

Exit gate: the curve is data-driven and exactly tested at band boundaries, XP provenance still reconciles, and the simulator's predicted level at 1/3/5 minutes matches live play within one level.

---

# Phase 3 — Spawn director, timer gating, and off-screen spawning

**Commit:** `feat(v0.3): add the timed spawn director and off-screen spawning`

Covers requests 4 and 8.

### Off-screen spawning (request 4)

Two changes are needed, because a larger radius alone is not enough:

1. **Radius derives from the viewport.** `spawnRadius = hypot(viewWidth, viewHeight) / 2 + margin`, where the view is the camera's world-space extent. At the proposed fixed view (below) that is ≈ 918 + 100 = **1020**, versus 360 today.
2. **Clamping is replaced with rejection.** `pointOnSpawnRing` currently clamps the candidate into the arena, which drags edge spawns on screen — precisely the bug being reported when the player is near a wall. Replace with: sample the golden-angle ring, reject candidates outside the arena or inside the camera's view rectangle, and take the first valid candidate; after N rejections fall back to the farthest in-arena point from the camera centre.

Because the arena is 2400×1600, a 1020-unit ring does not fit around a player near a corner. Two supporting changes:

- **Fixed logical view.** Set a camera zoom so the visible world is a constant **1600×900** units regardless of window size. This is worth doing for its own sake: today a player on a 27" monitor sees more of the arena, gets more warning, and has more targets in range than a player on a laptop, which means the balance work in this milestone would otherwise be monitor-dependent.
- **Larger arena.** 2400×1600 → **3600×2400**, giving room for a full off-screen ring anywhere in the arena and making shrine placement a real traversal decision.

Both touch existing e2e expectations (`ARENA_SIZE` is asserted in telemetry tests) — treat the test updates as part of this phase, not as incidental churn.

### The spawn director (request 8)

Replace the constant interval and `unlockAtMs` with declared phases keyed to **time remaining**, as requested:

| Remaining | Elapsed | Interval @ Chaos 1 | Batch | Role weights | Baseline elite chance |
| --- | --- | --- | --- | --- | --- |
| 5:00–4:00 | 0–60 s | 900 ms | 1 | Grunt 100 | 0% |
| 4:00–3:00 | 60–120 s | 700 ms | 1–2 | Grunt 70 · Runner 30 | 0% |
| 3:00–2:00 | 120–180 s | 560 ms | 2 | Grunt 50 · Runner 28 · Tank 15 · Brood 7 | 1% |
| 2:00–1:00 | 180–240 s | 430 ms | 2–3 | Grunt 40 · Runner 28 · Tank 20 · Brood 12 | 4% |
| 1:00–0:00 | 240–300 s | 330 ms | 3–4 | Grunt 32 · Runner 28 · Tank 22 · Brood 18 | 8% |

Chaos layers on top of the phase rather than replacing it:

- **Rate:** `interval / worldSpawnMultiplier` (the existing `1 + 0.25p` curve plus shrine products) — unchanged mechanism.
- **Composition:** each role carries a `chaosWeightBias`, and its weight becomes `weight × (1 + p × bias)`. Proposed biases — Grunt 0, Runner 0.10, Tank 0.35, Broodmother 0.50. High Chaos therefore shifts the swarm toward heavy roles, not just more of the same.
- **Elites:** `max(phaseBaselineEliteChance, min(0.4, 0.04p))`. This fixes the current situation where a shrine-free run never sees an elite at all.

Two more director features, because scheduled escalation is most of what makes the reference games feel paced:

- **Batch spawning.** Spawning 1 enemy every 330 ms reads as a trickle; spawning 3 every 990 ms in a shared arc reads as a wave. Batches spawn on a shared ring segment with jitter.
- **Telegraphed milestone events.** At each phase boundary, emit a banner and audio cue ("The pack stirs", "The brood wakes") and a burst of 15–30 of the newly unlocked role. The player should know the game just got harder, and why.

The phase table is expressed in absolute milliseconds with a `durationScale` derived from `runDurationMs`, so the compressed test runs still traverse every phase.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/spawning tests/unit/director tests/unit/content tests/unit/simulation
npm run build
npm run test:e2e -- --grep "spawn|enemy roster|Chaos"
npm run test:e2e:stress
```

Manual smoke: play a shrine-free run and confirm no enemy ever appears on screen, that each minute boundary is announced and visibly changes the roster, and that a high-Chaos run is heavier as well as denser.

Exit gate: zero on-screen spawns across a scripted sweep with the player at the centre, each edge, and each corner; director phases and weights are pure, data-defined, and unit-tested; the 300-enemy stress path still passes.

---

# Phase 4 — Physical presence, spatial index, and crowd separation

**Commit:** `feat(v0.3): give enemies physical presence`

Covers request 3. This is the highest-risk phase in the milestone — it adds per-frame work proportional to the swarm — so it lands after the director but before the difficulty ramp, and it carries the strictest performance gate.

### Approach

Full Arcade collider resolution between 300 enemies is the obvious approach and the wrong one: it fights `chase()`, which overwrites velocity every frame, and its cost is unbounded in a dense pile. Instead:

- **Enemy ↔ enemy: soft positional separation.** Build the spatial hash once per frame; for each enemy, examine its 3×3 cell neighbourhood, and for each overlapping neighbour apply a positional nudge of `overlap × 0.5 × otherMass / (mass + otherMass)`, clamped to a maximum displacement per frame. Velocity is untouched, so chasing is unaffected. Neighbour checks are capped (8 per enemy) so worst-case cost stays linear.
- **Player ↔ solid enemies: hard resolution.** Enemies flagged `solid` push the player out along the contact normal by the full overlap. Contact damage keeps flowing through the existing overlap handler, so damage semantics do not change. Guard against wedging the player outside arena bounds by preferring to displace the enemy when the player is against a wall.

### Body data (`bodies.ts`)

Separation radius is deliberately smaller than the drawn radius so small enemies still bunch, exactly as requested:

| Role | Draw radius | Separation scale | Effective | Mass | Solid |
| --- | --- | --- | --- | --- | --- |
| Runner | 10 | 0.55 | 5.5 | 0.6 | no |
| Grunt | 14 | 0.70 | 9.8 | 1.0 | no |
| Tank | 22 | 1.00 | 22 | 4.0 | **yes** |
| Broodmother | 25 | 0.95 | 23.8 | 3.0 | **yes** |
| Elite (any role) | ×1.3 | inherits | ×1.3 | ×2 | **yes** |

Runners overlap heavily and read as a shoal; Grunts bunch with visible gaps; Tanks and Broodmothers hold their ground and are walls.

Also add **contact knockback**: a solid enemy that damages the player shoves them, which sells the mass difference and gives a moment of recovery.

### Performance gate

This phase must not be merged on impression. Required evidence, recorded in reconciliation:

- average and worst frame time at 300 enemies, before and after, on the same machine;
- separation pair-check count per frame at the 300-enemy high-water mark;
- confirmation that explosions and targeting were migrated to the shared hash (they are net *savings* that partly pay for separation).

If the budget is exceeded, the documented fallback is half-rate separation (alternate frames, doubled displacement) before any reduction of the enemy cap.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/spatial tests/unit/separation tests/unit/effects tests/unit/targeting
npm run build
npm run test:e2e -- --grep "separation|presence|combat"
npm run test:e2e:stress
```

Manual smoke: walk into a Tank and confirm it blocks; walk through a Runner shoal and confirm it parts and reforms; stand in a corner under heavy load and confirm nothing tunnels through the player or the walls.

Exit gate: no enemy pair is fully coincident for more than one frame, solids are impassable for both player and enemies, the 300-enemy load stays within the recorded frame budget, and separation never alters damage, XP, or statistics.

---

# Phase 5 — Time and Chaos difficulty scaling

**Commit:** `feat(v0.3): scale enemy strength with time and Chaos`

Covers request 6, starting conservatively as requested.

Add an elapsed-time curve alongside the existing Chaos curves, resolved through the same `selectWorldModifiers` selector so there is still exactly one place where world pressure is decided:

| Modifier | Chaos term (existing) | New time term | Combined at 5:00, Chaos 3 |
| --- | --- | --- | --- |
| Enemy health | `1 + 0.20p` | `1 + 0.50 × (elapsed / duration)` | 1.40 × 1.50 = **2.10×** |
| Enemy contact damage | `1 + 0.15p` | `1 + 0.20 × (elapsed / duration)` | 1.30 × 1.20 = **1.56×** |
| Enemy move speed | none | `1 + 0.10 × (elapsed / duration)` | **1.10×** |
| Elite chance | `min(0.4, 0.04p)` | phase baseline from Phase 3 | max of the two |

Rules that keep this readable and safe:

- The time term advances in **30-second steps**, not continuously. A smooth ramp is imperceptible; a step is felt, and it lets the HUD show a "threat level" that changes at legible moments.
- Multipliers are **snapshotted at spawn**. Existing enemies never heal or accelerate mid-life, which would be both confusing and a statistics hazard.
- The snapshot is what feeds the Phase 2 toughness XP share and the Phase 6 victim-health explosion damage, so tougher enemies pay out more in both currencies.

Start at these values and expect to raise them. The simulator's TTK table (Phase 8) is the instrument for deciding.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/chaos tests/unit/modifiers tests/unit/difficulty tests/unit/simulation
npm run build
npm run test:e2e -- --grep "Chaos|world multiplier|difficulty"
npm run balance
```

Manual smoke: compare a Grunt's time-to-kill at 0:30 and at 4:30 with the same build, and confirm the HUD threat step changes are noticeable but not punishing.

Exit gate: every scaling term resolves from one selector, is exposed in telemetry, snapshots at spawn, and restarts clean.

---

# Phase 6 — Skill levels, scaling Detonation, and upgrade pool repair

**Commit:** `feat(v0.3): make skills level and scale`

Covers request 10, plus the wasted-pick defect.

### Skill levels

`skill.enable` becomes `skill.level`: taking the upgrade increments the level, capped at the skill's `maxLevel`. Every skill effect resolver takes a level. This single change fixes the defect where re-picking Detonation is a completely wasted level-up.

### Scaling Detonation

Damage becomes a share of what died, as requested, rather than a flat number:

```text
damage = flat + victimEffectiveMaxHealth × share
radius = baseRadius + radiusPerLevel × (level − 1)
```

| Level | 1 | 2 | 3 | 4 | 6 | 8 (max) |
| --- | --- | --- | --- | --- | --- | --- |
| Radius | 44 | 56 | 68 | 80 | 104 | 128 |
| Victim health share | 30% | 38% | 46% | 54% | 70% | 86% |
| Flat damage | 3 | 5 | 7 | 9 | 13 | 17 |

Level 1 is deliberately weaker than today's fixed blast (44 vs 96 radius, ~9 damage on a Grunt vs 15) so that investment has somewhere to go; level 8 is far stronger than today.

`victimEffectiveMaxHealth` is the enemy's max health *including* its spawn-time elite and difficulty multipliers, so a late-run elite Tank detonates for a great deal and a Runner barely pops. This is the interaction the design is asking for: killing the right target becomes the play, and Phase 5's health scaling feeds it automatically. `EnemyActor` must store `maxHealth` at construction — today only the mutable current `health` is retained.

### Scaling Chain Reaction

| Level | 1 | 2 | 3 | 4 | 5 (max) |
| --- | --- | --- | --- | --- | --- |
| Max chain depth | 2 | 3 | 4 | 5 | 6 |
| Damage falloff per depth | ×0.70 | ×0.74 | ×0.78 | ×0.82 | ×0.86 |
| Radius falloff per depth | ×0.85 | ×0.87 | ×0.89 | ×0.91 | ×0.93 |

An explicit depth limit replaces "bounded only by exact-once claims", which keeps a 300-enemy chain finite, readable, and measurable. Falloff means chains stay spectacular without becoming the only thing that matters.

Piercing Momentum, Fracture, and Bloodlust all take the same treatment: Momentum +10% per level, Fracture +5 percentage points of split chance per level, Bloodlust +0.5% attack speed per step per level.

### Upgrade pool repair

- `maxLevel` per upgrade; maxed upgrades leave the pool.
- Weighted rather than uniform selection, with rarity tiers (common / rare / epic) and `luck` feeding the weights (see Phase 8).
- Never offer three upgrades from the same category in one draw.
- Introduce the **dangerous third choice** that `PLAN.md` describes but the build never implemented — a world/curse upgrade such as Swarming (`enemy spawn ×1.5`, `+20 luck`) or Glass World (`player damage ×2`, `enemy damage ×2`). These are the clearest expression of the "difficulty should be player-controlled" principle and they cost almost nothing to add now that the world model exists.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/upgrades tests/unit/effects tests/unit/skills tests/unit/content
npm run build
npm run test:e2e -- --grep "explosion|chain reaction|level up"
npm run test:e2e:stress
```

Manual smoke: take Detonation five times and confirm each pick visibly enlarges the blast; kill an elite Tank in a crowd and confirm the explosion is dramatically larger than a Runner's; confirm no offered upgrade is ever a no-op.

Exit gate: every skill level resolves from data, chains terminate at the declared depth, the damage ledger still reconciles exactly, and duplicate-pick waste is impossible.

---

# Phase 7 — Informative upgrade cards, pause menu, and HUD

**Commit:** `feat(v0.3): show the player what everything does`

Covers requests 7 and 9.

### Upgrade cards (request 7)

Each card renders through `describeUpgrade(state, upgrade)`:

```text
┌──────────────────────────────────────────────┐
│ 1.  TEMPERED POWER                    Lv 3→4 │
│     Increase damage dealt.                   │
│     Damage        15.0  →  17.5   (+25%)     │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ 2.  TWIN CASTING                      Lv 1→2 │
│     Launch one additional projectile.        │
│     Projectiles      1  →  2                 │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ 3.  DETONATION                          NEW  │
│     Defeated foes erupt.                     │
│     Blast radius        44                   │
│     Blast damage        30% of victim health │
└──────────────────────────────────────────────┘
```

- The **level badge** (`Lv 3→4`) and the **NEW** badge are always shown — they are identity, not detail.
- The **numeric before → after lines** are gated by the pause-menu toggle `Detailed upgrade cards`, defaulting to on.
- Multi-hit upgrades read as counts (`1 → 2 projectiles`, later `9 → 10`), stat upgrades read as resolved values plus the percentage, and skills read as their resolved effect values at the level being offered.
- Rarity is expressed by card border colour.

### Pause menu (request 9)

`Esc` opens a four-tab overlay instead of a status string:

```text
STATS          UPGRADES          WORLD          SETTINGS

Vitality        86 / 125         Tempered Power        ×4
Damage          17.5             Twin Casting          ×2
Attack rate     1.62 /s          Critical Mass         ×3
Crit chance     145%  (Tier 1)   Sharpened Tip         ×2
Crit damage     200%             Detonation            ×3
Projectiles     3                Chain Reaction        ×1
Pierce          2                Bloodlust             ×1
Move speed      260
Pickup radius   160              CHAOS         ×2.8
Armour          4                Enemy spawn   ×1.90
Regeneration    0.5 /s           Enemy health  ×1.86
XP multiplier   ×1.50            XP gain       ×2.25
```

Everything on this screen comes from the same selectors as the cards and the run-end tally. Settings tab hosts `Detailed upgrade cards`, `Reduced motion`, and `Mute`, replacing the current keyboard-only mute.

### HUD

- Replace the XP text with a real progress bar plus `LVL n`.
- Timer shows the current director phase marker, so "3:00" reads as a milestone.
- Add live kill-chain counter and threat step indicator.
- Milestone/wave banner from Phase 3 renders here.

Short verification:

```text
npm run typecheck
npm test -- --run tests/unit/upgrades tests/unit/ui-selectors tests/unit/content tests/unit/settings
npm run build
npm run test:e2e -- --grep "level up|pause|hud|resize"
```

Manual smoke: confirm every card's stated "after" value matches the stat shown in the pause menu after taking it; toggle detail off and on; resize the window during level-up and pause and confirm both overlays reflow.

Exit gate: card numbers are derived from the same code that applies the upgrade (so they cannot drift), the pause overlay never leaks input or resumes physics accidentally, and both overlays are resize- and restart-safe.

---

# Phase 8 — Survivability stats, pickup pressure, and the balance pass

**Commit:** `feat(v0.3): complete the rebalancing milestone`

### Dead stats

`armour`, `regeneration`, and `luck` are declared, validated, and unread. Either implement or delete them — leaving validated-but-ignored stats is a trap for future work. Recommendation is to implement, because a rebalancing milestone that only adds offense will produce a game where the answer to every problem is more damage:

- **Armour:** multiplicative reduction `damage × 100 / (100 + armour)`, which never reaches immunity and never trivialises late contact damage.
- **Regeneration:** health per second, applied on the simulation clock, paused with the run.
- **Luck:** weights rare/epic upgrade offers and nudges the Fracture and elite rolls.

Add one upgrade for each so they are reachable, which also broadens the pool that Phase 6 draws from.

Also reconsider the **global invulnerability window**: one `lastContactDamageAtMs` means being surrounded by forty enemies costs exactly as much health as touching one. Per-enemy cooldowns make crowds genuinely dangerous; a global window with a shorter duration is the middle path. This interacts directly with Phase 4's solid enemies and Phase 5's damage ramp, so decide it here with all three visible.

### Pickup pressure

Every kill currently drops an uncapped pickup actor. At 300 enemies with chains, that is a second unbounded entity population competing for frame time and covering the arena.

- Cap live pickups (proposed 250); on overflow, merge the two nearest into one worth the sum.
- Three visual tiers by value, so a Tank's drop is visibly worth crossing the arena for.
- Route magnetism through the Phase 4 spatial hash.

### The balance pass

This is the phase where the numbers actually get decided, using the simulator plus real play:

- Publish a **time-to-kill table** — for each role, at minutes 0 / 1 / 2 / 3 / 4 / 5, for four reference builds — and tune until TTK stays inside the declared band. The failure mode this catches is the one the current build has: player DPS scaling and enemy health scaling diverging quietly.
- Publish a **DPS budget**: base 10 DPS at level 1 must reach roughly 400–600 effective DPS by minute five through multiplicative stacking, or the Phase 5 health ramp becomes a wall.
- Re-run the full stress path with every V0.3 system active.
- Record every provisional value and its evidence in reconciliation.

Short verification:

```text
npm test -- --run
npm run typecheck
npm run lint
npm run build
npm run test:e2e:ci
npm run test:e2e:stress
npm run balance
npm audit --audit-level=high
```

Manual smoke: three full runs — a cautious shrine-free run, a Chaos-stacking run, and a Detonation build — confirming each ends between roughly level 24 and 32, that death feels earned, and that the console stays clean.

Exit gate: all fourteen acceptance points pass, TTK stays in band across the reference builds, the stress path meets its budget, and reconciliation records the final tuning values with the evidence behind them.

---

# Additional recommendations

These came out of reading the code and comparing against the reference games. They are ordered by value-per-effort. Nothing here is scheduled above; pull items into a phase deliberately or defer them to V0.4.

### Strongly recommended, already inside V0.3's phases

1. **Fixed logical viewport** (Phase 3) — without it, every balance number in this milestone is monitor-dependent.
2. **Shared spatial hash** (Phase 4) — pays for separation by removing three existing O(n) scans.
3. **Pacing simulator** (Phase 1) — turns a five-minute experiment into a sub-second test.
4. **Upgrade pool repair** (Phase 6) — a wasted level-up is the single most frustrating thing in the current build.
5. **Baseline elite chance from the timer** (Phase 3) — elites currently never appear without shrines.

### Worth adding to V0.3 if appetite allows

6. **Hit-stop on big kills.** Two or three frames of freeze on an elite kill or a large chain. It is the cheapest possible "that felt good" and it is why Risk of Rain 2 and HoloCure land harder than their numbers suggest.
7. **Damage-number aggregation.** With scaling explosions the current per-hit numbers will become unreadable. Aggregate per enemy per ~120 ms and render one larger number.
8. **Level-up queue indicator.** "2 more choices" when several levels land at once, so the player understands the stacked pauses.
9. **Kill-streak audio pitch ramp.** The pierce system already does this per projectile; extending it to kill chains makes a good run audible, which `PLAN.md` explicitly asks for.
10. **Death slow-motion and cause-of-death line.** "Slain by an elite Tank at 4:12" reads far better than an instant overlay.

### V0.4 candidates

11. **Weapon evolution.** Rather than adding many weapons, let the starter weapon evolve at max level plus a paired stat upgrade — the Vampire Survivors hook, and it fits the existing "deepen one weapon" decision.
12. **Mini-boss at 1:00 remaining.** A single telegraphed threat gives the run a climax; the current ending is just the timer expiring.
13. **Per-run seed display and seeded replay.** Nearly free given the existing seeded randoms, and it makes balance reports reproducible.
14. **Profile persistence for settings and best-run statistics.** The natural first slice of `SAVE_DATA.md`, and it makes the Phase 7 settings toggle stick between sessions.
15. **Meta-progression.** Permanent unlocks between runs are the reason Risk of Rain 2 and HoloCure retain players past the first hour, but they should land only once the in-run curve is right.
16. **Colour-independent enemy identification.** Roles are currently distinguished by colour plus subtle geometry; distinct silhouettes would help both accessibility and split-second reads in a 300-enemy crowd.

---

# Decisions needed before Phase 3

These change the work materially, so they are worth settling early. Sensible defaults are proposed; the plan proceeds on the defaults if nothing is said.

1. **Fixed 1600×900 logical view and a 3600×2400 arena?** *Default: yes.* It is a prerequisite for guaranteed off-screen spawning and for monitor-independent balance, and it will require updating existing e2e assertions.
2. **Run length stays five minutes?** *Default: yes.* The director's milestone table is written for a 5:00 run and rescales for compressed test runs. A 10-minute run would want a sixth and seventh phase.
3. **Detailed upgrade cards default on or off?** *Default: on*, with the pause toggle to hide them.
4. **Add the dangerous world/curse upgrades to the pool now?** *Default: yes.* They are the clearest expression of the core design principle and the world model already supports them.
5. **Persist settings to localStorage in this milestone?** *Default: no* — session-only, with the adapter seam left in place, keeping persistence a clean V0.4 slice.
6. **Implement or delete `armour`, `regeneration`, and `luck`?** *Default: implement*, so survivability builds exist.
7. **Per-enemy or global invulnerability window?** *Default: keep global but shorten it*, and revisit once solid enemies and the damage ramp are both live.

---

# Explicitly deferred beyond V0.3

Additional weapons and weapon evolution; mini-bosses and bosses; unlockable content pools and meta-progression; browser-local persistence and portable save export/import; endless mode; a second production theme; final art and audio production; and the education pivot described in [`EDUCATION_PIVOT.md`](./EDUCATION_PIVOT.md).

Stable IDs, serializable models, provenance, and theme-owned tuning data must keep all of those additions possible without implementing them early.
