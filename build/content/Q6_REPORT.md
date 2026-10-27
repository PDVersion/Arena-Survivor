> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# Q6 — verified prerequisite correction, 2026-10-21

Branch `codex/readable-gameplay-g1`, parent/main `c200b21`. PR27 merge `9837158`
and successful CI39535388393 are historical foundation evidence. Fresh local
source identity and all120 model summaries: [results](Q6/results.json).

## Motion finding and correction

Fixed actor/body board across walk0/1/2, idle4 and hit5 in right/left and both
diagonal directions reproduces the anatomical shift: the upper hood bounds have
centres25.5/26/25/25/28px within independently centred48px poses. Hit5 faces left;
its compensated flip moved that feature about4.5 native pixels from walk0.
Frame1 also starts one pixel lower. These observations justify presentation-only
frame anchors, mirrored with the rendered pose. The accepted PNG/atlas/pipeline
are byte-unchanged. Bodies stay36×36; no system reads presentation metadata.
See [before](Q6/before-poses.png) and [after](Q6/fixed-anchor-poses.png).
The anchor holds the hood position; natural limb/pose motion remains intentional.

A175-completed-frame real Arcade trace covers right/left, down-right/up-left,
idle and timed damage flashes at200 speed with physics timeScale2 (rate0.5).
Sprite position equals actor position in every sample; dimensions stay36×36,
walk/hit facing holds, idle/hit transitions occur. The diagnostic board enlarges
only presentation for inspection; it is not a gameplay size change.

## Pulse and capacity

The cone keeps its original firing origin. A filled/nozzle pulse lasts the
weapon's80 simulation-ms extension; only a faint outline and fixed selected-hit
rings remain during200ms retraction. Damage still resolves once at firing.
The four live cases observe3/5/7/8 actual direct selections at0/2/4 picks/evolved,
unchanged starter clock, exact damage-breakdown sum, and no damage to a new fade
entrant. [Pulse](Q6/pulse-4.png), [fade](Q6/fade-4.png). Markers identify the
selected positions, not every later object standing within the historical sector.

Both themes author +1 primary target per actual owned reach pick, four picks max:
3→4→5→6→7, then evolved4+4=8. Rarity still improves reach but does not buy extra
capacity; unrelated levels/shared upgrades do not add capacity. Evolution reads
retained actual pick history, with exact slot/clock/modifier carryover. Reset
clears history. Splash stays capped3; targeting remains distance then stable ID.
No new saved IDs/state/schema or content categories.

Selection evidence: modest opening3, finite end7/evolved8, improved packed output
without an isolated/splash buff. The coarse model buys the tool atL2 and one actual
owned pick per subsequent level, evolvesL7; it does not model offer frequency.
Eco Normal baseline evolved-packed L27/771kills/1245XP becomesL31/973/1945;
two-tools-packed L22/549/684 becomesL27/752/1179. Isolated evolved L19/391/415
and isolated base L18/345/366 remain unchanged. This supports the capacity payoff,
not human survival or final enemy tuning. At0.5,300,000 simulated-ms means600,000
nominal wall-ms excluding pauses/hit-stop. Raw four-command outputs in Q6/ label
both themes, all presets, baseline/C3 and time. Eco spread/explosion remain parked
diagnostics excluded from attainable-build acceptance. TTK now receives the same
Collection Sweep capability as pacing; it previously omitted it.

## Actual verification and limits

- typecheck;146 units/16files (content, architecture, weapons, sprites, simulation);
  lint; production build; whitespace: pass. Existing Phaser bundle-size advisory.
- Final bounded Chromium Canvas gate:2pass5.3s, one worker/zero retries.
- Four recorded baseline/C3 balance commands:120 scenarios execute successfully.
- Early motion harness failures supplied incomplete directional inputs, producing
  NaN positions; they are fixture failures, not passing motion evidence or a
  production movement defect. Corrected full booleans and completed-frame sampling.
- Owned games/pages/test server end with runner cleanup. Full app/stress/soak/native
  and device campaigns deferred under resource policy. Actual Safari/browser-OS/
  older-device checks remain waived/unverified. No performance or human-play claim.

Self-review checks the one-way presentation seam, finite owner growth, evolution
carryover, independent clocks, and exact direct/splash attribution. Q6's local
gate passes; next eligible work is G1 fresh baseline and existing-role assessment.
