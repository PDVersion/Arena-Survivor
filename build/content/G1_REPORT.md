> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# G1 — reliable power growth and existing-roster rebalance

Verified locally 2026-10-21, `codex/readable-gameplay-g1`. Q6 prerequisite is the
separate verified commit `44585dd`; branch base is merged planning claim `c200b21`
on top of PR27 merge `9837158`. Remote PR27 head CI39535388393 succeeds; it does
not certify this branch. No push, PR, merge or deployment is part of this phase.

## Sources, fixtures and model corrections

[Final source hashes and checks](G1/verification.json) bind runtime, tests, assets
and packages, including new test paths. [Fresh Q6-tools capture](G1/before-tools.json)
executes all four commands from READABLE_ROSTER_BASELINE.json against `44585dd`;
older `5511e86` output is historical only. Command logs (trailing spaces/terminal blank lines normalized) are in
[G1/before-tools](G1/before-tools/eco-baseline.txt), [G1/before-tuning](G1/before-tuning/eco-baseline.txt)
and [G1/after](G1/after/eco-baseline.txt); each directory contains eco/knight ×
baseline/C3. Every command uses `--build all --difficulty all --ttk`.

Each stage preserves120 distinct scenarios:2themes ×2worlds ×3presets ×10models.
The two acceptance snapshots are [before tuning](G1/before-tuning.json) and
[after tuning](G1/after.json), using exactly the same corrected model. They retain
level timestamps, natural role counts, kills, XP, TTK rows and sampled cap/work
metrics for every scenario. Reproduce structured output with
`npx vite-node build/content/G1_CAPTURE.ts <output.json>`; set
`G1_HISTORICAL_GLASS=1` to restore only the Q6 Glass armour/weight in a local fixture.

All runs model300,000 simulated-ms /600,000 nominal wall-ms at rate0.5, excluding
pauses/hit-stop. Baseline has no optional world choices. C3 applies its new shrine
and both curses at start, an aggressive pressure/reward fixture without travel or
natural offer timing. Eco `spread`/`explosion` use parked mechanics: retain their
outputs as diagnostics, exclude them from attainable-build acceptance.

The fresh tools model overestimated throughput. G1 corrects four observed gaps:
kill spending now includes armour; each same-role spawn cohort retains its own
health/reward; one natural batch schedules from current time rather than repaying
old capacity debt; empty intervals cannot bank attacks. Cohort splitting retains
the prior densest-role priority, oldest cohort first. These are model changes,
not game balance improvements. For example, eco Normal damage-rush falls from
L27/738kills/1158roundedXP in the Q6 tool model toL24/592/821 before enemy tuning.
The earlier result must not be compared directly with the final tuning as a nerf.

Cap dwell samples the population before combat each100ms step; natural blocking
samples due ambient arrivals while full. Neither counts a causal backlog.
Remaining work sums surviving cohorts' full HP×armour cost; partial damage in the
aggregate pool is not assigned to individual actors. Quantization sensitivity
uses50ms on18 applicable eco cases before and18 after:
[sensitivity before](G1/sensitivity-before.json), [after](G1/sensitivity-after.json).
Normal damage-rush L24→25/kills598→686, packed base L25→26/653→761 and packed
evolution L30→30/872→943 retain the direction of the100ms comparison. All18
sensitivity cases retain or gain levels. This is robustness to step size, not
runtime throughput evidence.

## Selected values and retained roles

Only **two eco tuning values change**. Knight/magic keeps every enemy/tool/director
value; its60 before/after corrected-model scenario records are exactly identical.

