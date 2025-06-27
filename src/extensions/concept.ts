import { BlobReader, BlobWriter, ZipReader } from "@zip.js/zip.js";
import { AltTextParsed, ExtensionComponent } from "src/extensionComponent";
import { ExtensionView } from "src/extensionView";

export const VIEW_TYPE_CONCEPT = "extended-file-support-concept";

export class CONCEPTComponent extends ExtensionComponent {
	private objectURL?: string;

	parseLinkText(_: AltTextParsed): void {	}

	async loadFile(): Promise<void> {
		const THUMB_PATH = "Thumb.jpg";

		const CONCEPT_resource = this.plugin.app.vault.getResourcePath(this.file);
		const response = await fetch(CONCEPT_resource);
		const CONCEPT_blob = await response.blob();

		// Get the thumbnail from the zip
		const reader = new ZipReader(new BlobReader(CONCEPT_blob));
		const entries = await reader.getEntries();
		const target_entry = entries.find(entry => entry.filename === THUMB_PATH);

		if (target_entry && target_entry.getData) {
			const image_file = await target_entry.getData(new BlobWriter());
			this.objectURL = URL.createObjectURL(image_file);
		}

		if (this.objectURL) {
			const image = new Image();
			image.src = this.objectURL;
			image.alt = this.file.name;

			if (this.width) {
				image.width = this.width;
			}
			if (this.height) {
				image.height = this.height;
			}

			this.contentEl.empty();
			this.contentEl.removeClass("extended-file-loading");
			this.contentEl.addClasses(["media-embed", "image-embed"]);
			this.contentEl.append(image);
		} else {
			this.contentEl.empty();
			this.contentEl.createEl("i", { text: `Could not load ${this.file.path}` });
		}
	}
	
	cleanup(): void {
		if (this.objectURL) {
			URL.revokeObjectURL(this.objectURL);
			this.objectURL = undefined;
		}
	}
}

export class CONCEPTView extends ExtensionView<CONCEPTComponent> {
	getIcon(): string {
		return "image";
	}
	
	getComponent(): new (...args: ConstructorParameters<typeof ExtensionComponent>) => CONCEPTComponent {
		return CONCEPTComponent;
	}

	getViewType(): string {
		return VIEW_TYPE_CONCEPT;
	}
}