# Education Pivot — Exploration Document

This is an **idea and options document**, not a scheduled milestone. It explores how the themes in [`IDEAS.md`](./IDEAS.md) — particularly the environment/nature theme — could turn Arena Survivor into something that also teaches, without damaging the game that makes it worth playing.

Nothing here is committed. It is written so that a decision can be made cheaply later, and so that the V0.3 work does not accidentally close doors this would need open.

Status: **Exploration.** Earliest realistic start is during or after V0.3. See [`BUILD_PLAN_V0.3.md`](./BUILD_PLAN_V0.3.md) and REC-043.

---

## 1. The core bet

Most educational games fail the same way. They build a fun game, then bolt facts onto it — a popup, a quiz gate, a loading-screen tip. Players learn to dismiss the educational layer as the tax they pay for the fun layer. The genre nickname for this is "chocolate-covered broccoli," and it is the default outcome unless it is designed against deliberately.

The alternative is that **the mechanic is the lesson**. The player learns because playing well requires understanding the real system, not because the game paused to tell them something.

Two examples of what that means concretely in this game:

> **Enemy health is decomposition time.**
> A banana peel has almost no health — a few weeks in reality. A plastic bottle is a slow, grinding kill — 450 years. A glass bottle is enormously durable but barely harmful on contact — a million years to break down, but inert. A cigarette butt dies instantly and leaves a toxic pool behind — small, and disproportionately damaging.
>
> A player who plays for twenty minutes will *feel* which materials persist, and will never need to be told.

> **Type effectiveness is correct handling.**
> The composting tool shreds organic waste and does almost nothing to e-waste. Battery and chemical enemies resist generic cleanup and require hazardous-waste handling. Attack a battery with the incinerator and it ruptures into a contamination hazard — which is what actually happens.
>
> A player learns waste streams because sorting correctly is how they survive minute four.

If those two mechanics work, the facts layer becomes optional reinforcement rather than the delivery vehicle. That is the bet.

---

## 2. Two streams, one codebase

The request was for the game to potentially split into two streams: pure roguelite fun, and an educational version. There are three ways to do that.

| Option | What it means | Cost | Verdict |
| --- | --- | --- | --- |
| **A. Two products, two repos** | Fork the codebase; diverge freely | Highest — every engine and balance fix done twice, and they drift within months | Avoid |
| **B. One codebase, one build, mode toggle** | A single game, in-game switch between themes and education layer | Lowest | Weak product identity; the education build has to explain itself in a menu |
| **C. One codebase, two builds** ✅ | One repo, one engine, two theme packs, two build targets with different defaults | Low | **Recommended** |

Option C works because the architecture already supports it. `THEME_ARCHETYPES.md` established that fiction is a replaceable content pack, and V0.1 shipped an alternate-theme test fixture proving the same systems accept two manifests with no simulation changes. An education pack is a second theme plus a knowledge pack, selected in `active-theme.ts`.

```text
Arena Survivor              Eco Guardian (working title)
─────────────────           ────────────────────────────
theme: knight-magic         theme: eco-guardian
education layer: off        education layer: on
audience: itch.io, players  audience: families, schools
                            ↓
              ─── shared engine, systems, balance ───
```

Both builds get every performance fix, every balance improvement, and every new mechanic. The fun stream stays uncompromised — no facts, no popups, no reading. The education stream is the same game wearing a different coat with a knowledge layer attached.

An important consequence: **the fun stream is the R&D for the education stream.** Whatever is proven fun in knight-magic gets re-skinned. That ordering is what protects against building a worthy product nobody wants to play.

---

## 3. The type system

The Pokémon-style attribute matching described in `IDEAS.md` is the central new mechanic. It is worth building carefully, because it is easy to make it feel bad in an auto-battler.

### Design constraints specific to this game

The player does not choose targets — the weapon auto-fires at the nearest enemy. That has three consequences:

1. **Effectiveness cannot be a moment-to-moment decision.** It must be a *build* decision: which tool to invest upgrades in, given what is coming.
2. **The game must therefore telegraph composition.** The V0.3 spawn director already announces milestone waves. Extend those announcements to name the incoming type — "E-waste dumping incoming" — and the type system becomes a strategic loop instead of a dice roll.
3. **Targeting priority becomes a real upgrade.** "Prioritise hazardous targets" is a meaningful choice once types exist.

### Rules to keep it playable

| Rule | Reason |
| --- | --- |
| **5–6 types maximum**, not 18 | The player cannot inspect a 300-enemy crowd. Anything larger is unreadable at a glance |
| **No immunities.** Multipliers are 0.5× / 1× / 2× | A 0× matchup in a roguelite where you cannot swap tools mid-run is a dead run, not a challenge |
| **Effectiveness is visible instantly** | Damage-number colour, a hit-sound pitch shift, and a type glyph on the enemy. Three redundant channels, one of which must not be colour |
| **Wrong handling has a consequence, not just less damage** | Incinerating a battery spawning a contamination pool is more memorable and more accurate than the number being smaller |
| **Every enemy has one type; tools may have two** | Keeps the mental model small while allowing build variety |

