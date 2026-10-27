# V0.4.5 — money, cleanup tools and testing area

Owner-selected2026-10-27. Local implementation on `codex/v0.4.5`.
No push, merge or deployment is implied. Knights and Magic remains frozen.

## Where to try it

Start the usual game preview (`npm run dev`) and use the title-screen links:

- **Testing area** — `/testing-area.html`. Its **Tools & upgrade trees** menu edits
  real upgrades. Enemy type/count/distance, character level/health, money, Impact,
  weapons, general upgrades, manual pickups, invincibility, natural arrivals,
  pause, clear and reset are available. This tab uses an isolated memory profile;
  its currency and shop edits do not overwrite the normal save.
- **Impact Shop** — `/impact-shop.html`. Uses the real browser save, displays
  balance/cost/caps, and applies purchases to subsequent normal runs.
- **Sprite browser** — `/sprite-browser.html`. New money/pickup/rat/bin/rake sheets
  appear here. The old cone design is parked; its historical art remains archived.

Each weapon now has **one path with seven total levels**. Starting/newly equipped
weapons begin at Level 1; six fixed picks reach Level 7. Selecting a late node
acquires its predecessors; selecting an acquired node removes it and later nodes;
the Level 1 root resets that weapon. Green means acquired, gold means next.
There is one Cleanup Vacuum and no active Cyclone evolution. Changing a loadout
clears pending attacks, including travelling rake sweeps and thrown bins.

The level editor does not invent automatic stat picks. Money is the current
level's progress; crossing a requirement spends that progress and raises level.
The sandbox suppresses automatic upgrade menus so the tree remains the build
editor. Normal play still pauses for real upgrade choices.

## Implemented rules and initial tuning

Money replaces in-run Impact/XP wording, while historical saved IDs/statistic keys
remain compatible. Exact fractional reward value stays in each aggregate: silver
below4, gold from4, banknote from25. Nearby drops merge within28world units; the
existing bounded money cap remains250 actors. Special pickups never merge into
money and reserve room for a money aggregate. The magnet attracts all existing
money aggregates, representing their full value rather than an approximation.

| Rare drop | Base chance per primary cleanup | Effect |
|---|---:|---|
| Money Magnet | 0.3% | Draw all existing money toward the player |
| Drumstick | 0.5% | Restore20health, capped at maximum |
| Impact Point | 0.4% | Save1Impact immediately for the outside-run shop |

Fortune multiplies these chances by `1 + Fortune/100`, with8%cap per kind.
Fragment children do not roll extra rare items. A Litter Rat has8x base rare-item
rolls,180base health,30base money on cleanup, and a separate12money hit-leak budget.
It wanders rather than chasing and flees after damage. Its reward represents
recovered carried litter, not a claim that animals are recyclable waste.

| Tool | Level 1 | Level 7 |
|---|---|---|
| Cleanup Grabber | Damage 10, reach 78, cycle 1000 ms | Damage 38, reach 150, cycle 650 ms, full Collection Sweep |
| Cleanup Vacuum | Radius 90, damage 4/750 ms, 8% slow | Radius 150, damage 12/450 ms, 22% slow |
| Cleaning Bin | One bin, radius 58, burst 28, landing DOT 2/650 ms, 2.2 s fuse | Four bins, radius 95, burst 60, DOT 8/650 ms, 3.2 s fuse |
| Orbiting Shovels | Two heads, radius 84, damage 9, rotation 1.8 rad/s | Five heads, damage 24, rotation 2.5 rad/s |
| Rake Sweep | One straight outward rake, damage 18, 3 s cycle, speed 650 | Three parallel rakes, damage 48, 2.1 s cycle, speed 850 |

The testing tree gives each intermediate milestone's exact description. Shovel
levels alternate extra heads and stronger/faster blades. The grabber gains sweep
milestones through its own path; there is no separate Collection Sweep offer.
Fixed weapon upgrades identify their tool, with no rarity multiplier. General
stat upgrades retain quality gains. Four slots among five tools preserve a choice.

Shovel heads lead clockwise and own the contact area; handles trail. The outward
rake follows current/last movement direction, initially right, and travels to the
camera edge. Swept head contact prevents tunnelling after a delayed frame, with
one hit per enemy per rake. Parallel rake lanes can each hit the same target.
Collision comes from theme data, never sprite pixels. Bin display width is 38
world units (player 42), while its cleaning radius stays independent of the art.

Map-magnet money starts at 70 units/s, accelerates by 650 units/s each active
second and caps at 1900 units/s. Each aggregate tracks its own pull age, so distant
money arrives faster after a longer pull. Pauses add no acceleration time. Exact
value/merge limits are unchanged; displacement is capped to prevent overshoot.

