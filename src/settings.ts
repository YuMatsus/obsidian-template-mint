import { App, PluginSettingTab, Setting } from 'obsidian';
import TemplateMint from './main';

export interface TemplateMintSettings {
	sampleSetting: string;
}

export const DEFAULT_SETTINGS: TemplateMintSettings = {
	sampleSetting: 'default value'
}

export class TemplateMintSettingTab extends PluginSettingTab {
	plugin: TemplateMint;

	constructor(app: App, plugin: TemplateMint) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Template Mint Settings'});

		new Setting(containerEl)
			.setName('Sample setting')
			.setDesc('This is a sample setting')
			.addText(text => text
				.setPlaceholder('Enter value')
				.setValue(this.plugin.settings.sampleSetting)
				.onChange(async (value) => {
					this.plugin.settings.sampleSetting = value;
					await this.plugin.saveSettings();
				}));
	}
}