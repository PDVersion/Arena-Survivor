# Arena Survivor

A browser-first environmental arena game moving toward slower, readable play,
recognisable real-world tools, and optional educational depth.

## Status

**V0.4.2 and V0.4.2.1 are merged.** The readable baseline has a 2× cropped
world view, coherent 0.5 gameplay rate, Cleanup Grabber and Collection Sweep,
walk-through contact with bounded knockback, Microplastics, Glass Shards and
finite material families. V0.4.0's optional-sprite seam and V0.4.1's five-sheet
checkpoint are also merged; remaining art stays gated until the roster settles.

**V0.4.3 is active on `codex/v0.4.3`; P0/Q1/Q2/Q3/Q4 and P1 gameplay/software gates are verified; P2 is next.**
Q1 fixes player facing/walking and zoomed world text, makes both Cleanup Grabber
upgrade entries common in the offer pool, and adds Beginner / Normal / Experienced
difficulty (selected F16). Q2 adds event readability, fragment pose reuse, a sprite review browser and spawn
source counts. P1 excludes production diagnostics; interface, simulation,
presentation and lifecycle profiling continue through P2–P6. Other optional
content remains unselected; C1–C7 follows the performance gate. Real older-device
acceptance remains pending measurement. See [session progress](AUTONOMOUS_PROGRESS.md),
[the active plan](build/BUILD_PLAN_V0.4.3.md) and REC-100–110.

V0.1–V0.3 and the V0.3.1 corrections are complete. Their plans retain the
implementation history for progression, director, hazards, shrines, skills,
statistics, settings and endless/clearing behaviour.

## Project documents

- [V0.3 build plan](build/BUILD_PLAN_V0.3.md) — completed implementation record, architecture and verification conventions.
- [Education pivot](build/EDUCATION_PIVOT.md) — exploratory design for the type system, real-data enemy stats, and the knowledge layer.
- [Completed V0.2 build plan](build/BUILD_PLAN_V0.2.md) — implementation record for the interaction milestone.
- [Completed V0.1 build plan](build/BUILD_PLAN_V0.1.md) — implementation record for the first playable.
- [Theme and archetype system](build/THEME_ARCHETYPES.md) — modular content boundaries and safe retheme workflow.
- [V0.4 sequence](build/BUILD_PLAN_V0.4.md) — current increment order, gates, ownership, and reconciliation ranges.
- [V0.4.1 sprite plan](build/SPRITE_PLAN_V0.4.1.md) — the completed pipeline and five-sheet checkpoint, plus the gated historical inventory.
- [V0.4.2 readable-baseline plan](build/BUILD_PLAN_V0.4.2.md) — camera zoom, coherent slowdown, Cleanup Grabber, parallel delivery, and integration gate.
- [V0.4.3 active plan](build/BUILD_PLAN_V0.4.3.md) — performance prerequisites, ownership and gates, followed by selected content.
- [Autonomous roadmap](build/AUTONOMOUS_DEVELOPMENT_PLAN.md) — session protocol, measurements and optional feature menu.
- [Autonomous progress](AUTONOMOUS_PROGRESS.md) — actual checks, evidence, blockers and the next task.
- [Sprite style guide](build/SPRITE_STYLE_GUIDE.md) — the art bible and the reusable image-generation prompt.
- [Sprite manifest](build/sprites/MANIFEST.md) — per-sprite subject blocks, claim protocol, status, and the generation log.
- [Portable save data plan](build/SAVE_DATA.md) — encoded text export/import, versioning, validation, and migration.
- [Reconciliation log](RECONCILIATION.md) — decisions, pitfalls, discoveries, and future guardrails.
- [Game plan](build/PLAN.md) — the broader product and design vision.

Before beginning any work, read [the V0.4 sequence](build/BUILD_PLAN_V0.4.md),
then the reconciliation log and V0.3 implementation record, followed by session
progress and the active increment plan.
`build/BUILD_PLAN_V0.3.md` remains the implementation record for the milestone
underneath. The repository-wide workflow is defined in [AGENTS.md](AGENTS.md).

## Performance measurements

`npm run measure:performance -- --mode production --seconds 60 --warmup 10 --repeats 3 --output build/performance/local-production.json`
records production page frames and Chromium main-thread counters. Build first.
For a sustained population/capacity probe, use:

```bash
npm run measure:performance -- --mode test --scenario capacity --loads 150,300,450,600 --seconds 60 --warmup 10 --repeats 3 --output build/performance/local-capacity.json
```

