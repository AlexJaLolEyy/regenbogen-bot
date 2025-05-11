import { player } from '../lib/player';

export const event = {
  name: 'ready',
  once: true,
  async execute() {
    console.log('🎧 Registering player event listeners...');

    player.events.on('playerError', (queue, error) => {
      console.error(`❌ Player error: ${error.message}`);
    });

    player.events.on('error', (queue, error) => {
      console.error(`❌ General error: ${error.message}`);
    });

    player.events.on('playerStart', (queue, track) => {
      queue.metadata.channel.send(`🎶 Now playing: **${track.title}**`);
    });

    player.events.on('emptyQueue', queue => {
      queue.metadata.channel.send(`🛑 Queue finished!`);
    });
  }
};
