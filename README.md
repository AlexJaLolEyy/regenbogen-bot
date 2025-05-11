# Regenbogen Bot 🎵

A feature-rich Discord bot built with Discord.js and Discord Player, designed to enhance your server's experience with music, fun commands, and gaming features!

## Features

### 🎵 Music Commands (v0.1.0)
- `/play [query]` - Play a song from YouTube or Spotify
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
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
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

## 🔮 Version Roadmap

### v0.1.0 (Current) - Core Music Features
- ✅ Basic music playback
- ✅ Queue management
- ✅ Playlist support
- ✅ Spotify integration

### v0.2.0 (Next) - General Features
- [ ] Poll system with multiple choice options
- [ ] Dice roll and coin flip commands
- [ ] Comprehensive help command
- [ ] Quiz system with ranking
- [ ] Joke and meme commands

### v0.3.0 - Enhanced Music Features
- [ ] /vibe command for lofi/background music
- [ ] Volume control
- [ ] Audio effects (bass boost, nightcore, etc.)
- [ ] Lyrics display
- [ ] Performance improvements for long playlists

### v0.4.0 - Gaming Features
- [ ] League of Legends tracker
- [ ] Valorant tracker
- [ ] Path note summarizer
- [ ] Random champion/agent selector
- [ ] Steam/Epic Games sale notifications

### Future Plans
- [ ] Web dashboard for configuration
- [ ] Customizable settings per server
- [ ] More music sources
- [ ] Advanced audio effects
- [ ] Community features
