# V0.4 — Readable Baseline Before Content Growth

V0.4 is now a sequence, not two live parallel streams. The sprite checkpoint
made five core actors readable and exposed a larger design issue: the camera,
pace, and abstract projectile still serve the original high-density arcade game
better than the simpler educational game.

| Increment | What | Plan | Status / branch |
| --- | --- | --- | --- |
| **V0.4.0** | Optional-sprite seam | This file's historical contract; REC-071–073 | Merged from `claude/v0.4.0` |
| **V0.4.1** | Sprite pipeline plus player and four enemy sheets | [`SPRITE_PLAN_V0.4.1.md`](./SPRITE_PLAN_V0.4.1.md) | Merged from `codex/v0.4.1` |
| **V0.4.2** | Readable 2× world view, scaled crisp UI, 0.5 pace, minimap, Cleanup Grabber progression | [`BUILD_PLAN_V0.4.2.md`](./BUILD_PLAN_V0.4.2.md) | Merged from `codex/v0.4.2` |
| **V0.4.2.1** | Readability/contact corrections, Collection Sweep, and material-family mapping | [`BUILD_PLAN_V0.4.2.1.md`](./BUILD_PLAN_V0.4.2.1.md) | Merged from `codex/v0.4.2.1` |
| **V0.4.3** | Performance P0–P6, then selected weapons, evolution, bosses, curses, unlockables, persistence | [`BUILD_PLAN_V0.4.3.md`](./BUILD_PLAN_V0.4.3.md) | P0/Q1/Q2/Q3/Q4/P1 verified on `codex/v0.4.3`; P2 next; other content not started |
| **V0.4.4** | Reconcile and complete the remaining sprite roster | Future plan based on V0.4.2/V0.4.3 content | Gated by REC-078 |

The old V0.4.2 content plan was moved to V0.4.3 before implementation began.
REC-090 is preserved as an earlier implementation discovery; the renumbering
does not rewrite that history.

## Why the order changed

The original plan assumed that the loop was settled and should now grow. The
V0.4.1 checkpoint contradicted that assumption: the sprites can be good and
still be too small and too fast to read, while the starter weapon's fiction is
too abstract for a game whose environmental mechanics are meant to make sense.

Adding weapons, bosses, facts, or fourteen more sprites before correcting that
baseline would tune and draw them for the wrong game. V0.4.2 therefore tests the
new baseline first. V0.4.3 grows only what survives that test, and V0.4.4 draws
the resulting roster.

The technical caps remain safety ceilings. A tighter camera should make a much
smaller live population feel substantial; it does not require enlarging actor
art, bodies, or hitboxes, and it does not require lowering the 300-enemy cap
before performance evidence exists.

## Historical V0.4.0/V0.4.1 contract

V0.4.0 pre-landed the optional sprite contract, theme-owned sprite maps, loader,
primitive fallback, and follower view so V0.4.1 could add art without changing
simulation. Three rules remain permanent:

1. A sprite is presentation and nothing else. No system reads it, and no radius,
   hitbox, mass, range, or separation value is derived from it.
2. Nearest-neighbour filtering is applied per texture. The global Phaser
   `pixelArt` flag stays off while primitive fallbacks exist.
3. An actor keeps its authoritative primitive/body; an optional sprite view
   follows the full transform and may outlive a defeated actor only as a
   presentation remnant.

V0.4.1 delivered the reusable pipeline and accepted sheets #1–5: Plastic
Bottle, the since-replaced Plastic Bag, Glass Bottle, Bagged Waste, and Environment Protector. Rows
#6–19 remain unclaimed under REC-078 until V0.4.4 reconciles them against the
post-redirect roster.

## V0.4.2 working protocol

V0.4.2 has one tiny seam phase, three parallel features, and one integration
phase. [`BUILD_PLAN_V0.4.2.md`](./BUILD_PLAN_V0.4.2.md) owns the exact paths and
acceptance tests.

1. The core agent lands R0 on `codex/v0.4.2` with neutral camera/pace hooks and a
   weapon-delivery dispatch boundary.
2. Three equivalent agents branch from that commit as
   `codex/v0.4.2-view`, `codex/v0.4.2-pace`, and
   `codex/v0.4.2-grabber`.
3. Each agent stays inside its ownership block and produces one focused commit.
4. The core agent merges all three back into `codex/v0.4.2`, resolves the
   simulator and engagement-envelope changes, runs the full suite, and records
   the combined play test.
5. Only `codex/v0.4.2` opens a pull request into `main`.

This is preferable to three branches editing `RunScene` independently. R0 wires
one hook per concern first, so the feature agents work in separate modules and
the final agent integrates behaviour rather than merge conflicts.

## Reconciliation ranges

The original anchors are preserved. New ranges avoid renumbering published
entries:

