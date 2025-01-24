export interface ExtendedFileSupportSettings {
	kra: boolean;
	psd: boolean;
	ai: boolean;

	// 3D objects
	animate_3d_objects: boolean;
	obj: boolean;
	gltf: boolean;
	glb: boolean;
	stl: boolean;
}

export const DEFAULT_SETTINGS: ExtendedFileSupportSettings = {
	kra: true,
	psd: true,
	ai: true,

	animate_3d_objects: true,
	obj: true,
	gltf: true,
	glb: true,
	stl: true,
}
