import { DisTube } from "distube";
import { Client } from "discord.js";

export interface Command {
  name: string;
  description: string;
  execute: () => void;
}

// Add DisTube to Discord.js client type
declare module "discord.js" {
  interface Client {
    distube: DisTube;
  }
}