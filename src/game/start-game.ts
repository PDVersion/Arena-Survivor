import Phaser from "phaser";
import { createGameConfig } from "./config";
import { BOOT_FAILURE_EVENT } from "./scenes/boot-scene";

/** Load inside the entry's recovery boundary; expose no runtime diagnostic hook. */
export function startGame(parent: string, onFailure: (error: unknown) => void): Phaser.Game {
  return new Phaser.Game({
    ...createGameConfig(parent),
    callbacks: {
      preBoot(game) {
        game.events.once(BOOT_FAILURE_EVENT, (error: unknown) => {
          // Asset failure occurs on the running loader loop. Destroy on its next
          // step rather than re-entering the scene manager during loader completion.
          game.destroy(true);
          onFailure(error);
        });
      },
    },
  });
}
