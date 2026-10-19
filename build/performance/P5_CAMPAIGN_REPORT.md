# P5 / Session 10 — authorized consolidated lifecycle campaign

**The scoped M5 lifecycle campaign passes. P5 overall remains open for broader
browser/device compatibility; P6 has not started.** No production defect was
reproduced, and no runtime, balance, dependency, asset or persistence change is
included. This slice adds opt-in test instrumentation and durable evidence.

## Authorization, source and environment

On 2026-10-19 the owner explicitly approved “yes run the campaign lifecycle”,
following the request for one serial M5 campaign of up to 90 minutes. That
supersedes the Session 10 handoff's prior lack of long-campaign authorization.
It does not authorize publication, another browser/device campaign, or P6.

Clean starting checkout: `e2e8111`, existing `codex/v0.4.3`. Read-only recheck
confirms PR #25 merged `03965ef` as `54b9b1b`, and Actions run `38829241556`
passes only `03965ef`. There is no matching-head remote result for this slice.

| Item | Recorded value |
| --- | --- |
| Device / OS | Apple M5 Pro, 48 GiB, Darwin 25.5.0 / macOS |
| Browser / renderer | Chromium 151.0.7922.34; WebGL, ANGLE Metal Renderer: Apple M5 Pro |
| Initial actual viewport / DPR | 1280×657 / **2** inside a 1280×800 window; current evidence does not inherit Session 9's DPR1 |
| Window IDs | Both tabs **163985436** |
| Delivery / theme / difficulty | Vite test mode; actual eco RunScene/BootScene/config; Normal; Default/Low |
| Gameplay rate | **0.5**, unchanged; no clock fast-forward |
| Full campaign | **1 pass**, one worker / **zero automatic retries**, one long invocation, 27-minute upper bound |
| Measured ownership window | **1,200,458 ms**; runner reports 20.0 minutes |
| Fixture source | Hash-frozen before the long invocation; all three source hashes match after completion |

Raw capture: [P5_CAMPAIGN_RESULTS.json](P5_CAMPAIGN_RESULTS.json), copied verbatim
from Playwright's `testInfo.outputPath("campaign.json")`. The derived
[summary](P5_CAMPAIGN_SUMMARY.json) includes raw/fixture SHA-256 values and the
recorded environment. No source edits occurred during the accepted campaign.

## Method and boundaries

`tests/fixtures/p5-campaign.html` is a dev/test-only page with a root base URL.
Its control module imports the same Vite-resolved Phaser instance as the actual
scenes. It uses the existing config and BootScene asset loader, subclasses
RunScene only to record create/stop counters, and runs the actual inherited
update, physics, director, combat, reward, upgrade and terminal methods.
Controls stay in a Playwright JSHandle; no writable hook is added to production
or the existing read-only telemetry facade. The theme and sprite pipeline do not
change. Production JS/HTML contains none of the fixture/control/audio markers.

The sustained portion uses `noContact` and `noHazards` to reach the full clock
reliably, with scripted WASD movement and actual first-offer upgrade application.
A real XP pickup is seeded to set up the level-up overlay, and one deferred
benchmark-origin arrival is seeded for paused-queue verification. These are
explicit lifecycle fixtures, not an untouched progression/pacing build or human
survival play-test. Hazard soak and unassisted survival are not claimed.

Native overlay rounds attach to the default context of a fresh owned Chromium
process with Playwright `noDefaults:true`; focus emulation is explicitly **off**
while observing actual same-window tab events. Stable scenario setup and the
long sustained portion explicitly turn it **on**, because unrelated desktop
focus changes otherwise correctly pause the run. Only the native rounds count
as native-event evidence. No synthetic DOM events, visibility-property overrides,
dependency patch or direct focus-handler call substitutes for native events.
The sustained window is an instrumented ownership test, not a production frame-
rate comparison or a claim of native focus behavior throughout 20 minutes.

Long play is muted. Short audio probes use the theme's actual critical cue.
An injected observer delegates to real AudioContext/createOscillator/close and
returns the original close Promise, recording its settlement and context state.
It does not fabricate a resolved close or infer physical audio-device behavior.
The observer intentionally retains bounded context references; this is not a
heap/GC leak measurement.

## Accepted observations

| Requirement | Observed / asserted result |
| --- | --- |
| Full authored clock | Exactly **300,000 / 300,000 ms** at rate 0.5, held in `time_up`; level 19, 366 kills, 400.3 recorded XP in this aided fixture |
| Endless extension | Five wall-clock minutes; simulation **300,014.877→450,028.355 ms**, +**150,013.478 ms**, still playing/endless before contact-death setup |
| Native manual pause + pending work | Trusted blur/hidden/visible/focus; paused state, elapsed and one queued spawn remain held; explicit resume drains it once, adding one benchmark-origin arrival |
| Native level-up | Trusted blur/hidden/visible/focus; `level_up` stays held until an actual offer is chosen |
| Native timer decision | Trusted events including hidden/visible; elapsed stays exactly 300,000 ms and `time_up` stays held until Digit1 selects endless |
| Sustained presentation/resize | **10** paused Default↔Low dispatches and native window-bound changes; each preserves the paused clock. Existing P4 UI/pointer/world-view coverage remains separate |
| Terminal reconstruction | **10** short cycles: four completions, three real contact deaths, three clearings with a queued arrival. No fabricated deletion of the clearing enemy |
| Terminal accounting | Each short terminal cycle reconciles damage breakdown to total damage and XP to ambient+shrine source totals; queues drain and audio voices become zero |
| Fresh scene resources | **12** create baselines, each with one body, zero pickups/enemies, zero pickup/causal/lethal claim IDs and stable top-level display/POST_UPDATE/blur listener counts |
| Scene stop resources | **12** stops: zero display-list entries, bodies, POST_UPDATE hooks, tracked enemies/pickups/hazards/feedback, queue backlogs and pickup claims; scene blur/focus handlers removed |
| Audio | **13** observed AudioContexts, all close exactly once, close Promise settles, state becomes `closed`; **7** service closures start with voices active |
| Page errors | **0** |

