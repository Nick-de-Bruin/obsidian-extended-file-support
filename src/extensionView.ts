import ExtendedFileSupport from "main";
import { FileView, TFile, WorkspaceLeaf } from "obsidian";
import { ExtensionComponent } from "./extensionComponent";

export abstract class ExtensionView<T extends ExtensionComponent> extends FileView {
	private plugin: ExtendedFileSupport;
	private component: ExtensionComponent;

	public constructor(leaf: WorkspaceLeaf, plugin: ExtendedFileSupport) {
		super(leaf);
		this.plugin = plugin;
	}

	public getDisplayText(): string {
		return this.file ? this.file.basename : "Loading...";
	}

	// Enforce setting an icon for files
	abstract getIcon(): string;
	abstract getComponent(): new (...args: ConstructorParameters<typeof ExtensionComponent>) => T; 

	async onLoadFile(file: TFile) {
		const ComponentClass = this.getComponent();
		this.component = new ComponentClass(this.contentEl, this.plugin, file, null);
		this.component.loadFile();
	}

	async onClose() {
		this.component.onunload();
	}

	public async onOpen() {
		this.contentEl.addClass("image-container");
		this.contentEl.createEl("h1", { text: "Loading..." });
	}
}
