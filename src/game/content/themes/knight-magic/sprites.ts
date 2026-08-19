import type { ThemeSprites } from "../../../core/archetypes/contracts";

/**
 * Sprite sheets for this pack.
 *
 * Its own file rather than an entry in `tokens.ts` on purpose: `tokens.ts` is
 * edited whenever content needs a colour, and a sprite roster is edited on
 * every single sheet. Separating them gives the sprite work sole ownership of
 * one file and removes what would otherwise be the busiest merge conflict in
 * V0.4 — see `build/BUILD_PLAN_V0.4.md` §2.
 *
 * Empty is a complete state: every actor falls back to its primitive.
 */
export const sprites = {} as const satisfies ThemeSprites;
