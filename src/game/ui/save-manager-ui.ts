import type { ThemeManifest } from "../core/archetypes/contracts";
import { decodeProfile, encodeProfile, MAX_SAVE_CODE_BYTES } from "../systems/persistence/save-codec";
import {
  confirmProfileReplacement, getProfile, getProfileStatus, prepareProfileBackupRestore,
  prepareProfileReplacement, prepareProfileReset, profileCompatibilityWarnings,
} from "../systems/persistence/profile-service";

type Prepared = ReturnType<typeof prepareProfileReplacement>;

/** Title-only native controls. Imported text is always data, never markup. */
export class SaveManagerUi {
  private dialog?: HTMLDialogElement;
  private code?: HTMLTextAreaElement;
  private file?: HTMLInputElement;
  private preview?: HTMLElement;
  private status?: HTMLElement;
  private error?: HTMLElement;
  private confirm?: HTMLButtonElement;
  private cancel?: HTMLButtonElement;
  private prepared?: Prepared;
  private storageMessage?: HTMLElement;
  private previousFocus?: HTMLElement;
  private readonly exportUrls = new Set<string>();
  private selectCodeAfterAction = false;
  private busy = false;
  private generation = 0;

  constructor(private readonly theme: ThemeManifest, private readonly onClose: () => void) {}

