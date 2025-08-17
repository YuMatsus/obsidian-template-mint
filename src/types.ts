// Custom type definitions for Obsidian Commands API
export interface Command {
	id: string;
	name: string;
	callback: () => void;
}

export interface Commands {
	commands: { [commandId: string]: Command };
	executeCommandById(commandId: string): boolean;
	listCommands(): Command[];
	removeCommand?: (commandId: string) => void;
}