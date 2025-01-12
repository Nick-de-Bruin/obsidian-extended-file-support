import ExtendedFileSupport from "main";
import { TFile } from "obsidian";
import { ThreeJSComponent, ThreeJSView } from "src/abstractions/threejsComponent";
import { OBJLoader } from 'three/examples/jsm/Addons.js';

export const VIEW_TYPE_OBJ = "extended-file-support-obj";

export class OBJComponent extends ThreeJSComponent {
	loadModel(resource: string): void {
		const loader = new OBJLoader();

		loader.load(resource, obj => {
			this.scaleGroup(obj);
			this.centerGroup(obj);

			this.scene?.add(obj); 
		}, undefined, e => {
			console.log("Error while loading", e);
		});
	}
}

export class OBJView extends ThreeJSView<OBJComponent> {
	getComponent(): new (contentEl: HTMLElement, plugin: ExtendedFileSupport, file: TFile, linkText?: string | undefined) => OBJComponent {
		return OBJComponent;
	}

	getViewType(): string {
		return VIEW_TYPE_OBJ;
	}
} 
