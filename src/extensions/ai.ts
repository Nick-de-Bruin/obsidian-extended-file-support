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

			const page = await doc.getPage(1);

			console.log(this.plugin.settings.ai_render_scale);

			const SCALE = this.plugin.settings.ai_render_scale;
			const viewport = page.getViewport({scale: SCALE});

			const canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			canvas.addClass("full-width");

			const context = canvas.getContext('2d');
			
			if (context) {
				await page.render({ canvasContext: context, viewport: viewport}).promise;
			}

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
