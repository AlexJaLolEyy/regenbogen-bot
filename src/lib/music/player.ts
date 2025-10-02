import { Client } from 'discord.js';
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { SpotifyExtractor } from '@discord-player/extractor';
import { client } from '../client';
import { Logger } from '../utils/logger';

// Track loading states
const loadingStates = new Map<string, boolean>();

// Initialize the player
let player: Player;

try {
    player = new Player(client);
    player.extractors.loadDefault();
    Logger.success('🎵 Discord Player initialized successfully');
} catch (error) {
    Logger.error('Failed to initialize Discord Player:', error);
    throw error;
}

// Register YouTube extractor
player.extractors.register(YoutubeiExtractor, {
    streamOptions: {
        highWaterMark: 1 << 25,
        useClient: 'TV'
    }
}).then(() => {
    Logger.success('YouTubei extractor registered successfully');
}).catch(error => {
    Logger.error('Failed to register YouTubei extractor:', error);
});

// Register Spotify extractor
player.extractors.register(SpotifyExtractor, {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
}).then(() => {
    Logger.success('Spotify extractor registered successfully');
}).catch(error => {
    Logger.error('Failed to register Spotify extractor:', error);
});

// Helper function to set loading state
function setLoadingState(guildId: string, loading: boolean) {
    loadingStates.set(guildId, loading);
    if (loading) {
        // Clear loading state after 10 seconds
        setTimeout(() => {
            loadingStates.delete(guildId);
        }, 10000);
    }
}

// Helper function to check loading state
export function isGuildLoading(guildId: string): boolean {
    return loadingStates.get(guildId) || false;
}

// Add debug event listeners
player.events.on('debug', (queue, message) => {
    if (message.includes('buffer') || message.includes('stream') || message.includes('timeout') || message.includes('download') || message.includes('error')) {
        Logger.debug(`Player debug: ${message}`);
    }
});

player.events.on('error', (queue, error) => {
    Logger.error('Player error:', error);
    if (queue) {
        setLoadingState(queue.guild.id, false);
    }
});

player.events.on('playerStart', (queue, track) => {
    queue.metadata.channel.send(`🎵 Now playing: **${track.title}**`);
    Logger.info(`Started playing: ${track.title}`);
    Logger.debug('Track metadata:', {
        title: track.title,
        thumbnail: track.thumbnail,
        author: track.author,
        url: track.url,
        source: track.source
    });
    setLoadingState(queue.guild.id, false);
    // Update bot status with current song
    client.user?.setActivity({
        name: `${track.title}`,
        type: 2 // LISTENING
    });
});

player.events.on('playerFinish', (queue, track) => {
    Logger.success(`Finished playing: ${track.title}`);
    setLoadingState(queue.guild.id, false);
    // Reset bot status when no song is playing
    if (!queue.currentTrack) {
        client.user?.setActivity({
            name: 'music',
            type: 2 // LISTENING
        });
    }
});

player.events.on('playerSkip', (queue, track) => {
    Logger.info(`Skipped track: ${track.title}`);
    setLoadingState(queue.guild.id, true);
});

player.events.on('playerPause', (queue) => {
    Logger.info('Player paused');
    setLoadingState(queue.guild.id, false);
    // Update bot status when paused
    client.user?.setActivity({
        name: 'paused',
        type: 2 // LISTENING
    });
});

player.events.on('playerResume', (queue) => {
    Logger.info('Player resumed');
    setLoadingState(queue.guild.id, false);
    // Update bot status with current song
    if (queue.currentTrack) {
        client.user?.setActivity({
            name: `${queue.currentTrack.title}`,
            type: 2 // LISTENING
        });
    }
});

player.events.on('connection', (queue) => {
    Logger.info('Connected to voice channel');
    setLoadingState(queue.guild.id, false);
});

player.events.on('disconnect', (queue) => {
    queue.metadata.channel.send('👋 Disconnected from voice channel');
    setLoadingState(queue.guild.id, false);
    // Reset bot status when disconnected
    client.user?.setActivity({
        name: 'music',
        type: 2 // LISTENING
    });
});

player.events.on('audioTrackAdd', (queue, track) => {
    Logger.info(`Track added to queue: ${track.title}`);
    Logger.debug('Track metadata:', {
        title: track.title,
        thumbnail: track.thumbnail,
        author: track.author,
        url: track.url,
        source: track.source
    });
});

player.events.on('audioTrackRemove', (queue, track) => {
    Logger.info(`Track removed from queue: ${track.title}`);
});

player.events.on('audioTracksAdd', (queue, tracks) => {
    Logger.info(`${tracks.length} tracks added to queue`);
    tracks.forEach(track => {
        Logger.debug('Track metadata:', {
            title: track.title,
            author: track.author,
            url: track.url,
            source: track.source
        });
    });
});

player.events.on('playerError', (queue, error) => {
    Logger.error('Player error:', error);
    queue.metadata.channel.send('❌ An error occurred while playing!');
    queue.metadata.channel.send(`❌ Player error: ${error.message}`);
});

player.events.on('emptyQueue', (queue) => {
    queue.metadata.channel.send('✅ Queue finished!');
});

export { player };
