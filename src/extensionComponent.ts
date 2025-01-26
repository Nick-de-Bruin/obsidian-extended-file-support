import ExtendedFileSupport from "main";
import { Component, TFile } from "obsidian";

export type AltTextParsed = {[key: string]: string}

export abstract class ExtensionComponent extends Component {
	protected plugin: ExtendedFileSupport;
	protected contentEl: HTMLElement;
	protected file: TFile;
	protected linkText: string | null;
	protected width?: number;
	protected height?: number;

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
	}

	abstract parseLinkText(settings: AltTextParsed): void;

	abstract loadFile(): void;

	onload() {
		this.contentEl.addClass("extended-file-loading");
		this.contentEl.createEl("i", { text: `Loading ${this.file?.name}...`});
	}

	abstract onunload(): void;
}
