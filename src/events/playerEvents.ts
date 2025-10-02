import { Logger } from '../lib/utils/logger';

export const event = {
    name: 'ready',
    once: true,
    async execute() {
        Logger.info('Registering player event listeners...');
        
        // Import player here to ensure it's initialized
        const { player } = await import('../lib/music/player');

        player.events.on('playerError', (queue, error) => {
            Logger.error('Player error:', error);
            queue.metadata.channel.send('❌ An error occurred while playing!');
        });

        player.events.on('playerStart', (queue, track) => {
            queue.metadata.channel.send(`🎵 Now playing: **${track.title}**`);
        });

        player.events.on('emptyQueue', (queue) => {
            queue.metadata.channel.send('✅ Queue finished!');
        });

        player.events.on('disconnect', (queue) => {
            queue.metadata.channel.send('👋 Disconnected from voice channel');
        });

        Logger.success('Player event listeners registered');
    }
};
