import { BlobReader, BlobWriter, ZipReader } from "@zip.js/zip.js";
import { ExtensionComponent } from "src/extensionComponent";
import { ExtensionView } from "src/extensionView";

export const VIEW_TYPE_KRA = "extended-file-support-kra";

export class KRAComponent extends ExtensionComponent {
	private objectURL?: string;

	async loadFile(): Promise<void> {
		const MERGED_PATH = "mergedimage.png";

		const KRA_resource = this.plugin.app.vault.getResourcePath(this.file);
		const response = await fetch(KRA_resource);
		const KRA_blob = await response.blob();

		// Get the image from the zip
		const reader = new ZipReader(new BlobReader(KRA_blob));
		const entries = await reader.getEntries();
		const target_entry = entries.find(entry => entry.filename === MERGED_PATH);

		if (target_entry && target_entry.getData) {
			const image_file = await target_entry.getData(new BlobWriter());
			this.objectURL = URL.createObjectURL(image_file);
		}

		if (this.objectURL) {
			const image = new Image();
			image.src = this.objectURL;
			image.alt = this.file.name;

			this.contentEl.empty();
			this.contentEl.removeClass("extended-file-loading");
			this.contentEl.addClasses(["media-embed", "image-embed"]);
			this.contentEl.append(image);
		} else {
			this.contentEl.empty();
			this.contentEl.createEl("i", { text: `Could not load ${this.file.path}` });
		}
	}
	
	onunload(): void {
		if (this.objectURL) {
			URL.revokeObjectURL(this.objectURL);
			this.objectURL = undefined;
		}
	}
}

export class KRAView extends ExtensionView<KRAComponent> {
	getIcon(): string {
		return "image";
	}
	
	getComponent(): new (...args: ConstructorParameters<typeof ExtensionComponent>) => KRAComponent {
		return KRAComponent;
	}

	getViewType(): string {
		return VIEW_TYPE_KRA;
	}
}