| Increment | Reconciliation IDs |
| --- | --- |
| V0.4.0 seam | REC-071–073 |
| V0.4.1 sprites | REC-074–089 |
| V0.4.3 early discovery | REC-090 (preserved) |
| V0.4.2 redirect | REC-091–099 |
| V0.4.2.1 correction | REC-098–099 within the V0.4.2 range |
| V0.4.3 content growth | REC-100–119 |
| V0.4.4 sprites | REC-120 onward |

The anchors in `RECONCILIATION.md` follow milestone order rather than numerical
order where REC-090 is concerned. That oddity is intentional and safer than
renumbering a merged decision.

## Cross-increment ownership

V0.4.3 now starts with the browser-performance prerequisite P0–P6, promoted
from [`AUTONOMOUS_DEVELOPMENT_PLAN.md`](./AUTONOMOUS_DEVELOPMENT_PLAN.md) at the
owner's Session 1 request (REC-102). Measurement precedes optimization and
content growth; C1–C7 retain their dependencies and require owner selection.
The active increment plan owns the exact performance paths, commit subjects,
verification, and hardware-reporting gates. This is a technical prerequisite,
not a change to game content, balance, or the V0.4.4 sprite gate.

| Path | Owner while active |
| --- | --- |
| `build/SPRITE_*.md`, `build/sprites/**`, `public/sprites/**` | V0.4.1, then V0.4.4 |
| `src/game/content/themes/*/sprites.ts`, `src/game/systems/sprites/**` | V0.4.1, then V0.4.4; V0.4.2 may only add a generic timing input through R0 |
| Paths listed in `BUILD_PLAN_V0.4.2.md` R1A/R1B/R1C | The named V0.4.2 feature branch |
| Content-growth systems, persistence, bosses, curses, and weapon slots | V0.4.3 after V0.4.2 merges |
| Diagnostic/frame sampling, measured hot paths, presentation/lifecycle work | V0.4.3 P0–P6, within that plan's phase ownership |

Once an increment merges, the next increment may edit its code normally while
preserving the permanent presentation/simulation boundary above.

After P0, the owner selected a Q1 correction before P1: player facing/walk,
crisp background text, common tool-upgrade availability and three difficulty
presets (F16). `BUILD_PLAN_V0.4.3.md` owns that exception and its exact paths.
It may amend eco sprite presentation metadata; bitmap generation and remaining
roster work remain gated to V0.4.4. Other optional content is still unselected.

The owner also authorized Q2 event readability, sprite inspection/reuse, opening
composition and spawn accounting before P1 (REC-107/108). Exact paths and gates
are in the active plan; new bitmap generation/remaining roster stays gated.

## Gates

- V0.4.2 does not start from an unmerged sprite branch; V0.4.1 is already on
  `main`.
- V0.4.3 does not start until V0.4.2's combined play-test gate accepts the view,
  pace, and starter weapon, and V0.4.2.1 resolves the follow-up readability,
  contact, and material-family findings.
- V0.4.4 does not claim or generate remaining sheets until V0.4.2 and V0.4.3
  settle stable IDs, subjects, sizes, and frame roles.
- V0.4.3 content C1 does not start before the P0–P6 software gate passes and
  optional content is selected. Older-device acceptance requires device evidence;
  absent hardware remains explicitly pending, never inferred from throttling.
- Any build phase that changes product direction must update `PLAN.md`,
  `EDUCATION_PIVOT.md`, `THEME_ARCHETYPES.md`, and reconciliation in the same
  phase rather than leaving contradictory authorities.

## V0.4 definition of done

V0.4 is complete when the readable baseline has merged, content growth has been
revalidated against it, the reconciled sprite roster is complete, both
production themes still satisfy their contracts, and every accepted balance
value remains theme-owned data. A 300-enemy stress test must still pass, but the
game no longer treats reaching 300 enemies—or filling the screen with effects—as
a design goal.

Q3 is the owner's wrap-up correction before Session 3/P2: measured upgrade-card
bounds, filtering early-capped skill offers, atlas/tool navigation and handoff
documentation. The active increment plan owns its paths; it does not start P2,
change the half-speed clock, move Glass Shards or authorize bitmap edits.

Q4 is the owner's one-hit opening correction and stat-inspection checkpoint:
Microplastics health 11→9, with all other role/tool values and later scaling kept.
Its gameplay gate passes; the owner requests a draft PR now, while P2–P6 remain
unstarted and the unchanged lockfile's audit blocks release (REC-112/113).

Q5 is the owner's PR #24 Actions correction: portable test artifacts, bounded
simulation waits and vetted development-tool patches. The audit now reports
zero vulnerabilities locally; remote head verification remains part of its gate
(REC-113/114). It does not start P2 or change gameplay/balance.
