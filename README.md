# Minecraft RCON Dashboard

A modern web-based dashboard for managing Minecraft servers via RCON (Remote Console) protocol. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎮 Real-time Minecraft server management
- 🔧 RCON command execution
- 📊 Server status monitoring
- 🎨 Modern, responsive UI with animations
- ⚡ Built with Next.js 15 and React 19
- 🔒 Secure RCON connection handling

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **RCON Client**: rcon-client
- **Runtime**: Node.js

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Minecraft server with RCON enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sw3do/minecraft-rcon-dashboard.git
cd minecraft-rcon-dashboard
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Minecraft Server Setup

Ensure your Minecraft server has RCON enabled in `server.properties`:
```properties
enable-rcon=true
rcon.port=25575
rcon.password=your-password
```

## Usage

1. Navigate to the dashboard at `http://localhost:3000/dashboard`
2. Enter your Minecraft server details:
   - Server IP/hostname
   - RCON port (default: 25575)
   - RCON password
3. Connect and start managing your server!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── dashboard/    # Dashboard page
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
└── lib/
    └── rcon.ts       # RCON client utilities
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- RCON implementation using [rcon-client](https://www.npmjs.com/package/rcon-client)
- UI animations powered by [Framer Motion](https://www.framer.com/motion/)
