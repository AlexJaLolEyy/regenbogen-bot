import type { Interaction } from 'discord.js';
import { client } from '../lib/client';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../lib/utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively load commands from directories
async function loadCommands(dirPath: string) {
    const items = readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
            // Recursively load commands from subdirectories
            await loadCommands(fullPath);
        } else if (item.isFile() && item.name.endsWith('.ts')) {
            try {
                const command = await import(fullPath);
                if (command?.data && command?.execute) {
                    client.commands.set(command.data.name, command);
                    Logger.success(`Loaded command: ${command.data.name}`);
                } else {
                    Logger.warning(`Command file "${item.name}" missing data or execute function`);
                }
            } catch (err) {
                Logger.error(`Failed to load command "${item.name}":`, err);
            }
        }
    }
}

// Load commands
const commandsPath = path.join(__dirname, '..', 'commands');
Logger.info('Loading commands...');
await loadCommands(commandsPath);
Logger.info(`Total commands loaded: ${client.commands.size}`);

export const event = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction: Interaction) {
        Logger.info(`Interaction received: ${interaction.isChatInputCommand() ? interaction.commandName : 'non-command'}`);
        Logger.debug(`Interaction type: ${interaction.type}`);
        Logger.debug(`User: ${interaction.user.tag}`);
        Logger.debug(`Guild: ${interaction.guild?.name || 'DM'}`);

        if (!interaction.isChatInputCommand()) {
            Logger.info('Not a chat input command, ignoring');
            return;
        }

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            Logger.warning(`Command "${interaction.commandName}" not found in client.commands`);
            Logger.info(`Available commands: ${Array.from(client.commands.keys()).join(', ')}`);
            return;
        }

        Logger.info(`Executing command: ${interaction.commandName}`);
        try {
            await command.execute(interaction);
            Logger.success(`Command ${interaction.commandName} executed successfully`);
        } catch (error) {
            Logger.error('Error executing command:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ There was an error while executing this command.',
                    ephemeral: true
                });
            }
        }
    }
};
