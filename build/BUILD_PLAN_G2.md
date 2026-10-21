# G2 — one outdoor candidate at a time

Date2026-10-22. Owner authorizes starting G2. Branch `codex/readable-gameplay-g2`
is stacked on local G1 `54e9b2f`, not a merged-main claim. G2A Cigarette Butts is
selected first. Wrappers, Can, G3/G4 and new art remain unstarted.

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
