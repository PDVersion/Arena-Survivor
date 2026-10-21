# G2 — one outdoor candidate at a time

Date2026-10-22. Owner authorizes starting G2. Branch `codex/readable-gameplay-g2`
is stacked on local G1 `54e9b2f`, not a merged-main claim. Current result: all
three candidates locally kept; G2 complete, G3 ready/unstarted. G3/G4 and new art
remain unimplemented. The claims below retain their before-edit chronology.

## G2A scope and exact ownership, claimed before code edits

- Contracts/validation: `src/game/core/archetypes/{ids,contracts,tuning}.ts`,
  `src/game/content/define-theme.ts`.
- Both themes' `{enemies,director,bodies,copy}.ts`; no edits to old saved IDs.
- Pure formation/admission helper: `src/game/systems/director/arrival-cluster.ts`;
  integration limited to `run-scene.ts` natural arrivals and milestone size.
- Primitive-only view: `src/game/entities/{enemy-actor,enemy-primitive-view}.ts`.
  Sprite seam/pipeline/generated art and collision geometry stay independent.
- `src/game/systems/simulation/pacing-simulator.ts`; reuse G1 models/reporter.
- `tests/fixtures/alternate-theme.ts`, `tests/unit/{content/theme,director/spawn-director,simulation/pacing-simulator}.test.ts`,
  `tests/unit/{enemies/cluster-fodder,director/arrival-cluster}.test.ts`,
  `tests/e2e/g2-cluster-v044.spec.ts`; existing roster test only if its explicit
  old five-role fixture is genuinely affected (do not broaden historical claims).
- Evidence `build/content/G2*`, this plan/prompt/roadmap, BUILD_STATUS/BUILD_PLAN_V0.4/
  BUILD_PLAN_V0.4.3/PLAN/THEME_ARCHETYPES/EDUCATION_PIVOT/ECO_CONTENT_MAP/SAVE_DATA,
  AUTONOMOUS_PROGRESS and RECONCILIATION. Save doc is compatibility note only.

G2A candidate: slow individual weak litter in a group of three, each visibly
clearable and independently targetable/rewarded. Trial theme data:6HP/0armour,
64speed/3contact harm/1XP, radius10/display28; group3, spacing34world units.
Sparse roll weight2 with0.5 growth, unlock0.25, first introduction3. These are
trial game numbers, never environmental facts, and require measured acceptance.
Existing material values, weapon tuning, timing/rate0.5 and caps stay unchanged.

## Prompt self-review before implementation

Reviewed PHASE_G2_PROMPT on2026-10-22. Accept with these explicit resolutions:

- A group consists of separate actors, not three painted items paying triple XP
  from one lethal. Formation only applies to natural arrival selection. Duplication,
  elite splitting and causal offspring spawn exactly their requested actors.
- A generic small milestone-count override is necessary: the existing burst
  would introduce about19 actors at25%, contradicting a low-pressure first view.
  Queue the three introduction requests through existing retention, never drop
  causal work. Do not multiply a milestone introduction by group size again.
- Form off-screen on the same ring with world-unit spacing converted to angle;
  do not place unavoidable enemies on-screen or derive spawn/body sizes from art.
- Natural grouping raises arrivals per selection. Measure actual actor shares,
  not just roll weights, and parent/elite budgets. Do not enlarge caps or silently
  label the old per-roll model a valid comparison.
- Primitive two-part shapes are presentation only, with a shared transform/flash/
  destruction lifecycle. Use data, never theme-name branches. A declined art
  silhouette cannot be repaired by changing hitboxes.
- Fresh neutral IDs are content additions, not a save schema migration. Verify
  current unknown-ID compatibility; no saved discovery/unlock field is selected.
- This is a candidate trial. The local gate must explicitly keep/revise/drop;
  a prototype or aided fixture is not natural survival/performance acceptance.

## Ordered checklist and gate

- [x] Fresh G1 identity/baseline captured; prompt reviewed and scope claimed.
- [x] Definition/formation/intro/presentation and both-theme fixture implemented.
- [x] Deterministic admission, retained causal introduction, targets/XP/reset pass.
- [x] Both-theme/all-preset before/after balance and reward/mix review complete.
- [x] Necessary bounded serial browser evidence inspected in Default/Low and
  reduced-motion, with independent body/visual and source/XP assertions.
