import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { Logger } from '../lib/utils/logger';

config();

const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    Logger.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

Logger.success('Environment variables validated');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands: ReturnType<SlashCommandBuilder['toJSON']>[] = [];
const commandsPath = path.join(__dirname, '..', 'commands');

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
                
                if (command?.data) {
                    commands.push(command.data.toJSON());
                    Logger.success(`Loaded command: ${command.data.name}`);
                } else {
                    Logger.warning(`Command file "${item.name}" does not export a valid command.`);
                }
            } catch (err) {
                Logger.error(`Failed to import command "${item.name}":`, err);
            }
        }
    }
}

Logger.info('Loading commands...');
await loadCommands(commandsPath);

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

try {
    Logger.info('Registering slash commands...');
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
        { body: commands }
    );
    Logger.success('Slash commands registered successfully.');
} catch (error) {
    Logger.error('Failed to register commands:', error);
}
