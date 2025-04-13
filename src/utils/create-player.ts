import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import type { Client } from 'discord.js';

export const createPlayer = async (client: Client) => {
  const player = new Player(client);
  await player.extractors.load(DefaultExtractors);
  return player;
};
