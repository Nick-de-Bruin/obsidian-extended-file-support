import { AltTextParsed, ExtensionComponent } from "src/extensionComponent";
import { ExtensionView } from "src/extensionView";
import Psd from "@webtoon/psd";

export const VIEW_TYPE_PSD = "extended-file-support-psd";

export class PSDComponent extends ExtensionComponent {
	parseLinkText(_: AltTextParsed): void { }

	async loadFile(): Promise<void> {
		const resource = this.plugin.app.vault.getResourcePath(this.file);
		const res = await fetch(resource);
		const arrayBuffer = await res.arrayBuffer();
		
		const psd = Psd.parse(arrayBuffer);

		const canvasEl = document.createElement("canvas");
		const context = canvasEl.getContext("2d");
		const compositeBuffer = await psd.composite();
		
		const imageData = new ImageData(compositeBuffer, psd.width, psd.height);

		canvasEl.width = this.width ?? psd.width;
		canvasEl.height = this.height ?? (this.width ? (psd.height / psd.width * this.width) : psd.height);

		if (this.width) {
			const tempCanvas = document.createElement("canvas");
			tempCanvas.width = imageData.width;
			tempCanvas.height = imageData.height;
			const tempContext = tempCanvas.getContext("2d");

			if (tempContext) {
				tempContext.putImageData(imageData, 0, 0);

				context?.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvasEl.width, canvasEl.height);
			}
		} else {
			canvasEl.addClass("full-width");
			context?.putImageData(imageData, 0, 0);
		}
		

		this.contentEl.empty();
		this.contentEl.removeClass("extended-file-loading");
		this.contentEl.addClasses(["media-embed", "image-embed"]);
		this.contentEl.append(canvasEl);
	}
	
	onunload(): void {}
}

export class PSDView extends ExtensionView<PSDComponent> {
	getIcon(): string {
		return "image";
	}
	
	getComponent(): new (...args: ConstructorParameters<typeof ExtensionComponent>) => PSDComponent {
		return PSDComponent;
	}

	getViewType(): string {
		return VIEW_TYPE_PSD;
	}
}