  show(): void {
    if (this.dialog) return;
    const copy = this.theme.copy.saveManager;
    this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    const dialog = document.createElement("dialog");
    dialog.className = "save-manager";
    dialog.setAttribute("aria-label", copy.title);
    dialog.style.setProperty("--save-background", this.theme.tokens.palette.background);
    dialog.style.setProperty("--save-text", this.theme.tokens.palette.text);
    dialog.style.setProperty("--save-accent", this.theme.tokens.palette.accent);
    dialog.style.setProperty("--save-critical", this.theme.tokens.palette.critical);
    const heading = document.createElement("h2"); heading.textContent = copy.title;
    const description = document.createElement("p"); description.textContent = copy.description;
    const storage = document.createElement("p"); this.storageMessage = storage; storage.className = "save-manager-storage"; storage.textContent = getProfileStatus().message;
    const exportRow = document.createElement("div"); exportRow.className = "save-manager-actions";
    exportRow.append(this.button(copy.exportSave, () => this.exportSave()), this.button(copy.copyCode, () => this.copyCode()));
    const codeLabel = document.createElement("label"); codeLabel.textContent = copy.codeLabel;
    this.code = document.createElement("textarea"); this.code.rows = 5; this.code.spellcheck = false;
    this.code.setAttribute("aria-label", copy.codeLabel);
    this.code.addEventListener("input", () => { this.clearPrepared(); this.clearMessages(); });
    codeLabel.append(this.code);
    const fileLabel = document.createElement("label"); fileLabel.textContent = copy.fileLabel;
    this.file = document.createElement("input"); this.file.type = "file"; this.file.accept = ".txt,text/plain";
    this.file.setAttribute("aria-label", copy.fileLabel);
    this.file.addEventListener("change", () => { void this.action(async () => {
      const file = this.file?.files?.[0]; if (!file) return;
      this.clearPrepared();
      if (file.size > MAX_SAVE_CODE_BYTES) throw new Error(copy.fileTooLarge);
      const text = await file.text();
      if (!this.dialog) return;
      this.code!.value = text;
      await this.previewImport(text);
    }); });
    fileLabel.append(this.file);
    const previewButton = this.button(copy.previewImport, () => this.previewImport(this.code?.value ?? ""));
    this.preview = document.createElement("section"); this.preview.className = "save-manager-preview"; this.preview.hidden = true;
    this.preview.setAttribute("aria-label", copy.previewTitle);
    const replacementActions = document.createElement("div"); replacementActions.className = "save-manager-actions";
    this.confirm = this.button(copy.confirmImport, () => this.confirmReplacement()); this.confirm.hidden = true;
    this.cancel = this.button(copy.cancel, () => { this.clearPrepared(); this.clearMessages(); this.status!.textContent = copy.cancelled; }); this.cancel.hidden = true;
    replacementActions.append(this.confirm, this.cancel);
    const maintenance = document.createElement("div"); maintenance.className = "save-manager-actions save-manager-maintenance";
    maintenance.append(this.button(copy.restoreBackup, () => {
      const prepared = prepareProfileBackupRestore();
      this.present(prepared, profileCompatibilityWarnings(prepared.profile, this.theme));
    }), this.button(copy.resetProgress, () => this.present(prepareProfileReset(this.theme))));
    this.status = document.createElement("p"); this.status.setAttribute("role", "status"); this.status.setAttribute("aria-live", "polite");
    this.error = document.createElement("p"); this.error.className = "save-manager-error"; this.error.setAttribute("role", "alert");
    const close = document.createElement("button"); close.type = "button"; close.textContent = copy.close;
    close.className = "save-manager-close"; close.addEventListener("click", () => this.close());
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); this.close(); });
    // DOM editing must never enter the canvas keyboard/mouse game controls.
    dialog.addEventListener("keydown", (event) => event.stopPropagation());
    dialog.append(heading, description, storage, exportRow, codeLabel, fileLabel, previewButton, this.preview, replacementActions, maintenance, this.status, this.error, close);
    this.dialog = dialog;
    document.body.append(dialog);
    dialog.showModal();
    close.focus();
  }

  private button(label: string, action: () => unknown): HTMLButtonElement {
    const button = document.createElement("button"); button.type = "button"; button.textContent = label;
    button.addEventListener("click", () => { void this.action(action); });
    return button;
  }

  private async action(action: () => unknown): Promise<void> {
    if (this.busy || !this.dialog) return;
    this.busy = true; this.clearMessages();
    const generation = this.generation;
    this.setBusy(true);
    try { await action(); }
    catch (error) {
      if (this.dialog && generation === this.generation) {
        this.clearPrepared();
        this.error!.textContent = `${this.theme.copy.saveManager.error} ${error instanceof Error ? error.message : String(error)}`;
      }
    } finally {
      if (this.dialog && generation === this.generation) {
        this.busy = false; this.setBusy(false);
        if (this.selectCodeAfterAction) { this.selectCodeAfterAction = false; this.code?.focus(); this.code?.select(); }
      }
    }
  }

  private setBusy(busy: boolean): void {
    this.dialog?.querySelectorAll<HTMLButtonElement>("button:not(.save-manager-close)").forEach((button) => { button.disabled = busy; });
    if (this.code) this.code.disabled = busy;
    if (this.file) this.file.disabled = busy;
  }

  private clearMessages(): void { if (this.status) this.status.textContent = ""; if (this.error) this.error.textContent = ""; }
  private clearPrepared(): void {
    this.prepared = undefined;
    if (this.preview) { this.preview.hidden = true; this.preview.replaceChildren(); }
    if (this.confirm) this.confirm.hidden = true;
    if (this.cancel) this.cancel.hidden = true;
  }

  private async currentCode(): Promise<string> {
    const code = await encodeProfile(getProfile());
    if (this.code && this.dialog) { this.clearPrepared(); this.code.value = code; }
    return code;
  }
  private async exportSave(): Promise<void> {
    const code = await this.currentCode(); if (!this.dialog) return;
    for (const previous of this.exportUrls) URL.revokeObjectURL(previous);
    this.exportUrls.clear();
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain;charset=utf-8" }));
    this.exportUrls.add(url);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "arena-survivor-save.txt";
    document.body.append(anchor); anchor.click(); anchor.remove();
    this.status!.textContent = this.theme.copy.saveManager.exported;
  }
  private async copyCode(): Promise<void> {
    const code = await this.currentCode(); if (!this.dialog) return;
    // When clipboard access is denied the full code remains available to copy manually.
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(code);
      if (this.dialog) this.status!.textContent = this.theme.copy.saveManager.copied;
    } catch {
      if (this.dialog) { this.status!.textContent = this.theme.copy.saveManager.manualCopy; this.selectCodeAfterAction = true; }
    }
  }
  private async previewImport(text: string): Promise<void> {
    this.clearPrepared();
    const decoded = await decodeProfile(text); if (!this.dialog) return;
    this.present(prepareProfileReplacement(decoded.profile,
      [...decoded.warnings, ...profileCompatibilityWarnings(decoded.profile, this.theme)], "import"));
  }
  private present(prepared: Prepared, extraWarnings: readonly string[] = []): void {
    this.prepared = prepared;
    const copy = this.theme.copy.saveManager; const p = prepared.profile;
    const heading = document.createElement("h3");
    heading.textContent = prepared.action === "restore" ? copy.restoreAction : prepared.action === "reset" ? copy.resetAction : copy.importAction;
    const summary = document.createElement("dl");
    for (const [label, value] of [[copy.theme, p.activeThemeId], [copy.runs, p.statistics.runsPlayed], [copy.kills, p.statistics.totalKills], [copy.bestLevel, p.statistics.bestLevel],
      [copy.weapons, p.unlockedWeaponIds.length], [copy.upgrades, p.unlockedUpgradeIds.length], [copy.difficulty, this.theme.copy.difficulty.levels[p.settings.difficulty].name]]) {
      const name = document.createElement("dt"); name.textContent = String(label);
      const content = document.createElement("dd"); content.textContent = String(value); summary.append(name, content);
    }
    const hint = document.createElement("p"); hint.textContent = copy.confirmationHint;
    const warnings = document.createElement("ul");
    for (const warning of [...prepared.warnings, ...extraWarnings]) { const item = document.createElement("li"); item.textContent = warning; warnings.append(item); }
    this.preview!.replaceChildren(heading, summary, warnings, hint); this.preview!.hidden = false;
    this.confirm!.textContent = prepared.action === "restore" ? copy.confirmRestore : prepared.action === "reset" ? copy.confirmReset : copy.confirmImport;
    this.confirm!.hidden = false; this.cancel!.hidden = false;
  }
  private confirmReplacement(): void {
    const prepared = this.prepared; if (!prepared) return;
    const result = confirmProfileReplacement(prepared);
    if (!result.ok) throw new Error(result.error);
    this.clearPrepared(); this.status!.textContent = this.theme.copy.saveManager.saved;
    if (this.storageMessage) this.storageMessage.textContent = getProfileStatus().message;
  }
  private close(): void { if (!this.dialog) return; this.destroy(); this.onClose(); }
  destroy(): void {
    this.generation++; this.busy = false; this.prepared = undefined; this.selectCodeAfterAction = false;
    for (const url of this.exportUrls) URL.revokeObjectURL(url);
    this.exportUrls.clear();
    this.dialog?.close(); this.dialog?.remove(); this.dialog = undefined;
    this.code = undefined; this.file = undefined; this.preview = undefined;
    this.status = undefined; this.error = undefined; this.confirm = undefined; this.cancel = undefined; this.storageMessage = undefined;
    if (this.previousFocus?.isConnected) this.previousFocus.focus();
    this.previousFocus = undefined;
  }
}
