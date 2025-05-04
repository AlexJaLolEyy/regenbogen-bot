# Regenbogen Bot 🎵

A feature-rich Discord bot built with Discord.js and Discord Player, designed to enhance your server's experience with music and more!

## Features

### 🎵 Music Commands
- `/play [query]` - Play a song from YouTube
- `/skip` - Skip the current track
- `/queue` - View the current music queue
- `/pause` - Pause the current track
- `/resume` - Resume the paused track
- `/stop` - Stop playback and clear the queue
- `/info` - Get bot information and status

### 🎨 Modern UI
- Beautiful embeds for all commands
- Rich track information display
- Clean and consistent error messages
- Real-time bot status showing current track

## 🚀 Getting Started

### Prerequisites
- Node.js 16.9.0 or higher
- Bun runtime (recommended)
- FFmpeg installed on your system

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/regenbogen-bot.git
cd regenbogen-bot
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_guild_id
```

4. Deploy commands:
```bash
bun run build
```

5. Start the bot:
```bash
bun run start
```

## 🛠️ Development

### Project Structure
```
src/
├── commands/        # Bot commands
├── events/          # Discord events
├── lib/            # Core functionality
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

### Available Scripts
- `bun run start` - Start the bot
- `bun run build` - Deploy slash commands

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [Discord Player](https://discord-player.js.org/) - Music player framework
- [Discord Player YouTubei](https://github.com/Androz2091/discord-player-youtubei) - YouTube extractor

## 🔮 Future Plans

- [ ] More music features (volume control, seek, etc.)
- [ ] Fun commands (games, memes, etc.)
- [ ] Utility commands (moderation, server management)
- [ ] Customizable settings
- [ ] Web dashboard for configuration
