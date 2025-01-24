import ExtendedFileSupport from "main";
import { TFile } from "obsidian";
import { ThreeJSComponent, ThreeJSView } from "src/abstractions/threejsComponent";
import { STLLoader } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';

export const VIEW_TYPE_STL = "extended-file-support-STL";

export class STLComponent extends ThreeJSComponent {
	loadModel(resource: string): void {
		const loader = new STLLoader();
		loader.load(resource, (stl) => {
			const material = new THREE.MeshPhongMaterial({ color: 0x808080, specular: 0x111111, shininess: 100 });

			const model = new THREE.Mesh(stl, material);
			model.receiveShadow = true;
			model.castShadow = true;
			
			const group = new THREE.Group();
			group.add(model);

			group.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI / 2)
			
			this.scaleGroup(group);
			this.centerGroup(group);

			this.scene?.add(group);
		})
	}
}

export class STLView extends ThreeJSView<STLComponent> {
	getComponent(): new (contentEl: HTMLElement, plugin: ExtendedFileSupport, file: TFile, linkText?: string | undefined) => STLComponent {
		return STLComponent;
	}

	getViewType(): string {
		return VIEW_TYPE_STL;
	}
} 
