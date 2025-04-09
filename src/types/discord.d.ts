import { Collection } from 'discord.js';
import { Player } from 'discord-player';
import { Command } from './command.js';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, Command>;
    player: Player;
  }
}