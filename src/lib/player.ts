import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { SpotifyExtractor } from '@discord-player/extractor';
import { client } from './client';

const loadingStates = new Map<string, boolean>();

export const player = new Player(client, {
    skipFFmpeg: true
});

console.log('🎵 Initializing Discord Player...');

player.extractors.register(YoutubeiExtractor, {
    streamOptions: {
        highWaterMark: 1 << 25,
        useClient: 'TV'
    }
}).then(() => {
    console.log('✅ YouTubei extractor registered successfully');
}).catch(error => {
    console.error('❌ Failed to register YouTubei extractor:', error);
});

player.extractors.register(SpotifyExtractor, {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
}).then(() => {
    console.log('✅ Spotify extractor registered successfully');
}).catch(error => {
    console.error('❌ Failed to register Spotify extractor:', error);
});

function setLoadingState(guildId: string, loading: boolean) {
    loadingStates.set(guildId, loading);
    if (loading) {
        setTimeout(() => {
            loadingStates.delete(guildId);
        }, 10000);
    }
}

export function isGuildLoading(guildId: string): boolean {
    return loadingStates.get(guildId) || false;
}


player.events.on('debug', (queue, message) => {
    if (message.includes('buffer') || message.includes('stream') || message.includes('timeout') || message.includes('download') || message.includes('error')) {
        console.log(`🔍 Player debug: ${message}`);
    }
});

player.events.on('error', (queue, error) => {
    console.error('❌ Player error:', error);
    if (queue) {
        setLoadingState(queue.guild.id, false);
    }
});

player.events.on('playerStart', (queue, track) => {
    console.log(`🎵 Started playing: ${track.title}`);
    console.log('Track metadata:', {
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
    console.log(`✅ Finished playing: ${track.title}`);
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
    console.log(`⏭️ Skipped track: ${track.title}`);
    setLoadingState(queue.guild.id, true);
});

player.events.on('playerPause', (queue) => {
    console.log('⏸️ Player paused');
    setLoadingState(queue.guild.id, false);
    // Update bot status when paused
    client.user?.setActivity({
        name: 'paused',
        type: 2 // LISTENING
    });
});

player.events.on('playerResume', (queue) => {
    console.log('▶️ Player resumed');
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
    console.log('🔊 Connected to voice channel');
    setLoadingState(queue.guild.id, false);
});

player.events.on('disconnect', (queue) => {
    console.log('🔇 Disconnected from voice channel');
    setLoadingState(queue.guild.id, false);
    // Reset bot status when disconnected
    client.user?.setActivity({
        name: 'music',
        type: 2 // LISTENING
    });
});

player.events.on('audioTrackAdd', (queue, track) => {
    console.log(`➕ Track added to queue: ${track.title}`);
    console.log('Track metadata:', {
        title: track.title,
        thumbnail: track.thumbnail,
        author: track.author,
        url: track.url,
        source: track.source
    });
});

player.events.on('audioTrackRemove', (queue, track) => {
    console.log(`➖ Track removed from queue: ${track.title}`);
});

player.events.on('audioTracksAdd', (queue, tracks) => {
    console.log(`➕ ${tracks.length} tracks added to queue`);
    tracks.forEach(track => {
        console.log('Track metadata:', {
            title: track.title,
            author: track.author,
            url: track.url,
            source: track.source
        });
    });
});

player.events.on('playerError', (queue, error) => {
    console.error('❌ Player error:', error);
    queue.metadata.channel.send(`❌ Player error: ${error.message}`);
});
