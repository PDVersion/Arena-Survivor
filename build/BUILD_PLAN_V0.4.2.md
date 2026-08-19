# V0.4.2 — Content Growth

The content half of V0.4: what [`PLAN.md`](./PLAN.md) §V0.4 asks for, now that
V0.3 and V0.3.1 have made the loop worth adding content to.

**This stream runs concurrently with V0.4.1 (sprites).** Read
[`BUILD_PLAN_V0.4.md`](./BUILD_PLAN_V0.4.md) first — it owns the file-ownership
table and the rules that keep the two streams from colliding. In particular:
**never read a sprite from a system, and never derive a radius, hitbox, or
separation value from one.** New content added here renders as a primitive until
a later increment sprites it, and that is correct.

## Scope, from PLAN.md

| # | Item | Phase | Notes |
| --- | --- | --- | --- |
| 1 | Additional weapons | C1 | Needs weapon slots first — the delivery-kind union deferred in REC-051 |
| 2 | Weapon evolution | C2 | Depends on slots and on the upgrade tiers from REC-065 |
| 3 | Additional shrine types | C3 | The arrival scheduler from REC-059 already takes any number |
| 4 | Additional curses | C3 | New content category; the `world.modify` effect is the existing seam |
| 5 | Elite modifiers | C4 | Today there is one baseline elite (REC-037); this makes it a family |
| 6 | Mini-boss | C5 | Fires at a director milestone |
| 7 | Final boss | C5 | Replaces the timer as the run's climax |
| 8 | Unlockable weapons | C6 | Needs persistence |
| 9 | Unlockable upgrade pool | C6 | Needs persistence |
| 10 | Browser-local profile persistence | C6 | [`SAVE_DATA.md`](./SAVE_DATA.md) |
| 11 | Export progress as encoded text | C7 | `SAVE_DATA.md` |
| 12 | Import with validation, preview, backup, migration | C7 | `SAVE_DATA.md` |
| 13 | Advanced statistics | C6 | The session slice from REC-062 is the foundation |
| — | ~~Endless mode~~ | **Done** | Shipped early in V0.3.1 — REC-064, REC-068 |

## Phases

Ordered by dependency, and sized so each ends in something playable.

### C1 — Weapon slots and a second weapon
The delivery-kind union deliberately deferred in REC-051, because its shape
depended on decisions slots had not made yet. Slots make it decidable: a melee
weapon declares an arc and a target cap instead of a projectile speed and
lifetime.

Splash lands here too, and needs an explicit boundary against the existing
on-kill detonation: **splash triggers on hit, detonation on kill**, and the
damage ledger has to keep them apart or the Processing Ledger stops reconciling.

*Verification:* two weapons fire independently; the ledger reconciles to the
same total it did with one; the pacing simulator's build models cover both.

### C2 — Weapon evolution
An evolved weapon is a new definition unlocked by a condition, not a mutated one.
Upgrade tiers (REC-065) are the natural trigger surface.

### C3 — Shrines and curses
A curse is the inverse of a shrine: pressure the player accepts for a reward,
but persistent and chosen at a different moment. Both resolve through the world
model from REC-035, which already takes any number of contributors.

### C4 — Elite modifiers
One baseline elite becomes a small family — an elite that splits, one that
shields, one that accelerates. REC-037's inheritance rules already say what
happens when an elite duplicates or fractures, and this must not break them.

### C5 — Mini-boss and final boss
A boss is an enemy with a health bar, a telegraphed pattern, and a director
milestone that spawns exactly one. The final boss replaces the timer as the
run's climax, which interacts directly with the end-of-timer decision from
REC-064 — that decision may need a third option, or may be replaced entirely for
a boss run.

### C6 — Persistence, unlocks, and advanced statistics
The first real slice of `SAVE_DATA.md`. The session statistics slice from REC-062
is already shaped for the payload's lifetime-statistics field, so this is mostly
adapter and migration work rather than new modelling.

### C7 — Save export and import
Encoded text export, import with validation, preview, backup, and migration.
`SAVE_DATA.md` §"Verification required when implemented" is the acceptance list.

## What this stream must not do

- Edit anything in V0.4.1's ownership block (`BUILD_PLAN_V0.4.md` §3)
- Read a sprite in a system, or size a hitbox from one
- Assume every content id has a sprite — most will not, for a while
- Take reconciliation ids below REC-090 — that range belongs to V0.4.1

## Open questions to settle before C1

- Does a weapon slot have its own upgrade pool, or does the shared pool offer
  slot-specific entries? This decides how much the upgrade selection changes.
- Does evolution consume a slot or replace the weapon in it?
- Does the final boss end the run, or drop into the existing endless/clear
  decision?
