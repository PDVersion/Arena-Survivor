# P5 / Session12 — branded Edge releases and Safari access

Owner requests finishing remaining P5 work and beginning P6 on2026-10-19. Current/previous-major desktop support policy remains selected; physical device acceptance is not waived. Owner confirms no older device is available.

## Executed Edge evidence

| Target | Version | Result | Mode/environment |
| --- | --- | --- | --- |
| Current stable Edge |155.0.4283.62|13 focused checks pass, zero retries, about1.3min|M5 Pro48GiB, Darwin25.5.0, headless test mode, eco/Normal WebGL/Metal,1280×720 DPR1; both-theme isolated Canvas lifecycle|
| Previous-major stable Edge |154.0.4258.62|13 focused checks pass, zero retries, about1.3min|Same selected host/mode and viewport; actual renderer and UA retained in summary|

Both cases use the unchanged13 assertions from Session11: boot/resize, actual renderer and AudioContext close capability, half-rate/pause, exact1,040XP/790merge/250pickup lifecycle in both themes, movement/bounds, paused quality/resize/short terminal restart, title setting/level-up and300-live map. These remain bounded aided/short tests, not production throughput, long soak or native visibility evidence. Frame-consumed keys and resize readiness were already corrected in Session11. No runtime defect or runtime change.

Test apps are extracted into owned temporary folders from Microsoft's [official stable/archived release metadata](https://edgeupdates.microsoft.com/api/products?view=enterprise). Published SHA-256 values match; pkgutil validates Microsoft signatures and trusted Apple notarization. No installer/scripts run, no system-wide Edge installation/updater, project dependency or profile mutation. A fresh temporary Playwright profile is closed after each owned session. Config opts into an explicit executable only when `ARENA_EDGE_EXECUTABLE` is supplied; report output is independently selected by `ARENA_COMPATIBILITY_REPORT`, preserving Session11 records.

Sources/raw data: [current results](P5_EDGE_RESULTS.json), [current source/environment summary](P5_EDGE_SUMMARY.json), [previous results](P5_EDGE_PREVIOUS_RESULTS.json), [previous source/environment summary](P5_EDGE_PREVIOUS_SUMMARY.json). Project name remains `edge-stable`; actual version and frozen archive identify the previous-major run. Each invocation is one worker/zero retries with a four-minute global cap. Source/fixture assertions unchanged during each run.

## Native Safari remains blocked

Installed native Safari26.5.2 /21624.2.5.11.8 is verified through `/usr/bin/safaridriver --version`. One initial20-second-bounded availability probe fails before session creation. The owner indicates they will enable automation; a later bounded native-smoke attempt still fails session creation in171ms because Safari's own setting remains disabled. No game assertion, renderer or native event result is inferred.

Apple's [Safari WebDriver configuration](https://developer.apple.com/documentation/safari-developer-tools/macos-enabling-webdriver) requires the owner to enable “Allow remote automation”. No setting/authentication is bypassed. Raw blocked evidence: [preflight](P5_SAFARI_PREFLIGHT.json), [later blocked attempt](P5_SAFARI_RESULTS.json). Both owned drivers are stopped; the later owned strict-port test server is also stopped. Unknown services/review4213 are untouched.

`tests/native/safari-compatibility.py` is an opt-in stdlib W3C driver case with bounded requests and cleanup. It is syntax-checked; its gameplay path is **unexecuted/unverified** until Safari permits a session. It is intended to assert movement, pause/resize, Default→Low, a5,000ms shortened simulated ending at unchanged0.5 and restart. It does not synthesize visibility events or overwrite properties, and it makes no native-tab, console-error, in-flight audio-service or unassisted-duration claim. Do not call that intended path passed. Only rerun after confirmed access/precondition change.

## Remaining acceptance

P5 remains open: native Safari gameplay, missing branded-release/platform combinations and physical older integrated-GPU evidence remain pending. Edge's two macOS releases reduce the missing matrix; they do not stand in for Windows/Linux, earlier Safari or old hardware. Prior accepted native/long campaigns are unchanged and were not rerun. P6 software work is explicitly owner-authorized alongside these gaps; no acceptance checkbox is silently waived.

## Unpatched Firefox application follow-up

After the frozen P6 measurements completed, two additional serial application
smokes pass using Mozilla's official, unpatched macOS Firefox distributions:
**158.0 (25,038ms)** and **157.0.1 (25,390ms)**. Mozilla's release metadata
identified these current/previous-major targets; published SHA-512 manifests
match both images, and Apple accepts both as notarized Developer ID apps.
Official geckodriver0.37.1's published asset digest matches. Images are mounted
read-only at owned temporary paths; no installation or dependency update.

The [W3C driver case](../../tests/native/firefox-compatibility.py) uses fresh
profiles and real driver input: one canvas/WebGL, advancing held movement,
rate0.5, frozen pause, actual window resize, Low through Settings, short5,000ms
simulated completion and restart with full health/level1/zeroXP/Low retained.
Each case is bounded to90s of work (two-minute outer cap), one browser at a
time, no automatic retries. Both capabilities confirm headed mode. Initial
actual viewport1280×715/DPR2; renderer reports “Apple M1, or similar”, a generalized
string on the known M5 host, not proof of an M1 or older machine.

This is application smoke evidence, not the full13-case engine suite, native
visibility/focus event acceptance, console-error census, audio-service shutdown,
production throughput or unassisted/hazard play. Driver defaults apply; no
visibility properties are overwritten or DOM focus/visibility events dispatched
by this fixture. [Current raw](P5_FIREFOX_CURRENT_RESULTS.json),
[previous raw](P5_FIREFOX_PREVIOUS_RESULTS.json), and
[source/checksum/capability summary](P5_FIREFOX_SUMMARY.json) retain exact evidence.
Mozilla's [driver usage documentation](https://firefox-source-docs.mozilla.org/testing/geckodriver/Usage.html)
provides the official release sources; the summary preserves the exact URLs.

Owned driver/browser profiles, app images, mounts and servers are cleaned up.
Safari's access block, missing other release/platform combinations and physical
older integrated-GPU evidence remain pending. No P5 gate is waived.
