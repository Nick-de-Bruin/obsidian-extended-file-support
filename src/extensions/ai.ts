import { loadPdfJs } from "obsidian";
import { ExtensionComponent } from "src/extensionComponent";
import { ExtensionView } from "src/extensionView";
import type { PDFDocumentProxy } from "pdfjs-dist"

export const VIEW_TYPE_AI = "extended-file-support-ai";

export class AIComponent extends ExtensionComponent {

	async loadFile(): Promise<void> {
		const pdfJS = await loadPdfJs();
		try {
			const doc: PDFDocumentProxy = await pdfJS.getDocument(this.plugin.app.vault.getResourcePath(this.file)).promise;

			console.log(doc);

			const page = await doc.getPage(1);

			const viewport = page.getViewport({scale: 1});

			const canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			const context = canvas.getContext('2d');
			
			if (context) {
				page.render({ canvasContext: context, viewport: viewport})
			}

			canvas.addClass("full-width");

			this.contentEl.empty();
			this.contentEl.removeClass("extended-file-loading");
			this.contentEl.addClasses(["media-embed", "image-embed"]);
			this.contentEl.append(canvas);
		} catch (e) {
			this.contentEl.empty();
			this.contentEl.removeClass("extended-file-loading");
			console.error("Failed to load .ai file:",  e);
			this.contentEl.createEl("i", { text: `Could not load ${this.file.path}, make sure it has PDF compat enabled.` });
		}
	}

	onunload(): void {}
}

export class AIView extends ExtensionView<AIComponent> {
	getIcon(): string {
		return "image";
	}
	
	getComponent(): new (...args: ConstructorParameters<typeof ExtensionComponent>) => AIComponent {
		return AIComponent;
	}

	getViewType(): string {
		return VIEW_TYPE_AI;
	}
}
