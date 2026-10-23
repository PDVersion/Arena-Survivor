# Current handoff — eco sprite generation preparation

Owner direction 2026-10-22: Knights and Magic is paused indefinitely until the
owner explicitly reopens it. Read AGENTS, milestone sequence, reconciliation,
master conventions, BUILD_STATUS and AUTONOMOUS_PROGRESS first.

Q6/G1–G4 are locally complete; their completed phase plans/prompts are retired
into the [master log](MASTER_BUILD_PLAN.md#readable-gameplay). Historical PR28
and CI observations remain in BUILD_STATUS; inspect actual current remote state
if delivery work is requested. This documentation pass publishes nothing.

The selected next art direction is [V0.4.4](SPRITE_PLAN_V0.4.4.md). Use the
[style lock](SPRITE_STYLE_GUIDE.md), [26 copyable prompts](SPRITE_PROMPTS.md) and
[manifest](sprites/MANIFEST.md). All five shipped sheets are queued for actual
regeneration, not nearest-neighbour enlargement. Frame width/height double;
frame count, layout, normalized footprint, world display and physics stay fixed.

First-pass generation now exists for Bottle a2, Microplastics a4 and Glass a3.
Read the [batch report](sprites/review/style2/BATCH_1_REPORT.md) and measured bounds.
All three stay review; strict footprint/idle-hit alignment is not passed and
no live assets are replaced. Next refine the prompts and regenerate to the
measured envelopes, then run scoped live acceptance. Existing fixed-grid review
conversion is verified and preserves source offsets. For later implementation,
implementation create/claim the bounded V0.4.4 phase from the actual current
base, and claim the next attempt in the manifest. Preserve existing attempts. The production sprite script still builds five
style1 recipes: larger recipe dimensions, outline/normalization, atlas metadata
and Q6 anchors must be handled together. Do not overwrite old accepted art before
the replacement passes review. Preserve raw attempts and exact assembled prompts.
The plan orders Bottle/pipeline, existing replacements, remaining actors, then
other presentation assets and one consolidated eco gate. No knight-themed work.

Broad browser/stress/soak is not rerun for docs. Necessary future browser checks
stay serial and bounded, with owned resource cleanup. External actual Safari,
browser/OS and older physical-GPU checks remain waived/unverified.
