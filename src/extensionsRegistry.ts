import { KRAComponent, KRAView, VIEW_TYPE_KRA } from "./extensions/kra"
import { ExtensionView } from "./extensionView"
import { ExtensionComponent } from "./extensionComponent"

export type Extension = {
	types: string[],
	view_type: string,
	view: new (...args: ConstructorParameters<typeof ExtensionView>) => ExtensionView<ExtensionComponent>,
	component: new (...args: ConstructorParameters<typeof ExtensionComponent>) => ExtensionComponent,
}

// Type should match settings field
export const EXTENSION_REGISTRY: Extension[] = [
	{ types: ["kra"], view_type: VIEW_TYPE_KRA, view: KRAView, component: KRAComponent }
]
