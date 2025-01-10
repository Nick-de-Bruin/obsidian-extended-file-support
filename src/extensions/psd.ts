import { ExtensionComponent } from "src/extensionComponent";
import { ExtensionView } from "src/extensionView";
import Psd from "@webtoon/psd";

export const VIEW_TYPE_PSD = "extended-file-support-psd";

export class PSDComponent extends ExtensionComponent {
	async loadFile(): Promise<void> {
		const resource = this.plugin.app.vault.getResourcePath(this.file);
		const res = await fetch(resource);
		const arrayBuffer = await res.arrayBuffer();
		
		const psd = Psd.parse(arrayBuffer);

		const canvasEl = document.createElement("canvas");
		const context = canvasEl.getContext("2d");
		const compositeBuffer = await psd.composite();
		
		const imageData = new ImageData(compositeBuffer, psd.width, psd.height);

		canvasEl.width = psd.width;
		canvasEl.height = psd.height;

		canvasEl.addClass("full-width");
		
		context?.putImageData(imageData, 0, 0);
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
