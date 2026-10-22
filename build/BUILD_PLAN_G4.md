# G4 — useful run reviews and optional mastery reference

Owner requests implementation2026-10-22. Branch `codex/readable-gameplay-g4` from
verified G3`d8ae891`; clean at claim. One verified local phase commit; no push/
merge/new art. Read PHASE_G4_PROMPT and required authorities before this claim.

## Exact ownership before code

- `src/game/systems/statistics/run-statistics.ts` for transient actual weapon
  attribution; `src/game/scenes/run-scene.ts` only damage provenance, end-review
  context and Field Guide data. No HP/reward/attack/clock/cap changes.
- New pure `src/game/systems/mastery/run-review.ts`; existing state/statistics.ts
  only truthful elapsed death-clock correction if verified necessary.
- `src/game/ui/{run-end-overlay,pause-menu-ui}.ts`, `src/game/scenes/menu-scene.ts`
  for bounded summary/details and paged optional enemy/capability guide.
- `src/game/core/archetypes/contracts.ts`, `src/game/content/define-theme.ts`,
  both themes' copy.ts and `tests/fixtures/alternate-theme.ts` for required themed
  labels/advice. Existing enemy/weapon/unlock definitions stay unchanged.
- `tests/unit/{statistics/run-statistics,statistics/statistics,content/theme}.test.ts`,
  new `tests/unit/ui-selectors/run-review.test.ts`, `tests/e2e/g4-mastery.spec.ts`;
  affected UI fixtures only with a fresh exact claim if discovered.
- Build plan/prompt, G4 evidence/report, roadmap/status/current V0.4/V0.4.3 plans,
  PLAN/EDUCATION_PIVOT/THEME_ARCHETYPES/ECO_CONTENT_MAP/SAVE_DATA compatibility note,
  AUTONOMOUS_PROGRESS/RECONCILIATION; SPRITE_PLAN_V0.4.4 documentation reconciliation
  and a next handoff only. No sprite manifests/claims/generation or pipeline edit.

## Design and prompt self-review

Use existing recorded run/profile data. Add `damageByWeapon` to transient run
statistics only, with optional weaponId on actual committed damage records.
Direct/splash retain their originating weapon; skill/unattributed damage is the
remaining partition of the existing total. Group evolved/base weapon IDs by their
actual names, never infer damage from equipped items or assign kills to a tool.
No pending request, overkill, duplicate lethal or source category double-count.
Profile/session folding already selects explicit aggregate fields and must not
persist this transient map. No schema/migration/IDs/unlocks/settings change.

Results default to a concise review: actual tool contributions, accepted site/
curse choices and one attainable next experiment. Preserve the existing full
metrics/damage/upgrade ledger behind a Details tab. Keep restart reachable and
resize-safe; use measured text/paging where needed. Do not assert why a player
failed from a single death source. Death time must be elapsed time, not remaining.
Final-boss victory is only a recorded result when finalBossDefeated is true;
clearing/death/endless stay distinct. Existing terminal coordinator still owns
one durable fold, unchanged by tab switching/resizing/read-only review.

Expose the existing enemy catalog in the same optional Field Guide: one bounded
paged entry, description/behaviour/health/speed/contact harm/material relations
from the active theme, no discovery persistence/facts/handling claims. Add existing
capability unlock progress from current profile values/IDs; viewing never grants
or writes anything. Suggestions respect actual availability, random offer choice,
owned capacity picks and same-slot evolution. No new unlock or permanent grind.
No Australian ranking surface is selected, so no unsourced ranking is displayed.

Baseline/new unlock mechanics are identical: verify unchanged weapon/unlock/tuning
sources and compare the existing120ambient cases against G3, not invent a new
build. Existing first finished attempt unlocks the second tool;25lifetime kills
unlock the current recovery upgrade. Use these to suggest variety, not new stats.

## Gate

- [x] Pure actual source partition, zero/duplicate/unknown/evolved/reset coverage.
- [x] Terminal-aware review/advice, accurate elapsed death time, read-only unlock
  progress/unknown IDs, complete both-theme copy and optional guide paging.
- [x] G4 short suite: content/upgrades/statistics/ui-selectors/codex; affected
  persistence/terminal/reset and architecture/weapons; types/lint/build/diff.
- [x] One full unit run for cross-cutting state/UI; unchanged combat balance and
  comparison to G3 baselines, no new mechanic/tuning claimed.
- [x] Necessary bounded serial both-theme Default/Low+reduced-motion result/guide
  and terminal lifetime-once/resize/restart cases; affected existing save UI if
  actually changed. One worker/zero retries, images inspected, owned cleanup.
- [x] Report/product/status/reconciliation and settled V0.4.4 planning handoff in
  the same verified phase commit. No art or broad browser/stress/device campaign.

Natural first-attempt/offer frequency and environmental facts are not inferred
from aided browser fixtures. External checks remain waived/unverified.

Ownership extension before completion documentation: `build/MASTER_BUILD_PLAN.md`
for the required consolidated G4 implementation/verification record. No additional
runtime scope. Final visual inspection rounds displayed enemy game values to two
decimal places without changing authored/difficulty-resolved values.

Completed 2026-10-22: see [consolidated master record](MASTER_BUILD_PLAN.md#readable-gameplay-g4)
and [G4_REPORT](content/G4_REPORT.md). Final283focused/25files,703full/74files,
5serial browser passes/4.3s/no retries, types/lint/build/whitespace and120identical
G3ambient cases satisfy the selected gate. Prompt retired after durable record.
Next handoff is delivery/selected sprite planning; no new phase or art starts.
