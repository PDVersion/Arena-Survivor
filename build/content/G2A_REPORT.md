# G2A — weak arrival groups, keep decision /2026-10-22

Owner requested a G2 start prompt, its review and implementation. Created
[PHASE_G2_PROMPT](../PHASE_G2_PROMPT.md), reviewed its scope/risk assumptions in
[BUILD_PLAN_G2](../BUILD_PLAN_G2.md), then implemented the first candidate only.
Branch `codex/readable-gameplay-g2` starts at verified local G1 `54e9b2f` after
Q6 `44585dd`. Dependencies remain local/unmerged; no publication is implied.

**Decision: keep G2A** as a bounded addition. G2 remains in progress. Wrappers,
Can, G3/G4 and sprite generation are not started. This is a local candidate gate,
not full-run human survival/performance or final art acceptance.

## Implemented choice and boundaries

New neutral `enemy.cluster_fodder`: eco **Cigarette Butts**, knight **Ashling**.
Each actor has6HP,0armour,64speed,3contact harm,1XP, radius10 and authored display
footprint28. Three individuals approach together, with34-world-unit arc spacing
on the existing off-screen spawn ring. They are slower/weaker than Microplastics,
not a replacement or rename. A group presents a lane-clearing choice: deterministic
Grabber corridor selects one at the declared spacing, base cone selects three;
a live cone clears the cluster while two existing roles behind the player survive.

Prototype50speed failed the existing maximum-ring16s approach envelope (19.16s).
Revised to64 (14.97s at that legacy maximum ring); kept the guard unchanged.
Current tighter view approaches sooner. These are authored game values, not
persistence/toxicity/litter-count facts. No automatic harmful patch, fragmentation,
recursive bag offspring, new currencies, characters or tool effectiveness matrix.

Introduction at normalized25% =75s simulated/150s nominal wall on a five-minute
run, after Bottle's10% introduction and before Glass40%. A three-actor override
replaces the otherwise ~19-actor milestone burst. Existing causal queue retains
requests at capacity, introduces once and never expands each request into another
group. Stored angles re-resolve through current off-screen safety at admission;
near arena edges that safety can bend the ideal formation. Existing chase,
contact/target rules, actor cap300, independent weapon clocks and rate0.5 remain.

Later natural selection weight2/growth0.5/pressure bias0 is deliberately sparse.
Only a natural director roll expands to the group. Capacity can truncate ambient
companions as with normal batches; no ambient debt is created. Splits, duplication,
offspring and the introduction retain their exact individual requested count.
The24-event processing budget/claim lifetime are unchanged. One inherited split
root is at most three lethals; three original members at most nine, excluding
other independently selected world effects. No family generates further groups.

The eco primitive is a pale bar with an orange end; knight uses a contrasting
rune shape. Theme-authored rectangular parts share the actor transform, damage
flash, alpha, depth and destruction lifecycle. A sprite still takes precedence.
Presentation never supplies a radius/body/target value. Actual bodies stay20px
wide; parts create no physics bodies. Eight parts is the validation ceiling for
composition complexity; these definitions use two. No PNG, atlas, sprite metadata
or pipeline file changed. The existing catalog/banner reads names from copy.

SAVE_DATA reviewed before reserving the ID. No saved field, schema, migration,
old ID, unlock or discovery category changes. Existing schema2/portable unknown-ID
compatibility tests pass. Both production themes and alternate manifest are valid.

## Measurement, mix and reward review

[Before](G2A/before.json), [after](G2A/after.json), [source/check manifest](G2A/verification.json).
Eight fresh CLI invocations use the four baseline commands before and after:
2themes ×2worlds ×3presets ×10models =120 records per stage, all240 command
summaries checked against structured records. Logs retain the four combinations
in G2A/before and G2A/after (trailing whitespace normalized). G2_CAPTURE.ts
reproduces current structured output. The before capture names its actual G1
head54e9b2f; inherited G1 snapshot hashes are historical source identity only.

300,000 simulated-ms =600,000 nominal wall-ms at rate0.5, excluding pauses/hit-stop.
Baseline has no optional world choices. C3 applies the shrine/both curses at start,
not natural travel/choice timing. Eco spread/explosion remain explicitly parked
diagnostics, excluded from attainable-build acceptance.

Simulator now admits the actual implemented count per natural role roll, bounded
by free slots, retaining G1 armour/cohort/cadence/no-empty-bank corrections. It
still omits geometry, pickup travel, damage taken/survival, offer frequency,
intro/milestone waves, elites/shields, offspring and bosses. Group geometry,
retained introduction and exact individual rewards have separate test evidence.

