import { ExtensionComponent } from "src/extensionComponent";
import { ExtensionView } from "src/extensionView";
import * as THREE from 'three';

export const VIEW_TYPE_OBJ = "extended-file-support-obj";

export abstract class ThreeJSComponent extends ExtensionComponent {
	renderer?: THREE.WebGLRenderer;
	scene?: THREE.Scene;
	resizeObserver?: ResizeObserver;

	abstract loadModel(resource: string): void;

	async loadFile(): Promise<void> {
		this.scene = new THREE.Scene();

		// Subtract 1 to remove the scrollbar...
		let width = this.contentEl.innerWidth - 1;
		width = width > 0 ? width : 1;

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(width, width);
		this.renderer.setClearColor(0x000000, 0); 

		const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
		camera.position.set(1, 0.5, 1);
		camera.lookAt(0, 0, 0);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		this.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(0, 5, 0); // Above the object
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

		const resource = this.plugin.app.vault.getResourcePath(this.file);

		this.loadModel(resource);

		this.contentEl.empty();
		this.contentEl.removeClass("extended-file-loading");
		this.contentEl.append(this.renderer.domElement);

		let angle = 0;
		const radius = 1;

		this.renderer.setAnimationLoop(() => {
			if (this.scene && this.renderer) {
				if (this.plugin.settings.animate_3d_objects) {
					angle += 0.01;
					camera.position.x = radius * Math.cos(angle);
					camera.position.z = radius * Math.sin(angle);
					
					camera.lookAt(0, 0, 0);
				}

				this.renderer.render(this.scene, camera);
			}
		});

		this.resizeObserver = new ResizeObserver(() => {
			let width = this.contentEl.innerWidth - 1;

			if (this.linkText && !isNaN(Number(this.linkText))) {
				width = Number(this.linkText);
			}
	
			this.renderer?.setSize(width, width);
			camera.updateProjectionMatrix();
		});

		this.resizeObserver.observe(this.contentEl);
	}

	onunload(): void {
		this.renderer?.setAnimationLoop(null);
		this.renderer?.dispose();

		if (this.scene)	while (this.scene.children.length > 0) {
			this.scene.remove(this.scene.children[0]);
		}

		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = undefined;
		}
	}

	protected scaleGroup(group: THREE.Group) {
		const size_box = new THREE.Box3().setFromObject(group);
		const size = size_box.getSize(new THREE.Vector3());
		
		const scale_ratio = 1 / Math.max(size.x, size.y, size.z);
		group.scale.set(scale_ratio, scale_ratio, scale_ratio);
	}

	protected centerGroup(group: THREE.Group) {
		const center_box = new THREE.Box3().setFromObject(group);
		const center = center_box.getCenter(new THREE.Vector3());

		group.position.sub(center);
	}
}

export abstract class ThreeJSView<T extends ThreeJSComponent> extends ExtensionView<T> {
	getIcon(): string {
		return "box";
	}
} 
