# Full eco style2 live switch —2026-10-26

Owner selects all new eco sprites and removal of old sprites. All27 selected
subjects (24 sheets +3 equipped-tool icons,102 cells) are now production assets.
The five old style1 accepted/public outputs and old atlas pixels are overwritten;
Glass Shards has its own sheet. No old style1 asset is loaded or shipped at those
paths. Raw attempts/prompts, historical reports and frozen knight files survive.
This promotes existing art for normal-play review; it does not certify perfect
per-frame continuity or generate/hand-paint any new art.

## Implementation

- Theme sprite metadata covers all11 enemies, player,3 tools, pickup,5 sites and
  3 hazards. Character uses96px frames with measured presentation anchors, old
  right/left authored facing and distance-driven walk cadence. All world sizes,
  bodies, camera, timing, tuning, saved IDs and unlock rules remain unchanged.
- A shared registry builds all27 sheets directly from their preserved generation
  recipes. New output bytes exactly match their selected native review sheets.
  Bounded shelf packing keeps intact strips in one2048×736 nearest-filtered atlas,
  rather than stacking the roster above the2048px texture-height budget.
- Explicit SpriteView states persist across post-update: magnet/collection,
  proximity/activation/spent, hazard warning/live and obstacle hit. Cup retains
  simulation-owned preparation/release/recovery and hit priority.
- Grabber art follows its existing extension/contact/retraction; vacuum art shows
  active intake/recovery while code keeps suction and optional geometry. Tool
  pixel spans are theme-owned presentation metadata. Equipped tools use the three
  icons in the HUD and replace the secondary icon on evolution.
- Hazard tiles decorate the centre. Their full primitive circle/border remains
  visible and authoritative for the actual area. Sprite coverage is not collision.
  Procedural fallback is retained and verified with a synthetic empty sprite map.

## Verification

- `npm run sprites -- build --theme eco-guardian`:27 sheets rebuilt.
- `npm run sprites -- check --theme eco-guardian`:27 valid sheets.
- `npm test -- --run`:720 tests/75files pass, including exact selected native/public/
  accepted byte equality and every packed atlas frame's pixels/bounds (102frames).
- Typecheck, lint, production build, whitespace: pass. Existing bundle-size advisory.
- 13unique scoped serial Chromium cases pass cumulatively with one worker and zero
  retries: roster requests/facing, sprite inspector/fallback/export/navigation,
  tool suction/guides/menu, Cup harm/dodge/update/cleanup and two new world cases.
  The new Default and Low/reduced-motion cases verify all11 enemy frame sizes and
  body radii, pickup0→1→2, all5 sites0→1→2→3, hazard boundaries/frames, all3 tool
  sheets, actual Grabber contact/recovery and vacuum recovery, all3 equipped icons
  and synthetic fallback. Both expanded final world cases pass together.
- Production boot/play/pause, no test/diagnostic leaks, sprite-browser stats and
  architecture navigation pass with zero errors. [Result](integration-evidence/PRODUCTION_CHECK.json).
- Inspected [Default](integration-evidence/style2-default.png),
  [Low/reduced motion](integration-evidence/style2-low.png), new native player strip
  and production pause image. Dense actor/site arrangement is an aided inspection
  fixture, not natural placement/survival or whole-run art acceptance.

Initial unit failures were hardcoded48px anchor bounds and a HUD fixture bypassing
constructor fields; both corrected. Initial browser failures were the now-empty
eco fallback list and passing an actor where Vector2 is required; fixtures fixed.
No skip/retry/timeout increase or gameplay adjustment. Initial sandbox server/
Chromium launch attempts were blocked; scoped reruns with permitted local access
pass. Owned4173/4174 servers and browser sessions are cleaned up.

