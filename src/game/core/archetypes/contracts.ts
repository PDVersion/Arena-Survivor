import type { CharacterId, ContentId } from "./ids";

export interface ContentCopy {
  readonly name: string;
  readonly description: string;
}

export interface ThemeCopy {
  readonly gameTitle: string;
  readonly arenaName: string;
  readonly bootStatus: string;
  readonly bootFailure: string;
  readonly content: Readonly<Record<ContentId, ContentCopy>>;
}

export interface ThemePalette {
  readonly background: string;
  readonly floor: string;
  readonly grid: string;
  readonly accent: string;
  readonly text: string;
  readonly player: string;
}

export interface ThemeTokens {
  readonly palette: ThemePalette;
  readonly playerShape: "circle" | "diamond" | "square";
}

export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly radius: number;
  readonly presentationToken: keyof Pick<ThemePalette, "player">;
}

export interface ThemeManifest {
  readonly id: string;
  readonly schemaVersion: 1;
  readonly copy: ThemeCopy;
  readonly tokens: ThemeTokens;
  readonly characters: readonly CharacterDefinition[];
}