The short completion/clearing fixtures use a **1,000 ms** duration while retaining
rate 0.5. Death fixtures seed one health point and use a real known-enemy physics
overlap/contact path. An additional contact death terminates the sustained endless
run. These are not ten authored-length or unassisted runs. Reconstruction invokes
the actual scene restart method; the existing browser suite separately covers
restart controls. Final cleanup explicitly stops the active scene before Game
removal/destruction. Phaser SHUTDOWN and DESTROY are distinct: this result does
not certify direct permanent destruction/removal of an active RunScene.

Across **40** sustained/end samples, observed maxima are 300 enemies, 48 pickups,
0 projectiles (the eco starter is melee), **348 bodies**, 677 top-level display
entries, 9 scene timers and 18 tweens. Sampled body counts never exceed player +
tracked enemies/pickups/projectiles + pending body removals. These are sampled
maxima, not continuous high-water instrumentation for every resource. The prior
Session 6 250-pickup overflow/merge proof remains the cap-pressure evidence.

Causal identities peak at 406, lethal claims at 366 and pickup claims at 366 in
the sustained samples. They are legitimate per-run histories, not actor caps;
they are cleared at stop/reconstruction rather than evicted mid-run. No blanket
constant-memory, infinite-endless or GC/heap-growth conclusion is drawn.
Display counts are top-level Phaser list counts, not a recursive UI node census.

## Preflight history and verification

The [preflight diagnostic summary](P5_CAMPAIGN_PREFLIGHTS.json) preserves failures
and their reasons; full local diagnostics are backed up under
`/private/tmp/arena-p5-campaign-20261019-preflights/`. A preliminary pass is not
confused with the final scenario. The final accepted preflight takes **20.5 s**
(21.2 s runner total), three short cycles, five create/stop baselines and actual
AudioContext settlement. Its [raw record](P5_CAMPAIGN_PREFLIGHT_FINAL.json) is
retained. Preflights are not long-soak acceptance or automatic test retries.

Demonstrated fixture pitfalls:

- Phaser clears `_justDown` on keyup; hold control pulses for 80 ms so a frame
  can consume them. Zero-duration input once missed the intended resume.
- Relative atlas paths from a nested fixture resolve incorrectly without
  `<base href="/">`, producing an HTML-as-JSON error. Rooting the fixture fixes
  the test route; no loader/pipeline change is justified by that setup error.
- Native desktop focus loss legitimately pauses gameplay. Diagnostics record
  focusPaused/hidden/focused, rather than expanding clock deadlines or labelling
  a stalled run passed. Overlay XP setup now requires actual playing state;
  fixture collection while focus-paused is an invalid precondition, not a
  reproduced ordinary gameplay reward race.
- Final scene stop must be recorded before destroying the Game; neither manual
  second physics teardown nor garbage-collection movement substitutes for it.

| Executed check | Result |
| --- | --- |
| Final preflight, `ARENA_P5_CAMPAIGN=1 ARENA_P5_PREFLIGHT=1 npm run test:e2e -- tests/e2e/lifecycle-campaign-v043.spec.ts --workers=1 --retries=0` | **1 pass**, 20.5 s, after documented setup corrections |
| Full campaign, same command without `ARENA_P5_PREFLIGHT` | **1 pass**, 20.0 min, one worker/zero retries |
| `npm run typecheck` | Pass |
| `npm test -- --run` | **488 tests / 57 files pass** |
| `npm run lint` | Pass |
| `npm run build` | Pass; unchanged runtime asset filenames; existing chunk-size advisory |
| Emitted production JS/HTML scan | No `__P5_AUDIO__`, `createCampaign`, `p5-campaign` or `campaign-preflight` markers |
| Source hash / raw result validation | Pass; final accepted fixture sources unchanged |
| `git diff --check` / document links / ownership review | Pass on reviewed delivery |

The opt-in campaign adds a skip to ordinary headless regression, not a campaign
pass. No broad local Chromium/stress, production/startup campaign, balance,
audit or new Actions run was needed or performed. All owned browser/tabs/server/
profile resources are closed/removed; port 4173 has no remaining listener.
Unknown processes and the review server on 4213 are untouched.

## Remaining gate and handoff

The authorized M5 lifecycle slice is accepted within the boundaries above.
Broader browser/device compatibility remains pending: the owner must identify
supported browsers and provide representative older integrated-GPU hardware or
explicitly revise the gate. Existing M5/Metal, Canvas and Chromium/Linux evidence
cannot stand in for another engine, mobile/touch, physical older hardware or
mid-run context-loss acceptance. This report also preserves the unassisted-play,
hazard, direct-active-destruction and production-throughput limits; it does not
invent a pass or waive any required criterion.

P5 overall remains open and P6/content remain gated. Next is
[Session 11 completed record](../MASTER_BUILD_PLAN.md#v0-4-3-p5-compatibility). Do not repeat this unchanged long
campaign or create another inventory-only commit without a new defect, changed
source, selected remaining requirement or available device evidence.

Session 11 follow-up: owner delegated browser support selection and authorized
the focused desktop engine checks. See [compatibility report](P5_COMPATIBILITY_REPORT.md)
for selected policy and 52 passes. That resolves the selection prerequisite above;
actual missing branded/platform/older-device evidence remains pending. Current
handoff: [Session 12 / P5](../SESSION_12_PROMPT.md). Original campaign limits remain.
