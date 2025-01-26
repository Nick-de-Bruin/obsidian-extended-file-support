import { ThreeJSComponent, ThreeJSView } from "src/abstractions/threejsComponent";
import { ExtensionComponent } from "src/extensionComponent";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export const VIEW_TYPE_GLB = "extended-file-support-GLB";

export class GLBComponent extends ThreeJSComponent {
	loadModel(resource: string): void {
		const loader = new GLTFLoader();
		loader.load(resource, (gltf) => {
			const model = gltf.scene;
			
			this.scaleGroup(model);
			this.centerGroup(model);

			this.scene?.add(model);
		})
	}
}

export class GLBView extends ThreeJSView<GLBComponent> {
	getComponent(): new (...args: ConstructorParameters<typeof ExtensionComponent>) => GLBComponent {
		return GLBComponent;
	}

	getViewType(): string {
		return VIEW_TYPE_GLB;
	}
} 