### Draft matrix — environment theme

Enemy types are waste and pollution streams. Tool types are real interventions.

|  | Organic | Recyclable | E-waste | Hazardous | Emissions | Microplastic |
| --- | --- | --- | --- | --- | --- | --- |
| **Composting** | **2×** | 0.5× | 0.5× | 0.5× | 1× | 0.5× |
| **Sorting / Recycling** | 1× | **2×** | 1.5× | 0.5× | 0.5× | 1× |
| **Safe Disposal** | 0.5× | 1× | **2×** | **2×** | 0.5× | 0.5× |
| **Water / Filtration** | 1× | 0.5× | 0.5× | 1.5× | 1× | **2×** |
| **Renewable Energy** | 0.5× | 1× | 1× | 0.5× | **2×** | 0.5× |
| **Education / Policy** | 1× | 1.5× | 1× | 1× | 1.5× | 1× |

Every cell in that grid is a defensible real-world claim, and every cell is a design decision. That is the property to preserve: **if a cell cannot be justified from a source, the matrix is wrong, not the source.**

Note the shape of Education/Policy — no strong resistances and no strong strengths, but broadly useful. That is both good balance design (a reliable generalist) and an accurate statement about how behaviour change works relative to technical fixes.

### Prove it in the fantasy theme first

Strong recommendation: **build the type system in knight-magic before the eco theme exists.** Fire / Frost / Storm / Physical / Arcane against enemy resistances, in a theme with zero accuracy burden. If it does not make the game better there, it will not make the game better with real-world labels attached — and finding that out costs a phase instead of a milestone.

---

## 4. Deriving stats from real data

This is the highest-value idea in the document and the one most worth protecting.

Instead of inventing enemy stats and then attaching a fact, **derive the stats from the data and let the fact explain the stat.**

| Enemy | Health (persistence) | Speed | Contact damage (harm) | Real basis |
| --- | --- | --- | --- | --- |
| Food scraps | Very low | Slow | Very low | Weeks to months to decompose |
| Paper / cardboard | Low | Slow | Low | Weeks to months; readily recyclable |
| Aluminium can | Medium | Medium | Low | Decades if littered; recyclable indefinitely |
| Plastic bottle | High | Medium | Medium | Centuries; fragments rather than decomposes |
| Glass bottle | Very high | Very slow | Low | Effectively permanent, chemically inert |
| Cigarette butt | Very low | Fast | **High** | Small and short-lived, disproportionately toxic |
| Battery | Medium | Slow | **Very high** + leaves hazard | Heavy metals; needs dedicated collection |
| Microplastic swarm | Low each, spawns in dozens | Fast | Low each | Fragmentation product; the swarm is the point |

Three things fall out of this table for free:

- **The Broodmother role already exists and maps perfectly.** A plastic bottle that fractures into microplastics on death is the existing `enemy.death_spawner` contract with an accurate fiction, and it teaches fragmentation without a word of text.
- **Health and harm decouple.** Glass is a wall that barely hurts you; a cigarette butt dies instantly and hurts a lot. That is a genuinely interesting enemy-design space *and* it is the actual lesson about what makes litter dangerous.
- **The XP scaling from V0.3 gets meaning.** "Impact points" scale with how persistent the thing you removed was.

Reframed vocabulary, all of it existing systems:

| System | Current | Environment theme |
| --- | --- | --- |
| XP | Arcane Power | Impact Points |
| Chaos | Chaos | Pollution Level |
| Shrines | Risk/reward altars | Policy decisions and industry booms |
| Elites | Elite enemies | Illegal dumping site, industrial polluter |
| Curses | Fracture, Glass World | Fast fashion, single-use packaging boom |
| Boss (V0.4) | — | Landfill, oil spill, bushfire |

---

## 5. Four layers of educational delivery

Ordered from least to most intrusive. The design principle is that **each layer is optional, and the ones that interrupt play are the ones that pay the player.**

**Layer 1 — Mechanics (always on, zero words).**
Decomposition-time health, correct-tool effectiveness, consequences for wrong handling. Present in the eco theme whether or not the education layer is enabled, because it is good game design first.

**Layer 2 — Field Guide (pull, never push).**
Every enemy and tool encountered unlocks a codex card with two or three sourced facts. Readable from the pause menu — which V0.3 is already building — and between runs. Collection completion is the hook, reusing exactly the unlock dopamine that HoloCure and Vampire Survivors run on. **The player chooses when to read.**

