import { Client } from 'discord.js';
import { Logger } from '../lib/utils/logger';

export const event = {
    name: 'ready',
    once: true,
    async execute(client: Client) {
        Logger.success(`Logged in as ${client.user?.tag}`);
        Logger.info(`Connected to ${client.guilds.cache.size} guilds`);
    }
};
  