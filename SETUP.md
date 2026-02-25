# Pi-Agent-Teams: Setup Guide

Multi-agent orchestration for pi coding agent with OMC engines (RALPH, AUTOPILOT, ULTRAWORK, SWARM).

## Prerequisites

**Pi must be installed and authenticated first:**

```bash
# Install pi
npm install -g @mariozechner/pi-coding-agent

# Authenticate (choose your provider)
pi
> /login
```

That's it! Pi handles authentication. No separate API keys needed.

---

## Installation

### Step 1: Link Extension to Pi

```bash
# Clone or download picat
git clone https://github.com/hscheema1979/pi-agent-teams.git ~/picat
cd ~/picat

# Link to pi's extensions directory (recommended)
ln -s ~/picat ~/.pi/agent/extensions/agent-teams
```

### Step 2: Install Dependencies

```bash
cd ~/picat
npm install
npm run type-check
```

### Step 3: Activate in Pi

```bash
# Start pi
pi

# Reload extensions
/reload

# Verify agent-teams loaded
/help
```

You should see commands like `tap`, `tav`, `rawr`, `rawrs`, `swarm`.

---

## Usage

### Quick Commands

```bash
pi
> tap "Add OAuth2 authentication"
> tav "Optimize database queries"
> rawr "Implement real-time notifications"
> rawrs "Big project refactor" --teams 4
```

### Full Commands

```bash
pi
> /team-auto "Task description"
> /team-verified "Quality-critical task"
> /team-rawr "Complex feature"
> /team-swarm "Large-scale work" --teams 3
> /team-review src/ --reviewers security,performance
```

### Available OMC Commands

| Command | Engine | Power |
|---------|--------|-------|
| `tap` | AUTOPILOT | 🤖 |
| `tav` | RALPH | 🔄 |
| `tvs` | RALPH + SWARM | 🔄🐝 |
| `rawr` | Triple Engine | 🐯 |
| `rawrs` | All 4 Engines | 🐯🐝 |
| `swarm` | Multi-team | 🐝 |

---

## Optional: Telegram Bridge

To use pi-agent-teams from Telegram (sends messages → pi → agent response):

**Separate Setup** (not part of picat):

```bash
# Clone pi-telegram repo
git clone https://github.com/hscheema1979/pi-telegram.git ~/pi-telegram
cd ~/pi-telegram

# Setup (requires your Telegram bot token)
cp .env.telegram.example .env.telegram
nano .env.telegram  # Add TELEGRAM_BOT_TOKEN

# Install & build
npm install
npm run build

# Start bot (connects to your local pi instance)
./scripts/start.sh
```

Then message your bot in Telegram to use pi-agent-teams remotely!

---

## Architecture

```
┌──────────────────────────────────────────┐
│              Pi Coding Agent              │
│  (Installed globally, authenticated)     │
└──────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────┐
│    pi-agent-teams Extension (picat)      │
│  (Linked to ~/.pi/agent/extensions/)     │
│                                          │
│  ├─ OMC Engines (RALPH, AUTOPILOT, ...) │
│  ├─ Team Manager                        │
│  ├─ Commands (tap, tav, rawr, etc.)    │
│  └─ Session State                       │
└──────────────────────────────────────────┘
         ↓ (optional)
┌──────────────────────────────────────────┐
│        pi-telegram Bot (separate)        │
│  (Bridges Telegram to local pi)          │
└──────────────────────────────────────────┘
```

---

## File Structure

```
picat/
├── src/
│   ├── omc/              OMC engines (RALPH, AUTOPILOT, ULTRAWORK, SWARM)
│   ├── commands/         Pi commands (tap, tav, rawr, rawrs, swarm, etc.)
│   ├── agents/           Agent system prompts
│   ├── state/            Team/session management
│   └── index.ts          Extension entry point
├── analysis/             Strategic documentation (82 KB)
├── README.md             Project overview
├── SETUP.md              This file
└── package.json          Dependencies
```

---

## Troubleshooting

### Extension Not Loading

```bash
# Make sure symlink exists
ls -la ~/.pi/agent/extensions/agent-teams

# Reinstall dependencies
cd ~/picat && npm install

# Reload in pi
pi
> /reload

# Check logs
tail ~/.pi/logs/session.log
```

### Commands Not Recognized

```bash
# Make sure you reloaded
pi
> /reload

# Verify extension is listed
pi
> /help | grep team-auto
```

### Pi Authentication Issues

Pi handles all authentication. If commands fail:

```bash
# Check if pi is authenticated
pi
> /status

# If not authenticated, login
pi
> /login

# Then reload agent-teams
pi
> /reload
```

---

## What You Get

✅ **7 OMC-powered commands** for different execution modes  
✅ **4 OMC engines** at your disposal (RALPH, AUTOPILOT, ULTRAWORK, SWARM)  
✅ **Multi-agent coordination** with autonomous orchestration  
✅ **Type-safe TypeScript** implementation (100% compilation passing)  
✅ **Production-ready code** that extends pi seamlessly  

---

## Next Steps

1. ✅ Install pi globally (`npm install -g @mariozechner/pi-coding-agent`)
2. ✅ Authenticate with pi (`pi` → `/login`)
3. ✅ Link pi-agent-teams to pi extensions
4. ✅ Reload pi (`/reload`)
5. 🚀 Try a command: `tap "Add feature"`

Optional:
6. Setup pi-telegram for Telegram bridge (separate repo)

---

## Support

- Documentation: `/home/ubuntu/picat/analysis/` (82 KB strategic docs)
- GitHub: https://github.com/hscheema1979/pi-agent-teams
- Pi docs: https://pi.dev

---

**That's it!** pi-agent-teams extends pi with sophisticated multi-agent orchestration. Just use it through pi's normal interface.
