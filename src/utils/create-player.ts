import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';

export async function createPlayer(client: any) {
    const player = new Player(client);

    // Load extractors (YouTube & SoundCloud by default)
    await player.extractors.loadMulti(DefaultExtractors);

    return player;
}
