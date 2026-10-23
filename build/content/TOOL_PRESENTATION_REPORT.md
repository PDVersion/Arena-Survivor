# Tool effects, optional attack guides and return-to-menu

2026-10-23, codex/v0.4.4. Owner requests suction/air/dust rather than an always
visible cone, an off-by-default attack-radius setting, mechanical multi-claw
extra grabs, and an Escape-menu route back to the title.

## Result

The eco vacuum draws cyan inward air streaks/dust during its pulse, with fewer
streams on Low and a static air cue under reduced motion. The pulse clears its
air/nozzle at extension end; fade never creates hits. The yellow precise sector,
selected-target circles and splash-radius overlay are hidden by default and
available through **Settings → Show attack radius**. Only new presentation is
changed: original target selection/caps, damage/ledger, cooldowns/reach, equipment
progression and collision remain unchanged. Optional tool-effect values are
validated theme-owned eco view data; the frozen knight pack is not edited.

Grabber jaws close at the existing extension end. Collection Sweep extra cues
use three inward-snapping mechanical prongs at the already resolved positions,
with a static closed cue under reduced motion; the optional radius guide can
still expose their area. These are visuals, not extra attacks or new collision.

Escape opens the existing pause overlay. **Quit to main menu · Q (ends this run)**
works by pointer or Q on any pause tab, survives resize and cleans listeners on
close. It starts the existing menu scene and uses ordinary run shutdown to release
actors, audio and timers. The abandoned run is not folded as a finished run and
does not grant finish-based unlocks; already saved settings/progress remain.
Start reconstructs a fresh run. Pause panels use the authored UI viewport and
settings rows fit the available height after reserving the footer action.

`showAttackRadius` is a persistent boolean, default false. Current schema2 saves
that omit it hydrate false; present nonboolean values reject. Export/import retains
true/false and current-key persistence still uses the existing service. No schema
bump or new unlock/stable ID. Old binaries with strict unknown-key validation may
reject newly exported settings; no reverse compatibility is claimed.

Generated sprite sheets stay in review; no generated/public/accepted image is
modified or automatically integrated. These bounded procedural effects animate
actual attack phases and avoid making generic ready/fire sheets authoritative.

## Verification and honest limits

- 231 targeted units across 19 files pass, then 714 full units across 74 files pass.
  Legacy schema2 setting hydration, invalid values, export round-trip and persisted
  setting changes with unchanged finished totals have meaningful new coverage.
- Typecheck, lint, production build and whitespace pass. Existing bundle warning
  remains. No dependency/balance/saved-ID changes.
- Three final serial Chromium cases pass 2.2s, one worker/zero retries: Default;
  Low+reduced motion; actual Escape/pointer setting/resize/pointer quit/title/
  Start/Escape/Q quit with no finished-run increment. Five screenshots under
  TOOL_PRESENTATION_BROWSER are visually inspected. Fixture effects are positioned
  and briefly presentation-frozen for the effect screenshots; no natural playtest
  or performance evidence is inferred from those images.
- Existing Q6 cone-pulse regression passes 3.0s separately: real vacuum acquisitions/
  evolution still hit 3/5/7/8 selected enemies, origin stays fixed, late fade entrants
  take no damage and damage partitions equal the total.
- No broad browser/stress/soak/device campaign. External actual Safari/browser-OS/
  older physical-GPU evidence stays waived/unverified. Owned browser/server resources
  exit; no push/PR/merge or deployment.

Initial browser fixture checks failed: Graphics clear retains default style
commands, so empty command-buffer length was an invalid visibility assertion;
explicit guide/air visibility now both skips rendering and provides a truthful
state check. Test pointer positions initially ignored CSS FIT scale/letterboxing;
the fixture now maps authored canvas coordinates to its real DOM rectangle.
An instantaneous Escape following scene restart missed a game frame; holding the
key across one postupdate fixes the fixture without retries, sleeps or weakened
assertions. First server attempt hit sandbox listen EPERM; the bounded suite ran
with approved local execution. Final three-case capture reran after previous
Playwright output was replaced by the Q6 run; the durable output directory now
retains the inspected images. Earlier failures are not described as passes.
