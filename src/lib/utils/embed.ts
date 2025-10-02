import { EmbedBuilder } from 'discord.js';
import type { ColorResolvable } from 'discord.js';

export class EmbedUtil {
    static success(title: string, description: string) {
        return new EmbedBuilder()
            .setColor('#00FF00' as ColorResolvable)
            .setTitle(`✅ ${title}`)
            .setDescription(description);
    }

    static error(title: string, description: string) {
        return new EmbedBuilder()
            .setColor('#FF0000' as ColorResolvable)
            .setTitle(`❌ ${title}`)
            .setDescription(description);
    }

    static info(title: string, description: string) {
        return new EmbedBuilder()
            .setColor('#0099FF' as ColorResolvable)
            .setTitle(`ℹ️ ${title}`)
            .setDescription(description);
    }

    static warning(title: string, description: string) {
        return new EmbedBuilder()
            .setColor('#FFFF00' as ColorResolvable)
            .setTitle(`⚠️ ${title}`)
            .setDescription(description);
    }
}
