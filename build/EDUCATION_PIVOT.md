# Education Pivot — Design Exploration

This document explores how far the environment theme can be pushed toward genuinely teaching something, and what that would be worth.

It is **not a scheduled milestone**. The primary work remains building a fun game. The education angle is a wider-audience and monetisation option layered on top of a game that must stand on its own first.

Two decisions from this exploration have now been promoted into committed work:
the environment theme became the primary production theme in
[`MASTER_BUILD_PLAN.md#v0-3`](./MASTER_BUILD_PLAN.md#v0-3), and V0.4.2 now makes readability
the baseline through a cropped 2× view, a 0.5 gameplay rate, and a real-world
Cleanup Grabber starter. Everything else here remains exploratory.

V0.4.2.1 promotes one further environmental rule: fragmentation now produces
material-specific outcomes. Plastic Bottles create Microplastics, Glass Bottles
create stationary Glass Shards, and Bagged Waste releases a finite mixture of
primary waste roles. The concise names and relationships are recorded in
[`ECO_CONTENT_MAP.md`](./ECO_CONTENT_MAP.md); precise factual claims still need
the evidence workflow below.

The owner's post-P0 correction also selects Beginner / Normal / Experienced
presets for approachability. They change game pressure, not the environmental
facts or material relationships. Crisp world labels and correctly facing player
motion are part of the existing readability goal; no educational content is added.

Status: **Exploration.** Earliest realistic start for the layers below is V0.4.

---

## 1. The core bet

Most educational games fail the same way. They build a fun game, then bolt facts onto it — a popup, a quiz gate, a loading-screen tip. Players learn to dismiss the educational layer as the tax they pay for the fun layer. The genre nickname for this is "chocolate-covered broccoli," and it is the default outcome unless it is designed against deliberately.

The alternative is that **the mechanic is the lesson**. The player learns because playing well requires understanding the real system, not because the game paused to tell them something.

Two examples of what that means concretely:

> **Enemy health is persistence.**
> Food scraps die instantly — weeks in reality. A plastic bottle is the grinding baseline — around 450 years. A glass bottle is enormously durable but barely harmful on contact — effectively permanent, but chemically inert.
>
> A player who plays for twenty minutes will *feel* which materials persist, and will never need to be told.

> **Type effectiveness is correct handling.**
> The composting tool shreds organic waste and does almost nothing to plastic. Chemicals and refrigerants resist generic cleanup and need safe handling. Crush a sealed container of solvent and it ruptures into a contamination hazard — which is what actually happens.
>
> A player learns waste streams because sorting correctly is how they survive minute four.

Persistence-derived enemy identity remains agreed. Correct-tool effectiveness
is still promising, but slots and a six-type matrix are deferred until the
simpler V0.4.2 baseline proves that one readable real-world tool is engaging.
Complexity is not educational merely because it encodes a real taxonomy.

### Readability is now part of the educational goal

A player cannot learn from an object they cannot identify or an interaction
they cannot see. The environment game therefore shows less world at once rather
than enlarging its art or bodies, slows one coherent gameplay clock, and begins
with a recognisable pickup grabber instead of an abstract energy orb. The
300-enemy limit remains a stress ceiling; crowd size is no longer evidence that
the lesson or the game is working. See
[`MASTER_BUILD_PLAN.md#v0-4-2`](./MASTER_BUILD_PLAN.md#v0-4-2).

That rule includes the interface: reference copy, upgrade descriptions, and
settings are rendered at a crisp scalable baseline and are reachable before a
run through Info. The minimap supports orientation without revealing more world
through the gameplay camera.

---

## 2. One game, one theme, an optional layer

The earlier framing of this document — two themes, one fun and one educational — is superseded. The environment theme is now the primary fiction for **both** streams. That simplifies the structure considerably.

```text
                    ONE CODEBASE
                         │
              environment theme (primary)
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   knowledge layer OFF              knowledge layer ON
   hints & tooltips                 facts, codex depth,
   (the fun stream)                 knowledge shrines
                                    (the education stream)
                         │
              knight-magic theme (secondary)
              retained as a real regression target
```

The split is no longer "which theme" but "how deep is the information layer" — which is a content and settings decision, not an architectural fork.

### The knowledge system is the tooltip system

The most useful consequence: **the information system is not education-only.** The fun stream needs exactly the same machinery — hover an enemy and see what it is, open a codex to check what a tool does, get a hint about a mechanic you have not met. Facts are simply another entry type in the same catalogue.

That means the knowledge layer is never wasted work for the fun stream, and it removes the biggest risk in this whole document — building a system only one audience uses.

Practical rule for all feature work from here: **build every feature as if there is one game.** Assume the theme pack override is coming, keep display text and tuning in theme data, and let the depth of the information layer be a content decision rather than a code path. Building a core feature primarily because the education stream wants it is fine, provided the fun stream gets a version of it.

---

## 3. The type system

The Pokémon-style attribute matching is the central new mechanic. It is worth building carefully, because it is easy to make it feel bad in an auto-battler.

### Do all wastes fit into six types?

This was the sharpest question raised, and the answer determines whether the taxonomy scales. Motor oil, car parts, a mattress, a fridge — none of them are obviously "one" thing.

**The answer is a rule, not a longer type list:** six *material* types, and anything that is not one material is a **layered enemy** built from several.

Types are materials, not disposal streams. Streams vary by council and country; materials do not.

| # | Type | Covers |
| --- | --- | --- |
| 1 | **Organic** | Food scraps, garden waste, natural fibres, timber |
| 2 | **Paper & Fibre** | Paper, cardboard, cotton and other natural textiles |
| 3 | **Polymer** | All plastics — bottles, films, foams, synthetic textiles, rubber, microplastics |
| 4 | **Mineral** | Glass, ceramics, concrete, rubble, aggregate |
| 5 | **Metal & Electronic** | Cans, scrap metal, whitegoods, electronics, batteries as devices |
| 6 | **Chemical & Emission** | Oils, solvents, paints, refrigerants, gases, particulates |

Then the composites resolve cleanly:

| Item | Resolution |
| --- | --- |
| Motor oil | Pure **Chemical** |
| Tyre | Pure **Polymer** (rubber is a polymer) |
| Concrete rubble | Pure **Mineral** |
| Car part | Layered — **Metal** shell → **Chemical** fluids → **Polymer** trim |
| Mattress | Layered — **Paper & Fibre** or **Polymer** cover → **Polymer** foam → **Metal** springs |
| Fridge | Layered — **Metal** shell → **Chemical** refrigerant → **Polymer** lining |
| Cigarette butt | Layered — **Polymer** filter → **Chemical** toxins. The filter is cellulose acetate, which is a plastic. Most people do not know this, and the game teaches it by making the butt take polymer-tool damage |

**Design rule: if something does not fit, it is a layered enemy, not a new type.** That keeps the matrix at six forever while the roster grows without limit.

### Layered enemies

This is the strongest idea to come out of the review, and it is worth stating as a mechanic in its own right.

A layered enemy has an ordered stack of layers, each with its own type, health, and armour. Breaking a layer:

- changes the enemy's active type, so the tool that was effective may stop being effective mid-fight;
- can trigger an on-break effect — a fridge leaking refrigerant creates a Chemical hazard zone, a mattress exposing springs gains armour;
- changes its appearance, so the state is readable without a health bar.

That is a mini-boss archetype, a teaching device, and a genuinely novel bullet-heaven enemy all at once. It also composes with existing systems: `hazard.damage_zone` from V0.3 Phase 6 is exactly what a refrigerant leak spawns.

### Rules to keep the matrix playable

| Rule | Reason |
| --- | --- |
| **Six types, permanently** | The player cannot inspect a 300-enemy crowd. Layered enemies absorb the complexity instead |
| **No immunities.** Multipliers are 0.5× / 1× / 1.5× / 2× | A 0× matchup in a roguelite where you cannot swap tools mid-run is a dead run, not a challenge |
| **Effectiveness is visible instantly** | Damage-number colour, a hit-sound pitch shift, and a type glyph on the enemy. Three redundant channels, at least one of which is not colour |
| **Wrong handling has a consequence, not just less damage** | A ruptured solvent container spawning a contamination pool is more memorable and more accurate than the number being smaller |
| **Each enemy layer has one type; tools may cover two** | Keeps the mental model small while allowing build variety |

### Draft matrix

Tools are interventions. Every cell is a defensible real-world claim — **if a cell cannot be justified from a source, the matrix is wrong, not the source.**

|  | Organic | Paper & Fibre | Polymer | Mineral | Metal & Elec. | Chem. & Emis. |
| --- | --- | --- | --- | --- | --- | --- |
| **Composting** | **2×** | 1.5× | 0.5× | 0.5× | 0.5× | 1× |
| **Sorting & Recycling** | 1× | **2×** | 1× | 1.5× | 1.5× | 0.5× |
| **Polymer Processing** | 0.5× | 1× | **2×** | 0.5× | 1× | 1× |
| **Crushing & Aggregate** | 1× | 1× | 1× | **2×** | 1.5× | 0.5× |
| **Safe Handling** | 0.5× | 0.5× | 1× | 1× | **2×** | **2×** |
| **Education & Policy** | 1.5× | 1.5× | 1.5× | 1× | 1× | 1.5× |

Two cells worth noting because they carry real content:

- **Composting × Polymer = 0.5×.** Plastics do not compost. "Compostable" plastics mostly require industrial facilities that most kerbside systems do not have — a genuinely surprising codex fact, delivered by the player watching the compost tool bounce off.
- **Education & Policy** has no hard counter and no hard weakness. It is a reliable generalist that prevents rather than treats. That is good balance design and an accurate statement about how behaviour change compares with technical fixes.

### Type zones on the map

Tying types to map regions makes the larger arena from V0.3 Phase 4 do real work.

Divide the arena into three to five zones with a dominant type — a riverbank thick with Polymer, an industrial yard of Metal and Chemical, a green belt of Organic. Zone membership becomes a **local spawn-weight modifier** feeding the existing director, so no new spawning system is needed.

The result is a traversal decision the game currently lacks: go where your build is strong, or accept a bad matchup to reach a shrine. Combine with the director's milestone crossings so zones escalate over time, and the map itself becomes part of the pacing.

### Weapon and equipment slots

Two options were raised: active switching between 1–3 tools, or fixed slots with everything firing automatically.

**Recommendation: fixed slots, no manual switching.** Four weapon slots and four equipment slots, all auto-firing, each visually distinct.

The reasoning:

- The genre's core promise is that you do not aim and you do not micromanage. The player's agency lives in *build* decisions, not actions per minute. Manual switching adds a per-second decision to a game that is already asking you to read a 300-enemy crowd.
- With mixed types on screen simultaneously, "which tool is correct right now" has no single answer. Switching would be wrong most of the time, which makes it feel bad rather than skilful.
- Simultaneous auto-fire turns type coverage into a **slot allocation problem** — decided calmly at level-up, visible in the pause menu, and re-evaluated as the run's composition shifts. That is where depth belongs, and it is what makes the wave telegraphs meaningful.
- It matches every reference game: Vampire Survivors' six weapons and six passives, HoloCure's equivalent, Risk of Rain 2's items.

Supporting decisions that follow from it:

- **Passives do not consume weapon slots.** Pickup range, move speed, armour, and luck are free-standing stat upgrades, as they are today.
- **Weapon level caps: yes.** A capped weapon is what makes evolution possible — max level plus a paired equipment item upgrades it into something qualitatively different. That is Vampire Survivors' single strongest hook and it fits the existing "deepen the weapon" decision.
- **Targeting as an equipment slot.** "Prioritise hazardous targets", "prefer the largest", "prefer the nearest to the objective" — these become build-defining once types exist, and they are the cleanest answer to "targeting should be meaningful".

If more moment-to-moment expression is wanted later, the better lever is **one active ability on a cooldown** — a single button, a big effect — rather than weapon switching. It adds a moment of player expression without turning the game into inventory management.

---

## 4. Deriving stats from real data

Instead of inventing enemy stats and then attaching a fact, **derive the stats from the data and let the fact explain the stat.**

### Plastic is the baseline

The **plastic bottle** remains the game's numerical baseline, not a claim that
bottles are the most commonly counted litter item. The verified FY25 litter
survey ranks cigarette butts first; plastic beverage bottles are fifth. Plastic
material prevalence and individual-item prevalence are different measures. The
current opening is Microplastics under REC-112, not a bottle-only opening. See the
[Australian evidence and roster roadmap](READABLE_GAMEPLAY_ROADMAP.md).

Plastic also comes in enormous variety, which gives the roster room to grow — bottles, bags, films, foams, fragments, textiles — all one type, all mechanically different.

### Log-scaled persistence

2026-10-21 evidence boundary: the legacy persistence values below are historical
modelling inputs/exploratory estimates, not newly verified facts. The supplied
waste and litter datasets do not validate decay times, toxicity, contact damage
or tool effectiveness. Keep accepted material ordering and REC-112's opening
exception while rebalancing; do not derive HP from prevalence or publish these
point estimates without the separate sourcing review in section6.

Literal persistence is unplayable: glass outlasts a banana peel by roughly a factor of twenty million. So health is derived on a **log scale, normalized to the plastic bottle**:

```text
health = baselineHealth × k ^ ( log₁₀(years) − log₁₀(450) )      k ≈ 1.6
```

This is a stated modelling decision, not a hidden fudge. The codex shows the real figure alongside the modelled one, and the ordering and intuition survive intact.

| Enemy | Persistence (widely-cited range) | Modelled health | Role |
| --- | --- | --- | --- |
| Food scraps | Weeks | ~3 | Swarm filler |
| Paper / cardboard | Weeks to months | ~4 | Weakest — dies instantly, as it should |
| Cigarette butt | ~10 years | ~9 | Fast, low health, **disproportionate harm** |
| Plastic bag | ~20 years | ~11 | **`enemy.fast_fragile`** in V0.3 |
| Aluminium can | ~100–200 years | ~16 | Mid |
| **Plastic bottle** | **~450 years** | **20 — baseline** | **`enemy.swarm_basic`** in V0.3 |
| Tyre | ~2,000 years | ~27 | Heavy, slow |
| Glass bottle | Effectively permanent | ~96 | **`enemy.slow_durable`** in V0.3 |

Persistence figures vary between sources; the fact schema in §6 requires ranges rather than point claims for exactly this reason.

### Health and harm are decoupled

This is the most important design consequence, and it is also the real lesson.

Glass is a wall that barely hurts you — inert, but permanent. A cigarette butt dies instantly and hurts a lot — small, short-lived, and toxic. Persistence and harm are different axes, and separating them gives a genuinely interesting enemy-design space while teaching the actual thing that makes litter dangerous.

The V0.3 plan already uses this: the Glass Bottle gets high health and **high armour** with low contact damage, which is why armour becomes an enemy stat in that milestone.

### Quirks

Beyond health and harm, each material earns behaviour:

| Material | Quirk |
| --- | --- |
| Plastic bag | Drifts — moves in gusts rather than a straight chase |
| Glass | High armour; shatters into sharp fragments that persist briefly |
| Cigarette butt | Leaves a small contamination patch on death |
| Battery | Ruptures if killed by the wrong tool, spawning a hazard |
| Foam | Fragments repeatedly — the existing Fragmentation mechanic as an innate trait |
| Refrigerant | Invisible until it drifts into a detection radius |

Start with the four V0.3 roles and add quirks before adding count. A small roster with strong identities beats a large roster of reskins.

---

## 5. Delivery layers

Ordered from least to most intrusive. The principle: **each layer is optional, and the ones that interrupt play are the ones that pay the player.**

### Layer 1 — Mechanics (always on, zero words)

Persistence-derived health, correct-tool effectiveness, consequences for wrong handling, layered enemies. Present whether or not the knowledge layer is enabled, because it is good game design first.

### Layer 2 — Field Guide (pull, never push)

Every enemy, tool, and hazard encountered unlocks a codex entry. Readable from the pause menu that V0.3 is already building, and between runs. **The player chooses when to read.**

In the fun stream the same UI shows mechanical information — what a tool does, what a quirk means. In the education stream those entries carry additional depth. Same system, different content depth.

### Layer 2b — Collections, feats, and unlocks

Turn the codex into a collection game, using exactly the completionist loop that HoloCure and Vampire Survivors run on:

| Feat type | Example | Reward |
| --- | --- | --- |
| Volume | Clean up 1,000 plastic bottles | Alternate skin for that enemy |
| Rarity | Encounter a 0.01%-drop variant | Codex entry and a cosmetic quirk |
| Completion | Every entry in one type | Type-themed palette or banner |
| Mastery | Clear a run using one tool type only | Title or trail effect |
| Discovery | Break every layer of a composite enemy | Cutaway diagram entry |

**Rewards are cosmetic and informational, never mechanical.** That keeps the fun stream fair, keeps the education stream honest, and avoids the trap of making knowledge a power gate.

This is also the cheapest possible retention system, and it works identically in both streams.

### Layer 3 — Post-run debrief (one screen, personalised)

The run-end screen already tallies what happened. Add one fact chosen by a rule against the player's own statistics — most-killed type, largest chain, a material they neglected — rather than a random draw:

```text
You cleared 312 plastic bottles this run.

A plastic drink bottle takes an estimated 100–500 years to break
down, and it never truly disappears — it fragments into
microplastics, which is why every bottle you missed became a swarm.

Something that helps: a refillable bottle replaces roughly 150
single-use bottles a year.
                                    [ Field Guide ]  [ Play again ]
```

Personalised, short, tied to their own run, skippable. A random fact is a loading screen; a fact about what you just did is a debrief. The selection formula is the difference.

### Layer 4 — Knowledge Shrines (opt-in, rewarded, never mandatory)

Reframed from the earlier "field test" idea, and better for it.

Certain shrines are **Knowledge Shrines**. Activating one offers three upgrades, each attached to a different topic. Choosing an upgrade poses its question. Answer correctly and take the full upgrade; answer incorrectly and take a weakened version, with the correct answer and a short explanation shown either way.

Why this shape works:

- It is a **choice to engage**, exactly like every other shrine. The player who wants only the game walks past.
- It creates the loop that makes the codex worth reading — knowing things is directly rewarded, so the Field Guide stops being optional flavour.
- It fits the existing risk/reward shrine model with no new systems.

Design cautions, because this is the layer most likely to feel bad:

- **Weakened, never nothing.** A wrong answer costing the entire upgrade turns a game into an exam. The weakened version keeps it a gamble rather than a punishment.
- **Questions must only cover content the player has already encountered.** Drawing from unencountered material is trivia gating, and it makes the shrine a coin flip. Restrict the pool to unlocked codex entries.
- **Always show the answer.** A wrong answer that teaches is worth more than a right answer that was guessed.
- Ship it behind a setting. It is the one layer that genuinely interrupts, and it should be provable that the game is complete without it.

Deliberately **not** on this list: mid-run popups, mandatory reading, quiz gates between levels. Any of them would break the flow state the whole V0.3 milestone exists to produce.

---

## 6. Accuracy governance

If this becomes a product used by children, factual accuracy is the entire credibility of the thing. A single confidently wrong statistic in a classroom is unrecoverable.

Treat facts as validated content, exactly as the theme manifest is validated today.

```ts
{
  id: "fact.polymer.bottle_persistence",
  claim: "A plastic drink bottle is estimated to take 100–500 years to break down.",
  detail: "Plastics fragment into smaller pieces rather than decomposing fully.",
  range: { low: 100, high: 500, unit: "years" },
  source: { name: "...", url: "...", year: 2024, kind: "government" },
  region: "AU",
  depth: "primary" | "secondary" | "advanced",
  ageBand: "3-6",
  confidence: "widely-cited-estimate",
  kind: "fact" | "commentary",
  lastReviewed: "2026-08-17",
  linkedContent: ["enemy.polymer_bottle"],
}
```

Validation rules, enforced by tests in the same way `define-theme.ts` validates manifests today:

- every fact has a named source, a URL, and a publication year;
- every fact has a `lastReviewed` date within the last 18 months, or the build warns;
- **ranges, not point claims** — persistence estimates vary widely, and stating "450 years" as fact where the literature says "100–500" is exactly the error that gets a product dismissed;
- `confidence` is explicit, and `widely-cited-estimate` is visibly different from `measured`;
- every enemy, tool, and hazard links to at least one entry;
- entries have an enforced word limit, so nobody writes a paragraph into a game overlay;
- claims are checked for regional accuracy — recycling rules differ by council, let alone by country.

### Fact and commentary are labelled separately

Social commentary is wanted and worth having — but it must be visibly distinct from measurement. "A plastic bottle takes 100–500 years to break down" and "producers should carry more of the cost of packaging" are different kinds of statement, and mixing them costs the credibility of the first.

The `kind` field handles this, and the UI presents commentary in a visually distinct style. Being explicit about which is which is what earns the right to say the second one at all.

### One content recommendation

[`IDEAS.md`](./IDEAS.md) lists "dumb politicians or counsellors, lobbyists" as enemy types. That works fine in the pure-fun stream and it is a genuinely funny idea.

For anything used in a classroom it is worth reconsidering — not on principle, but on outcome. Enemies caricaturing real political roles will keep the product out of schools, date badly, and hand critics an easy reason to dismiss the accurate content alongside it. The mechanic survives intact if the enemies become **systems and behaviours** rather than people: *Red Tape*, *Greenwashing Campaign*, *Loophole*, *Planned Obsolescence*.

Those are better targets anyway. A Greenwashing Campaign that heals nearby polluters until you cut through it is a better enemy design than a person with a briefcase.

---

## 7. Audience, region, and privacy

### Age is deliberately deferred

Locking an age band this early would constrain mechanics for no benefit. Game mechanics should stay true to the game — and children are considerably more capable of learning complex systems than educational software usually assumes, even where that requires some reading.

So: **build the game elements first, filter content later.** The `ageBand` and `depth` fields exist in the fact schema from day one, which makes age filtering a content decision rather than an architectural one. Nothing in the engine needs to know who is playing.

### Region: Australia only for now

Facts carry a `region` field regardless, so expanding later is a content addition rather than a rewrite. Australian specifics — kerbside streams, FOGO, container deposit schemes, state variation — are enough to be going on with, and being accurate about one place beats being vague about everywhere.

### Privacy is a genuine advantage

The game has no backend, no accounts, and no tracking, and [`SAVE_DATA.md`](./SAVE_DATA.md) already specifies a portable text save code.

That is a selling point, not a limitation, and it should be stated on the front page. No accounts means no COPPA exposure, no GDPR-K obligations, no Australian Privacy Act data-handling burden, no school data-protection review, and nothing for a parent to worry about. The existing save code doubles as a progress code a child can carry between a classroom and a home computer.

**Recommendation: keep it that way permanently.** No ads, no accounts, no analytics, no in-app purchases. It closes off some business models and it is worth it — and, usefully, it also makes Apple's and Google's kids-category policies trivial to satisfy rather than a compliance project.

---

## 8. Distribution and monetisation

The stated goal is that the process pays for itself primarily as end-to-end development learning, with monetisation as an ideal end state. That framing is worth taking seriously, because it changes what "success" means: **a finished, polished, small game is a better outcome than a large unfinished one** — both as a portfolio artifact and as a commercial base.

Concrete answers to the questions raised.

### Does going standalone raise the difficulty exponentially?

**No — but it adds a real fixed tax.** The build itself is genuinely cheap: Phaser wraps to desktop via Electron or NW.js, and to mobile via Capacitor. What is not free:

- store assets — capsule art, screenshots, trailer, description;
- age ratings and store questionnaires;
- a release build pipeline and update process;
- support and bug reports from people who are not you.

That is a few weeks of unfamiliar work, not an exponential increase. **The hard part is discoverability, not building.** Plan for that, not for the port.

### Platform comparison

| Platform | Entry cost | Fit | Notes |
| --- | --- | --- | --- |
| **Web** (itch.io, GitHub Pages) | Free | Highest reach, lowest friction | Zero gatekeeping, instant play, hardest to monetise directly. The natural home for a demo and for the school-facing build |
| **Steam** | ~US$100 per app, one-time | **Best commercial fit** | The survivors-like genre performs well here and the audience actively seeks it. Premium pricing works. Adds achievements, cloud saves, controller support |
| **iOS** | ~US$99/year | Viable, most work | Touch controls need real redesign, not a virtual stick bolted on |
| **Android** | ~US$25 one-time | Viable, most work | Performance on low-end devices is the genuine risk — 300 enemies with separation is demanding |

*Verify current fees before committing; platform pricing changes.*

The mobile caveat deserves weight: V0.3's 300-enemy budget is measured on desktop Chromium. A mobile port is a performance project, not a packaging project, and it would likely need its own entity budget and a reduced-effects mode.

### A note on genre precedent

Vampire Survivors launched cheap on Steam and did extraordinarily well, which is a large part of why this genre looks attractive. That is worth remembering as **survivorship bias** — it is the outlier that created the category, not the median outcome. The genre is now crowded. The differentiator here would be the educational angle and the environment theme, not the survivors-like mechanics, which is an argument for taking the theme seriously rather than treating it as a skin.

### Monetisation options, ranked for this project

1. **Premium on Steam.** Simple, honest, no privacy compromise, and it fits the genre's expectations. The clearest path to "this made money".
2. **Free web build as a funnel** to the paid desktop version. Costs nothing and the web build already exists.
3. **School or institution licensing.** Highest revenue per unit, and by far the highest effort — procurement cycles, invoicing, support, teacher materials, and a much higher accuracy bar. Worth exploring only after the game stands on its own.
4. **Ads or in-app purchases — do not.** They conflict directly with the kids audience and would destroy the "no tracking, no accounts" position, which is one of the few genuinely differentiated things here.

### Content beyond Year 12

Yes, and it costs almost nothing to keep possible. The same type system supports deeper content because the underlying science is deeper — lifecycle analysis, circular economy, embodied carbon, extended producer responsibility, policy instruments.

The `depth` field in the fact schema handles it: the same enemy carries a primary-level entry, a secondary-level entry, and an advanced entry. One roster, one matrix, three reading depths. This is why the depth field is in the schema from the start even though nothing reads it yet.

---

## 9. Sequencing

Each stage is independently valuable and independently abandonable. That matters — this should never become a commitment that endangers the game.

| Stage | What it delivers | Gate before continuing |
| --- | --- | --- |
| ~~**E1**~~ | ~~Environment theme as the primary production pack~~ | **Promoted into V0.3 Phase 2** |
| **E1.5 — Readable baseline** | Cropped 2× view, 0.5 gameplay rate experiment, real-world Cleanup Grabber starter | **Promoted into V0.4.2. Can players identify objects and read one tool action?** |
| **E2 — Slots and types** | Weapon and equipment slots, six types, the effectiveness matrix, wave and zone telegraphing, effectiveness feedback, targeting equipment | **Deferred until E1.5 passes. Is the game more fun with types?** If no, stop here |
| **E3 — Zones and layers** | Type zones in the arena; layered composite enemies with on-break effects | Do layered enemies read clearly in the cropped view at representative density? |
| **E4 — Knowledge system** | Entry contracts, codex UI in the pause menu, encounter tracking, mechanical hints for the fun stream | Do playtesters open the Field Guide voluntarily? |
| **E5 — Collections and debrief** | Feats, cosmetic unlocks, personalised post-run debrief, fact schema and validation | Does the collection loop pull people back into runs? |
| **E6 — Knowledge Shrines** | Opt-in question shrines drawing only from unlocked entries | Does it feel like a gamble rather than an exam? |
| **E7 — Depth and reach** | Age and depth filtering, curriculum mapping, teacher sheets, learning summary | Would a teacher use it unaided? |
| **E8 — Distribution** | Desktop build pipeline, store presence, pricing | — |

E1.5 is now the load-bearing stage. E2 remains a possible fun-stream feature,
but it no longer gets to assume that more simultaneous weapons and type
interactions are automatically better. The simplest tool has to be readable and
engaging first.

### Architecture the pivot would add

```text
core/
  attributes/
    ids.ts            Stable type IDs — never display names
    effectiveness.ts  Pure matrix lookup, data-driven
  loadout/
    contracts.ts      Weapon and equipment slot contracts
  knowledge/
    contracts.ts      Entry, fact, source, depth, age-band contracts
systems/
  knowledge/
    codex.ts          Encounter tracking and unlock state
  loadout/
    slots.ts          Slot allocation and level caps
ui/
  codex-ui.ts         Field Guide, reachable from the pause menu
  debrief-ui.ts       Post-run micro-lesson
content/themes/eco-guardian/
  attributes.ts       Type assignments per enemy layer and tool
  effectiveness.ts    The matrix as theme data
  entries.ts          Codex entries, sourced, validated, dated
```

Every one of those respects the existing boundary: stable IDs in core, display text and tuning in the theme, no simulation branch on a themed string.

---

## 10. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| **Chocolate-covered broccoli** — the education layer is skipped by every player | High | Layers 1 and 2 carry the load; interrupting layers pay the player; E4's gate is voluntary codex reads |
| **Type system makes the auto-battler worse** | High | E2 is deferred until the readable baseline passes, then gated on being more fun independent of any facts |
| **Slots increase per-frame cost** | Medium | Four simultaneous weapons multiply projectile counts; the V0.3 projectile budget and stress gate must be re-measured in E2 |
| **Accuracy maintenance burden** | Medium | Fact schema with review dates, a small curated set, ranges over point claims. Fifty good entries beat five hundred unchecked ones |
| **Focus split kills the fun game** | High | One codebase, one theme, shared systems; the knowledge system doubles as the tooltip system so no work is education-only |
| **Scope explosion** | High | Seven abandonable stages, each with a gate |
| **A wrong fact in a classroom** | Severe | Sources mandatory, ranges mandatory, review dates enforced by test, fact and commentary explicitly separated |
| **Mobile performance** | Medium | Treat any mobile port as a performance project with its own entity budget, not a packaging exercise |
| **Genre saturation** | Medium | The differentiator is the theme and the teaching, not the survivors-like loop. Which argues for taking the theme seriously |

---

## 11. Decisions taken

| # | Question | Decision |
| --- | --- | --- |
| 1 | Which theme first? | **Environment, as the primary production theme for both streams.** Knight-magic is retained as a second real theme for boundary regression. Pool-technician is not pursued. Promoted into V0.3 Phase 2 |
| 2 | Target age? | **Deferred.** Build game elements first; `ageBand` and `depth` fields make filtering a later content decision. Mechanics stay true to the game |
| 3 | Region? | **Australia only for now.** `region` field keeps expansion a content addition |
| 4 | Two build targets or one? | **One codebase, one primary theme, knowledge layer depth as the difference.** Simpler than the original two-theme framing |
| 5 | How far does the education layer go? | **Defer the serious layers.** Build the core game the fun stream needs first; E4 onward comes after the systems are proven |
| 6 | Is the type system worth doing regardless? | **Unproven.** First prove one readable real-world tool in V0.4.2; only then test E2 as an independently abandonable fun-stream feature |
| 7 | Commercial intent? | **Monetisable end state is the goal**, with the process paying for itself as end-to-end development learning. Steam premium is the leading candidate; ads and IAP are ruled out |

### Still open

- Whether an active ability on a cooldown is wanted alongside auto-firing slots.
- Exact slot counts — four and four is the recommendation, not a measurement.
- Whether weapon evolution lands with slots (E2) or later.
- Whether the fun stream ships any facts at all, or only mechanical hints.

---

## 12. One-paragraph summary

Build the environment theme as the game's real fiction, not a skin, and make
the first lesson legible before making it complex: a cropped view, slower clock,
recognisable waste, and one real cleanup tool. Keep persistence-derived health;
test correct-handling types and layered enemies only after that baseline works.
Build the knowledge system as the tooltip system so it serves both audiences
and no work is wasted. Deliver facts through a Field Guide the player chooses
to open, a debrief tied to their own run, and opt-in Knowledge Shrines that
reward knowing things without punishing not knowing them. Validate every fact
like code, label commentary as commentary, stay accountless and trackerless and
say so loudly, and aim at a finished small game rather than a large unfinished
one.


Q2 follow-up (2026-10-12): Microplastics now open the eco run; Plastic Bottles
enter quietly at 10% progress (30 seconds on the five-minute timer) and ramp
from ~6% to ~43% of calm natural spawn selection. At 0.5 gameplay rate this
first unlock is about 60 real seconds into active play. Microplastics now pay
1 XP as the common opening enemy; material health ordering stays unchanged.
Bagged Waste still releases its fixed 2 bottles / 2 Microplastics / 1 glass mix
pending owner confirmation. Site-event labels counter camera zoom at UI scale,
and spent events disappear from the minimap. Spawn accounting distinguishes
natural arrivals (including milestone waves), Fracture, Bagged Waste release,
site effects (surge/duplication) and test loads; source means immediate creation,
so ambient pressure modified by a shrine is still natural. No factual claims,
new material identities or bitmap generation are introduced.

Q4 (2026-10-13) makes ordinary opening Microplastics one-hit across difficulty
presets by lowering their game health to 9. This is authored game balance, not
a claim about environmental persistence. Starting stats in the sprite browser
come from actual difficulty-resolved theme definitions. A future stat book should
reuse those definitions/selectors and clearly distinguish authored, starting and
live modified values; that future feature is not implemented here.


## V0.4.3 C1 promotion — bounded second tool

The selected content phase adds a short-cone Cleanup Vacuum beside the unchanged
starter grabber. Two automatic slots; no manual switching or material matrix.
Three direct targets and bounded on-hit neighbour splash are authored game rules,
not sourced factual handling claims. The shared ledger names hit splash separately
from on-kill detonation. Tool-owned upgrades remain in each theme's weapon data.
No new enemy material, fact card, persistence or sprite is introduced here.


### V0.4.3 C2 — secondary-tool evolution

After four actual picks of its owned reach upgrade, the second tool can evolve
through the normal level-up draw: Cleanup Vacuum → Cyclone Vacuum, Runic Fan →
Runic Tempest. A distinct definition replaces the source in the same slot with
its exact earned reach and existing attack clock. Shared upgrades stay shared;
old owner entries retire and reset returns to the starting loadout. The evolved
tool has a wider four-target cone and stronger bounded on-hit splash; theme
weapons data owns every value. Quality tiers retain their gains but do not count
as extra picks toward the condition. No paired-equipment subsystem, environmental
fact/material-effectiveness claim, persistence or sprite generation is introduced.
The education document's earlier max-level/paired-item example remains exploratory;
this shipped condition uses the existing capped owner track instead.


### V0.4.3 C3 — readable, voluntary pressure choices

Unmanaged Dump adds a spatial Pollution/XP bargain. Overflow Contract and
Contamination Pact are one-time normal level-up choices for more arrivals or
more Pollution in exchange for XP, lasting only for that run. Their names and
numeric effects are theme-owned game fiction, not environmental facts or
material-effectiveness claims. No Knowledge Shrine/question or new enemy/material
identity is introduced. The detail card prioritizes the actual reward and primary
cost so the voluntary bargain stays readable under the three-line limit.

C4 implementation boundary2026-10-20: elite family names describe authored game
modifiers over existing material roles. Split/shield/acceleration adds no factual
environmental claim, material/tool effectiveness table or new educational surface.


### V0.4.3 C5 — bounded fictional encounters

Compacted Waste and Dumping Colossus are readable mini/final encounter fiction,
not persistence estimates, disposal advice or a promoted layered-material system.
They use the same tool damage path as existing waste actors. Their marked circle
teaches the immediate game action: move clear before the pulse. No knowledge
question, content-source claim, type effectiveness, material layer or sprite
inventory is added. Boss values and labels remain theme-owned.

### Session21 selected correction — vacuum progression and feedback

Owner selects increasing vacuum primary-target capacity as its own weapon upgrades
advance, retaining a modest early cap. This is a planned game rule, not an
educational/material-effectiveness claim. The C1/C2 three/four-target descriptions
above remain the implemented baseline. Exact steps, finite ceiling and evolution
carryover tuning need theme data and balance verification in Q6; growth must not
be lost at evolution. Clarify pulse/cone feedback and investigate player pose
alignment before further sprite generation. No new information surface, factual
content, material identity or progression category is introduced here.

## Australian rubbish and readable gameplay — 2026-10-21 planning amendment

The [four-phase roadmap](READABLE_GAMEPLAY_ROADMAP.md) records the owner-requested
priorities, source review, candidate roster and phase gates. The promotion here is
planning direction, not implementation of the broader six-type/knowledge systems.
Waste generation uses tonnes; surveyed litter uses item counts and a site sample.
Neither measures combat harm. The >5mm hard-fragment row does not describe the
existing Microplastics identity. Keep period/region/metric/denominator/source/review
date with eventual facts; retain the two separate rankings.

Outdoor prototypes prioritize Cigarette Butts, Packets/Wrappers and Aluminium Can,
one proved decision at a time. Rubble/organics/cardboard/scrap are later site
candidates; ash and hazardous waste remain industrial/containment candidates.
New movement/attacks are fictional game behaviour. In particular, the legacy
cigarette-on-death contamination idea is not selected: successful cleanup should
not automatically create a harmful patch. Hazardous material is not ordinary
vacuumable rubbish. Real handling claims require separate evidence and context.

The existing guide is the only reference framework. Optional explanations follow
recognizable interactions; no reading/quiz gate or new effectiveness matrix is
introduced. Q6 remains first, followed by measured G1 rebalancing before growth.

## Q6 implemented correction — 2026-10-21

The second tool's own four reach picks each add one primary target, independent
of rarity and unrelated levels:3→4→5→6→7. Evolution retains all four gains and
adds its authored extra target (8). Splash remains finite and unchanged. The
short filled cue marks a single pulse, followed by a faint historical outline
and selected-hit rings; entering the fade causes no new damage. Frame-specific
presentation anchors align player poses without editing accepted art or bodies.
This supersedes the earlier fixed3/4 and pending-Q6 wording. No environmental
fact, effectiveness matrix, persisted state or new sprite is added.
[Verification and limits](content/Q6_REPORT.md). G1 enemy tuning follows this gate.

## G1 accepted balance — 2026-10-21

After verified Q6, the existing-roster comparison selects only eco Glass armour
40→20 and its director base weight12→8. Glass retains96health, slow70movement,
9contact harm and7XP; the health ordering/material relationships stay intact.
The calm late natural selection mix is approximately45%Bottle/30%Microplastics/
11%Glass/14%Bagged, replacing the historical43/28/16/13rounded mix. These are game
weights, never litter-survey probabilities. Microplastics still open one-hit;
Bottles remain the numerical baseline, Shards stationary/clearable and bag
families finite. Knight tuning, other roles, weapon damage, progression, presets,
cap300 and rate0.5 stay unchanged. No new content, art, facts or saved IDs.
[G1_REPORT](content/G1_REPORT.md) separates corrected-model effects from tuning,
retains all scenarios and records the bounded local gate and its limits. G1 is
locally complete; G2–G4 and sprite generation remain unstarted.

## G2A weak groups — kept locally 2026-10-22

`enemy.cluster_fodder` maps to eco Cigarette Butts and knight Ashling. Individual
weak actors approach slowly in groups of three; clear a narrow lane or catch the
group in a cone. First introduction at25% is three retained requests, then sparse
natural groups.6HP/64speed/3harm/1XP are game tuning, unrelated to surveyed item
percentages or factual toxicity/persistence. Visible pale/orange primitive parts
and separate20px bodies replace neither Microplastics nor any material family.
No post-cleanup contamination patch, new art, saved discovery or effectiveness
matrix. Both themes retain all prior tuning/contracts and rate0.5/cap300.

[Reviewed plan](BUILD_PLAN_G2.md), [candidate report](content/G2A_REPORT.md).
G2A is locally complete; G2 remains in progress. Packets/Wrappers are next under
a separate reviewed claim; Can/G3/G4 and sprite generation remain unstarted.
