import { Plugin, Notice, TFile, FuzzySuggestModal, App, TFolder } from 'obsidian';
import { TemplateMintSettings, CommandConfig } from './settings';
import { TemplateProcessor } from './templateProcessor';
import { NoteCreator } from './noteCreator';
import { Commands } from './types';

declare module 'obsidian' {
	interface App {
		commands: Commands;
	}
}

export class CommandManager {
	private plugin: Plugin & { settings: TemplateMintSettings };
	private templateProcessor: TemplateProcessor;
	private noteCreator: NoteCreator;
	private registeredCommandIds: string[] = [];

	constructor(plugin: Plugin & { settings: TemplateMintSettings }, templateProcessor: TemplateProcessor) {
		this.plugin = plugin;
		this.templateProcessor = templateProcessor;
		this.noteCreator = new NoteCreator(plugin.app, templateProcessor);
	}

	registerCommands(): void {
		// Register main command to create note from template
		this.plugin.addCommand({
			id: 'create-note-from-template',
			name: 'Create note from template',
			callback: () => {
				this.showTemplatePickerModal();
			}
		});

		// Register custom commands from settings
		this.plugin.settings.commands.forEach(command => {
			if (command.name && command.templatePath) {
				this.registerCustomCommand(command);
			}
		});
	}

	unregisterCommands(): void {
		// Unregister custom commands (main command stays)
		this.registeredCommandIds.forEach(id => {
			if (this.plugin.app.commands?.removeCommand) {
				this.plugin.app.commands.removeCommand(id);
			} else {
				// Fallback for older versions
				const commands = this.plugin.app.commands?.commands;
				if (commands && commands[id]) {
					delete commands[id];
				}
			}
		});
		this.registeredCommandIds = [];
	}

	private registerCustomCommand(command: CommandConfig): void {
		const commandId = command.id || this.generateCommandId(command.name);
		
		// Check for duplicate command IDs
		if (this.registeredCommandIds.includes(commandId)) {
			new Notice(`Duplicate command ID skipped: ${command.name}`);
			return;
		}
		
		this.plugin.addCommand({
			id: commandId,
			name: command.name,
			callback: async () => {
				await this.executeCommand(command);
			}
		});

		this.registeredCommandIds.push(commandId);
	}

	private async executeCommand(command: CommandConfig): Promise<void> {
		try {
			const templateFile = this.plugin.app.vault.getAbstractFileByPath(command.templatePath);
			
			if (!templateFile || !(templateFile instanceof TFile)) {
				new Notice(`Template not found: ${command.templatePath}`);
				return;
			}

			await this.noteCreator.createNoteFromTemplate(
				templateFile,
				command.destinationFolder
			);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			new Notice(`Failed to create note: ${msg}`);
		}
	}

	private showTemplatePickerModal(): void {
		new TemplatePickerModal(
			this.plugin.app,
			this.plugin.settings.templateFolder,
			async (template: TFile) => {
				// Ask for destination folder
				new DestinationPickerModal(
					this.plugin.app,
					async (destinationFolder: string) => {
						await this.noteCreator.createNoteFromTemplate(template, destinationFolder);
					}
				).open();
			}
		).open();
	}

	private generateCommandId(name: string): string {
		const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
		return slug;
	}
}

class TemplatePickerModal extends FuzzySuggestModal<TFile> {
	private templateFolder: string;
	private onChoose: (file: TFile) => void;

	constructor(app: App, templateFolder: string, onChoose: (file: TFile) => void) {
		super(app);
		this.templateFolder = templateFolder;
		this.onChoose = onChoose;
		this.setPlaceholder('Select a template...');
	}

	getItems(): TFile[] {
		const files = this.app.vault.getMarkdownFiles();
		
		if (!this.templateFolder) {
			return files;
		}
		
		return files.filter(file => file.path.startsWith(this.templateFolder));
	}

	getItemText(file: TFile): string {
		return file.basename;
	}

	onChooseItem(file: TFile): void {
		this.onChoose(file);
	}
}

class DestinationPickerModal extends FuzzySuggestModal<string> {
	private onChoose: (folder: string) => void;
	private hasChosen = false;

	constructor(app: App, onChoose: (folder: string) => void) {
		super(app);
		this.onChoose = onChoose;
		this.setPlaceholder('Select destination folder (or press Esc for root)...');
	}

	getItems(): string[] {
		const folders: string[] = ['/'];
		const rootFolder = this.app.vault.getRoot();
		
		const collectFolders = (folder: TFolder, path = ''): void => {
			for (const child of folder.children) {
				if (child instanceof TFolder) { // It's a folder
					const childPath = path ? `${path}/${child.name}` : child.name;
					if (!childPath.startsWith('.obsidian')) {
						folders.push(childPath);
						collectFolders(child, childPath);
					}
				}
			}
		};
		
		collectFolders(rootFolder);
		return folders;
	}

	getItemText(folder: string): string {
		return folder === '/' ? 'Vault root' : folder;
	}

	onChooseItem(folder: string): void {
		this.hasChosen = true;
		this.onChoose(folder === '/' ? '' : folder);
	}

	onClose(): void {
		// If user dismissed without choosing (e.g., Esc), use root folder
		if (!this.hasChosen) {
			this.onChoose('');
		}
	}
}