Waste begins with75%breakage chance on a weak multi-hit, non-critical kill.
A clean one-shot reduces this to10%; a critical finishing hit reduces it to15%;
a one-shot critical produces no fragments. Each Fortune point subtracts0.4
percentage points, and each Careful Cleanup skill level subtracts10points.
Better damage naturally reaches the clean-hit condition sooner. No recursive
fragments. When a primary fragments, it pays75%of its clean money and its two
children share35%:110%total, with substantially more work and contact pressure.
The small extra return is not intended to make fragmentation desirable.

Cigarette Butts now open naturally; natural Microplastics enter at28%of the run
(84seconds on a five-minute clock), while events and breakage may create them
earlier. Cigarette Butts retain small arrival groups. Rare rats begin entering
at20%, with very low selection weight. Glass remains the durable waste role.

Eco criticals progress2x yellow →3x white →4x red; red is the top tier and its
number is larger. Critical-chance upgrades stop at300%and leave the offer pool,
so additional capped picks are never wasted. The balance model uses that capped policy. The run timer uses
monotonic active wall time rather than the old half-speed simulation clock;
upgrade/pause/focus pauses exclude inactive time. Existing movement presentation
pace remains separate. The testing area also pauses while its tree menu is open.

Impact Shop initially offers five capped levels each of maximum health, tool
maintenance, Fortune and movement speed. Purchases have increasing costs, cannot
overspend, persist immediately, and modify fresh runs. Profile schema3 explicitly
migrates schemas1/2 with an empty Impact balance/shop. Existing statistics and
unlocks survive. Sandbox purchases stay temporary.

## Comparison research

The game references below are community wikis, not developer balance guarantees.
Their patterns inform this implementation; this game's exact values are local
starting tuning rather than copied balance claims.