- [x] G2 short suite + types/lint/build + whole-branch whitespace pass.
- [x] Keep/revise/drop, actual source/checks/limits and next handoff durable.

G2 recipe: `npm test -- --run tests/unit/content tests/unit/architecture tests/unit/enemies tests/unit/director tests/unit/spawning tests/unit/targeting tests/unit/combat tests/unit/elites tests/unit/events tests/unit/simulation`.
Also run affected difficulty/weapons/persistence units for new ID compatibility.
Four balance commands are recorded in content/READABLE_ROSTER_BASELINE.json.
Browser cases: new g2-cluster-v044 only, each bounded30s (retention45s if needed),
one worker/zero retries, owned cleanup. Full app/stress/soak/native/device gates
remain deferred; actual Safari/browser-OS/older-device evidence waived/unverified.

Initial deterministic review revises trial speed50→64: the legacy maximum-ring
approach guard would take19.16s at50, above its16s band;64 reaches in14.97s while
remaining far slower than Microplastics. Keep the existing envelope assertion.
Append the new role to catalogs to preserve existing fixture/roster ordering.

## G2A accepted local gate — 2026-10-22

Keep the candidate: [G2A_REPORT](content/G2A_REPORT.md).278units/29files,
types/lint/build,240before/after scenario summaries and4serial browser cases pass.
Each case now includes old/new mixed roles and exact source/XP/view destruction.
Broad/native/device checks deferred/waived as recorded; no human survival claim.
The first candidate is complete; G2 remains in progress. Next is G2B wrapper
interception, which needs a fresh exact claim/prompt review before implementation.
The `v044` suffix in the bounded test filename is only a fixture filename; it
neither starts nor accepts the V0.4.4 sprite milestone. No generated art is owned.

## G2B scope and prompt review — claimed 2026-10-22 before code

Owner now requests completing the G2 plan, then reporting G3 readiness. Implement
G2B and verify/commit it before claiming G2C. Exact additional ownership:
`src/game/systems/enemies/committed-motion.ts`, `src/game/entities/enemy-motion-cue.ts`,
`tests/unit/enemies/committed-motion.test.ts`, `tests/e2e/g2-motion.spec.ts`;
reuse G2A contracts/validation, both-theme enemies/director/bodies/copy, actor,
run-scene enemy movement/avoidance only, alternate fixture/content tests and
G2 evidence/planning/status/reconciliation paths. No simulator algorithm change.

Reviewed prompt: add neutral `enemy.gust_drifter` (Packets / Wrappers; Paper Wisp).
Approach at80, enter a stationary900ms directional warning within150world units,
commit to a heading offset0.8radians from the captured player bearing, travel900ms
at2.5×base speed, stop1300ms, then approach/repeat. Reusable motion capability
contains all thresholds/timing/offset/speed in theme data. Presentation observes
state; a persistent essential arrow/ring survives Low/reduced-motion. Stats trial:
12HP/0armour,5harm,2XP,radius12/display34. Introduce one at0.32, natural weight3,
growth0.5. Approach trigger is inside the camera's225world-unit vertical half-view;
no off-screen launch. First hint uses existing wave announcement/catalog copy.

Self-review: this is intermittent crossing/interception, not continuous pursuit;
heading locks at warning entry (never tracks during warning/travel). Zero delta
freezes motion; large deltas advance at most one phase so warning/recovery cannot
be skipped. Existing target/contact/XP/cap/causal semantics remain. Actor-local
state resets on construction. Skip obstacle steering during commitment so it
cannot silently re-aim; recovery remains contactable/targetable. Existing drift
waves keep their behaviour for roles without the capability. No save fields or
sprites. Balance model does not simulate these movement or interception costs.

Gate: deterministic phase/heading/reset/invalid-definition checks; current G2
short suite + difficulty/weapons/persistence, types/lint/build/whitespace;120
before/after ambient cases and four balance CLI commands; four bounded serial
both-theme Default/Low+reduced-motion browser cases for phase cue, mixed target,
exact-once XP/death and clean destruction. Keep/revise/drop then phase commit.

