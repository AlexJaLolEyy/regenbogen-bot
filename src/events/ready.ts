import { Client } from 'discord.js';
import { player } from '../lib/player';

export const event = {
    name: 'ready',
    once: true,
    async execute(client: Client) {
        console.log(`✅ Logged in as ${client.user?.tag}`);
        console.log(`🏰 Connected to ${client.guilds.cache.size} guilds`);
        console.log(`🎵 Player initialized with ${player.extractors.store.size} extractors`);
    }
};
  