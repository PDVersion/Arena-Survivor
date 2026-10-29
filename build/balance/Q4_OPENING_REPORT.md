> Historical evidence at its recorded revision/date. Old “current”, “next” and
> unchecked gates below are not the live work queue. See [current status](../BUILD_STATUS.md)
> and the remaining-work audit; later owner waivers/corrections supersede old status.

# Q4 opening Microplastics — 2026-10-13

Choose **base health 11 → 9**, keeping starter damage 10. The prior starting
health was 8.25 / 10.45 / 12.1 against non-critical damage 12 / 10 / 10.
Beginner was already one-hit; Normal and Experienced needed two hits.

| Difficulty | New starting health | Ordinary starter hit | Hits | First time-only two-hit threshold with unchanged starter |
| --- | ---: | ---: | ---: | --- |
| Beginner | 6.75 | 12 | 1 | Not during authored five minutes; pressure/overtime can increase it |
| Normal | 8.55 | 10 | 1 | 40% progress / 2:00 timer |
| Experienced | 9.9 | 10 | 1 | 10% progress / 0:30 timer |

The 0.5 gameplay rate means those timer thresholds take twice as much active
wall time. Ordinary opening-step arrivals (0–<10% progress) die in one plain hit;
world pressure, elite variants and upgrades are separate modifiers. Health is
snapshotted at spawn, so older cohorts retain their spawn health.

Nine is the largest whole-number base health below Experienced's plain hit
threshold, with margin against floating-point equality. Raising starter damage
from 10 to 12.2 also works, but increases all-role starter damage by 22% and all
subsequent damage-scaled upgrades. It would alter bottle/glass/bag challenge.
The chosen change lowers only Microplastics health by 18.2%; its reward stays 1.
Fragments sharing the role also use that lower base health as intended.

Five-minute, chaos-1 damage-rush model:

| Variant | Final levels B/N/E | Peak live B/N/E | Total XP B/N/E (rounded) |
| --- | --- | --- | --- |
| Previous (11 health, 10 damage) | 31 / 26 / 25 | 43 / 300 / 300 | 1954 / 1056 / 927 |
| Selected (9 health, 10 damage) | 32 / 27 / 26 | 24 / 300 / 300 | 2040 / 1158 / 1044 |
| Increase damage (11 health, 12.2 damage) | 32 / 28 / 27 | 1 / 300 / 300 | 2133 / 1364 / 1189 |

[Full comparison](Q4_COMPARISON.json) includes every existing reference build,
all three presets and all three counterfactuals. These deterministic pacing
estimates have no player movement/contact survival or device performance model.
No human difficulty acceptance or resource-efficiency improvement is claimed.

Reproduce from the repository root:

```sh
npx vite-node scripts/assess-opening.ts build/balance/Q4_COMPARISON.json
npm run balance -- --difficulty all --build damage-rush
```

[Selected pacing output](Q4_SELECTED_PACING.txt) records the actual balance command.
Regression checks use real damage/armour/world-selection rules and a live browser
starter attack with crit chance zero in each preset. The sprite browser displays
health, armour, contact damage, speed, XP/radius and non-critical starter hits;
its difficulty selector resolves actual theme definitions, with explicit scope.
The architecture atlas's captured base definition is also refreshed to 9.
