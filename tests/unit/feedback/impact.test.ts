import { describe, expect, it } from "vitest";
import {
  accumulateDamage,
  createDamageAggregator,
  createHitStopState,
  DEFAULT_HIT_STOP_BUDGET,
  drainAll,
  drainDueDamage,
  drainTarget,
  isHitStopActive,
  killChainDetune,
  requestHitStop,
} from "../../../src/game/systems/feedback/impact";

const FAST_FRAME = 12;

describe("hit-stop budgeting", () => {
  it("grants a freeze and reports it active until it expires", () => {
    const state = requestHitStop(createHitStopState(), 1_000, 60, FAST_FRAME);
    expect(state.granted).toBe(1);
    expect(isHitStopActive(state, 1_000)).toBe(true);
    expect(isHitStopActive(state, 1_059)).toBe(true);
    expect(isHitStopActive(state, 1_060)).toBe(false);
  });

  it("caps a single freeze at the maximum duration", () => {
    const state = requestHitStop(createHitStopState(), 0, 10_000, FAST_FRAME);
    expect(state.activeUntilMs).toBe(DEFAULT_HIT_STOP_BUDGET.maxDurationMs);
  });

  it("refuses to stack freezes while one is running", () => {
    let state = requestHitStop(createHitStopState(), 0, 60, FAST_FRAME);
    state = requestHitStop(state, 10, 60, FAST_FRAME);
    expect(state.granted).toBe(1);
    expect(state.denied).toBe(1);
  });

  it("spends a bounded budget per window, so a chain cannot stall the game", () => {
    let state = createHitStopState();
    let now = 0;
    for (let request = 0; request < 20; request += 1) {
      state = requestHitStop(state, now, 90, FAST_FRAME);
      now += 100;
    }
    expect(state.spentMs).toBeLessThanOrEqual(DEFAULT_HIT_STOP_BUDGET.budgetMs);
    expect(state.denied).toBeGreaterThan(0);
  });

  it("refills once the window rolls over", () => {
    let state = createHitStopState();
    state = requestHitStop(state, 0, 90, FAST_FRAME);
    state = requestHitStop(state, 200, 90, FAST_FRAME);
    expect(state.spentMs).toBe(DEFAULT_HIT_STOP_BUDGET.budgetMs);

    const later = requestHitStop(state, DEFAULT_HIT_STOP_BUDGET.windowMs + 10, 90, FAST_FRAME);
    expect(later.spentMs).toBeLessThan(DEFAULT_HIT_STOP_BUDGET.budgetMs);
    expect(later.granted).toBeGreaterThan(state.granted);
  });

  it("never freezes while frames are already slow", () => {
    // Emphasis must not become lag exactly when the game is struggling.
    const state = requestHitStop(createHitStopState(), 0, 60, 50);
    expect(state.granted).toBe(0);
    expect(isHitStopActive(state, 0)).toBe(false);
  });
});

describe("damage aggregation", () => {
  const hit = (targetId: string, amount: number, tier = 0) => ({
    targetId,
    amount,
    tier,
    x: 10,
    y: 20,
  });

  it("draws one number per target per window rather than one per hit", () => {
    const aggregator = createDamageAggregator();
    accumulateDamage(aggregator, hit("a", 10), 0, 120);
    accumulateDamage(aggregator, hit("a", 15), 30, 120);
    accumulateDamage(aggregator, hit("a", 5), 60, 120);

    expect(aggregator.pending.size).toBe(1);
    expect(drainDueDamage(aggregator, 100)).toEqual([]);

    const due = drainDueDamage(aggregator, 120);
    expect(due).toHaveLength(1);
    expect(due[0]!.amount).toBe(30);
  });

  it("keeps the highest crit tier so the biggest hit sets the styling", () => {
    const aggregator = createDamageAggregator();
    accumulateDamage(aggregator, hit("a", 10, 0), 0, 120);
    accumulateDamage(aggregator, hit("a", 10, 3), 10, 120);
    accumulateDamage(aggregator, hit("a", 10, 1), 20, 120);

    expect(drainDueDamage(aggregator, 200)[0]!.tier).toBe(3);
  });

  it("separates targets", () => {
    const aggregator = createDamageAggregator();
    accumulateDamage(aggregator, hit("a", 10), 0, 120);
    accumulateDamage(aggregator, hit("b", 25), 0, 120);

    const due = drainDueDamage(aggregator, 200);
    expect(due.map((entry) => entry.amount).sort((l, r) => l - r)).toEqual([10, 25]);
  });

  it("flushes a target that dies mid-window so nothing is lost", () => {
    const aggregator = createDamageAggregator();
    accumulateDamage(aggregator, hit("a", 40), 0, 120);

    const flushed = drainTarget(aggregator, "a");
    expect(flushed?.amount).toBe(40);
    expect(aggregator.pending.size).toBe(0);
    expect(drainTarget(aggregator, "a")).toBeUndefined();
  });

  it("never loses or double-counts damage across any drain path", () => {
    const aggregator = createDamageAggregator();
    accumulateDamage(aggregator, hit("a", 10), 0, 120);
    accumulateDamage(aggregator, hit("b", 20), 0, 120);
    accumulateDamage(aggregator, hit("c", 30), 0, 120);

    drainTarget(aggregator, "a");
    drainDueDamage(aggregator, 200);
    accumulateDamage(aggregator, hit("d", 40), 250, 120);
    drainAll(aggregator);

    // Everything that entered aggregation was drawn exactly once.
    expect(aggregator.flushed).toBe(aggregator.accumulated);
    expect(aggregator.accumulated).toBe(100);
    expect(aggregator.pending.size).toBe(0);
  });
});

describe("kill-chain audio ramp", () => {
  it("rises with the streak and caps so a long chain never shrieks", () => {
    expect(killChainDetune(0)).toBe(0);
    expect(killChainDetune(1)).toBe(0);
    expect(killChainDetune(3)).toBeGreaterThan(killChainDetune(2));
    expect(killChainDetune(10_000)).toBe(900);
  });
});
