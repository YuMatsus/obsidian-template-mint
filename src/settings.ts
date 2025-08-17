import { App, PluginSettingTab, Setting, TFolder, FuzzySuggestModal, TFile, Notice } from 'obsidian';
import type TemplateMint from './main';

export interface CommandConfig {
	id: string;
	name: string;
	templatePath: string;
	destinationFolder: string;
}

export interface TemplateMintSettings {
	templateFolder: string;
	commands: CommandConfig[];
}

export const DEFAULT_SETTINGS: TemplateMintSettings = {
	templateFolder: '',
	commands: []
};

export class TemplateMintSettingTab extends PluginSettingTab {
	plugin: TemplateMint;

	constructor(app: App, plugin: TemplateMint) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Template Mint Settings' });

		// Template folder setting
		new Setting(containerEl)
			.setName('Template Folder')
			.setDesc('Select the folder containing your templates')
			.addText(text => {
				text
					.setPlaceholder('Templates folder path')
					.setValue(this.plugin.settings.templateFolder)
					.setDisabled(true); // Make input read-only
				
				text.inputEl.style.width = '300px';
			})
			.addButton(button => {
				button
					.setButtonText('Select')
					.onClick(() => {
						new FolderSearchModal(this.app, async (folder: TFolder) => {
							// Validate that folder is within vault
							if (this.isPathWithinVault(folder.path)) {
								this.plugin.settings.templateFolder = folder.path;
								await this.plugin.saveSettings();
								this.display();
							} else {
								new Notice('Selected folder must be within the vault');
							}
						}).open();
					});
			});

		// Commands section
		containerEl.createEl('h3', { text: 'Template Commands' });
		
		const commandsContainer = containerEl.createDiv('template-commands-container');
		
		// Add command button
		new Setting(commandsContainer)
			.setName('Add New Command')
			.setDesc('Create a new command to generate notes from a template')
			.addButton(button => {
				button
					.setButtonText('Add Command')
					.setIcon('plus')
					.onClick(async () => {
						await this.addNewCommand();
					});
			});

