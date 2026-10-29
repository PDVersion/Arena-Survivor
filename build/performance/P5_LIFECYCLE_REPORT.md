> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# P5 / Session 6 — lifecycle slice

Affected lifecycle gate: **verified locally, 2026-10-15**. Overall P5 remains
open. Session 7 startup/compatibility is next; P6 and optional content have not
started. Local delivery only on `codex/v0.4.3`, parent `d9047c0`, subject
`fix(v0.4.3): bound lifecycle and startup costs`. The subject is the plan's P5
subject; this commit implements lifecycle, with startup explicitly deferred.

## Reproduction and fixes

REC-117 is reproduced without a browser by executing the actual `dropExperience`
and `enforcePickupCap` methods against the actual PickupActor with synchronous
DESTROY/body/group doubles. Drop 1,040 one-XP pickups in repeating 80-point grids:
`x = 100 + (i % 80 % 10) * 10`, `y = 100 + floor(i % 80 / 10) * 10`.
The original code leaves **535 tracked references / 250 active actors** after
790 merges. A targeted newest-drop-at-distance-0.1 fixture also proves that the
newest pickup can be destroyed during its own cap enforcement. Its scene cleanup
listener was installed too late. The listener now exists before enforcement.
No sampled-nearest search, strict-distance tie order or retained-actor source
attribution changes for unpaid rewards.

A second failing regression shows that an already-claimed pickup can participate
in overflow during its collect tween. Keeping it loses the newly merged reward;
absorbing it can pay its value twice. Overflow now retires paid presentation
before choosing an unpaid pair. Total actor cap stays 250; the collect cue may
finish early under cap pressure. Both race directions, fractional XP and repeated
claims are covered. A successful claim always starts its collect cleanup, including
the test-only level-cap path that previously returned without a cue/destruction.
No production XP curve, reward multiplier, identity or cap changes.

The first correctly wired real Phaser stop probe finds **one retained destroyed
hazard, one feedback reference, one borrowed map reference, 250 claim IDs and two
pending events** after engine teardown has already removed objects/bodies/timers/
tweens. A reusable scene retains those collections until its next create. Named
idempotent shutdown now releases actor/UI/input references, map/hash buffers,
claim IDs, pending damage presentation and both causal queues at stop time.
Run data/statistics and terminal metric snapshots remain intact. In-run causal
ordering/deduplication semantics are unchanged; no history eviction algorithm.

Inspection confirms Phaser 3.90.0 owns DisplayList destruction, Clock timers,
TweenManager shutdown and Arcade world teardown. The existing sprite registry
removes its POST_UPDATE hook and clears followers on scene shutdown; actor destroy
removes its follower. Shutdown does not touch already-nulled physics (REC-020).
Audio destroy closes its context once even when invoked repeatedly. No sprite
pipeline, graphics/audio architecture, pooling or startup changes were needed.

## Resource and reward evidence

Two Chromium cases, **one worker / zero automatic retries**, use real Phaser
Canvas and each production theme. Each creates a tiny idle RunScene fixture and
performs three stop/start reconstructions, alternating Default/Low fixture
settings across cycles. Authored theme assets are loaded by the existing loader;
RunScene.update is disabled to isolate ownership from combat/director scheduling.
This validates engine lifecycle, not a playable run, renderer compatibility,
settings UI switching, performance throughput or hardware readiness.

Every cycle in both themes asserts:

| Checkpoint | Counts / reward |
| --- | --- |
| Fresh reconstruction | 1 player body; stable theme-specific display count and POST_UPDATE listener count |
| After 1,040 drops / physics post-update | 250 tracked, 250 active, 250 group members, 250 enabled pickup bodies, 790 merges, 1,040 unpaid XP |
| After duplicate collection attempts / cue completion | 250 successful claims, exactly 1,040 awarded XP; 0 pickup Set/group/body ownership |
| Stop with hazard/feedback/queues and a sprite-flash timer pending | 0 tested retained collections/claims/backlog/map references; 0 display objects, bodies, timers, tweens and POST_UPDATE listeners; player/follower destroyed; scene blur/focus handlers removed |
| Repeated cleanup | No error or repeated UI destruction; queue identity/lethal/effect claims released |

Body removal is deferred to Phaser's post-update. Assertions wait for its
pendingDestroy set to drain; a synchronous Set size is never substituted for a
physics-owned count. Deterministic body/group counts are explicitly doubles;
the browser checks independently inspect real world/group ownership.

