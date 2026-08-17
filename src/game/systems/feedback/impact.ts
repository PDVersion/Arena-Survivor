/**
 * Impact feedback: hit-stop budgeting and damage-number aggregation.
 *
 * Both are downstream of committed events. Aggregation never changes what
 * damage was dealt, only how many numbers are drawn. Hit-stop does change the
 * mapping from wall time to simulation time — that is the point — but it never
 * changes how much simulation a run performs: a five-minute run still runs five
 * minutes of simulated time, it just takes slightly longer in real seconds.
 */

export interface HitStopState {
  /** Simulation-independent wall clock at which the current freeze ends. */
  readonly activeUntilMs: number;
  /** Freeze granted inside the rolling budget window. */
  readonly spentMs: number;
  readonly windowStartMs: number;
  readonly granted: number;
  readonly denied: number;
}

export interface HitStopBudget {
  /** Longest single freeze. */
  readonly maxDurationMs: number;
  /** Total freeze allowed per window, so a dense chain cannot stall the game. */
  readonly budgetMs: number;
  readonly windowMs: number;
  /** Skip entirely when frames are already slow; emphasis must not become lag. */
  readonly maxFrameMs: number;
}

export const DEFAULT_HIT_STOP_BUDGET: HitStopBudget = Object.freeze({
  maxDurationMs: 90,
  budgetMs: 180,
  windowMs: 1_000,
  maxFrameMs: 34,
});

export function createHitStopState(): HitStopState {
  return Object.freeze({
    activeUntilMs: 0,
    spentMs: 0,
    windowStartMs: 0,
    granted: 0,
    denied: 0,
  });
}

export function isHitStopActive(state: HitStopState, nowMs: number): boolean {
  return nowMs < state.activeUntilMs;
}

/**
 * Request a freeze. Denied when the budget is exhausted or frames are slow,
 * which is why emphasis never turns into a stall under load.
 */
export function requestHitStop(
  state: HitStopState,
  nowMs: number,
  requestedMs: number,
  frameMs: number,
  budget: HitStopBudget = DEFAULT_HIT_STOP_BUDGET,
): HitStopState {
  const rolled = nowMs - state.windowStartMs >= budget.windowMs
    ? { windowStartMs: nowMs, spentMs: 0 }
    : { windowStartMs: state.windowStartMs, spentMs: state.spentMs };

  const remaining = budget.budgetMs - rolled.spentMs;
  const duration = Math.min(Math.max(0, requestedMs), budget.maxDurationMs, remaining);

  if (duration <= 0 || frameMs > budget.maxFrameMs || isHitStopActive(state, nowMs)) {
    return Object.freeze({ ...state, ...rolled, denied: state.denied + 1 });
  }

  return Object.freeze({
    ...rolled,
    activeUntilMs: nowMs + duration,
    spentMs: rolled.spentMs + duration,
    granted: state.granted + 1,
    denied: state.denied,
  });
}

export interface PendingDamage {
  readonly targetId: string;
  amount: number;
  /** Highest crit tier seen in the window, so the biggest hit sets the styling. */
  tier: number;
  x: number;
  y: number;
  readonly dueAtMs: number;
}

export interface DamageAggregator {
  readonly pending: Map<string, PendingDamage>;
  /** Every unit of damage that has passed through, for reconciliation. */
  accumulated: number;
  flushed: number;
}

export function createDamageAggregator(): DamageAggregator {
  return { pending: new Map(), accumulated: 0, flushed: 0 };
}

/**
 * Record damage for a target, to be drawn as one number.
 *
 * With scaling explosions the per-hit numbers become unreadable, and each one
 * is a text object competing for frame time exactly when frames are scarce.
 */
export function accumulateDamage(
  aggregator: DamageAggregator,
  entry: Readonly<{ targetId: string; amount: number; tier: number; x: number; y: number }>,
  nowMs: number,
  windowMs: number,
): void {
  aggregator.accumulated += entry.amount;
  const existing = aggregator.pending.get(entry.targetId);
  if (existing) {
    existing.amount += entry.amount;
    existing.tier = Math.max(existing.tier, entry.tier);
    existing.x = entry.x;
    existing.y = entry.y;
    return;
  }
  aggregator.pending.set(entry.targetId, {
    targetId: entry.targetId,
    amount: entry.amount,
    tier: entry.tier,
    x: entry.x,
    y: entry.y,
    dueAtMs: nowMs + windowMs,
  });
}

/** Entries whose window has closed, removed from the aggregator. */
export function drainDueDamage(
  aggregator: DamageAggregator,
  nowMs: number,
): readonly PendingDamage[] {
  const due: PendingDamage[] = [];
  for (const entry of aggregator.pending.values()) {
    if (nowMs >= entry.dueAtMs) due.push(entry);
  }
  for (const entry of due) {
    aggregator.pending.delete(entry.targetId);
    aggregator.flushed += entry.amount;
  }
  return due;
}

/** Flush one target immediately, used when it dies mid-window. */
export function drainTarget(
  aggregator: DamageAggregator,
  targetId: string,
): PendingDamage | undefined {
  const entry = aggregator.pending.get(targetId);
  if (!entry) return undefined;
  aggregator.pending.delete(targetId);
  aggregator.flushed += entry.amount;
  return entry;
}

/** Flush everything, used at a terminal state so nothing is silently dropped. */
export function drainAll(aggregator: DamageAggregator): readonly PendingDamage[] {
  const all = [...aggregator.pending.values()];
  aggregator.pending.clear();
  for (const entry of all) aggregator.flushed += entry.amount;
  return all;
}

/**
 * Pitch offset in cents for a kill chain.
 *
 * The pierce system already ramps per projectile; this gives a run's overall
 * kill rate the same audible shape, capped so a long chain does not shriek.
 */
export function killChainDetune(chainLength: number, centsPerKill = 35, maxCents = 900): number {
  return Math.min(maxCents, Math.max(0, Math.floor(chainLength) - 1) * centsPerKill);
}
