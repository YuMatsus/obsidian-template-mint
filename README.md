# Template Mint

Create notes directly from templates in Obsidian with a streamlined workflow.

<img width="789" height="716" alt="image" src="https://github.com/user-attachments/assets/3d61a607-0c37-4503-b0ef-b249c12fdde1" />


## Why Template Mint?

While Obsidian's core Templates plugin allows you to insert templates into existing notes, **Template Mint** enables you to create new notes directly from templates in a single action. This plugin is designed to complement the core Templates plugin, using the same template format and variables for seamless compatibility.

## Features

- 🔄 **Core Templates Compatible**: Works seamlessly with Obsidian's core Templates plugin - use the same template files and folder
- 📁 **Direct Note Creation**: Skip the manual steps of creating a note and then inserting a template
- 🎯 **Custom Commands**: Create unlimited custom commands, each linked to a specific template
- 📍 **Flexible Destination**: Specify different output folders for each command
- 🔤 **Familiar Variables**: Supports standard template variables compatible with core Templates plugin
- ⚡ **Quick Access**: Access templates through command palette or custom hotkeys

## Installation

1. Download the latest release from the releases page
2. Extract the files to your vault's `.obsidian/plugins/template-mint/` folder
3. Enable the plugin in Obsidian's settings

## Usage

### Initial Setup

1. Open Settings → Template Mint
2. Select your template folder using the folder picker (can be the same folder used by core Templates plugin)
3. Create custom commands for your frequently used templates

### Creating Custom Commands

1. Click "Add Command" in the settings
2. Configure:
   - **Command Name**: The name that appears in the command palette
   - **Template**: Select the template file to use
   - **Destination Folder**: Choose where new notes will be created
   - **Default Note Name**: Set a default filename for new notes (supports template variables)

### Creating Notes

**Method 1: Using Custom Commands**
- Open command palette (Ctrl/Cmd + P)
- Search for your custom command name
- The note will be created instantly in the specified location

**Method 2: Using Template Picker**
- Open command palette (Ctrl/Cmd + P)
- Run "Create note from template"
- Select a template from the picker
- Choose the destination folder

### Template Variables

Template Mint supports all standard Obsidian template variables for full compatibility with the core Templates plugin:

- `{{title}}` - Note filename without extension
- `{{date}}` - Current date (YYYY-MM-DD)
- `{{time}}` - Current time (HH:mm)
- `{{date:FORMAT}}` - Custom date format using moment.js syntax
- `{{time:FORMAT}}` - Custom time format using moment.js syntax

Example: `{{date:YYYY-MM-DD}}` → "2024-01-15"

## File Naming

By default, notes are created with a 13-digit Unix timestamp (milliseconds) as the filename, ensuring uniqueness and chronological ordering.

When a **Default Note Name** is configured for a command, the note will use that name instead. Template variables are supported:

- `{{date}}` → `2024-01-15`
- `{{time}}` → `14:30`
- `{{date:YYYYMMDD}}` → `20240115`
- `{{date:YYYY-[W]ww}}` → `2024-W03`

Example: Setting `{{date}} Meeting Notes` creates a note named `2024-01-15 Meeting Notes.md`

## Development

### Setup
```bash
npm install
```

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Type Checking
```bash
npx tsc --noEmit --skipLibCheck
```

### Linting
```bash
npx eslint . --ext .ts
```

## Compatibility

This plugin is designed to work alongside Obsidian's core Templates plugin. You can use the same template files for both plugins, ensuring a consistent workflow across your vault. Template Mint extends the functionality by allowing direct note creation from templates, while maintaining full compatibility with your existing template setup.

## License

MIT
