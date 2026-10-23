# Optional development proposals — unselected backlog

## Owner direction — Knights and Magic paused indefinitely

Effective 2026-10-22: all further `knight-magic` theme development is paused
indefinitely. Only the owner explicitly reopening the theme can end this pause;
a new milestone, generic parity rule, old plan or failing themed test cannot.
Do not plan or implement its content, tuning, names/copy, sprites, features or
new dedicated acceptance campaigns. Preserve its existing files and historical
records. Existing generic contract tests may read the frozen pack; a change that
would require editing it must be recorded and deferred until explicit reopening,
rather than silently expanding this scope. Continue eco-guardian through stable
core contracts. This overrides older instructions to keep both packs in step.


Completed performance/session sequencing is in the [master build log](MASTER_BUILD_PLAN.md#performance-original-sequencing).
P0–P6 software, C1–C7 and Q6/G1–G4 are completed records, not a new backlog.
F16 is delivered; other menu entries require checking current code and explicit
owner selection before becoming a bounded phase. The current selected work is
[V0.4.4 sprite preparation](SPRITE_PLAN_V0.4.4.md).

## Recycling ideation — assessed against the existing game

Source: the owner-supplied **Game Concept: Recycling-Themed Roguelite Survival
Game**, received 2026-10-11. It was written without repository context. The
assessment below preserves its useful ideas for subsequent sessions without
requiring future agents to recover the chat attachment. It is design input,
not a replacement for the active milestone/product authorities or approval to
implement every example. See REC-101.

| Ideation suggestion | Repository assessment | Treatment in this roadmap |
| --- | --- | --- |
| Movement, auto-attacks/aim, XP magnetism, level-up choices, escalating runs | Shipped | Maintain and validate; no new foundational implementation |
| Ordinary cleanup character, grabber, plastic/glass rubbish enemies | Shipped as Environment Protector, Cleanup Grabber, and existing material roles | Preserve identities and stable IDs; no automatic rename |
| Grabber range, speed, damage, wider attacks | Reach track, general stat picks, and Collection Sweep already exist | Extend only for a selected mechanic that current tracks cannot provide |
| Plastic fragments and glass hazards | Microplastics and stationary Glass Shards already exist; finite relationships are accepted | Preserve REC-099; shards are clearable enemy actors, not a new timed hazard system |
| Plastic Bag as the fast enemy | Historical identity explicitly replaced by Microplastics | Do not restore or relabel the retired role; any floating bag would be a separately selected new role |
| Contamination zones, obstacles, burst hazards | Existing spill, debris, and vent systems cover these capabilities | Reuse their contracts for new themed sources rather than duplicate hazards |
| Ten-minute runs and longer modes | Five authored minutes at 0.5 gameplay rate already take about ten real minutes; endless/clearing shipped | Do not double authored duration from this suggestion; reconsider length only with pacing evidence |
| Adjustable effects, minimal instructions, clear silhouettes | Reduced motion, bounded feedback, title/settings, hint dismissal, and accepted core sprites exist | Performance P4 plus accessibility F9; colour-independent cues remain useful work |
| New waste behaviours and recycling tools | Modular content exists, but suggested additional roles/tools are unbuilt | F13 and concrete candidates within F1; introduce one of each at a time |
| WasteDex, first-encounter unlocks, defeat counts, optional facts | Field Guide already exists for reference/session totals; enemy discovery and sourced facts are missing | Extend F10 inside the existing guide; no second encyclopedia framework |
| Material drops and recovery efficiency | XP drops exist; recyclable-resource economy does not | F14, optional; begin with aggregate counters and no extra actor population |
| Park restoration and facilities | No between-run restoration loop exists | F15, optional after resources/persistence; a small milestone screen, not a city builder |
| Bosses and evolution | Already planned in V0.4.3, unbuilt | Enrich F5/F2 candidates; preserve C5's post-boss endless/clearing choice |
| Relaxed/Standard/Challenge modes | World tuning and player-chosen risk exist; explicit difficulty presets do not | F16, separate from Default/Low graphics settings |
| Mobile/controller controls | Keyboard/pointer paths exist; dedicated touch/gamepad support is unbuilt | F11 and F18, separately scoped and tested |
| Material specialisation, contamination penalties, collection stations, challenges | Exploratory beyond the accepted simple loop | F12/F17 after selected foundations; no forced quizzes or early specialist-tool requirement |

### Concrete content candidates, still optional

- **Enemy variety / F13:** prototype one new behaviour, with Aluminium Can
  rolling, Cardboard Box releasing bounded child items, or Food Scraps creating
  a short telegraphed zone as initial candidates. Battery, electronic waste,
  cigarette-butt groups, a charging Tyre, and a separately defined drifting
  Plastic Bag remain later alternatives. Reuse the finite spawn graph and hazard
  seams; do not add the entire ten-enemy list. A new role needs a distinct
  silhouette and behaviour, not only another health value.
- **Second tool / F1:** a Vacuum with a short cone or a Compactor with one
  telegraphed area action are initial candidates for a readable contrast to the
  grabber. They must respect the shared event budget, cooldowns, hit queries,
  and damage ledger. Names, widths, reach, and effectiveness remain theme data.
  A Magnetic Collector needs an eligible material role and verified handling
  model before selection; it is not effective against every item labelled
  "metal" by default. Sorting Drone and Recycling Turret are later bounded
  companion/emitter candidates, with summon/projectile caps and no independent
  unbounded AI loops. Compost Launcher and E-Waste Containment Device need a
  convincing processing role and corresponding content before implementation.
- **Boss / F5:** shortlist a Scrap Machine with a readable wind-up/charge, or
  a Landfill Golem using bounded existing waste spawns. Plastic Tide, Battery
  Overload, Garbage Truck, Microplastic Swarm, and Waste Mountain remain
  alternative pitches, not seven scheduled bosses. All summons share the
  existing enemy budget and finite fragmentation rules; a growing visual must
  never define its own collision footprint.
- **Collection identity / F9 and selected presentation work:** prefer theme
  copy such as collected, contained, or processed where appropriate. Existing
  upgrade copy and Processing Ledger already use this language. Inspect surfaces
  before changing them; keep damage, crit, and stable internal semantics intact.
  Collection sounds and disappearance cues are downstream presentation, and
  reuse effect budgets. Do not imply that fragmenting or crushing every material
  is safe real-world recycling.

### Product and performance constraints for these ideas

Keep gameplay first and detailed learning optional. Unlock reference entries
through committed encounter/defeat events, but never lock normal upgrades behind
reading, quizzes, or educational achievement. Distinguish in-game behaviour,
mechanical hints, and sourced real-world guidance in every information surface.
Define an encounter as seeing or engaging an item; merely spawning it outside
the camera should not silently count as discovery. Record that rule in F10's
contract and test it before adding persistent encounter counts.

Start fact content with a small reviewed Australian set; NSW/council guidance is
a possible scope to select, not universal disposal advice. Before publishing
facts, research authoritative current sources, record geography/applicability,
source URL and review date, and validate those fields. Do not promote the
ideation's disposal examples or the game's persistence-health estimates into
verified fact cards. Educational content stays theme-owned and outside gameplay
code, following `EDUCATION_PIVOT.md`.

New content must preserve the P0–P6 performance targets, both production theme
contracts, the readable camera/pace, and simple early controls. A new family of
resources, a drone, a boss spawn, and an existing XP pickup cannot each create
an independent unbounded object population. Any new visual asset follows the
V0.4.4 roster/style gate; prototype mechanics with supported primitives first.

## Optional feature menu — select before implementation

These are local product proposals grounded in the existing architecture. Labels
and tool identities remain provisional until theme/design reconciliation. Session
counts are initial estimates for **60–120 minute sessions**, including validation;
larger features deliberately span sessions rather than promising a whole system
in one hour. Already shipped features such as endless mode are not on this list.

| ID | Feature and player benefit | Estimated sessions | Dependency / runtime impact |
| --- | --- | --- | --- |
| F1 | **Second cleanup tool and weapon slots:** a meaningful alternative build alongside the grabber | 3–4 | C1, after performance gate; medium/high combat/render cost |
| F2 | **One weapon evolution:** a visible reward for completing a weapon track | 2 | C2, F1; bounded replacement in the same slot |
| F3 | **One new shrine and one curse:** additional optional risk/reward choices | 2 | C3, C1–C2 order; may raise entity pressure |
| F4 | **Two elite behaviours:** a shielded or splitting threat with readable telegraphs | 2–3 | C4, prior content gates; bounded modifier work |
| F5 | **Mini-boss and final boss:** a readable climax before the existing endless/clearing choice | 3–4 | C5, preceding gates; cap summons and telegraphs |
| F6 | **Remember settings and best runs:** browser-local persistence and a small unlock pool | 3–4 | C6 and `SAVE_DATA.md`; write at safe boundaries, not every frame |
| F7 | **Save backup and transfer:** encoded text export, validated preview, backup, confirmed import | 2–3 | C7, F6; parsing/storage work outside active combat |
| F8 | **Seed display and repeatable challenge runs:** reproducible practice and bug reports | 1–2 | Later scoped phase; same seed alone is not deterministic replay |
| F9 | **Accessible controls and clearer role cues:** remapping, contrast, readable UI options | 2–3 | Later scoped phase; preserve silhouettes/telegraphs and low-mode budgets |
| F10 | **Field Guide / WasteDex expansion:** first encounters, per-material defeat counts, optional sourced facts and post-run explanations | 3–4 | Reuse the existing guide; Education E4/E5, F6 for persistent tracking; source/review facts before shipping |
| F11 | **Touch controls:** movement and interaction on phones/tablets | 2–3 | Separate mobile viewport/input/performance gate |
| F12 | **Material effectiveness and layered waste:** appropriate tools expose or clean different layers | 4–6 | Exploratory E2/E3, F1; highest complexity, independently abandonable |
| F13 | **One new waste behaviour:** a rolling can, unfolding box, or zone-producing food waste | 2–3 | New scoped content phase; F1 not required; finite spawn/hazard rules and stress gate |
| F14 | **Automatic recyclable-resource totals:** recover materials alongside XP, initially without extra pickups | 3–4 | New economy phase, F6 for storage; exact committed rewards and bounded counters |
| F15 | **Small park-restoration progression:** three visible milestones and equipment/cosmetic unlocks between runs | 3–4 | F14 + F6; new scoped phase; menu presentation first, no city simulation |
| F16 | **Beginner/Normal/Experienced presets (Q1 verified):** approachable or more demanding runs chosen before play | 2–3 | Theme-owned difficulty data; Normal gentler than old baseline; Q1 balance/browser/stress gate |
| F17 | **One optional collection-station objective:** deposit selected resources or safely clear a marked zone for a reward | 3–4 | F14 for deposits; education research if factual; later E6-style opt-in objective, no mandatory quiz |
| F18 | **Controller support:** movement, interaction, and complete menu navigation with a gamepad | 2–3 | Existing input/settings seam; disconnect/focus/deadzone/menu regression coverage |

Historical initial shortlist (F1/F5/F6 now delivered): **F6, F1, F5, and F9** for retention, build variety,
a run climax, and accessibility. The owner can choose any subset. Preserve C1–C7
order unless a documented resequencing creates a smaller safe prerequisite; for
example, bringing a settings/statistics-only part of C6 earlier needs its own
phase boundary and rationale before code changes. The ideation also makes
**F13 and F10** useful next choices for recognisable variety and optional learning;
**F14/F15** are a later retention experiment rather than immediate prerequisites.
Selection does not authorize the entire feature menu or automatically promote
exploratory education scope.

V0.4.4 eco sprite preparation is selected after the locally completed G1–G4 roster.
Read the style/pipeline plans and claim manifest rows before any later art work.

## How future selections become bounded phases

Before implementation check current code and completed master records, select one
remaining capability, then write its exact ownership, dependencies, acceptance and
short checks in an active plan. C1–C7 and F16 are complete and cannot be restarted
from the old session estimates. The following are historical estimates for still
optional scope; G2/G4 already deliver parts of F13/F10. Scope only the remaining
chosen behaviour. Knights and Magic stays paused.

| Optional package | Session slices and acceptance |
| --- | --- |
| F10 — Guide expansion | (1) encounter/defeat state and exact-once committed-event tests, then reference selectors; (2) enemy/material sections in the existing guide, discovered-state filtering, counts, keyboard/pointer navigation and resize; (3) a small sourced/reviewed fact set with distinct game/fact copy and validation; (4) reload/import compatibility, opt-in debrief, and complete guide/browser gate if selected |
| F13 — One enemy | (1) author one role's theme contract, reusable movement/spawn/hazard behaviour and deterministic tests; (2) director integration, readable primitive cues, offspring/cap/ledger browser checks and balance; (3) dense mixed-roster/default-low stress, edge cases and corrections if needed |
| F14 — Resources | (1) finite theme-owned resource definitions, reward provenance and exact-once run counters alongside XP; (2) run-end/session summary and storage/schema migration, with restart/double-count/import fixtures; (3) browser collection/reload/recovery and stress with no new collectible actors; (4) narrowly scoped eligibility/recovery rules only if selected, plus full economy gate |
| F15 — Restoration | (1) three milestone conditions, costs/unlocks and pure insufficient-resource/idempotence tests; (2) existing-menu progress screen and bounded before/after scene presentation; (3) persist spend/unlock safely, handle storage failure and import compatibility; (4) complete restore/reload/browser/low-mode gate and adjust the progression economy using evidence |
| F16 — Difficulty | (1) neutral preset contracts, theme tuning and ordering and baseline-comparison tests; (2) pre-run choice, clear copy, settings compatibility and browser lifecycle; (3) simulator comparisons, escape/telegraph/readability checks and per-preset stress; difficulty never changes implicitly with graphics quality |
| F17 — Station/objective | (1) one optional objective's state/reward/expiry rules and duplicate-completion tests; (2) bounded placement/telegraph and existing interaction prompt; (3) committed resource deposit or zone-clear reward, helpful failure feedback and factual-content review when applicable; (4) ignore/complete/restart/reload, balance and stress gate |
| F18 — Controller | (1) input adapter with deadzones, action mapping, repeat behaviour and disconnect tests; (2) title/pause/guide/level-up/overtime/end-screen navigation and device-switch browser checks; (3) focus/unplug/reconnect, remapping compatibility and real-controller smoke if hardware is available |

## Design-review priorities and architecture index — 2026-10-12

Owner request: retain the repository-aware recommendations from the environmental
survivor prompt, place them beside the appropriate planned work, and provide a
single-file architecture map. This records prioritisation and proposed scope;
it does not select every optional feature, rename the game, reorder C1–C7,
or authorize content implementation inside a performance phase.

The [interactive architecture map](ARCHITECTURE_MAP.html) indexes current game
features, retained secondary-theme mechanics, technical foundations and future
packages. Every item has a stable reference identifier, related-item links,
implementation/design sources and an explanation. Future-phase filters only
change the documentation view; they never enable game code or mark a gate passed.
The map is a dated snapshot, not a replacement for active plans or live progress.

### Recommended priority, with existing phase placement

| Priority / reference | Recommendation | Placement and dependencies | Acceptance / boundary |
| --- | --- | --- | --- |
| R01 / P0–P6 | Finish performance readiness before multiplying tools, actors and effects | Existing P0–P6 sequence; Q1/Q2 remain delivered corrections; read live progress for P1 status | Preserve correctness/caps, measure production and report physical older-device acceptance separately |
| R02 / F19 | Sharpen identity and selectively polish existing copy/UI | New optional identity/presentation package after the performance gate, with explicit ownership before implementation; coordinate with F9/F10 and C1 copy | “Cleanup Shift” is a proposed name, hopeful/practical/playful tone; no automatic rename. Correct obsolete Sorting Pulse wording, make card hierarchy action → mechanical change → optional context, and lead the run report with outcome/build moment |
| R03 / F10 | Extend the existing Field Guide with encounters, per-material counts and reviewed optional facts; add a personalised run takeaway | F10's existing four slices, exploratory Education E4/E5; F6 for persistent discovery history. This is a high design priority, not an implicit move ahead of C1–C7 | Start with one relevant takeaway, at most two; use committed outcomes and a pure selection rule. Reading/quizzes never gate ordinary play; sources, region and review dates required |
| R04 / F1 | Add one contrasting auto-firing cleanup tool, initially a short-cone Vacuum prototype | C1 / F1 after P6; reuse shipped delivery contracts, scheduling, causal budgets and the ledger | Test positioning/build variety at current camera/pace before extra slots or a large tool roster. Existing Longer Grabber and Collection Sweep are not duplicate new features |
| R05 / F13 | Add one distinct enemy behaviour and a legible wave response | Existing F13 slices; a named future content phase is still required, independent of F1 | First candidate: Rolling Can aimed at the player's previous position then rolling past. Charging Tyre is an alternative, not a second simultaneous commitment. Leaking Waste Container is later, using bounded existing hazard contracts |
| R06 / F6–F7 | Remember settings/best runs and add modest unlocks; preserve portable saves | Existing C6 / F6, then C7 / F7. Any earlier settings-only prerequisite needs documented resequencing/ownership | Prefer sidegrades, discovery/cosmetics and best records over permanent numerical power; preserve SAVE_DATA validation/backup/import rules |
| R07 / F2–F5 | Add one qualitative tool evolution and a readable boss climax | C2–C5 in their existing dependency order; keep post-boss endless/clearing choice | Evolution changes a visible action and replaces its slot. New shrine/curse/elite choices must stay understandable and bounded |
| R08 / F9 and V0.4.4 | Improve role cues, interaction hierarchy and successful-collection feedback; finish art against the settled roster | F9 for accessibility; measured presentation work belongs to P2/P4 only within their existing ownership. Remaining sprites stay V0.4.4-gated | Player harm, attack geometry and hazard warnings have priority over decoration; preserve reduced motion and bounded audio/effects |

F16 has already shipped in Q1 as Beginner / Normal / Experienced. Do not
schedule difficulty presets or endless/clearing again from the generic prompt.
The roadmap's earlier assessment table remains a dated historical snapshot;
current status comes from the active plan/progress, including concurrent sessions.

### Historical design suggestions — check completed implementations first

- **F1 / C1:** consider a bounded Vacuum → Collection Sweep interaction only
  if the prototype's suction/action is immediately legible. Theme data owns
  reach, angle, force, limits and cadence; no manual weapon switching is needed.
- **F2 / C2:** evolve an action qualitatively rather than awarding another
  percentage. A future containment attachment may reduce eligible fragment or
  spill consequences, but needs supporting enemy content and a tested trade-off.
- **F10 / E4–E5:** keep upgrade copy mechanical first; optional explanations
  share the existing information surface. Replace floating facts with a brief
  discovery cue and a voluntarily opened entry. Start without special fact-orb
  actors. “Learn mode” means optional information depth initially, not a parallel
  game ruleset. Explain Fragmentation's gameplay bargain without presenting
  pollution fragmentation as successful recovery or safe handling advice.
- **F13:** make Bottle, Microplastics, Glass, Shards and Bagged Waste visually
  distinguishable before expanding count. Preserve Q2's Microplastics opening
  and quiet bottle unlock unless an owner-selected tuning change supersedes it.
  Wave candidates are scattered arrivals, crossing sweeps, durable groups and
  mixed releases, with telegraphs/recovery; prefer varied responses to density.
- **F8, then F20:** show seeds/repeatable presets first; an optional daily local
  challenge can reuse a versioned challenge configuration later. A seed alone
  is not deterministic replay. Online leaderboards/backend are not prerequisites.
- **F12 / E2–E3:** defer the full material-effectiveness matrix until a second
  readable tool proves useful. Layered waste remains an independently
  abandonable experiment, not a mandatory educational foundation.
- **F14 → F15:** a small restoration screen can reinforce hope later, after
  resource/profile foundations. Do not expand it into a city-management game.
- **Later setting experiments:** oil/contamination fits hazards; heat waves may
  become telegraphed arena events; invasive plants belong to an accurately
  identified habitat setting; deforestation/biodiversity loss suit habitat
  conditions, objectives and restoration. These are ideas, not new scheduled
  enemy identities, factual claims or approved phases.

### Additional optional and parked identifiers

| ID | Item | Proposed placement / state |
| --- | --- | --- |
| F19 | Identity, copy and existing-screen hierarchy pass | Optional, unselected. Two slices: (1) inventory stale copy and propose name/tone/labels against current theme; (2) selected copy/layout changes with content validation, keyboard/pointer/resize and visual checks. No menu/framework rebuild |
| F20 | Daily challenge built from repeatable presets | Optional, deferred after F8; requires a named phase. Version challenge seed/config/date policy and validate repeatability claims before release |
| ART-RES | Double native sprite resolution while preserving world display size | **Parked at the owner's request.** No current-phase or automatic V0.4.4 inclusion. If revisited, compare one newly authored higher-resolution baseline at identical display size, measure cost and update style/pipeline coherently; upscaling existing final pixels adds no detail |

Keep the existing pixel style, palette anchors and sprite presentation/simulation
boundary. Do not rebuild Phaser/TypeScript as single-file vanilla Canvas. New
functions extend the existing contracts, theme definitions, selectors and UI.

### Concurrent-work and identifier guardrails

This amendment owns this section and `build/ARCHITECTURE_MAP.html` only. It
does not edit active build checklists, source, manifests, progress, README or
the shared reconciliation log while the other performance session is writing
them. Preserve earlier roadmap edits and re-read changed authorities before
refreshing the map. Record any promoted implementation decision in reconciliation
with its owning phase later; this section is the durable design-review record.

Map identifiers reuse content IDs (`enemy.fast_fragile`, `upgrade.weapon_range`),
feature IDs F1–F20 and phase IDs P0–P6 where available. `SYS-*`, `UI-*`,
`ART-*`, `DATA-*` and `TOOL-*` are documentation references, not new saved IDs.
Never renumber/reuse an existing map ID; retain a retired identifier with a
replacement pointer. Preserve ID fragments when updating the single HTML file.
The map embeds its catalog to work offline and requires no library/build change.
Source links resolve relative to the repository; the map itself also remains
usable when copied elsewhere, although source links then need the repository.

Map verification at capture: **126 unique items / 381 linked relationships**,
90 current items including current-phase foundations. Every source path exists;
isolated Chromium checks pass for phase/search/area/status filtering, expandable
details, related-item navigation/history, ID deep links, reset/list/summary
controls, mobile width and light/dark layouts, with no page errors. Visual
inspection uses settled screenshots. No game suite or performance recording is
run by this amendment; the other session retains those resources. The previous
roadmap text is verified unchanged after removing this added section.

## Verification and reporting

Run the phase's targeted units/browser paths after meaningful changes. Before
marking a phase complete, verify the applicable gate. The following full
browser/stress commands are CI or separately scheduled consolidated-gate
references; they are not per-session local requirements:

```sh
npm run typecheck
npm test -- --run
npm run lint
npm run build
npm run test:e2e:ci
npm run test:e2e:stress -- --workers=1
```

Use `npm run balance` when combat, progression, spawning, or world tuning changes.
Run `npm audit --audit-level=high` for dependency changes and milestone delivery
where network access permits. Keep the long readability measurement opt-in:

```sh
ARENA_LONG_MEASURE=1 npm run test:e2e -- --grep @measurement --workers=1
```

Manual performance recordings complement these commands; the existing short
stress test is not a sustained real-device benchmark. Record commands, exit
status, failures, skips, and blocked checks accurately. Never disable a failing
test or add retries to disguise performance regressions. Fix related defects;
leave unrelated user edits intact.

Keep `AUTONOMOUS_PROGRESS.md` concise: objective; branch/HEAD; current phase;
session start/deadline/actual elapsed; completed and partial work; commands and
results; evidence links; decisions/reconciliation IDs; outstanding issues;
selected/pending feature IDs; next task; blockers. Update after every completed
cycle and at interruption/end. On recovery, inspect the diff and verify partial
work before resuming; do not trust a stale checkbox.

At session end, report objective status, implemented features, fixed bugs,
measured improvements, executed checks, unverified work, remaining features,
known risks/blockers, and the next priority. Stop at the real deadline, a fully
validated objective, or an actual inability to progress. Do not wait for another
instruction between safe tasks during a running session.

Work stays in this repository. No production deployment, cloud/billing changes,
secret edits, destructive migration, unrelated data access, or external messaging.
Use isolated fixtures for saves. Runtime save import must still require the
player's explicit confirmation and successful backup. If restricted permissions
block a check, document it and continue independent work without pretending it ran.


## Deferred scope retained from consolidated historical plans

These are historical design inputs, not new content selection. Later delivered
items (including endless/clearing and difficulty presets) must not be scheduled
again. Current C1–C7, F1–F20, SAVE_DATA and the active plans govern what remains.

### V0.4 candidates

1. **Weapon and equipment slots, and delivery kinds.** Rather than one deepening weapon, move to a small number of auto-firing weapon slots plus passive equipment slots. This is the natural home for the type system described in [`EDUCATION_PIVOT.md`](./EDUCATION_PIVOT.md), and it is where weapon level caps and evolution belong.

   It is also where `WeaponDefinition` splits delivery into a discriminated union, so a melee weapon can declare an arc and a target cap instead of a projectile speed and lifetime. V0.3 deliberately stops at the generic stat surface — `range`, `knockback`, `armourPierce`, and optional per-weapon crit — because the union's shape depends on decisions slots have not made yet. Splash also belongs here, and needs an explicit boundary against the existing on-kill detonation skill: splash triggers on hit, detonation on kill, and the damage ledger has to keep them apart.
2. **Type and effectiveness system.** Enemy and tool attributes with a small effectiveness matrix. Designed in `EDUCATION_PIVOT.md`; it needs the slot system first.
3. **Endless mode.** The director already supports `t > 1`; endless needs only the escalation index and a terminal condition.
4. **Mini-boss at the final milestone.** The run currently ends when the timer expires; a telegraphed climax is a better ending.
5. **Per-run seed display and seeded replay.** Nearly free given the existing seeded randoms, and it makes balance reports reproducible.
6. **Profile persistence** for settings, best-run statistics, and unlocks — the natural first slice of `SAVE_DATA.md`.
7. **Meta-progression.** Permanent unlocks between runs are why the reference games retain players past the first hour, but they should land only once the in-run curve is right.
8. **Layered composite enemies.** Multi-material enemies whose outer shell breaks to expose a different interior. Strong design and a natural fit for the environment theme; see `EDUCATION_PIVOT.md`.
9. **Colour-independent enemy identification.** Roles are distinguished by colour plus subtle geometry; distinct silhouettes would help both accessibility and split-second reads in a 300-enemy crowd.
10. **Per-enemy invulnerability windows**, revisited alongside the above.

---
