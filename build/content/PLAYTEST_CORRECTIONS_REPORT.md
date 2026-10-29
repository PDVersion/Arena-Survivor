> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# Owner playtest corrections —2026-10-26

Owner asks for a real player step rather than colour flicker, slower cloud-like
vacuum air, scrolling overflowing menu pages, fixed-upgrade identity in place of
meaningless rarity, and a separate-session progression research prompt.
Bounded claim e0eccf2 precedes generation/code. Knight content remains frozen.

## A —one regenerated player subject, committed as708259a

Built-in imagegen produces preserved a4 raw source, exact [generation prompt](../sprites/raw/character_starter.a4.prompt.txt),
metadata/reference hashes, equal-grid recipe and native check evidence.
[Native player strip](../sprites/review/style2/character_starter.a4.png).
Four walking cells have two distinct lifted/passing-foot poses; use0→1→2→3,
which includes the fourth cell skipped by the previous0→1→2→1cycle. Idle4/hit5/
reserved6/death7 and left-authored hit remain. No movement/body/gameplay changes.

One272×288source grid with common contain scaling and explicit right transparent
padding, no per-pose fitting/painting. Standing height84–86pixels versus prior
85–86; display42/body18/stride20 fixed. Measured hood anchors compensate slight
source offsets. a3 is preserved. Strict artistic continuity still needs normal
play review; this is a targeted step improvement rather than perfect animation.

39sprite units,27rebuild/checks, types/lint/build, three serial Chromium roster/
facing/four-step cases pass. Live case sees all0/1/2/3. Native sheet inspected.
Initial fractional grid rejected correctly; an integer common grid fixes it.
A nullable telemetry typing error was corrected without changing runtime rules.

## B —gusts, menu overflow and meaningful upgrade identity

Eco suction uses broad overlapping translucent air banks, fourDefault/twoLow,
520ms drift plus180ms fade and1100ms flow cycle. No needle lines/dust points.
Actual damage/selection/pulse timing/cooldowns are unchanged. Intake art changes
to recovery at the actual pulse boundary; the lingering air is presentation only.
Reduced motion holds the air shape and fades it without travelling. Optional
presentation timings preserve older/frozen packs. Validate suction and claw
separately: merging their objects would hide suction.durationMs behind claw's.

Pause/title-info body sections now measure content and scroll within a masked
viewport, with tabs, guide chips, enemy paging controls, Quit and footer outside
it. Wheel, PgUp/PgDn, Home/End and scrollbar-track clicks clamp to the measured
range. Enemy PgUp/PgDn still pages enemies; Home/End and wheel scroll long text.
Section chips wrap at narrow layouts. Masks use the same UI/camera transform;
listeners/mask graphics release on redraw/hide. Equipment rows advance from real
wrapped title/description heights; no compressed pitch or footer overlap.
One-time acquisition/evolution caps display1, rather than the old erroneous2;
ordinary weapon upgrades still display the existing level-based cap.

Fixed-value cards use the theme accent and related weapon/item name, with no
quality bonus label. Pure stat cards say STAT, owner-specific/acquisition/evolution
cards say WEAPON. Existing roll-sensitive stat/weapon/skill gains retain quality
and truthful quantities; acquisition/evolution remain fixed. Current code really
scales weapon reach and can grant multiple skill levels at higher quality. Those
rules, rarity/offer weights, caps, saved IDs and progression are not changed or
silently relabelled as fixed. The new research prompt covers whether to replace
those rules with capped authored items later.

[Desktop equipment bottom](playtest-corrections/equipment-bottom-webgl.png) ·
[resized equipment bottom](playtest-corrections/equipment-small-webgl.png) ·
[fixed versus stat cards](playtest-corrections/fixed-and-stat-cards.png).
Gust and Canvas/menu/native screenshots also inspected during the scoped runs;
retained pictures use aided fixtures and are not natural full-run acceptance.

## Checks and limitations

- Final723unit tests/75files pass, including presentation-label/real-tier-gain and
  independent suction-timing validation. Types/lint/build/whitespace pass. Existing
  bundle-size advisory remains.
- B has11unique scoped browser cases passing cumulatively, all serial/one worker/
  zero retries: two gust, Quit/settings, two roster/world, two scroll/card,
  measured card layout, two eco G4 guide/review and title Info navigation.
  Scroll/card cases pass in both Canvas and actual WebGLDefault/Low-reduced-motion,
  including1000×700→800×600resize, wheel/page/home/end input, footer separation,
  actual fixed labels versus Legendary stat gains, and listener cleanup.
- First scroll attempt assumed a sixth native WheelEvent argument. Phaser3 emits
  five arguments: use pointer.event for preventDefault. Corrected actual wheel
  cases pass. The preexisting G4 observer now descends into nested scroll content;
  data/ledger/page assertions remain. One unused parameter lint error corrected.
- No retries/timeouts/skips increased, no knight art/content/dedicated campaign,
  no gameplay tuning/progression migration. Owned browsers/server cleaned up.
- No new full-app300-actor/stress/soak/device/remote-CI campaign. Existing external
  browser-OS/Safari/older physical-GPU checks remain waived/unverified. No release,
  push, merge or deployment claim. OverallV0.4 acceptance is still open.

## Separate-session handoff

[Progression-system research prompt](../prompts/PROGRESSION_SYSTEM_RESEARCH.md)
is ready to copy into another chat. It requests a code-grounded audit and verified
primary-source comparison of current unlimited stacking, capped named items and
a hybrid. It asks for concrete Eco builds, trade-offs, slot/cap/quality rules,
pacing/prototype tests and save implications. It treats the owner's game
comparisons as hypotheses, not evidence. No new chat was created, no research
findings claimed, and no progression redesign implemented.