Add `--headed` to measure a visible Chromium window and record its actual GPU
renderer on the target machine. Run browser measurements alone. The capacity fixture holds a mixed crowd with
weapons/contact/XP/hazards disabled and records live/visible counts plus source
origins. It includes test telemetry overhead and does not establish mixed-combat
or hardware acceptance. The production safety cap remains 300. `npm run
check:production` checks the built output and production boot/play/pause without
test hooks. The P1 report records actual before/after results and limits.

## Sprite inspection

Open `/sprite-browser.html` on the local server (for example
[Sprite browser](http://localhost:5173/sprite-browser.html)). Filter/search the
roster, compare idle/move/hit/death poses as a set, then select an entry to freeze
or step every frame, play its walk, mirror it and change zoom/background. Mark
good/bad/review and add notes; reviews persist in that browser and export as JSON.
Missing sprite bindings are listed as fallbacks. Glass Shards reuse the accepted
broken-glass pose until the dedicated art pass; no generated image was edited.

Live source counts appear in the HUD, with live/total counts in Pause → Pollution:
natural (including waves), fragments, Bagged Waste releases, site effects and
benchmark loads. Shrine-modified ambient arrivals are counted as natural.

## Run locally

Requirements: Node.js 20+ and npm 10+.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The game opens on a title screen; press Enter, Space, or click to begin. Runs reach a five-minute simulation checkpoint (about ten active real-world minutes at the current 0.5 gameplay rate, plus pauses); combat fires automatically, and risk/reward shrines permanently raise world pressure. Shrines arrive one at a time across the run at scattered positions rather than all at the start; while one is off screen, a named marker on the edge of the view points the way.

Controls:

```text
WASD / Arrow keys = Move
Enter / Space     = Begin a run from the title screen
Escape            = Pause or resume
E / Space         = Activate a shrine while in range
1 / 2 / 3         = Choose title-screen difficulty or a level-up upgrade
1 / 2             = Answer the end-of-timer choice
R / Enter         = Restart after death or completion
M                 = Mute or unmute session audio
Tab / left/right  = Switch pause-menu tabs while paused
Up / down         = Switch Field Guide sections
```

Choose difficulty on the title screen (buttons, 1/2/3 or left/right). Normal is
the default. Settings changes during play apply to the next run; the HUD names
the current preset. Choices last for this browser session and are not saved yet.
Multipliers below are relative to the game before presets:

| Preset | Enemy health / damage / arrival rate | Player and tool help |
| --- | --- | --- |
| Beginner | 75% / 60% / 70%; enemy speed 85% | Health 125%, speed 110%, pickup reach 125%, tool damage 120%, cooldown 90% |
| Normal | 95% / 85% / 90% | Original player/tool stats |
| Experienced | 110% / 110% / 115% | Original player/tool stats |

Hazard damage/rate follows the preset's enemy damage/arrival multipliers. Both
tool upgrade entries use common offer weighting; card quality still rolls across
Common through Unique, preserving stronger rewards.

Upgrade cards state exactly what they do — `Damage 15.0 → 17.5 (+25%)`, `Charges 1 → 2` — with a level badge or a `NEW` marker. The numbers can be hidden from the pause menu's settings tab; the badges always show. Pause also lists your current stats, every upgrade taken with counts, and live world pressure.

Every upgrade offer rolls a tier — common, uncommon, rare, epic, legendary, or unique — which colours the card and multiplies what it gives, from 1× at common through 2× at legendary to 2.5× at unique. A tier is rolled per card, so the same upgrade can come up white or yellow. `Luck` biases that roll upward; it does not bias common downward, so ordinary cards always remain in the mix. Integer gains like pierce and extra charges round, so epic and above are worth `+2`. World-pressure cards never roll: scaling one half of a stated bargain would change the deal.

At five minutes the run does not simply stop. It asks whether to work on with no end time, or to stop new arrivals and finish clearing what is already on the field. Clearing ends on an empty arena with the usual shift report; working on removes the limit, and enemy health then compounds by about 30% every thirty seconds, so a surviving build gets a couple of good minutes rather than an endless farm.

The Field Guide tab has three sections, switched with the up and down arrows or by clicking: what each shrine costs and gives before you walk to it; the whole upgrade pool with how many you have taken this session, the most you have taken in one run, and the per-run cap; and the session's totals, including total damage and your best run. Session figures survive a restart but not a page reload — persistence lands in V0.4.

### What a run looks like

The active theme is **environment/nature**: plastic bottles, bags, glass, and bagged waste rather than knights and monsters. World pressure is called **Pollution**.

The spawn director escalates from run progress rather than a clock, so the shape below holds at any run length:

| Progress | Roster | Cadence | Batch |
| --- | --- | --- | --- |
| Start | Plastic Bottle only | 900 ms | 1 |
| 20% | Plastic Bag joins — announced by a wave | 737 ms | 1 |
| 40% | Glass Bottle joins | 603 ms | 2 |
| 45% | Bagged Waste joins | ~570 ms | 2 |
| 60%+ | Elites begin appearing without any shrine | — | 3–4 |

Enemies also get tougher on the clock alone, in ten discrete steps, so a cautious run still escalates — under V0.2 a player who never touched a shrine faced an identical world at 4:30 and 0:30. Arena hazards appear as the run progresses: a contamination spill that damages and slows, a debris pile that blocks movement and shots until cleared, and a methane vent that flares on a cycle. Everything telegraphs before it can hurt you.

Each milestone is announced before it arrives. The first wave sweeps past on a fixed heading rather than chasing, because that role is faster than you and a homing pack of them is unsurvivable with the starter weapon; later waves do home in.

The game renders a fixed 1600×900 view scaled to fit the window and letterboxed, so every window shows exactly the same amount of world. Enemies always appear outside it.

To play the retained knight-magic theme instead, change the one import in `src/game/content/active-theme.ts`. Both packs are complete and validated.

## Test and build

Install Playwright's Chromium once on a new machine:

```bash
npx playwright install chromium
```

Run the complete V0.3 verification gate:

```bash
npm run typecheck
npm test -- --run
npm run lint
npm run build
npm run test:e2e:ci
npm run test:e2e:stress
npm audit --audit-level=high
```

## Balance without playing

An authored five-minute run takes about ten active real-world minutes at the current half-speed pace, so pacing questions go through the headless simulator instead:

```bash
npm run balance                                      # every build model, 5 minutes
npm run balance -- --build crit --minutes 10         # one model, longer run
npm run balance -- --build damage-rush --chaos 3     # under world pressure
npm run balance -- --theme knight-magic              # a specific theme pack
npm run balance -- --build spread --ttk              # time-to-kill table
```

It reports spawns by role, live enemies, kills, experience, and level per 15-second bucket. It models pacing only — not movement, positioning, damage taken, or build choice — so read its output as a band, not a prediction.

Balance values live in the active theme's tuning pack (`progression.ts`, `director.ts`, `difficulty.ts`), never as literals in systems or scenes.

The normal Chromium regression suite runs on every pull request. The tagged 300-enemy stress path is a separate manual GitHub Actions workflow; run it before a release and after changes to spawning, combat/effect queues, statistics, feedback limits, or restart cleanup.

For a manual smoke test, verify movement, combat, XP collection, upgrade choices, pause/focus behavior, all shrine roles, elites, mute and reduced-motion behavior, the terminal statistics ledger, repeated restart, and a clean browser console.

## Current limitations

- Visuals and sounds are generated placeholders; audio uses theme-defined synthesized cues.
- Balance values, the five-second kill-chain window, and the 300/192 entity budgets are provisional pending broader hardware and playtesting. `npm run balance -- --ttk` is the instrument for revisiting them.
- Profile persistence, save export/import, weapon slots, additional weapons, bosses, and advanced elite variants remain V0.4 work. Settings are session-only until the persistence adapter lands.
- The production bundle currently includes Phaser in the initial chunk, so Vite reports its large-chunk advisory during builds.

The [architecture atlas](build/ARCHITECTURE_MAP.html) and
[sprite browser](sprite-browser.html) link to one another and are separate built
reference pages. Run Vite to use the sprite browser; its review notes stay local.
The [Session 3 prompt](build/SESSION_3_PROMPT.md) resumes P2 in a new session.
Glass Shards deliberately remain stationary and clearable; restart a pre-Q2 live
run to load their broken-glass sprite binding. Detached pixels in intact Glass
Bottle poses are an art-review finding, not runtime particles.

Q4 makes ordinary opening Microplastics one-hit on every difficulty: 9 base
health becomes 6.75 / 8.55 / 9.9 against 12 / 10 / 10 starting damage. Later
scaling remains active. The sprite browser's starting-difficulty selector shows
health and other stats from actual theme definitions; the atlas also captures
the updated base value. See [the balance comparison](build/balance/Q4_OPENING_REPORT.md).

Q5 repairs the PR browser timing/output failures and patches audited development
tooling. The current lockfile installs cleanly and audits with zero vulnerabilities
(REC-113/114). The V0.4.3 checkpoint PR remains draft while P2–P6 readiness is
unfinished; its latest Actions result is the remote verification authority.