Live sprite resources are now atlas PNG175,018bytes + JSON36,864bytes =211,882bytes
before transport compression, one GPU texture /6,029,312 decoded RGBA bytes
(~5.75MiB before GPU overhead). Previous runtime atlas plus standalone Cup was
21,349bytes and421,888 decoded RGBA bytes. This is a measured storage increase,
not a startup-latency or performance pass. No300-actor/full-app/soak/device campaign
was run; consolidated current-head CI/stress is deferred to delivery/selection.
Actual Safari/missing browser-OS/older physical-GPU checks stay waived/unverified.

## Normal playthrough checklist

Use a normal menu-started timed run with no test query flags. The HUD counts DOWN
from5:00; times below mean the displayed countdown, with ordinary0.5 gameplay
rate (about10real minutes of active play, plus menus, before the final boss).
These are eligibility/schedule points: travel and offscreen arrivals can delay
when you first see a role. Do not expect guaranteed random upgrade offers.

| HUD clock | What becomes available / what to check |
| --- | --- |
| 5:00–4:30 | Microplastics then Plastic Bottles. Walk left/right, stop and take a hit: hood/facing should remain steady. Grabber jaws should meet its visible reach; Impact Points should collect once. |
| 4:12 | Landfill Breach destination. Follow its minimap diamond, read the nearby cost/reward, use the displayed interaction key. It should activate once and remain visibly spent. Ignoring it must remain viable. |
| 3:45 /3:18 | Cigarette Butt groups / Wrappers. Butts stay individual targets; wrapper warning direction should remain fixed and allow a sideways dodge. |
| 3:00 /2:48 /2:24 | Fast Fashion site / Glass Bottles / Bagged Waste. Glass leaves stationary matching shards; bag children retain readable materials. |
| 2:00 /1:42 | Can direct pass / Cup and Single-Use site. Dodge sideways from fixed Can warnings; Cup preparation should precede a visible coffee shot, followed by recovery. |
| 1:24 /0:54 | Compacted Waste mini-boss / baseline elites. Art must leave warning circles, elite/shield cues and safe routes legible. |
| 0:48 /0:30 | Overproduction / Unmanaged Dump destinations. Preview the current actual costs; each accepts once. |
| 0:00 | Dumping Colossus arrives; timer expiry is not victory. Dodge its fixed circle, defeat it, then test endless or stop-spawns-and-clear. |

Across the run, check spill/vent warning borders and Debris Pile blocking; the
art is a centre decoration, so the full outlined area is what matters. Toggle
Show attack radius in Escape settings to compare true reach, then try Low and
reduced motion. Note any sprite drift, tiny silhouettes, confusing hazards or
stalls, with HUD clock/difficulty and a screenshot if convenient.

After one finished attempt (death counts; Quit to Main Menu does not), Cleanup
Vacuum becomes eligible in later level-ups. Take four Vacuum Reach picks to make
Cyclone Vacuum evolution eligible; it replaces the same slot, updates its icon,
and should keep its suction origin stable. Bloodlust unlocks at25 lifetime kills.
At the end, check actual tool contribution/pressure/next-experiment review, inspect
Details and the Field Guide, and reload to confirm existing progress/settings.

## What is next for Eco

1. Owner normal-play art/readability and pacing review; fix selected issues through
   prompt regeneration, never pixel patches. Known candidates: token centre drift,
   Grabber grip and evolved nozzle continuity, player hood/mirroring, tiny icons,
   site activation cues/palettes and longer Cup pacing. Generation backlog is empty.
2. Complete the remaining consolidated V0.4.4 presentation/performance acceptance
   and matching-head CI/delivery when selected. Integration alone does not close
   overall V0.4 or the external hardware evidence.
3. Select later optional scope only after playtest findings. Existing roadmap offers
   repeatable seeds/challenges, remaining controls/accessibility, guide discovery/
   sourced facts; resources→restoration and collection objectives are later choices.
   Weapons/evolution/bosses/saves/run reviews are already built, not the next backlog.

Knights and Magic remains paused indefinitely.
