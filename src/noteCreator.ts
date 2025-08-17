import { App, Notice, TFile, moment } from 'obsidian';
import { TemplateProcessor } from './templateProcessor';

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
			const filePath = this.getFilePath(fileName, destinationFolder);
			
			// Ensure destination folder exists
			await this.ensureDirectoryExists(destinationFolder);
			
			// Read template content
			const templateContent = await this.app.vault.read(templateFile);
			
			// Process template variables
			const processedContent = this.templateProcessor.processTemplateVariables(templateContent, fileName);
			
			// Create the new file
			const newFile = await this.app.vault.create(filePath, processedContent);
			
			new Notice(`Note created: ${newFile.basename}`);
			
			// Open the new file
			await this.openFile(newFile);
			
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			new Notice(`Failed to create note: ${msg}`);
		}
	}

	private getFilePath(fileName: string, destinationFolder: string): string {
		if (!destinationFolder) {
			return fileName;
		}
		
		const normalizedDir = destinationFolder.replace(/\/+$/, '');
		return normalizedDir ? `${normalizedDir}/${fileName}` : fileName;
	}

	private async ensureDirectoryExists(folderPath: string): Promise<void> {
		if (!folderPath) {
			return;
		}

		const normalizedPath = folderPath.replace(/\/+$/, '');
		const folder = this.app.vault.getAbstractFileByPath(normalizedPath);
		
		if (!folder) {
			try {
				await this.app.vault.createFolder(normalizedPath);
			} catch (error) {
				// Ignore if folder already exists
				if (error instanceof Error && !error.message.includes('already exists')) {
					throw error;
				}
			}
		}
	}

	private async openFile(file: TFile): Promise<void> {
		// Get the most recent leaf
		const leaf = this.app.workspace.getLeaf(false);
		await leaf.openFile(file);
		
		// Focus on the editor
		const view = leaf.view;
		if (view && 'editor' in view) {
			// @ts-ignore
			const editor = view.editor;
			if (editor) {
				editor.focus();
				// Move cursor to the end of the file
				const lastLine = editor.lastLine();
				const lastLineLength = editor.getLine(lastLine).length;
				editor.setCursor({ line: lastLine, ch: lastLineLength });
			}
		}
	}
}