import { moment } from 'obsidian';

export class TemplateProcessor {
	processTemplateVariables(content: string, fileName: string): string {
		const now = moment();
		
		let processedContent = content;
		
		// Core Obsidian Templates plugin compatible variables
		processedContent = processedContent.replace(/\{\{title\}\}/g, fileName.replace('.md', ''));
		processedContent = processedContent.replace(/\{\{date\}\}/g, now.format('YYYY-MM-DD'));
		processedContent = processedContent.replace(/\{\{time\}\}/g, now.format('HH:mm'));
		
		// Week and month variables
		processedContent = processedContent.replace(/\{\{week\}\}/g, now.format('ww'));
		processedContent = processedContent.replace(/\{\{weekyear\}\}/g, now.format('gggg-[W]ww'));
		processedContent = processedContent.replace(/\{\{month\}\}/g, now.format('MM'));
		processedContent = processedContent.replace(/\{\{monthname\}\}/g, now.format('MMMM'));
		processedContent = processedContent.replace(/\{\{year\}\}/g, now.format('YYYY'));
		
		// Day variables
		processedContent = processedContent.replace(/\{\{day\}\}/g, now.format('DD'));
		processedContent = processedContent.replace(/\{\{dayname\}\}/g, now.format('dddd'));
		
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
		
		// Relative date replacements
		processedContent = processedContent.replace(/\{\{yesterday\}\}/g, now.clone().subtract(1, 'day').format('YYYY-MM-DD'));
		processedContent = processedContent.replace(/\{\{tomorrow\}\}/g, now.clone().add(1, 'day').format('YYYY-MM-DD'));
		processedContent = processedContent.replace(/\{\{lastweek\}\}/g, now.clone().subtract(1, 'week').format('YYYY-MM-DD'));
		processedContent = processedContent.replace(/\{\{nextweek\}\}/g, now.clone().add(1, 'week').format('YYYY-MM-DD'));
		processedContent = processedContent.replace(/\{\{lastmonth\}\}/g, now.clone().subtract(1, 'month').format('YYYY-MM-DD'));
		processedContent = processedContent.replace(/\{\{nextmonth\}\}/g, now.clone().add(1, 'month').format('YYYY-MM-DD'));
		
		return processedContent;
	}
}