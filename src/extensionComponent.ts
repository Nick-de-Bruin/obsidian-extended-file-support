import ExtendedFileSupport from "main";
import { Component, EventRef, TFile } from "obsidian";

export type AltTextParsed = {[key: string]: string}

export abstract class ExtensionComponent extends Component {
	protected plugin: ExtendedFileSupport;
	protected contentEl: HTMLElement;
	protected file: TFile;
	protected linkText: string | null;
	protected width?: number;
	protected height?: number;
	protected fileModify?: EventRef;

	public constructor(contentEl: HTMLElement, plugin: ExtendedFileSupport, file: TFile, linkText: string | null) {
		super();
		this.contentEl = contentEl;
		this.plugin = plugin;
		this.file = file;
		this.linkText = linkText;

		const parsed: AltTextParsed = {};

		for (const val of linkText?.split(';') ?? []) {
			const [key, value] = val.split('=');
			if (key && value !== undefined) {
				parsed[key] = value;
			} else {
				if (Number(val)) {
					this.width = Number(val);
				} else {
					const [width, height] = val.split("x");
					if (Number(width) && Number(height)) {
						this.width = Number(width);
						this.height = Number(height);
					}
				}
			}
		}

		if (Number(contentEl.getAttr("width"))) {
			this.width = Number(contentEl.getAttr("width"));
		}
		if (Number(contentEl.getAttr("height"))) {
			this.height = Number(contentEl.getAttr("height"));
		}

		this.parseLinkText(parsed);

		this.fileModify = this.plugin.app.vault.on("modify", (f) => {
			if (f === this.file) {
				this.contentEl.addClass("extended-file-loading");
                this.contentEl.empty();
                this.contentEl.createEl("i", { text: `Reloading ${this.file?.name}...`});

				this.loadFile();
			}
		});
	}

	abstract parseLinkText(settings: AltTextParsed): void;

	abstract loadFile(): void;

	onload() {
		this.contentEl.addClass("extended-file-loading");
		this.contentEl.createEl("i", { text: `Loading ${this.file?.name}...`});
	}

	onunload(): void {
		if (this.fileModify) {
			this.plugin.app.vault.offref(this.fileModify);
		}

		this.cleanup();
	}

	abstract cleanup(): void;
}