- [x] G2B implementation and deterministic motion checks.
- [x] G2B balance, bounded visual evidence and software gate.
- [x] G2B decision/report/status/reconciliation and phase commit.

G2B accepted **keep**: [report](content/G2B_REPORT.md). Ready for the separately
claimed/reviewed G2C Can candidate; G2 overall remains open.

## G2C scope and prompt self-review — claimed before code 2026-10-22

G2B verified/committed7ce03c5. Now claim the same both-theme ID/definition/copy/
director/body/validator-fixture/content/director/enemies test paths and
`tests/e2e/g2-motion.spec.ts`; existing committed-motion/cue/actor integration is
read/reused, not extended unless an evidenced defect requires a recorded claim.
Evidence `build/content/G2C*`, this plan/prompt/current authority/status/reconciliation
paths. Also claim `build/PHASE_G3_PROMPT.md` for the final reviewed handoff only.
No G3 implementation, boss/site/world/weapon/save/sprite code is owned.

Reviewed G2C prompt: neutral `enemy.committed_charger`, eco Aluminium Can / knight
Barrel Construct. Reuse fixed-bearing capability with zero aim offset: approach90,
trigger150, warning1000ms aimed at the player's captured prior position, travel
1000ms at3.5×base (315units), stationary recovery1400ms.18HP/0armour,7contact harm,
3XP,radius14/display38. One introduction at55%, sparse weight2/growth0.4/bias0.
Aimed line crosses the old player position and passes beyond it; moving sideways
leaves the committed route. Unlike the oblique180-unit wrapper gust, this is a
longer fast direct pass followed by a larger recovery opportunity. Primitive can
body/label/end caps provide a separate silhouette; no new sprite or body inference.

Self-review: keep the same phase logic rather than adding a parallel AI system.
Preserve both old behaviours and all finite cap/XP/causal rules. No retargeting
at launch, predictive tracking, invulnerability or extra attack hitbox. New role
must prove the old-position pass and sideways miss, not just share the wrapper's
phase test. Intro at55% is a trial, not natural encounter acceptance; G3 owns
encounter sequencing around the existing mini-boss. Pacing model still omits
movement/survival/offspring/intro/bosses. Compare actual role shares and both-theme
weak/strong build work/XP/cap trade-offs before keep. No numerical survey ranking.

- [x] G2C implementation, content/motion and sidestep/target/XP checks.
- [x] G2C120before+120after/fourCLI, bounded serial browser/software gate.
- [x] G2C keep/revise/drop, complete G2 disposition, reviewed G3 handoff/commit.

### Final verification discovery / narrow ownership extension

The consolidated full unit suite finds one pre-existing Q6 expectation in
`tests/unit/ui-selectors/describe-upgrade.test.ts`: the starter stats must cover
all keys except projectiles/pierce, but Q6 added `primaryTargets` only for a capped
melee tool. The actual starter has no such cap. Test and selector are unchanged
since G1 (empty diff against54e9b2f; selector's last relevant change44585dd).
Claim this test only before correction: exclude the inapplicable capacity from
starter keys and explicitly verify both themes' finite secondary capacity and
knight projectile delivery stats. No selector/weapon/UI runtime change. Rerun the
full unit suite once; record the initial684pass/1fail honestly in the G2C report.

## G2 complete local gate / G3 readiness — 2026-10-22

All three candidates kept individually: G2Ab4d61ae, G2B7ce03c5, G2C in this plan's
owning final candidate commit. [G2C_REPORT](content/G2C_REPORT.md) records the full
disposition.288targeted units, final686units/72files, types/lint/build/whitespace,
12serial candidate browser cases and120before+120after model cases/fourCLI for
G2C pass. Earlier G2A/G2B gates retain their own evidence. Broad/native/device
limits remain as recorded, never silently passed. No push/PR/merge/art.

[PHASE_G3_PROMPT](PHASE_G3_PROMPT.md) is written and reviewed. G3 remains unstarted;
its exact implementation ownership will be claimed at the next owner instruction.
