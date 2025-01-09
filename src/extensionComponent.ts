import ExtendedFileSupport from "main";
import { Component, TFile } from "obsidian";

export abstract class ExtensionComponent extends Component {
	protected plugin: ExtendedFileSupport;
	protected contentEl: HTMLElement;
	protected file: TFile;
	protected linkText?: string;

	public constructor(contentEl: HTMLElement, plugin: ExtendedFileSupport, file: TFile, linkText?: string) {
		super();
		this.contentEl = contentEl;
		this.plugin = plugin;
		this.file = file;
		this.linkText = linkText;
	}

	abstract loadFile(): void;

	onload() {
		this.contentEl.addClass("extended-file-loading");
		this.contentEl.createEl("i", { text: `Loading ${this.file?.name}...`});
	}

	abstract onunload(): void;
}