**Layer 3 — Post-run debrief (one screen, personalised).**
The run-end screen already exists and already tallies what happened. Add one fact tied to what *this player actually did*:

```text
You neutralised 312 plastic bottles this run.

A plastic bottle takes around 450 years to break down, and it
never truly disappears — it fragments into microplastics, which
is why every bottle you missed became a swarm.

One thing that helps: a refillable bottle replaces about 150
single-use bottles a year.
                                    [ Learn more ]  [ Play again ]
```

Personalised, short, tied to their own run, and skippable. This is where retention of the lesson actually happens.

**Layer 4 — Field Test (opt-in, rewarded, never punitive).**
Three questions before a run for a starting bonus. Wrong answers show the correct answer with a short explanation and still grant partial reward. This is the assessment layer a teacher or parent wants, and making it a *bonus* rather than a *gate* is the difference between a game and a worksheet.

What is deliberately **not** on this list: mid-run popups, quiz gates between levels, and mandatory reading. Any of them would break the flow state that the whole V0.3 milestone is designed to produce.

---

## 6. Accuracy governance

If this becomes a product for children, factual accuracy is not a nice-to-have — it is the entire credibility of the thing, and a single confidently wrong statistic in a classroom is unrecoverable.

Treat facts as validated content, exactly as the theme manifest is validated today.

```ts
{
  id: "fact.plastic_bottle.persistence",
  claim: "A plastic drink bottle can take around 450 years to break down.",
  detail: "Plastics fragment into smaller pieces rather than decomposing fully.",
  range: { low: 100, high: 500, unit: "years" },
  source: { name: "...", url: "...", year: 2024, kind: "government" },
  region: "AU",
  ageBand: "3-6",
  confidence: "widely-cited-estimate",
  lastReviewed: "2026-08-15",
  linkedContent: ["enemy.persistent_plastic"],
}
```

Validation rules, enforced by tests in the same way `define-theme.ts` validates manifests today:

- every fact has a named source, a URL, and a publication year;
- every fact has a `lastReviewed` date within the last 18 months, or the build warns;
- **ranges, not point claims** — decomposition estimates vary widely between sources, and stating "450 years" as fact where the literature says "100–500" is the kind of error that gets a product dismissed;
- `confidence` is explicit, and `widely-cited-estimate` is flagged as different from `measured`;
- every enemy and tool links to at least one fact;
- facts have a word limit, enforced, so nobody writes a paragraph into a game overlay;
- claims are checked for regional accuracy — recycling rules differ by council, let alone by country.

### One content recommendation

`IDEAS.md` lists "dumb politicians or counsellors, lobbyists" as enemy types. That works fine in the pure-fun stream, and it is a genuinely funny idea.

For the educational stream it is worth reconsidering — not on principle, but on outcome. Enemies that caricature real political roles will keep the product out of classrooms, will date badly, and will hand critics an easy reason to dismiss the accurate content alongside it. The mechanic survives intact if the enemies become **systems and behaviours** rather than people: *Red Tape*, *Greenwashing Campaign*, *Loophole*, *Planned Obsolescence*. Those are more accurate targets anyway — and "Greenwashing Campaign" that heals nearby polluters until you cut through it is a better enemy design than a person with a briefcase.

---

## 7. Audience, curriculum, and privacy

### Audience

Primary recommendation: **ages 8–12 (upper primary).** Reading level supports short fact cards, the age group is comfortable with roguelite structure, sustainability sits squarely in the curriculum, and it is the age where parents actively look for screen time they can justify.

Secondary: 12–14, with a deeper fact layer surfaced by the same codex.

### Curriculum mapping (Australia)

Mapping to the curriculum is what turns "an educational game" into something a teacher can actually use, and it costs one document.

- **Sustainability** is a cross-curriculum priority in the Australian Curriculum and threads through everything here.
- **Science** — Earth and Space Sciences, Biological Sciences (Years 4–7): materials, decomposition, ecosystems.
- **HASS / Geography** (Years 4–7): environmental management, resource use, waste.
- **Design and Technologies**: materials, life cycles, sustainable design.
- NSW syllabus outcomes map alongside, and Years F–2 / 3–4 / 5–6 / 7–8 bands are the natural `ageBand` values in the fact schema.

Deliverable when scheduled: a one-page teacher sheet per topic — what the game covers, which outcomes it touches, and three discussion questions. Cheap to write, disproportionately effective for adoption.

### Privacy — a genuine advantage

The game has **no backend, no accounts, and no tracking**, and `SAVE_DATA.md` already specifies a portable text save code.

That is not a limitation here — it is a selling point, and it should be stated on the front page. No accounts means no COPPA exposure, no GDPR-K obligations, no Australian Privacy Act data handling, no school data-protection review, and nothing for a parent to worry about. The existing save code doubles as a student progress code that a child can carry between the classroom and home computer on a slip of paper.

