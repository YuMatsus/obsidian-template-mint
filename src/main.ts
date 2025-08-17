import { Plugin } from 'obsidian';
import { TemplateMintSettings, DEFAULT_SETTINGS, TemplateMintSettingTab } from './settings';
import { CommandManager } from './commands';
import { TemplateProcessor } from './templateProcessor';

export default class TemplateMint extends Plugin {
	settings: TemplateMintSettings;
	commandManager: CommandManager;
	templateProcessor: TemplateProcessor;

	async onload() {
		await this.loadSettings();

		// Initialize managers
		this.templateProcessor = new TemplateProcessor();
		this.commandManager = new CommandManager(this, this.templateProcessor);

		// Register commands
		this.commandManager.registerCommands();

		// Add settings tab
		this.addSettingTab(new TemplateMintSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Re-register commands when settings change
		this.commandManager.unregisterCommands();
		this.commandManager.registerCommands();
	}
}