Both-theme units additionally repeat overflow/collection three times, assert
survivor provenance and equal-distance ordering, verify fractional sums and both
paid-cue race directions, and cover the test XP cap. Shutdown units execute the
actual method, reject physics/timer/tween access, verify listener removal and
idempotence, clear deduplication claims, and preserve damage/gameplay data.
These are bounded ownership tests; no GC/heap endpoint is called leak evidence.

## Executed checks

| Command | Result |
| --- | --- |
| `npm test -- --run tests/unit/lifecycle/pickup-lifecycle.test.ts` before fixes | Expected failures: REC-117 gives 535 tracked; newest actor retained; paid-cue reward race fails in both themes |
| `npm test -- --run tests/unit/lifecycle tests/unit/xp tests/unit/events tests/unit/sprites tests/unit/feedback` | 73 tests / 11 files pass at the affected checkpoint; later fractional/second-race coverage included in final full unit run |
| `npm run typecheck` | Pass on final source/tests |
| `npm test -- --run` | **466 tests / 55 files pass** |
| `npm run lint` | Pass |
| `npm run build` | Pass; game entry 1,618.80 kB / 377.58 kB gzip; existing chunk advisory |
| `npm run test:e2e -- tests/e2e/lifecycle-v043.spec.ts --workers=1 --retries=0` | **2 pass**, 5.3 s total; 3 reconstructions per theme, zero page errors |
| `git diff --check` | Pass |

Initial browser attempts: sandbox binding fails with EPERM before test execution;
permitted execution proceeds. Two eco-only fixture attempts time out at 45 s
because direct dist Phaser ESM differs from Vite's Phaser module, breaking scene
instance/key recognition. A test-only re-export uses the same Vite module as game
actors/scenes, and bounds the initial ready wait. The next eco-only run completes
in 2.2 s and exposes the five stopped-resource failures above. After fixing those
owners, the two-case run passes. Final review moves the idempotence call after the
stopped-resource snapshot, ensuring that manual cleanup cannot mask event wiring;
the final two-case rerun passes in 5.3 s. These failures are retained as findings,
not hidden by retries or included as passing evidence. One shutdown unit initially
fails because a deep spy-argument comparison touches its intentionally throwing
physics getter; identity comparison fixes that test harness without weakening the
no-engine-access guard.

No browser/performance jobs overlap. Playwright closes its owned browser/server;
port 4173 has no listener after completion. Unknown processes and review port 4213
are left alone. No push, CI trigger, PR, dependency update, balance change or save
write. The eight pre-existing dirty plans and three untracked session prompts are
preserved unstaged; initial patch/prompts are backed up under
`/private/tmp/arena-p5-session-20261015/`.

## Deferred acceptance

The owner's limited-local-browser policy overrides earlier long per-session
checklists. These are **pending, not passed**:

- `npm run test:e2e:ci -- --workers=1 --retries=0` and
  `npm run test:e2e:stress -- --workers=1`: Actions or an authorized consolidated
  gate after several sessions; no CI claim for this local commit.
- Full authored run at the unchanged 0.5 simulation rate; extended overtime;
  ten end-to-end terminal/restart cycles; a 20–30-minute lifecycle soak;
  real focus/visibility resume and catch-up behavior; pause/resize and Default/Low
  settings UI switching under sustained play. Scene stop/start is covered here;
  permanent active-scene removal/game destruction is not an acceptance claim.
- `npm run check:production` browser boot/play/guard check and cold/warm/network/
  asset-failure/startup measurements: Session 7. Runtime boot wiring is unchanged,
  so no redundant production browser run was added to this lifecycle slice.
- Broader browser/WebGL/Canvas matrix, sustained mixed 300-live combat,
  representative older integrated-GPU device and P6 combined readiness.

P5 overall stays open. REC-117's specific retention blocker is resolved; REC-119
records the new collection and shutdown guardrails. There is no frame-rate,
heap-growth, startup-speed or physical-device improvement claim.

Time budget: start **13:25:18 AEDT / 02:25:18 UTC**; maximum deadline
**14:55:18 AEDT / 03:55:18 UTC**. Final verification/review began early at
**13:33:47 AEDT / 02:33:47 UTC** (8 min 29 s), preserving the final 20-minute
reserve. Final elapsed recording is in AUTONOMOUS_PROGRESS.md and the delivery
message.
