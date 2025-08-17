import { Plugin, Notice } from 'obsidian';
import { TemplateMintSettings, DEFAULT_SETTINGS, TemplateMintSettingTab } from './settings';

export default class TemplateMint extends Plugin {
	settings: TemplateMintSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'sample-command',
			name: 'Sample command',
			callback: () => {
				new Notice('Template Mint plugin is working!');
			}
		});

		this.addSettingTab(new TemplateMintSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}