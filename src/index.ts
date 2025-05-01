import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { DefaultExtractors } from '@discord-player/extractor';
import { config } from 'dotenv';
import path from 'path';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { client } from './lib/client';
import { player } from './lib/player';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Register extractors
await player.extractors.register(YoutubeiExtractor, {});
console.log('✅ YouTube extractor registered');

for (const extractor of DefaultExtractors) {
  await player.extractors.register(extractor, {});
  console.log(`✅ Registered extractor: ${extractor.identifier}`);
}

// 🔁 Load events
const eventFiles = readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.ts'));
for (const file of eventFiles) {
  const { event } = await import(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// 🔁 Load commands
const commandFiles = readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.ts'));
for (const file of commandFiles) {
  const imported = await import(`./commands/${file}`);
  const command = imported.default;

  if (!command) {
    console.warn(`⚠️ Command ${file} does not export a default object`);
    continue;
  }

  client.commands.set(command.data.name, command);
  console.log(`✅ Loaded command: ${command.data.name}`);
}

client.login(process.env.DISCORD_TOKEN);