		// Display existing commands
		this.plugin.settings.commands.forEach((command, index) => {
			this.createCommandSetting(commandsContainer, command, index);
		});
	}

	private createCommandSetting(container: HTMLElement, command: CommandConfig, index: number): void {
		const commandDiv = container.createDiv('template-command-item');
		commandDiv.style.marginBottom = '20px';
		commandDiv.style.padding = '10px';
		commandDiv.style.border = '1px solid var(--background-modifier-border)';
		commandDiv.style.borderRadius = '5px';

		// Command name
		new Setting(commandDiv)
			.setName('Command Name')
			.setDesc('Name for this command (will appear in command palette)')
			.addText(text => {
				text
					.setValue(command.name)
					.onChange(async (value) => {
						command.name = value;
						// Don't regenerate ID when name changes to preserve hotkeys
						if (!command.id) {
							command.id = this.generateCommandId(value);
						}
						await this.plugin.saveSettings();
					});
			});

		// Template selection
		new Setting(commandDiv)
			.setName('Template')
			.setDesc('Select the template file to use')
			.addText(text => {
				text
					.setValue(command.templatePath)
					.setDisabled(true); // Make input read-only
				text.inputEl.style.width = '200px';
			})
			.addButton(button => {
				button
					.setButtonText('Select')
					.onClick(() => {
						new TemplateSearchModal(this.app, this.plugin.settings.templateFolder, async (file: TFile) => {
							// Validate that template is within the template folder
							if (this.isTemplateInValidFolder(file.path)) {
								command.templatePath = file.path;
								await this.plugin.saveSettings();
								this.display();
							} else {
								new Notice('Template must be within the configured template folder');
							}
						}).open();
					});
			});

		// Destination folder
		new Setting(commandDiv)
			.setName('Destination Folder')
			.setDesc('Where to create new notes (leave empty for vault root)')
			.addText(text => {
				text
					.setValue(command.destinationFolder)
					.setDisabled(true); // Make input read-only
				text.inputEl.style.width = '200px';
			})
			.addButton(button => {
				button
					.setButtonText('Select')
					.onClick(() => {
						new FolderSearchModal(this.app, async (folder: TFolder) => {
							// Validate that folder is within vault
							if (this.isPathWithinVault(folder.path)) {
								command.destinationFolder = folder.path;
								await this.plugin.saveSettings();
								this.display();
							} else {
								new Notice('Selected folder must be within the vault');
							}
						}).open();
					});
			});

		// Delete button
		new Setting(commandDiv)
			.addButton(button => {
				button
					.setButtonText('Delete Command')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.commands.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					});
			});
	}

	private async addNewCommand(): Promise<void> {
		const newCommand: CommandConfig = {
			id: this.generateCommandId('New Template Command'),
			name: 'New Template Command',
			templatePath: '',
			destinationFolder: ''
		};
		
		this.plugin.settings.commands.push(newCommand);
		await this.plugin.saveSettings();
		this.display();
	}

	private generateCommandId(name: string): string {
		const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
		return `${this.plugin.manifest.id}:${slug}`;
	}

	private isPathWithinVault(path: string): boolean {
		// Allow empty path (vault root)
		if (path === '' || path === '/') {
			return true;
		}
		
		// Ensure path doesn't contain parent directory references
		if (path.includes('../') || path.includes('..\\')) {
			return false;
		}
		
		// Ensure path doesn't start with absolute path indicators outside of vault
		// Note: In Obsidian, paths are relative to vault root, so starting with / is not an issue
		if (path.startsWith('\\') || /^[a-zA-Z]:/.test(path)) {
			return false;
		}
		
		// Disallow hidden folders that might escape vault
		if (path.startsWith('.')) {
			return false;
		}
		
		return true;
	}

	private isTemplateInValidFolder(templatePath: string): boolean {
		// First check if path is within vault
		if (!this.isPathWithinVault(templatePath)) {
			return false;
		}
		
		// If no template folder is configured, any vault file is valid
		if (!this.plugin.settings.templateFolder) {
			return true;
		}
		
		// Check if template is within the configured template folder
		return templatePath.startsWith(this.plugin.settings.templateFolder);
	}
}

class TemplateSearchModal extends FuzzySuggestModal<TFile> {
	onChoose: (file: TFile) => void;
	templateFolder: string;

	constructor(app: App, templateFolder: string, onChoose: (file: TFile) => void) {
		super(app);
		this.templateFolder = templateFolder;
		this.onChoose = onChoose;
	}

	getItems(): TFile[] {
		const files = this.app.vault.getMarkdownFiles();
		
		if (!this.templateFolder) {
			// If no template folder is set, show all markdown files
			return files;
		}
		
		// Filter files in the template folder
		return files.filter(file => {
			return file.path.startsWith(this.templateFolder);
		});
	}

	getItemText(file: TFile): string {
		return file.path;
	}

	onChooseItem(file: TFile): void {
		this.onChoose(file);
	}
}

class FolderSearchModal extends FuzzySuggestModal<TFolder> {
	onChoose: (folder: TFolder) => void;

	constructor(app: App, onChoose: (folder: TFolder) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	getItems(): TFolder[] {
		const folders: TFolder[] = [];
		const rootFolder = this.app.vault.getRoot();
		
		const collectFolders = (folder: TFolder): void => {
			folders.push(folder);
			for (const child of folder.children) {
				if (child instanceof TFolder) {
					collectFolders(child);
				}
			}
		};
		
		collectFolders(rootFolder);
		return folders
			.filter(f => !f.path.startsWith('.obsidian'))
			.sort((a, b) => a.path.localeCompare(b.path));
	}

	getItemText(folder: TFolder): string {
		return folder.path || '/';
	}

	onChooseItem(folder: TFolder): void {
		this.onChoose(folder);
	}
}