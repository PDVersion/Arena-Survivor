import { archetypeIds, v01ContentIds } from "../core/archetypes/ids";
import type { ThemeManifest } from "../core/archetypes/contracts";

const HEX_COLOUR = /^#[0-9a-f]{6}$/i;

export class ThemeValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid theme manifest:\n- ${issues.join("\n- ")}`);
    this.name = "ThemeValidationError";
    this.issues = issues;
  }
}

export function validateTheme(theme: ThemeManifest): readonly string[] {
  const issues: string[] = [];

  if (!theme.id.trim()) issues.push("theme id is required");
  if (!theme.copy.gameTitle.trim()) issues.push("game title is required");
  if (!theme.copy.arenaName.trim()) issues.push("arena name is required");
  if (!theme.copy.bootStatus.trim()) issues.push("boot status copy is required");
  if (!theme.copy.bootFailure.trim()) issues.push("boot failure copy is required");

  for (const id of v01ContentIds) {
    const copy = theme.copy.content[id];
    if (!copy?.name.trim()) issues.push(`${id} name is required`);
    if (!copy?.description.trim()) issues.push(`${id} description is required`);
  }

  for (const [token, colour] of Object.entries(theme.tokens.palette)) {
    if (!HEX_COLOUR.test(colour)) issues.push(`palette.${token} must be a six-digit hex colour`);
  }

  const characterIds = new Set<string>();
  for (const character of theme.characters) {
    if (characterIds.has(character.id)) issues.push(`duplicate character id: ${character.id}`);
    characterIds.add(character.id);
    if (!Number.isFinite(character.radius) || character.radius <= 0) {
      issues.push(`${character.id} radius must be greater than zero`);
    }
    if (!(character.presentationToken in theme.tokens.palette)) {
      issues.push(`${character.id} references missing presentation token: ${character.presentationToken}`);
    }
  }

  if (!characterIds.has(archetypeIds.character.starter)) {
    issues.push(`missing required character: ${archetypeIds.character.starter}`);
  }

  return issues;
}

export function defineTheme<const T extends ThemeManifest>(theme: T): T {
  const issues = validateTheme(theme);
  if (issues.length > 0) throw new ThemeValidationError(issues);
  return theme;
}