| Eco role | Base HP / armour / speed / harm / XP | G1 decision and reason |
| --- | --- | --- |
| Microplastics |9 /0 /190 /8 /1 | Unchanged. Opening fodder and movement pressure; one Grabber hit in all presets remains verified. Later time/pressure scaling still applies. |
| Plastic Bottle |20 /0 /104 /10 /1 | Unchanged numerical/generalist baseline. Sporadic unlock at10% and gradual growth remain. No prevalence-derived stats. |
| Glass Bottle |96 /**40→20** /70 /9 /7 | Retain high material health, slow commitment and reward. Compounded effective work134.4→115.2 removes14.3% cost without a global damage/XP buff. |
| Bagged Waste |24 /10 /80 /12 /5 | Unchanged; parent is cheap, released mixed family supplies its commitment/reward. |
| Glass Shards |18 /12 /0 /7 /0 | Unchanged, stationary/clearable, zero-XP terminal material outcome. |
| Mini/final encounters |240/1200HP, other values unchanged | No evidence here warrants boss tuning; their live-fight contracts remain. They are outside ambient pacing counts. |

Glass director base weight **12→8**, keeping unlock40%, growth0.9 and pressure
bias0.35. At end of a calm run its theoretical natural selection share falls
16.2%→11.4%; Bottle42.6%→45.0%, Microplastics28.4%→30.0%, Bagged12.8%→13.5%.
Rounded shares can sum differently. These are authored selection shares, not
survey percentages or actual on-screen mix. No interval, batch, cap, event,
health curve, XP curve, preset, weapon damage or cooldown changes.

Glass previously retained about69–72% of modeled remaining combat work in Normal
isolated/packed tool cases. After tuning it remains a distinct bottleneck at
56–67%, with less monopoly over the field. Its health still exceeds Plastic by
4.8×, effective work by5.76×. At Normal opening stats, isolated noncritical hits
needed for Glass fall13→11 Grabber,22→19 base Vacuum,15→13 evolved Vacuum. Ordinary
Bottle remains2/4/3, Microplastics1/2/1 and Shards2/4/3. Splash, crit, time buffs and
other contacts are excluded from these discrete counts.

## Power payoff and pacing evidence

Q6 already supplied owned Vacuum progression3→7, then8 at evolution with stronger
hits, shorter cooldown, wider cone and splash; G1 preserves it. The model buys
atL2, four owner picks atL3–6, evolutionL7. Normal modeledL7 is reached at37.1s
simulated (~74.2s nominal wall); this leaves262.9 simulated seconds to use it.
This is a declared purchase/contact fixture, not a measured natural card schedule.
No upgrade triggers compensating enemy scaling. Global damage/crit builds remain
the generalist alternatives; broadening capacity primarily rewards packed contact.

Corrected-model eco Normal, baseline (XP rounded; dwell in simulated seconds):

| Model | Level before→after | Kills before→after | XP before→after | Cap dwell before→after |
| --- | --- | --- | --- | --- |
| passive floor |16→16 |258→257 |275→274 |84.1→84.1 |
| damage-rush |24→24 |592→674 |821→877 |21.3→11.0 |
| crit |24→24 |583→666 |804→852 |23.2→7.9 |
| Collection Sweep |20→20 |457→452 |504→497 |49.7→50.7 |
| two tools, isolated |18→18 |324→322 |350→347 |76.2→76.1 |
| two tools, packed |25→26 |648→739 |986→1077 |14.4→1.2 |
| evolved, isolated |18→18 |362→362 |393→393 |70.3→70.6 |
| evolved, packed |30→30 |852→910 |1662→1737 |0→0 |

L20 damage-rush208.0→203.8s; packed base184.3→178.0s; Sweep272.3→276.5s;
packed evolution167.9→171.4s. Late high-value Glass is less common, so removing
work does not universally increase XP or accelerate every milestone. Beginner
baseline evolved-packed dropsL31→30/1857→1755XP while kills increase804→816;
its base packed alternative endsL29. This bounded one-level reward trade-off is
accepted, not hidden or countered with a blanket XP buff. Other Beginner/Experienced
representative gains and every fixture's complete mix/milestones remain in JSON.

C3 Normal pressure band improves damage-rushL39→41/712→901kills/4303→5276XP,
packed baseL37→39/644→800/3538→4286 and packed evolutionL43→45/887→1076/6137→7210.
Caps remain300. Even improved C3 models dwell at cap47.6–74.8s; optional pressure
is not declared harmless or survivable from this model.

Isolated-contact continuous Glass TTK at40%/100% progress (simulated seconds):
base two tools before10.21/12.77 → after8.76/10.94; evolved before8.34/10.42 →
after7.15/8.93. Damage-rush3.65/2.70 →3.13/2.32. Packed-role work-clearing
bands are6.76/2.55 →5.80/2.19 for base tools,4.71/1.28 →4.03/1.10 evolved.
Packed HP/aggregate-DPS is **not single-enemy focused TTK**: its output is spread
across selected targets and neighbours. Actual discrete hits include cooldown,
contact availability and overkill. Peak300 by itself is neither a balance failure
nor a performance result.

## Descendants, rewards and finite work

Normal source multiplier1, no elite/world/time/Fracture: Bagged Waste plus its
2Bottles+2Microplastics+1Glass costs218.8→199.6 authored effective work and pays
**10.5XP**, unchanged:5+2×0.5+2×0.5+7×0.5. The five children use their authored
half rewards, not a recursively compounded parent reward. Each stays a primary
role; no ordinary bag child is another bag. Plastic/Glass fragmentation remains
finite, zero-reward secondary outcomes; Shards never move or reproduce.

Inherited splitting elites need the whole tree budget: three bags including two
depth1 copies, their15 primary offspring, and10 depth1 split copies from the root
bag's primary offspring =**28 total lethals**, **80XP**, before world/time factors
and excluding optional Fracture. After-tuning work1890.4; ordinary199.6. Split
source rewards halve before reapplying elite/world once; role offspring keep their
fixed authored half rewards and inherit elite identity/depth. The family pays
less XP per effective work than the ordinary family, not a recursive XP farm.
Shield variants add real work; acceleration adds movement pressure; both remain
bounded existing contracts. No elite/bag reward or depth value changes.

New differential budget tests and existing causal/elites/pending-spawn suites
verify bounded families, exact claims/rewards and retained work at capacity.
The runtime24-event processing budget, pending queue, claim lifetime and exact-once
direct/splash damage/XP attribution are unchanged. Ambient pacing omits children,
elites, waves, bosses, shields and causal backlog; the budget review/tests are
separate evidence, not secretly simulated family acceptance.

## Actual verification, review and limits

- Requested G1 short suite: **187units/21files pass** across content, architecture,
  enemies, director, difficulty, weapons, simulation, elites and events.
- Typecheck, lint, build and whitespace pass; existing large Phaser chunk advisory.
- All four commands succeed for each120-scenario stage;36 sensitivity scenarios.
- One bounded serial Chromium Canvas integration case passes **1.7s**, one worker,
  zero automatic retries. A real Normal scene observes13.3333 actual armour-adjusted
  direct damage from two tools with clocks1000/1400. Moving beyond both reaches
  yields no attack/damage and leaves clocks ready. Actual keyboard movement
  retreats; overlapping Glass then causes exactly7.65 incoming harm, with no
  pending causal work. [Reach image](G1/g1-glass-in-reach.png),
  [contact image](G1/g1-real-contact.png), both visually inspected.
- Fixture explicitly equips both tools, disables ambient/XP/hazards/audio, initially
  pauses physics then runs real keyboard/physics/contact. It validates the contact
  model's dependency on positioning, not human survival, natural offers, full-run
  feel, audible quality or native focus. Screenshot artifacts use testInfo.outputPath.
- Early test typing errors and the old rounded director-share expectation were
  corrected before the final gate. Model spawn fixture initially forgot Normal's
  cadence multiplier; corrected its fixture interval, never relaxed the assertion.
- Final staged review caught trailing whitespace in captured tool stdout that an
  unstaged-only check had not covered. Normalize whitespace only in Q6/G1 text
  evidence, preserving all values; the final whole-branch check covers new files too.
- Reviewed changes preserve rate0.5, bodies/camera, two production themes,
  independent clocks, existing saves/IDs, finite causal work and caps. No new
  facts, material matrix, enemies, characters, currencies or art.
- Owned browser/game/server cleaned up. Broad regression/stress/soak/device/native
  campaigns remain deferred to authorized consolidated work/Actions, never passed
  here. Actual Safari/browser-OS/older-device checks remain waived/unverified.

G1's bounded local gate is accepted. G2–G4 and new sprites are not started.
The next handoff is owner-selected G2 prototype work under the roadmap's gate;
reconcile sprite inventory only against the settled implemented roster. Publishing
or merging gameplay needs its own instruction; the earlier main planning claim
is not merge authorization.
