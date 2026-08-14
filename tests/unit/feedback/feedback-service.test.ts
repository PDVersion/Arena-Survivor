import { describe, expect, it } from "vitest";
import { FeedbackLimiter } from "../../../src/game/systems/feedback/feedback-service";

describe("scalable feedback limits", () => {
  it("bounds visuals and reports dropped presentation without changing callers", () => {
    const limiter = new FeedbackLimiter(2, 50);
    expect(limiter.beginVisual()).toBe(true);
    expect(limiter.beginVisual()).toBe(true);
    expect(limiter.beginVisual()).toBe(false);
    limiter.endVisual();
    expect(limiter.beginVisual()).toBe(true);
    expect(limiter.snapshot()).toEqual({ activeVisuals: 2, visualHighWater: 2, dropped: 1 });
  });

  it("aggregates category audio independently", () => {
    const limiter = new FeedbackLimiter(2, 50);
    expect(limiter.allowAudio("critical", 100)).toBe(true);
    expect(limiter.allowAudio("critical", 120)).toBe(false);
    expect(limiter.allowAudio("explosion", 120)).toBe(true);
    expect(limiter.allowAudio("critical", 150)).toBe(true);
  });
});
