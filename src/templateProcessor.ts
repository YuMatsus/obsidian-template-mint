import { moment } from 'obsidian';

export class TemplateProcessor {
	processTemplateVariables(content: string, fileName: string): string {
		const now = moment();

		let processedContent = content;

		// Core Obsidian Templates plugin compatible variables only
		processedContent = processedContent.replace(/\{\{title\}\}/g, fileName.replace('.md', ''));
		processedContent = this.processDateTimeVariables(processedContent, now);

		return processedContent;
	}

	processFileNameVariables(template: string): string {
		const now = moment();
		return this.processDateTimeVariables(template, now);
	}

	private processDateTimeVariables(content: string, now: moment.Moment): string {
		let processedContent = content;

		processedContent = processedContent.replace(/\{\{date\}\}/g, now.format('YYYY-MM-DD'));
		processedContent = processedContent.replace(/\{\{time\}\}/g, now.format('HH:mm'));

		// Custom format replacements - directly pass format to moment
		processedContent = processedContent.replace(/\{\{date:([^}]+)\}\}/g, (match, format) => {
			try {
				return now.format(format);
			} catch {
				return match;
			}
		});

		processedContent = processedContent.replace(/\{\{time:([^}]+)\}\}/g, (match, format) => {
			try {
				return now.format(format);
			} catch {
				return match;
			}
		});

		return processedContent;
	}
}