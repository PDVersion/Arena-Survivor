// Dev/test-only fixture. Never imported by a production entry. Actual RunScene
// update, input, physics, rewards and lifecycle run unchanged; test controls are
// held in a Playwright JSHandle, not added to the production/read-only facade.
export async function createCampaign() {
  if (import.meta.env.MODE !== "test") throw new Error("P5 campaign requires test mode");
  const phaserPath = "/tests/fixtures/phaser-runtime.ts";
  const runPath = "/src/game/scenes/run-scene.ts";
  const bootPath = "/src/game/scenes/boot-scene.ts";
  const configPath = "/src/game/config.ts";
  const telemetryPath = "/src/test-support/install-telemetry.ts";
  await import(/* @vite-ignore */ telemetryPath);
  const [{ default: Phaser }, { RunScene }, { BootScene }, { createGameConfig }] = await Promise.all([
    import(/* @vite-ignore */ phaserPath), import(/* @vite-ignore */ runPath), import(/* @vite-ignore */ bootPath), import(/* @vite-ignore */ configPath),
  ]);
  let scene: InstanceType<typeof RunScene>;
  let nextKind = "soak";
  const baselines: object[] = [], stops: object[] = [];
  const audio: { stateAtClose: string; settled: boolean; stateAfter?: string; voicesAtClose: number }[] = [];
  const contexts = new Set<AudioContext>();
  const closing: Promise<unknown>[] = [];
  let ready: () => void = () => {};
  const first = new Promise<void>((resolve) => { ready = resolve; });
  const capture = () => {
    const state = scene.runState;
    return {
      wall: performance.now(), focusPaused: scene.focusPaused, hidden: document.hidden, focused: document.hasFocus(), generation: scene.runGeneration, status: state?.status,
      mode: state?.mode, elapsed: state?.elapsedMs, duration: state?.durationMs,
      rate: scene.runTheme.tuning.pace.gameplayRate,
      health: state?.player.health, level: state?.progression.level,
      kills: state?.statistics.kills ?? state?.kills, xp: scene.xpEarnedTotal,
      ambientXp: scene.ambientXpCollected, shrineXp: scene.shrineXpCollected,
      enemies: scene.enemies.size, pickups: scene.pickups.size, projectiles: scene.projectiles.size,
      bodies: scene.physics.world.bodies.size, pendingBodies: scene.physics.world.pendingDestroy.size,
      display: scene.children.length, timers: scene.time._active.length + scene.time._pendingInsertion.length,
      tweens: scene.tweens.getTweens().length, postUpdate: scene.events.listenerCount("postupdate"),
      blurListeners: scene.game.events.listenerCount("blur"), focusListeners: scene.game.events.listenerCount("focus"),
      queues: { gameplay: scene.eventQueue.snapshot(), load: scene.loadEventQueue.snapshot() },
      claims: scene.claimedPickupIds.size,
      causalIds: scene.eventQueue.knownEventIds.size, lethalIds: scene.eventQueue.lethalClaims.size,
      spawns: scene.spawnStatistics.snapshot(), audio: scene.audioFeedback.snapshot(),
      quality: window.__ARENA_TEST__?.getSnapshot().ui?.settings.presentationQuality,
      damage: state?.statistics.totalDamage, damageBreakdown: state?.statistics.damageBreakdown,
    };
  };
  class CampaignRun extends RunScene {
    create() {
      super.create();
      // Retain the real current scene only in the test control handle.
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      scene = this;
      if (nextKind === "death") this.runState = { ...this.runState, player: { ...this.runState.player, health: 1 } };
      const world = this.physics.world;
      baselines.push(capture());
      this.events.once("shutdown", () => {
        stops.push({ display: this.children.length, bodies: world.bodies.size,
          postUpdate: this.events.listenerCount("postupdate"), pickups: this.pickups.size,
          enemies: this.enemies.size, feedback: this.feedbackObjects.size, hazards: this.hazards.size,
          gameplayBacklog: this.eventQueue.snapshot().backlog, loadBacklog: this.loadEventQueue.snapshot().backlog,
          claimed: this.claimedPickupIds.size,
          blurHandler: this.game.events.listeners("blur").includes(this.handleGameBlur),
          focusHandler: this.game.events.listeners("focus").includes(this.handleGameFocus) });
      });
      ready();
    }
  }
  const game = new Phaser.Game({ ...createGameConfig("campaign"), scene: [BootScene, CampaignRun] });
  await Promise.race([first, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Campaign did not boot")), 8000))]);
  return {
    capture, baselines, stops, audio,
    chooseUpgrade() { if (scene.runState.status === "level_up") scene.chooseUpgrade(scene.currentChoices[0]); },
    chooseMode(mode: "endless" | "clearing") { scene.resolveOvertimeChoice(mode); },
    pause() { scene.togglePause(); },
    quality() { scene.applySetting("presentationQuality"); },
    mute() { scene.applySetting("muted"); },
    watchAudio() {
      const context = scene.audioFeedback.context as AudioContext | undefined;
      if (!context || contexts.has(context)) return;
      contexts.add(context);
      const close = context.close.bind(context);
      context.close = () => {
        const record = { stateAtClose: context.state, settled: false, stateAfter: undefined as string | undefined, voicesAtClose: scene.audioFeedback.snapshot().voices };
        audio.push(record);
        const promise = close();
        closing.push(promise.then(() => { record.settled = true; record.stateAfter = context.state; }));
        return promise;
      };
    },
    tone() { scene.audioFeedback.setMuted(false); return scene.audioFeedback.play("critical"); },
    rewardForOverlay() {
      if (scene.runState.status !== "playing") throw new Error("Fixture reward requires active playing state");
      scene.dropExperience(scene.player.x, scene.player.y, scene.runState.progression.xpToNextLevel, "ambient");
      const pickup = [...scene.pickups].find((p) => p.x === scene.player.x && p.y === scene.player.y);
      if (pickup) scene.collectPickup(pickup);
    },
    seedPending() {
      scene.enqueueSpawnRequest(scene.enemyDefinition.id, "ambient", 1, undefined, undefined, "roster", { x: scene.player.x + 100, y: scene.player.y + 100 });
      return scene.eventQueue.snapshot().backlog;
    },
    // Short reconstruction fixtures retain the authored gameplay rate. Health=1
    // seeds a contact-death precondition; damage still comes from real overlap.
    nextRun(kind: "complete" | "death" | "clearing" | "soak") {
      const query = kind === "death" ? "noHazards=1&noWeapon=1&loadHarness=1&closeLoad=1&loadRole=enemy.fast_fragile" :
        kind === "soak" ? "noContact=1&noHazards=1" :
        "noContact=1&noHazards=1&noXp=1&noAmbient=1&runDurationMs=1000";
      history.replaceState(null, "", `?${query}`);
      nextKind = kind;
      scene.restartRun();
    },
    shorten() { scene.runState = { ...scene.runState, durationMs: 1500 }; },
    enableContactDeath() { history.replaceState(null, "", "?noHazards=1&noWeapon=1"); scene.runState = { ...scene.runState, player: { ...scene.runState.player, health: 1 } }; },
    finishEmpty() { scene.resolveOvertimeChoice("clearing"); },
    audioSettled() { return audio.every((record) => record.settled && record.stateAfter === "closed"); },
    async destroy() {
      game.scene.stop("run");
      game.destroy(true); game.runDestroy();
      await Promise.all(closing);
      return { baselines, stops, audio };
    },
  };
}
