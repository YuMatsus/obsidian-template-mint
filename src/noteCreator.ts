import { App, Notice, TFile, TFolder, moment, normalizePath } from 'obsidian';
import { TemplateProcessor } from './templateProcessor';
import { Commands } from './types';

declare module 'obsidian' {
	interface App {
		commands: Commands;
	}
}

export class NoteCreator {
	private app: App;
	private templateProcessor: TemplateProcessor;

	constructor(app: App, templateProcessor: TemplateProcessor) {
		this.app = app;
		this.templateProcessor = templateProcessor;
	}

	async createNoteFromTemplate(templateFile: TFile, destinationFolder: string): Promise<void> {
		try {
			// Generate unique filename with 13-digit Unix timestamp (milliseconds)
			const timestamp = moment().format('x');
			const fileName = `${timestamp}.md`;
			
			// Construct file path
			const rawFilePath = this.getFilePath(fileName, destinationFolder);
			
			// Ensure destination folder exists
			await this.ensureDirectoryExists(destinationFolder);
			
			// Ensure the file path is unique (avoid rare same-millisecond collisions)
			const filePath = await this.getUniqueFilePath(rawFilePath);
			
			// Read template content
			const templateContent = await this.app.vault.read(templateFile);
			
			// Process template variables
			const processedContent = this.templateProcessor.processTemplateVariables(templateContent, fileName);
			
			// Create the new file
			const newFile = await this.app.vault.create(filePath, processedContent);
			
			// Open the new file
			await this.openFile(newFile);
			
		} catch (error) {
			console.error('[Template Mint] Failed to create note from template', error);
			const msg = error instanceof Error ? error.message : String(error);
			new Notice(`Failed to create note: ${msg}`);
		}
	}

	private getFilePath(fileName: string, destinationFolder: string): string {
		if (!destinationFolder) {
			return fileName;
		}
		
		const normalizedDir = normalizePath(destinationFolder).replace(/\/+$/, '');
		return normalizedDir ? `${normalizedDir}/${fileName}` : fileName;
	}

	private async getUniqueFilePath(filePath: string): Promise<string> {
		const adapter = this.app.vault.adapter;
		const dot = filePath.lastIndexOf('.');
		const base = dot > 0 ? filePath.slice(0, dot) : filePath;
		const ext = dot > 0 ? filePath.slice(dot) : '';
		let candidate = filePath;
		let i = 1;
		while (await adapter.exists(candidate)) {
			candidate = `${base} ${i}${ext}`;
			i += 1;
		}
		return candidate;
	}

	private async ensureDirectoryExists(folderPath: string): Promise<void> {
		if (!folderPath) {
			return;
		}

		const normalizedPath = normalizePath(folderPath).replace(/\/+$/, '');
		const existing = this.app.vault.getAbstractFileByPath(normalizedPath);

		if (existing) {
			if (!(existing instanceof TFolder)) {
				throw new Error(`Destination exists and is a file, not a folder: ${normalizedPath}`);
			}
			return;
		}
		try {
			await this.app.vault.createFolder(normalizedPath);
		} catch (error) {
			// Ignore concurrent creation races
			if (!(error instanceof Error) || !/already exists/i.test(error.message)) {
				throw error;
			}
		}
	}

	private async openFile(file: TFile): Promise<void> {
		// Get the most recent leaf
		const leaf = this.app.workspace.getLeaf(false);
		await leaf.openFile(file);
		
		// Focus on title editing (same as mono-task-note)
		setTimeout(() => {
			this.app.commands.executeCommandById('workspace:edit-file-title');
		}, 100);
	}
}