import { describe, expect, it } from "vitest";
import { archetypeIds, v01ContentIds } from "../../../src/game/core/archetypes/ids";
import type { ThemeManifest } from "../../../src/game/core/archetypes/contracts";
import { knightMagicTheme } from "../../../src/game/content/themes/knight-magic";
import { validateTheme } from "../../../src/game/content/define-theme";
import { alternateTheme } from "../../fixtures/alternate-theme";

describe("theme manifests", () => {
  it.each([
    ["knight-magic", knightMagicTheme],
    ["alternate", alternateTheme],
  ])("validates the %s manifest", (_name, theme) => {
    expect(validateTheme(theme)).toEqual([]);
    expect(Object.keys(theme.copy.content)).toEqual(expect.arrayContaining(v01ContentIds));
  });

  it("changes presentation without changing the stable starter role", () => {
    const current = knightMagicTheme.copy.content[archetypeIds.character.starter];
    const alternate = alternateTheme.copy.content[archetypeIds.character.starter];

    expect(current.name).not.toBe(alternate.name);
    expect(knightMagicTheme.tokens.palette.player).not.toBe(alternateTheme.tokens.palette.player);
    expect(knightMagicTheme.characters[0]?.id).toBe(alternateTheme.characters[0]?.id);
    expect(knightMagicTheme.characters[0]?.radius).toBe(alternateTheme.characters[0]?.radius);
  });

  it("reports missing copy, duplicate IDs, bad values, and broken tokens", () => {
    const invalid = {
      ...alternateTheme,
      copy: {
        ...alternateTheme.copy,
        content: {
          ...alternateTheme.copy.content,
          [archetypeIds.enemy.swarmBasic]: { name: "", description: "" },
        },
      },
      characters: [
        ...alternateTheme.characters,
        {
          id: archetypeIds.character.starter,
          radius: 0,
          presentationToken: "missing",
        },
      ],
    } as unknown as ThemeManifest;

    expect(validateTheme(invalid)).toEqual(
      expect.arrayContaining([
        `${archetypeIds.enemy.swarmBasic} name is required`,
        `${archetypeIds.enemy.swarmBasic} description is required`,
        `duplicate character id: ${archetypeIds.character.starter}`,
        `${archetypeIds.character.starter} radius must be greater than zero`,
        `${archetypeIds.character.starter} references missing presentation token: missing`,
      ]),
    );
  });
});
