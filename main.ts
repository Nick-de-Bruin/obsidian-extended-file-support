import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { EXTENSION_REGISTRY } from 'src/extensionsRegistry';
import { DEFAULT_SETTINGS, ExtendedFileSupportSettings } from 'src/settings';
import { EmbedRegistry } from 'obsidian-typings';

export default class ExtendedFileSupport extends Plugin {
	settings: ExtendedFileSupportSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ExtendedFileSupportSettingTab(this.app, this));

		const embedRegistry = this.app.embedRegistry as EmbedRegistry; 

		for (const extension of EXTENSION_REGISTRY) {
			this.registerView(extension.view_type, (leaf) => new extension.view(leaf, this));

			for (const extension_type of extension.types) {
				// @ts-ignore
				if (this.settings[extension_type]) {
					this.registerExtensions([extension_type], extension.view_type);

					embedRegistry.registerExtension(extension_type, (context, file, _) => {
						return new extension.component(context.containerEl, this, file, context.containerEl.getAttr('alt'));
					});
				}
			}
		}
	}

	onunload() {
		const embedRegistry = this.app.embedRegistry as EmbedRegistry; 

		for (const extension of EXTENSION_REGISTRY) {
			for (const extension_type of extension.types) {
				// @ts-ignore
				if (this.settings[extension_type]) {
					this.app.viewRegistry.unregisterExtensions([extension_type]);
					embedRegistry.unregisterExtension(extension_type);
				}
			}
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	public toggleExtension(extension: string, enable: boolean): void {
		const e = EXTENSION_REGISTRY.find(e => e.types.contains(extension));
		const embedRegistry = this.app.embedRegistry as EmbedRegistry; 

		if (!e) return;

		if (enable) {
			this.registerExtensions(e.types, e.view_type);

			embedRegistry.registerExtension(extension, (context, file, _) => {
				return new e.component(context.containerEl, this, file, context.containerEl.getAttr('alt'));
			});
		} else {
			this.app.viewRegistry.unregisterExtensions([extension]);
			embedRegistry.unregisterExtension(extension);
		}
	}
}

class ExtendedFileSupportSettingTab extends PluginSettingTab {
	plugin: ExtendedFileSupport;

	constructor(app: App, plugin: ExtendedFileSupport) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Image formats")
			.setHeading();

		new Setting(containerEl)
			.setName(".psd")
			.setDesc("Photoshop documents. Generated by Adobe Photoshop or similar programs.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.psd)
				.onChange(async (value) => {
					this.plugin.settings.psd = value;
					await this.plugin.saveSettings();
					this.plugin.toggleExtension("psd", value);
				}));

		new Setting(containerEl)
			.setName(".clip")
			.setDesc("Files generated by Clip Studio Paint.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.clip)
				.onChange(async (value) => {
					this.plugin.settings.clip = value;
					await this.plugin.saveSettings();
					this.plugin.toggleExtension("clip", value);
				}));

		new Setting(containerEl)
			.setName(".kra")
			.setDesc("Files generated by Krita.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.kra)
				.onChange(async (value) => {
					this.plugin.settings.kra = value;
					await this.plugin.saveSettings();
					this.plugin.toggleExtension("kra", value);
				}));

		new Setting(containerEl)
			.setName(".ai")
			.setDesc("Adobe Illustrator files. Only works with PDF compat enabled.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.ai)
				.onChange(async (value) => {
					this.plugin.settings.ai = value;
					await this.plugin.saveSettings();
					this.plugin.toggleExtension("ai", value);
				}));

		new Setting(containerEl)
				.setName(".ai render scale")
				.setDesc("Render scale for Illustrator files. Higher means higher resolution, but longer load times. Default: 1.5.")
				.addDropdown(dropdown => dropdown
					.addOptions({"0.5": "0.5", "1.0": "1.0", "1.5": "1.5", "2.0": "2.0", "2.5": "2.5", "3.0": "3.0"})
					.setValue(this.plugin.settings.ai_render_scale.toFixed(1))
					.onChange(async (value) => {
						this.plugin.settings.ai_render_scale = Number(value);
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName("3D formats")
			.setHeading();

		new Setting(containerEl)
			.setName("Animate")
			.setDesc("Animate 3d objects (Rotate the camera around them).")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.animate_3d_objects)
				.onChange(async (value) => {
					this.plugin.settings.animate_3d_objects = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName(".obj")
			.setDesc("Object file type for 3d models.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.obj)
				.onChange(async (value) => {
					this.plugin.settings.obj = value;
					await this.plugin.saveSettings();
					this.plugin.toggleExtension("obj", value);
				}));

		new Setting(containerEl)
			.setName(".gltf")
			.setDesc("glTF format. Only embedded glTF files are supported.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.gltf)
				.onChange(async (value) => {
					this.plugin.settings.gltf = value;
					await this.plugin.saveSettings();
					this.plugin.toggleExtension("gltf", value);
				}));
		
		new Setting(containerEl)
			.setName(".glb")
			.setDesc("Binary glTF format. Only self-contained glb files are supported.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.glb)
				.onChange(async (value) => {
					this.plugin.settings.glb = value;
					await this.plugin.saveSettings();
					this.plugin.toggleExtension("glb", value);
				}));
		
		new Setting(containerEl)
			.setName(".stl")
			.setDesc("Stereolithography CAD files (Often used for 3d printing).")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.stl)
				.onChange(async (value) => {
					this.plugin.settings.stl = value;
					await this.plugin.saveSettings();
					this.plugin.toggleExtension("stl", value);
				}));
	}
}
