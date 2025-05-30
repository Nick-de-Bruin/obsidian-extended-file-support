import { loadPdfJs } from "obsidian";
import { AltTextParsed, ExtensionComponent } from "src/extensionComponent";
import { ExtensionView } from "src/extensionView";
import type { PDFDocumentProxy } from "pdfjs-dist"

export const VIEW_TYPE_AI = "extended-file-support-ai";

export class AIComponent extends ExtensionComponent {
	scale: number;

	parseLinkText(settings: AltTextParsed): void {
		if (settings["scale"] && Number(settings["scale"])) {
			this.scale = Number(settings["scale"]);
		} else {
			this.scale = this.plugin.settings.ai_render_scale;
		}
	}

	async loadFile(): Promise<void> {
		const pdfJS = await loadPdfJs();
		try {
			const doc: PDFDocumentProxy = await pdfJS.getDocument(this.plugin.app.vault.getResourcePath(this.file)).promise;

			const page = await doc.getPage(1);

			const SCALE = this.scale;
			const viewport = page.getViewport({scale: SCALE});

			const canvas = document.createElement('canvas');
			canvas.width = this.width ?? viewport.width;
			canvas.height = this.height ?? (this.width ? (viewport.height / viewport.width * this.width) : viewport.height);

			const context = canvas.getContext('2d');

			if (this.width) {
				const tempCanvas = document.createElement("canvas");
				tempCanvas.width = viewport.width;
				tempCanvas.height = viewport.height;
				const tempContext = tempCanvas.getContext("2d");	

				if (tempContext && context) {
					await page.render({ canvasContext: tempContext, viewport: viewport}).promise;

					context.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
				}
			} else {
				if (context) {
					await page.render({ canvasContext: context, viewport: viewport}).promise;
				}
	
				canvas.addClass("full-width");
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

	cleanup(): void {}
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
