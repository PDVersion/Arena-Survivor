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

## Planned gameplay follow-on — 2026-10-21

The owner requests a phased adoption of the genre priorities, Australian rubbish
candidates and any required current-enemy rebalance. Detailed scope/evidence/gates
are in [READABLE_GAMEPLAY_ROADMAP.md](READABLE_GAMEPLAY_ROADMAP.md): Q6 first, then
G1 existing-roster balance, G2 bounded outdoor variety, G3 rhythm/sites, G4 mastery.
G1–G4 are planned follow-ons with milestone/branch placement TBC, not reopened
C1–C7 phases or runtime work started by this documentation amendment. Preserve
Q6 priority, existing delivery decisions and performance evidence limits.

Reconcile V0.4.4 against the settled implemented subset; future candidates do not
authorize art or indefinitely block the current roster. Construction/industrial
waste ideas are deferred, rather than added wholesale to the outdoor swarm.

## G1 claim publication

Owner2026-10-21 requests the plan on main as a claim and a prompt to begin G1.
PR27 has merged the preceding checkpoint; the readable-gameplay roadmap now owns
G1's bounded paths and `codex/readable-gameplay-g1` branch. Start with
[PHASE_G1_PROMPT.md](PHASE_G1_PROMPT.md), completing/verifying Q6 first. G1 is
claimed, not started/completed. G2–G4 remain planned and V0.4.4 stays gated by
the settled implemented roster. This documentation publication changes no gameplay.

## Current follow-on outcome — 2026-10-21

Q6 is verified in44585dd on `codex/readable-gameplay-g1`; G1 subsequently passes
its bounded local gate. [G1_REPORT](content/G1_REPORT.md) records the two Glass
changes, model repairs, actual checks and limits. Earlier Session21/open-Q6 and
claimed/unstarted-G1 sections above are historical. G2–G4/new art remain unstarted;
next owner-selected work must claim the roadmap's G2 scope. No gameplay merge,
broad campaign or additional external-device pass is inferred from this result.

## G2A continuation — 2026-10-22

Owner now authorizes G2 prompt/plan/review and implementation. First candidate
is locally kept on `codex/readable-gameplay-g2` from G154e9b2f. Exact authority:
[BUILD_PLAN_G2](BUILD_PLAN_G2.md), [G2A_REPORT](content/G2A_REPORT.md). G2 remains
in progress; next is separately claimed/reviewed G2B. No old phase, sprite work,
main merge or deferred hardware/browser acceptance is reopened by this result.

## G2B local continuation — 2026-10-22

Wrapper/Paper Wisp interception is **kept** after its separate local gate:
282units/30files, types/lint/build,120before+120after ambient cases/four balance
commands and4serial both-theme Default/Low+reduced-motion browser cases pass.
[Report](content/G2B_REPORT.md) owns source, trade-offs and aided-fixture limits.
G2 remains in progress; G2C Can next under a reviewed claim. G3/G4/art unstarted;
broad/native/device evidence remains deferred/waived/unverified. No push/merge.

## G2 complete; G3 ready/unstarted — 2026-10-22

G2A weak groups, G2B wrapper gust/interception and G2C direct Can roll/recovery
are all **kept** after separate verified local candidate gates. G2Ab4d61ae and
G2B7ce03c5 precede the G2C commit owning this checkpoint. Final686units/72files,
types/lint/build/whole-branch whitespace,12serial Chromium Canvas candidate cases
(4.2s,1worker,0retries) and per-candidate before/after balance evidence pass.
[G2C report](content/G2C_REPORT.md) records all decisions, actual sources,
initial test-only failures, trade-offs and aided-fixture/model limits.
[Reviewed G3 handoff](PHASE_G3_PROMPT.md) is prepared; **G3 implementation
has not started**. G4/new sprites remain unstarted. Broad regression/stress/soak
checks deferred; actual Safari/missing browser-OS/older physical GPU evidence
remains waived/unverified. No new remote CI, push, PR or main merge claim.

## G3 complete locally / G4 ready, unstarted — 2026-10-22

Owner requests execution of PHASE_G3_PROMPT. G3 runs on `codex/readable-gameplay-g3`
from G2C5b50d7b: spaced teaching/mini/elite thresholds,4Glass/2Bag first waves,
five optional destinations, current-world site cost/reward, minimap diamonds and
boss pursuit holds during fixed warnings. Rate/camera/bodies/caps/weapons/stable
IDs/saves/art remain. Final342short tests/35files and696full units/73files,
types/lint/build/whitespace,13unique affected serial browser cases and120before+
120after ambient /90before+90after timed balance scenarios pass. Initial old
schedule/roster fixture failures and actual aided/model limits are recorded in
[G3_REPORT](content/G3_REPORT.md); this is no natural survival/device claim.
[PHASE_G4_PROMPT](PHASE_G4_PROMPT.md) is written/reviewed; G4 implementation
and new sprites remain unstarted. Broad browser/stress/soak checks deferred;
external browser/OS/older physical GPU evidence waived/unverified. Local phase
commit only, no new CI/push/PR/main merge. Earlier open-G3 entries are historical.

## G4 complete locally — 2026-10-22

Owner requests G4 implementation. `codex/readable-gameplay-g4` starts at verified
G3 `d8ae891`. Results now default to actual tool contributions, accepted optional
pressure and one attainable next experiment, with the existing ledger/tally in
Details. Death clocks use elapsed time, including overtime. The shared optional
guide adds ten paged enemies and current progress toward the existing two unlocks.
Both themes use authored copy; no new progression, saved fields, tuning or art.

Final **703 unit tests/74 files**, **283 focused tests/25 files**, types/lint/build
and whitespace pass. All **five** bounded serial Chromium cases pass together in
4.3s, one worker, zero retries; screenshots inspected. All120 ambient balance
cases exactly match G3. [G4_REPORT](content/G4_REPORT.md) records actual sources,
input-fixture corrections and limits. G1–G4 are locally complete, with no new
remote CI/push/PR/main merge claim. Broad app/stress/soak and physical/native
checks remain deferred; previously waived external evidence remains unverified.
[Next handoff](NEXT_READABLE_GAMEPLAY_HANDOFF.md) covers delivery/owner-selected
sprite planning. V0.4.4 roster reconciliation is documented; generation is unstarted.
Earlier unstarted-G4 entries above are historical checkpoints.
