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
						return new extension.component(context.containerEl, this, file, context.linktext);
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
				if (this.settings[extension.type]) {
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
				return new e.component(context.containerEl, this, file, context.linktext);
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
			.setName(".kra")
			.setDesc("Files generated by Krita")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.kra)
				.onChange(async (value) => {
					this.plugin.settings.kra = value;
					await this.plugin.saveSettings();
					this.plugin.toggleExtension("kra", value);
				}));
	}
}
