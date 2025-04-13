import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import { config } from 'dotenv';
import path from 'path';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.commands = new Collection();

export const player = new Player(client);

for (const extractor of DefaultExtractors) {
  await player.extractors.register(extractor, {});
}

const eventFiles = readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.ts'));
for (const file of eventFiles) {
  const { event } = await import(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

const commandFiles = readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.ts'));
for (const file of commandFiles) {
  const command = (await import(`./commands/${file}`)).default;
  client.commands.set(command.data.name, command);
}

client.login(process.env.TOKEN);