End-calm eco roll share is only2.2%, but actor share is about6.3% after tripling
that role's admissions (other roles are single admissions). Expected actors per
roll rise about4.4%; do not confuse weights with item shares. Actual Normal
baseline damage-rush admits53 new actors among984 total (~5.4%). Existing values
and other role weights remain unchanged; only their relative selection share
changes. Bagged Waste still releases its original five half-reward children.

Eco Normal baseline examples (XP rounded, cap dwell in simulated seconds):

| Build | Level before→after | Kills | XP | Sampled cap dwell |
| --- | --- | --- | --- | --- |
| damage-rush |24→25 |674→684 |877→959 |11.0→14.1 |
| two tools packed |26→27 |739→770 |1077→1152 |1.2→1.5 |
| evolved packed |30→30 |910→944 |1737→1783 |0→0 |

Experienced baseline damage-rush keepsL25 but kills752→707/XP901→891 and dwell
35.0→43.7s; packed base keepsL26/kills818→786, XP1053→1073. These trade-offs are
accepted for the sparse weak group, not concealed by cap/XP buffs. C3 Normal
damage-rush staysL41, XP5276→5241, dwell60.1→71.5s; evolved staysL45, XP7210→7208.
Knight Normal baseline damage-rush staysL25/XP891→902, packed evolution staysL31/
XP1834→1834. All presets/worlds/builds, role counts, milestone timestamps and
isolated/packed TTK bands are retained in JSON. A cap peak is neither performance
nor balance failure; packed aggregate work-clearing bands are not focused TTK.

At25% calm Normal each member spawns with6.27HP and pays1.05XP after the existing
toughness share. The retained three-member intro pays3.15XP for18.81 actual health
loss, once each. A later three-member group adds exactly the same, cumulative
6.3XP/37.62damage. Duplicate lethal attempts add nothing; death commits are drained
through the ordinary queue. A split elite family pays existing inherited source
halves/elite multipliers once; no cluster multiplication occurs in causal spawning.
No new lifetime/profile accounting path or reward source is introduced.

## Verification and limits

- **278units/29files pass**: G2 recipe plus affected difficulty, weapons and
  persistence suites. Formation/count admission/intro threshold, invalid data,
  one-hit introduction across presets, target geometry, legacy causal retention,
  material families and portable save compatibility are covered.
- Typecheck, lint, production build pass; existing large Phaser chunk advisory.
  Whole-branch/staged whitespace checks include new evidence files.
- **Four final serial Chromium151.0.7922.34 Canvas cases pass2.0s**, one worker,
  zero retries. Both themes ×Default/Low, with reduced motion enabled in Low.
  Each checks three retained introductions at capacity1 (backlog2→1→0), no
  duplicate introduction, individual exact lethals/XP, destroyed views, one
  natural three-actor admission,20px bodies, actual chase velocity matching world
  modifiers, mixed-roster cone selection and exact ledger sum.
- Screenshots under testInfo.outputPath, then copied into G2A/<theme>-<quality>.
  Mixed-role views inspected: [eco Default](G2A/eco-guardian-default/group-before.png),
  [eco Low](G2A/eco-guardian-low/group-before.png),
  [knight Default](G2A/knight-magic-default/group-before.png),
  [knight Low](G2A/knight-magic-low/group-before.png). White/orange members remain
  distinct from Bottle/Microplastics; the retained primitive shapes survive quality
  and motion settings. Images demonstrate readable prototypes, not accepted art.
- Browser fixture manually advances the introduction threshold, injects role
  selection and positions targets for comparison. Physics/update are initially
  frozen; the velocity assertion uses the actual actor advance method. These are
  integration/rule/readability assertions, not unassisted movement/survival,
  natural first-encounter timing or sustained performance. Audio disabled.
- First harness attempts incorrectly disabled XP drops; then omitted draining the
  final death event before asserting an empty queue. Corrected fixture flags and
  explicit ordinary event processing; no production XP/queue assertion was relaxed.
  Early test typings/catalog order expectations were corrected before acceptance.
- Owned games/pages/server cleaned up. Broad app/stress/soak/native/device campaigns
  deferred; actual Safari/browser-OS/older-device checks remain waived/unverified.
  No merge, remote CI, hardware pass or new sprite acceptance is claimed.

Next: G2B wrapper gust/interception prototype, separately claimed and reviewed
before edits. Do not bundle Can or move into G3. Keep G2A's source, reward and
presentation contracts as regressions; broader natural-play evidence remains a
separate authorized consolidated check.
