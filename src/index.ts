import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import playdl from 'play-dl';
import fs from 'fs';
import path from 'path';

config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const player = new Player(client);

player.extractors.register(playdl, { name: 'play-dl' });


await player.extractors.loadMulti(DefaultExtractors);

client.player = player;


client.player.events.on('playerStart', (queue, track) => {
    queue.metadata.channel.send(`🎶 Now playing: **${track.title}**`);
});

client.player.events.on('emptyQueue', (queue) => {
    queue.metadata.channel.send('🚫 The queue has ended.');
});

client.player.events.on('audioTrackAdd', (queue, track) => {
    queue.metadata.channel.send(`➕ Added to queue: **${track.title}**`);
});

client.player.events.on('error', (queue, error) => {
    console.error(`Player error: ${error.message}`);
    queue.metadata.channel.send('❌ An unexpected error occurred while processing the track.');
});

client.player.events.on('playerError', (queue, error) => {
    console.error(`Stream extraction error: ${error.message}`);
    queue.metadata.channel.send('❌ Could not extract a stream for this track.');
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
    const { data, execute } = require(path.join(commandsPath, file));
    client.commands.set(data.name, { data, execute });
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(process.env.DISCORD_TOKEN);
