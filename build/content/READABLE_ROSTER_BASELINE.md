# Existing-roster balance baseline for the readable gameplay roadmap

Captured 2026-10-21 (Australia/Sydney), before any new balance change. This is a
planning baseline, not a G1/Q6 gate pass. [Roadmap](../READABLE_GAMEPLAY_ROADMAP.md).

## Source and scope

- Local source HEAD: `5511e868b199d3391ff14fab57f09214d78093e1`.
- Runtime/test/asset manifest digest: `9adcd46cdc613fd1e7dedd9d1bbce8f6c6ad4db3dfcb48996f3df7efe66d0332`.
- Runtime source is unchanged by this session. The captured source has verified
  C1–C7 foundations; Q6 capacity growth and presentation corrections remain open.
- Four successful command invocations cover two themes × two world fixtures ×
  three difficulties × ten models = **120 deterministic scenarios**.
- Full compact summaries, commands, identity method and limitations:
  [READABLE_ROSTER_BASELINE.json](READABLE_ROSTER_BASELINE.json).
- Five simulated minutes correspond to ten nominal real minutes at rate0.5,
  excluding pauses/hit-stop. Tables use simulated time, not observed wall play.

## Eco / Normal / no optional choices

| Model | Final level | Kills | Peak modeled live | Rounded XP | Use |
| --- | --- | --- | --- | --- | --- |
| evolved-single | 19 | 391 | 300 | 415 | Coarse contact/pacing comparison |
| evolved-packed | 27 | 771 | 300 | 1245 | Coarse contact/pacing comparison |
| two-tools-single | 18 | 345 | 300 | 366 | Coarse contact/pacing comparison |
| two-tools-packed | 22 | 549 | 300 | 684 | Coarse contact/pacing comparison |
| passive | 16 | 280 | 300 | 292 | Coarse contact/pacing comparison |
| damage-rush | 27 | 738 | 300 | 1158 | Coarse contact/pacing comparison |
| crit | 27 | 733 | 300 | 1141 | Coarse contact/pacing comparison |
| spread | 35 | 1146 | 1 | 2746 | Diagnostic only; parked eco mechanics |
| collection-sweep | 21 | 508 | 300 | 595 | Coarse contact/pacing comparison |
| explosion | 29 | 873 | 273 | 1525 | Diagnostic only; parked eco mechanics |

## Findings and resulting rebalance work

The damage-rush Normal baseline reaches level27 and the modeled live cap300.
Its displayed role TTK at40% progress is0.51s Bottle,0.23s Microplastics,3.4s
Glass and0.67s Bagged Waste. At100% it is0.36/0.16/2.4/0.48s respectively;
mini/final coarse TTK is4.3/21.7s at100%. These are simulated seconds, continuous
DPS estimates, not timed discrete attacks or proof of player survival.

Normal eco evolved-single ends level19 versus27 for evolved-packed;
two-tools-single ends18 versus22 for two-tools-packed. The comparison exposes
contact/positioning sensitivity, not evidence that either build is impossible.
Most ordinary model cases reach the live cap; peak alone gives no cap dwell,
on-screen occupancy, queue, player damage, performance or human-play evidence.

G1 must re-run after Q6 and evaluate tool contact/cap growth, Glass health plus
armour, role proportions and the Bagged Waste parent/child reward budget before
selecting new numbers. No global enemy nerf, new XP curve, spawn proportion or
tonnage-derived health is justified by these bands alone.

## Model applicability pitfall

`spread` multiplies by projectile count; `explosion` assumes density-driven kill
detonation. Those capabilities are parked in eco, yet the CLI still emits these
models for that theme. Their level35/29 results above are not attainable-build
acceptance evidence. Keep them for labelled historical/tooling diagnostics or
the applicable knight-magic pack; exclude them from eco balance conclusions.
Other models also assume picks/contact rather than simulate actual card rolls.

The C3 world fixture applies the new shrine and both curses at start. It tests
an aggressive reward/pressure band, not actual shrine timing or travel. All120
scenarios completed across four commands; this is model execution, not a numeric
balance assertion.

## Verification limits

No runtime values changed and no browser/stress/performance suite was run.
Q6, G1 and all new roster implementation remain open. Both-theme contract/units
and affected serial browser checks belong to the later owning implementation
slice; prior external-device waivers remain waived/unverified.

Planning verification: production build and whitespace checks pass,22 added local
link targets resolve,120 unique scenario summaries validate and all282 captured
runtime/test/asset hashes are unchanged. Existing bundle-size advisory remains.
Shared Session21 draft-delivery documentation updates were retained separately
from this amendment; no source/asset/test file was edited by this session.
