# V0.4 — Readable Baseline Before Content Growth

Current milestone dates and statuses: [BUILD_STATUS.md](BUILD_STATUS.md).

V0.4 is now a sequence, not two live parallel streams. The sprite checkpoint
made five core actors readable and exposed a larger design issue: the camera,
pace, and abstract projectile still serve the original high-density arcade game
better than the simpler educational game.

| Increment | What | Plan |
| --- | --- | --- |
| **V0.4.0** | Optional-sprite seam | [Master seam record](MASTER_BUILD_PLAN.md#v0-4-0); REC-071–073 |
| **V0.4.1** | Sprite pipeline plus player and four enemy sheets | [`MASTER_BUILD_PLAN.md#v0-4-1`](./MASTER_BUILD_PLAN.md#v0-4-1) |
| **V0.4.2** | Readable 2× world view, scaled crisp UI, 0.5 pace, minimap, Cleanup Grabber progression | [`MASTER_BUILD_PLAN.md#v0-4-2`](./MASTER_BUILD_PLAN.md#v0-4-2) |
| **V0.4.2.1** | Readability/contact corrections, Collection Sweep, and material-family mapping | [`MASTER_BUILD_PLAN.md#v0-4-2-1`](./MASTER_BUILD_PLAN.md#v0-4-2-1) |
| **V0.4.3** | Performance P0–P6, then selected weapons, evolution, bosses, curses, unlockables, persistence | [`BUILD_PLAN_V0.4.3.md`](./BUILD_PLAN_V0.4.3.md) |
| **V0.4.4** | Reconcile and complete the remaining sprite roster | [`SPRITE_PLAN_V0.4.4.md`](./SPRITE_PLAN_V0.4.4.md) |

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

## Completed foundations

The seam, sprite checkpoint and V0.4.2 delivery/verification records are now
in [MASTER_BUILD_PLAN.md](MASTER_BUILD_PLAN.md#v0-4-0). The permanent boundary:
a sprite is presentation only; no system derives hitboxes, radii, mass or
separation from art. Nearest-neighbour filtering is per texture; global
`pixelArt` stays off while primitive fallbacks exist (REC-071–073).

## Reconciliation ranges

The original anchors are preserved. New ranges avoid renumbering published
entries:

| Increment | What | Plan |
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
On 2026-10-20 the owner explicitly approves planned C1–C7 after the verified
software gate while missing P5/P6 browser/device evidence remains release-blocking.
Session15 explicitly temporarily waives the outstanding actual Safari, missing
browser/OS combinations and older physical integrated-GPU checks. They remain
waived/unverified, never passed; other optional content remains unselected.
The active increment plan owns the exact performance paths, commit subjects,
verification, and hardware-reporting gates. This is a technical prerequisite,
not a change to game content, balance, or the V0.4.4 sprite gate.

| Path | Owner while active |
| --- | --- |
| `build/SPRITE_*.md`, `build/sprites/**`, `public/sprites/**` | V0.4.1, then V0.4.4 |
| `src/game/content/themes/*/sprites.ts`, `src/game/systems/sprites/**` | V0.4.1, then V0.4.4; V0.4.2 may only add a generic timing input through R0 |
| Paths listed in `MASTER_BUILD_PLAN.md#v0-4-2` R1A/R1B/R1C | The named V0.4.2 feature branch |
| Content-growth systems, persistence, bosses, curses, and weapon slots | V0.4.3 after V0.4.2 merges |
| Diagnostic/frame sampling, measured hot paths, presentation/lifecycle work | V0.4.3 P0–P6, within that plan's phase ownership |

Once an increment merges, the next increment may edit its code normally while
preserving the permanent presentation/simulation boundary above.

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
  absent hardware is never inferred from throttling. Session15 temporarily waives
  the outstanding external checks by explicit owner decision, without new evidence.
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

## Session21 correction priority

C1–C7 local gates pass at C7 `88f220b`; the active V0.4.3 plan now tracks open Q6:
player motion/alignment, cone feedback matching actual pulses, and owner-selected
vacuum primary-target growth through weapon upgrades. Modest early caps are
accepted; later steps/evolution tuning remain unimplemented and need balance
verification. Owner subsequently authorizes a draft delivery PR before these
corrections; Q6 stays open and V0.4.4 generation remains gated.
Historical scoped passes and the temporary external-check waiver remain intact.
