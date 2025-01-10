export interface ExtendedFileSupportSettings {
	kra: boolean;
	psd: boolean;

	// 3D objects
	animate_3d_objects: boolean;
	obj: boolean;
	gltf: boolean;
	glb: boolean;
}

export const DEFAULT_SETTINGS: ExtendedFileSupportSettings = {
	kra: true,
	psd: true,

	animate_3d_objects: true,
	obj: true,
	gltf: true,
	glb: true,
}