**Recommendation: keep it that way permanently.** No ads, no accounts, no analytics, no in-app purchases in the education stream. It closes off some business models and it is worth it.

---

## 8. Sequencing

Each stage is independently valuable and independently abandonable. That matters — this should never become a commitment that endangers the game.

| Stage | What it delivers | Gate before continuing |
| --- | --- | --- |
| **E0 — Decide** | Audience, stream strategy, first theme, scope ceiling | Answers to §10 |
| **E1 — Types in knight-magic** | Attribute contracts, effectiveness matrix, wave telegraphing, type feedback, targeting priority | **Is the game more fun with types?** If no, stop here — the whole pivot rests on this |
| **E2 — Eco theme pack** | Second production theme; stats derived from real data; reframed vocabulary; no facts layer yet | Does it stand up as a game with the sound off and the text hidden? |
| **E3 — Knowledge layer** | Fact schema and validation, codex UI, post-run debrief, unlock tracking | Do playtesters read the codex voluntarily? |
| **E4 — Field Test and reporting** | Opt-in quiz, learning summary, teacher sheets, curriculum map | Would a teacher use it unaided? |
| **E5 — Distribution** | Two build targets, landing pages, school pilot | — |

E1 is deliberately inside the existing game. It is the cheapest possible test of the riskiest assumption, and it produces a better fun-stream game whether or not the pivot proceeds.

### Architecture the pivot would add

```text
core/
  attributes/
    ids.ts            Stable type IDs — never display names
    effectiveness.ts  Pure matrix lookup, data-driven
  knowledge/
    contracts.ts      Fact, source, codex-entry, age-band contracts
systems/
  knowledge/
    codex.ts          Encounter tracking and unlock state
ui/
  codex-ui.ts         Field guide, reachable from the pause menu
  debrief-ui.ts       Post-run micro-lesson
content/themes/
  eco-guardian/       Second production theme
    facts.ts          Sourced, validated, dated
    effectiveness.ts  The matrix as theme data
```

Every one of those respects the existing boundary: stable IDs in core, display text and tuning in the theme, no simulation branch on a themed string.

---

## 9. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| **Chocolate-covered broccoli** — the education layer is skipped by every player | High | Layers 1 and 2 carry the load; interrupting layers pay the player; E3 gate is voluntary codex reads |
| **Type system makes the auto-battler worse** | High | E1 tests it in knight-magic first, at the cost of one phase |
| **Accuracy maintenance burden** | Medium | Fact schema with review dates, small curated set, ranges over point claims. Fifty good facts beat five hundred unchecked ones |
| **Focus split kills the fun game** | High | One codebase, shared engine; the fun stream stays the R&D track and is never blocked on education work |
| **Scope explosion** | High | Five abandonable stages, each with a gate. E0 sets a ceiling before any code |
| **A wrong fact in a classroom** | Severe | Sources mandatory, ranges mandatory, review dates enforced by test, regional accuracy checked |
| **More enemy variety costs frames** | Medium | V0.3's spatial index and 300-enemy stress gate already exist and cover it |

---

## 10. Decisions needed before E0 closes

1. **Which theme first?** Environment is the strongest fit for accurate content and curriculum mapping. The pool-technician theme is a real alternative and deserves a mention on its own merits — water chemistry, pH, filtration, and pool safety are genuine STEM content, the domain knowledge is already available, and it is a narrower and cheaper first pack than the whole environment.
2. **Ages 8–12 as primary?** It drives reading level, fact depth, session length, and difficulty defaults.
3. **Region?** Australia-first affects recycling rules, waste terminology, curriculum mapping, and units. Facts carry a `region` field either way.
4. **Two build targets, or one game with a mode toggle?** Recommendation is two targets from one codebase.
5. **How far does the education layer go?** Codex and debrief only, or all the way to Field Test and teacher reporting? This is the single biggest scope lever in the document.
6. **Is E1 (types in knight-magic) worth doing regardless?** It improves the fun stream on its own. If yes, it can slot into V0.4 with no commitment to the pivot at all.
7. **Any commercial intent?** Free-and-open, free-with-optional-school-pack, and paid-school-licence lead to different amounts of reporting, polish, and support work — and the answer changes E4 substantially.

---

## 11. One-paragraph summary

Build the type system inside the current fantasy game first, where it costs one phase and nothing is at stake. If it makes the game better, re-skin it as an environment theme where enemy health is decomposition time and effectiveness is correct disposal — so the mechanics themselves are the lesson. Add facts as a pull-based codex and a personalised post-run debrief, never as popups. Keep one codebase with two build targets so the fun stream never subsidises the education stream. Validate every fact like code, with sources, ranges, and review dates. Keep it accountless and trackerless, and say so loudly. And gate every stage, so the whole thing can stop at any point having still improved the game.
