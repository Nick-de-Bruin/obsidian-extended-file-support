import { ThreeJSComponent, ThreeJSView } from "src/abstractions/threejsComponent";
import { ExtensionComponent } from "src/extensionComponent";
import { FBXLoader } from "three/examples/jsm/Addons.js";

export const VIEW_TYPE_FBX = "extended-file-support-FBX";

export class FBXComponent extends ThreeJSComponent {
	loadModel(resource: string): void {
		const loader = new FBXLoader();
		loader.load(resource, (fbx) => {
			this.scaleGroup(fbx);
			this.centerGroup(fbx);

			this.scene?.add(fbx);
		})
	}
}

export class FBXView extends ThreeJSView<FBXComponent> {
	getComponent(): new (...args: ConstructorParameters<typeof ExtensionComponent>) => FBXComponent {
		return FBXComponent;
	}

	getViewType(): string {
		return VIEW_TYPE_FBX;
	}
}