- [HoloCure EXP](https://holocure.wiki.gg/wiki/EXP) describes exact-value nearby-drop
  merging and an EXP Magnet. This supports conserving aggregate money and pulling
  it toward the character. HoloCure's stated magnet rate is much lower; this short
  five-minute game starts at0.3%and needs owner feedback about frequency.
- [Vampire Survivors Vacuum](https://vampire.survivors.wiki/w/Vacuum) pulls ground
  experience toward the player and is affected by Luck. Our magnet affects money,
  while healing and saved Impact remain their own pickups.
- [Vampire Survivors weapons](https://vampire.survivors.wiki/w/Weapon) provides the
  nearby aura, orbiting weapon and damaging landing-zone patterns through Garlic,
  King Bible and Santa Water. [HoloCure Spider Cooking](https://holocure.wiki.gg/wiki/Spider_Cooking)
  similarly uses a periodic area around the character. Bin fuse bursts and rake
  head-only contacts are this game's adaptations; the aura's slow is authored here.
- [HoloCure food](https://holocure.wiki.gg/wiki/Food) describes enemy-drop healing.
  Our drumstick restores a fixed20health as requested, rather than percentage
  healing. [Vampire Survivors Floor Chicken](https://vampire.survivors.wiki/w/Floor_Chicken)
  is the visual/mechanical pickup comparison, with a different drop source.
- [Official Return and Earn](https://returnandearn.org.au/what-you-can-return)
  verifies10c refunds for eligible marked drink containers. Cleanup money is
  fictional game credit; it does not assert cigarette butts, rat litter, shards
  or all waste qualify for a real refund.

The drawback-fragmentation system and roaming rat are owner-selected adaptations,
not asserted replicas of either reference game. The separate unlimited-stats vs
fixed-items research remains separate from these implementation decisions.

## Normal-play checklist and next work

1. Begin a fresh normal run. Cigarette Butts should be recognisable opening waste.
   Check that money looks like coins/notes, larger piles keep their value, and
   fixed tool cards name their owner while stat cards retain meaningful quality.
2. Compare the five-minute countdown with a stopwatch. Count only active play;
   pause and level-up menus should stop it. Slow rendering should not slow time.
3. Try grabber+vacuum, then compare bin, shovels and outward rake. Test one weapon level at a time in the
   testing area first. Watch for readable grey aura, slower enemies inside it,
   landed bin DOT followed by its burst, clockwise leading shovel heads, and a rake sweep following your last movement direction.
4. Compare weak bottle/glass cleanup with strong or critical hits and more
   Fortune. Early mistakes should create extra cleanup work; improved tools
   should visibly leave fewer fragments. Report whether the starting pressure
   feels fair rather than farming fragments for a tiny extra return.
5. Below full health, collect a drumstick:20health or remaining missing health.
   A magnet should recover distant banked money without awarding extra value.
   Drops are intentionally rare; use manual pickups to check their behaviour.
6. Chase a rat: it should wander, flee after a hit, leak a finite amount of money,
   then release a large reward. Judge whether its health/reward makes pursuit
   worthwhile without distracting too much from survival.
7. Collect Impact in normal play, return to title, reload and visit Impact Shop.
   Check increasing costs and capped levels, then start a fresh run to see the
   bonus. Sandbox Impact edits must never change that real balance.

Next is owner feel/balance feedback on fragmentation, rat pursuit, drop rates,
shop affordability and new-tool coverage. Use that evidence for a bounded tuning
pass. Remaining V0.4.4 art acceptance, full current-head regression/CI,
performance/device acceptance and eventual publication remain open. No passive
slot redesign, education fact layer or frozen-theme work is selected implicitly.

## Art and verification evidence

Six subjects generated with the built-in image generator, reviewed individually
and committed separately. Rat a1 was rejected for cell spacing and regenerated
a2; the other five usea1. Raw images and exact `.prompt.txt` files are in
[`build/sprites/raw`](../sprites/raw/); corresponding `.review.json` recipes,
`.metadata.json` hashes and normalized checks are retained. Accepted outputs are
in [`build/sprites/accepted`](../sprites/accepted/). The
[manifest](../sprites/MANIFEST.md) and [inventory](../sprites/review/style2/ALL_SPRITES_INVENTORY.json)
identify all selections. The original lime Impact art is repurposed for the saved
currency. No painted repairs.33recipes/118atlas frames include parked history;
28content bindings are active. The frozen pack is unchanged.

Verification details are finalized with the phase checklist and REC-135. Browser
checks are serial and scoped. The retired cone-specific browser campaign is
preserved at [`SECOND_TOOL_V043_RETIRED.spec.txt`](../history/SECOND_TOOL_V043_RETIRED.spec.txt);
new acceptance covers single-vacuum offers through Level 7, fixed paths, economy, mixed tools and outward-rake contact.
The coarse balance/TTK CLI ran damage-rush and capped-critical models. It omits
spatial coverage, rat movement and downside-fragment work, so it is not a proof of
survival balance. Full historical browser/stress/soak/native-device regression
is explicitly deferred, including reconciliation of old G2 introduction/cone
fixtures with the new opening and vacuum. No unrun check is labelled passed.

Final local results:740unit tests in79files;33sprite checks; typecheck/lint/build
and whitespace pass. Six unique scoped browser cases pass cumulatively, including
ordinary aura offers and continued tracks after evolution. The
[production check](../performance/V045_PRODUCTION_CHECK.json) verifies the final
built game, sprite browser, shop and testing-area entries, real-profile isolation,
and absent test hooks. A bounded150-enemy maximum-track field passes without
browser errors; this is not a frame-rate or device-performance guarantee. Captures
were inspected and owned browsers/servers closed. The existing bundle-size
advisory remains. Unrelated in-progress progression research is left unstaged.


## Owner correction, phase 4 — 2026-10-27

The former four-track/five-level design and Cyclone are superseded above. The new
shovel was generated with built-in imagegen; exact prompt/raw/review/accepted
sources are preserved as `weapon_orbiting_shovel.a1` under `build/sprites/`.
The accepted rake is reused for the new outward sweep. Historical orbit weapon ID
is retained for shovels; `weapon.rake_beam` is the new rake ID. Historical saved
upgrade/statistic IDs remain readable, without offering removed tracks.

Comparison sources: [Elite Lava Bucket](https://holocure.wiki.gg/wiki/Elite_Lava_Bucket)
informs thrown lingering-area cleanup; [BL Book](https://holocure.wiki.gg/wiki/BL_Book)
and the owner's pasted seven-level table inform stepped orbit progression;
[Fan Beam](https://holocure.wiki.gg/wiki/Fan_Beam) informs aimed outward coverage;
[Spider Cooking](https://holocure.wiki.gg/wiki/Spider_Cooking) informs the nearby
periodic aura. Fandom links returned access errors, so corresponding wiki.gg
entries were checked. These are secondary comparisons. Tuning and the moving rake
head, bin burst and vacuum slow are this game's adaptations.

Phase 4 checks: 736 units across 79 files; 34 sprite sheets; typecheck, lint,
production build; five unique targeted serial Chromium cases (zero retries),
including distant-target cleanup using the actual rake runtime, single-vacuum
normal offers to Level 7, path resets, money conservation, save isolation and
maximum-level mixed tools. Production guard passes for all entry pages and
absence of test hooks. Native shovel and mixed arena captures were inspected.
Bundle-size advisory remains. Owned browser/server processes are cleaned.

Damage-rush pacing and TTK models ran. The coarse model still omits spatial
coverage, the new stepped weapon paths, fragments and rat movement; historical
'evolved' model names are estimates, not an active vacuum evolution. These runs
are not proof of tool balance or survival. Full historical regression/stress/soak/
device checks and matching-head CI remain deferred, not passed.

Next normal-play feedback: compare early weak cleanup with late strong tools;
notice whether each weapon pick changes coverage/power; choose four of five tools;
check shovel readability, rake direction while stopping/turning, bin clutter and
whether distant magnet money feels satisfying. Unlimited stats vs capped passive
items remains the separate research decision already prepared.
