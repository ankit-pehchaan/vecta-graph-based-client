# Vecta Client - Financial Life Graph Chat Interface

Modern Next.js frontend with WebSocket integration for testing the financial information gathering flow.

## Features

- Real-time bidirectional WebSocket communication
- Modern chat interface
- Session management
- Connection status indicator
- Message history
- Error handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure WebSocket URL (optional):
```bash
cp .env.local.example .env.local
# Edit .env.local if your backend runs on a different URL
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter your financial goal (e.g., "Buy a house", "Plan for retirement")
2. Click "Start" to begin the session
3. Answer the questions as they appear
4. The system will collect information across multiple nodes
5. Session completes when all necessary information is gathered

## Project Structure

```
src/
├── app/              # Next.js app router
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Main chat page
│   └── globals.css   # Global styles
├── components/       # React components
│   ├── ChatInterface.tsx      # Main chat container
│   ├── MessageBubble.tsx     # Individual messages
│   ├── InputBox.tsx          # User input
│   └── ConnectionStatus.tsx  # WS status indicator
├── hooks/           # Custom React hooks
│   └── useWebSocket.ts       # WebSocket hook
└── types/           # TypeScript types
    └── websocket.ts          # WebSocket message types
```

## WebSocket Message Types

Matches backend schemas:
- `WSAnswer` - Client → Server
- `WSQuestion` - Server → Client
- `WSComplete` - Server → Client
- `WSError` - Server → Client
- `WSSessionStart` - Server → Client

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
