> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# C1 foundation — automatic slots and attack ownership

Verified local slice, 2026-10-20 (Australia/Sydney), starting at clean
`45f837f` on existing `codex/v0.4.3`. C1 overall remains open.

The owner explicitly replied “yes proceed” to continuing planned C1–C7 after
verified software checks with missing P5/P6 browser/device evidence remaining
release-blocking. This changes implementation order; it does not pass or waive
Safari, missing branded/platform combinations or older physical integrated-GPU
acceptance. No accepted P5/P6 campaign was rerun.

## Delivered

Each run has ordered serializable weapon slots and a copied starting loadout.
Successful attacks advance only their slot's simulation clock. No-target and
blocked-state attempts consume no cooldown, and long frames do not replay missed
attacks. Each theme authors capacity two in its weapons file; normal play still
starts with the same sole starter. No second player-facing tool is offered yet.

Melee damage and Collection Sweep carry the actual weapon into committed hits.
Projectiles retain an immutable copy of their attack-time definition, including
armour bypass, knockback and stable source identity. Catalog changes after launch
cannot lend them another weapon's data. Exact capped applied damage continues
through the existing ledger and lethal-claim queue.

Restart reconstructs starting slots/clocks and resets shared modifiers. The pure
reset helper now preserves the original difficulty, matching normal scene-created
runs. No tuning, XP, rate, sprite, dependency, persistence or physics teardown
changes. Only slot capacity is newly authored theme data.

## Verification

- Typecheck, all **495 unit tests / 58 files**, lint, production build, diff check.
- Six new slot cases cover capacity/duplicates/invalid input, immutable
  acquisition, independent clocks/no catch-up, global modifiers across melee and
  projectile definitions, reset/difficulty and serialization; content validation
  adds a seventh new deterministic case verifying authored capacities.
- Two new actual Phaser actor/scene cases, one per theme: isolated Canvas game,
  test mode, fixed explicit simulation timestamps, paused automatic physics,
  no ambient/contact/XP/hazards. Two test-only definitions fire at timestamps
  0 and300: clocks `[1000,300]` then `[1000,600]`, shots2 then3, no shot at299.
  Empty-target clocks and paused shots stay zero. An in-flight secondary retains
  full armour bypass and positive knockback after its catalog changes; one death
  keeps its secondary source ID. Actual capped ledger totals are14 (eco) and9
  (knight), and every breakdown reconciles exactly. Restart returns one starter
  with clock zero. No page errors.
- Nine existing affected browser cases pass: grabber geometry/presentation,
  overcrit/delivery boundary, terminal/HUD/focus-resize, both-theme pickup and
  stopped-resource lifecycle. These are existing scoped assertions, not new
  native-event or long-play evidence.
- Serial one worker, zero automatic retries; affected-suite global cap180s and
  new-case timeout30s each. Final corrected new-case run cap60s. Owned server
  and browser exit; review4213 and unknown processes untouched.

Initial two new cases passed before adding the exact-total assertion. The combined
11-case run passed10 and exposed an incorrect fixture expectation: armour uses
points, so `.5` does not mean50% reduction. The fixture now uses100 points.
No gameplay formula changed. The two corrected cases pass, then exact environment
observations are attached and those same cases pass for durable evidence. Setup
first failed to bind the sandboxed local server; approved bounded execution
started it successfully. All attempts are retained in the results summary.

Environment: local M5 Pro host; actual user agent, Canvas renderer, page
viewport/DPR,800×450 isolated game size, per-case values, source hashes and
execution counts are in `C1_FOUNDATION_RESULTS.json`. The standard Desktop Chrome
profile supplies a Windows user-agent string on this macOS host; this supplies no
physical Windows evidence. CPU inventory re-read was sandbox-denied; host identity
is retained from prior evidence, with actual uname recorded. Canvas evidence makes no
WebGL/GPU performance, native visibility, human survival or production throughput
claim. No full app/stress/long/startup guard campaign repeated.

## Next gate

Continue C1 with the contrasting second tool, acquisition through the ordinary
level-up pool, weapon-owned offers beside definitions with equip eligibility,
on-hit splash distinct from on-kill detonation, simulator models and the combined
balance/readability/affected stress gate. Do not start C2 before C1 verifies.
Other optional features and V0.4.4 sprites remain outside scope. Final release
still requires the unresolved browser/device acceptance.
