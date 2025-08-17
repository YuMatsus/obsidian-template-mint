# Template Mint

Create notes directly from templates in Obsidian with a streamlined workflow.

## Why Template Mint?

While Obsidian's core Templates plugin allows you to insert templates into existing notes, **Template Mint** enables you to create new notes directly from templates in a single action. This plugin is designed to complement the core Templates plugin, using the same template format and variables for seamless compatibility.

## Features (Planned)

**Note: This plugin is currently in initial development. The features below are planned but not yet implemented.**

- **Direct note creation from templates** - Skip the manual steps of creating a note and then inserting a template
- **Compatible with core Templates plugin** - Use the same template files and folder
- **Template selection modal** - Quick visual selection of available templates
- **Automatic variable replacement** - Support for date/time variables just like the core plugin
- **Configurable folders** - Set your preferred template and output directories

## Usage

**Note: The functionality described below is not yet implemented. Currently, the plugin only provides a sample command for testing.**

1. Set up your template folder in the plugin settings (can be the same folder used by core Templates plugin)
2. Create markdown templates in your template folder
3. Use the command "Create note from template" from the command palette
4. Select a template from the modal
5. A new note will be created instantly from the selected template

## Template Variables

**Note: Template variable support is planned but not yet implemented.**

Supports standard template variables for compatibility with Obsidian's core Templates plugin:

- `{{date}}` - Current date in YYYY-MM-DD format
- `{{time}}` - Current time in HH:MM:SS format
- `{{datetime}}` - Full ISO datetime

## Settings

**Note: Currently only a sample setting is available. The settings below will be implemented in future versions.**

- **Template folder**: The folder containing your template files (can share with core Templates plugin)
- **New note folder**: The folder where new notes will be created

## Installation

1. Download the latest release
2. Extract the files to your vault's `.obsidian/plugins/template-mint` folder
3. Enable the plugin in Obsidian's settings

## Compatibility

This plugin is designed to work alongside Obsidian's core Templates plugin. You can use the same template files for both plugins, ensuring a consistent workflow across your vault.

## License

MIT License - see LICENSE file for details