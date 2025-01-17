import { KRAComponent, KRAView, VIEW_TYPE_KRA } from "./extensions/kra"
import { ExtensionView } from "./extensionView"
import { ExtensionComponent } from "./extensionComponent"
import { OBJComponent, OBJView, VIEW_TYPE_OBJ } from "./extensions/obj"
import { GLBComponent, GLBView, VIEW_TYPE_GLB } from "./extensions/glb"
import { PSDComponent, PSDView, VIEW_TYPE_PSD } from "./extensions/psd"

export type Extension = {
	types: string[],
	view_type: string,
	view: new (...args: ConstructorParameters<typeof ExtensionView>) => ExtensionView<ExtensionComponent>,
	component: new (...args: ConstructorParameters<typeof ExtensionComponent>) => ExtensionComponent,
}

// Type should match settings field
export const EXTENSION_REGISTRY: Extension[] = [
	{ types: ["kra"], view_type: VIEW_TYPE_KRA, view: KRAView, component: KRAComponent },
	{ types: ["obj"], view_type: VIEW_TYPE_OBJ, view: OBJView, component: OBJComponent },
	{ types: ["glb", "gltf"], view_type: VIEW_TYPE_GLB, view: GLBView, component: GLBComponent },
	{ types: ["psd"], view_type: VIEW_TYPE_PSD, view: PSDView, component: PSDComponent }
]
