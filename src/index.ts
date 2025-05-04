import { client } from './lib/client';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();

// Validate environment variables
const requiredEnvVars = ['DISCORD_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

console.log('✅ Environment variables validated');

// Load events
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const eventsPath = path.join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

console.log('🔍 Loading events...');
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
        const { event } = await import(filePath);
        if (!event?.name) {
            console.warn(`⚠️ Event file "${file}" missing name property`);
            continue;
        }
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`✅ Loaded event: ${event.name}`);
    } catch (err) {
        console.error(`❌ Failed to load event "${file}":`, err);
    }
}

client.login(process.env.DISCORD_TOKEN);
