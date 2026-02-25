# Pi-Agent-Teams: Complete Setup & Deployment Guide

## Table of Contents

1. [Quick Setup (Pi Only)](#quick-setup-pi-only)
2. [Full Deployment (Pi + Domain + Telegram)](#full-deployment-pi--domain--telegram)
3. [Troubleshooting](#troubleshooting)

---

## Quick Setup (Pi Only)

### Step 1: Link to Pi Extension Directory

```bash
# Option A: Symlink (recommended - stay connected to git repo)
ln -s ~/picat ~/.pi/agent/extensions/agent-teams

# Option B: Copy (standalone)
mkdir -p ~/.pi/agent/extensions/agent-teams
cp -r ~/picat/* ~/.pi/agent/extensions/agent-teams/
```

### Step 2: Install Dependencies

```bash
cd ~/.pi/agent/extensions/agent-teams
npm install
```

### Step 3: Activate in Pi

**Do NOT restart pi!** Instead:

```bash
pi
> /reload
```

That's it! The extension loads dynamically.

### Step 4: Test It

```bash
# Test basic command
/team-review --help

# Test AUTOPILOT
tap "Add authentication"

# Test RALPH
tav "Refactor module"

# Test ultimate power
rawrs "Big project" --teams 3
```

### Available Commands

```
tap ........ AUTOPILOT
tav ........ RALPH
tvs ........ RALPH + SWARM
rawr ....... Triple engine
rawrs ...... Ultimate power
swarm ...... Multi-team
```

---

## Full Deployment (Pi + Domain + Telegram)

This section covers setting up the full AT (Agent Teams) domain with Telegram bot integration.

### Prerequisites

- Node.js 20+
- Python 3.10+
- PM2 (`npm install -g pm2`)
- Git
- Telegram bot token (from @BotFather)

### Step 1: Create Domain Directory

```bash
# Choose your domain name (e.g., "intake", "dev", "research")
DOMAIN="intake"

mkdir -p /home/ubuntu/$DOMAIN
cd /home/ubuntu/$DOMAIN
```

### Step 2: Deploy Agent Teams

```bash
# Clone the AT repo (if not already done)
git clone https://github.com/hscheema1979/Domain_Agent_Teams.git AT
cd AT
npm install
npm run build
```

### Step 3: Configure Domain

Create `packages/domain/config.json`:

```json
{
  "domain": "intake",
  "workspace": "/home/ubuntu/intake",
  "description": "Process incoming requests",
  "capabilities": [
    "code-review",
    "debugging",
    "feature-development"
  ],
  "wshobsonAgents": [
    "analyst",
    "architect",
    "developer",
    "reviewer"
  ],
  "telegramBot": "@your_bot_handle"
}
```

### Step 4: Setup Telegram Bot

Create `.env.intake` in `plugins/telegram/`:

```bash
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_BOT_USERNAME=@your_bot
APPROVED_DIRECTORY=/home/ubuntu/intake
DOMAIN=intake
AT_WORKSPACE=/home/ubuntu/intake
AT_DEPLOYMENT=/home/ubuntu/intake/AT
OMC_ENABLED=true
```

Get bot token:
1. Open Telegram
2. Message @BotFather
3. Say `/newbot`
4. Follow instructions to create bot
5. Copy token to `.env.intake`

### Step 5: Start Services

#### Start Agent Teams

```bash
cd /home/ubuntu/intake/AT
npm run start:domain
```

#### Start Telegram Bot

```bash
cd /home/ubuntu/intake/AT/plugins/telegram
npm start
```

Or use PM2 for persistent services:

```bash
pm2 start npm --name "agent-teams" -- run start:domain
pm2 start npm --name "telegram-bot" -- start

pm2 save
pm2 startup
```

### Step 6: Verify Deployment

```bash
# Check services running
pm2 list

# Check logs
pm2 logs agent-teams
pm2 logs telegram-bot

# Test bot (send message to your bot in Telegram)
# Should get response from agent team
```

---

## Architecture Overview

### Pi-Agent-Teams (Local Extension)

```
~/.pi/agent/extensions/agent-teams/
├── src/
│   ├── omc/ (OMC engines)
│   ├── commands/ (User commands)
│   ├── agents/ (System prompts)
│   └── state/ (Team management)
├── npm install
└── /reload in pi to activate
```

**Access**: Available in `pi` terminal only

### Domain Agents (Full AT Deployment)

```
/home/ubuntu/{domain}/AT/
├── agents/ (319 domain agents)
├── packages/ (orchestration, registry)
├── plugins/ (telegram integration)
├── skills/ (OMC skills)
└── npm start (persistent service)
```

**Access**: Available via Telegram bot or REST API

---

## Workflows

### Workflow 1: Pi Only (Local Development)

```
You
  ↓
pi terminal
  ↓
/tap, /tav, /rawr commands
  ↓
Local team execution
  ↓
Results in pi
```

**Use case**: Local development, quick testing

### Workflow 2: Domain + Telegram (Production)

```
Telegram User
  ↓
@your_bot_handle
  ↓
Telegram plugin
  ↓
AT Domain agents
  ↓
OMC engines
  ↓
Results back to Telegram
```

**Use case**: Team workflows, async operations

### Workflow 3: Hybrid (Pi + Domain)

```
You (pi)                    External User (Telegram)
     ↓                                    ↓
  /tap command                    Send message to bot
     ↓                                    ↓
  OMC engines                       AT Domain
     ↓                                    ↓
  Results in pi                    Results in Telegram
```

**Use case**: Mix local and domain-based operations

---

## State & Data

### Pi-Local State

```
~/.pi/teams/{teamName}/
├── state.json (team config)
├── members/ (member data)
└── results/ (findings)
```

**Lifetime**: Session-based (cleared on shutdown)

### Domain State

```
/home/ubuntu/{domain}/AT/.omc/
├── state/ (persistent team state)
├── sessions/ (session history)
└── checkpoints/ (recovery points)
```

**Lifetime**: Persistent (survives restarts)

---

## Commands Reference

### Pi Commands (Lazy 3-4 letter)

| Command | Engine | Power |
|---------|--------|-------|
| `tap` | AUTOPILOT | 🤖 |
| `tav` | RALPH | 🔄 |
| `tvs` | RALPH + SWARM | 🔄🐝 |
| `rawr` | Triple engine | 🐯 |
| `rawrs` | All 4 engines | 🐯🐝 |
| `swarm` | Multi-team | 🐝 |

### Full Names (Available too)

```
/team-auto ..................... AUTOPILOT
/team-verified ................. RALPH
/team-verified-swarm ........... RALPH + SWARM
/team-rawr ..................... Triple engine
/team-rawrs .................... All 4 engines
/team-swarm .................... Multi-team
/team-review ................... Code review (MVP)
/team-status ................... Monitor teams
/team-shutdown ................. Cleanup
```

---

## Troubleshooting

### Pi Extension Not Loading

```bash
# Check if linked/copied correctly
ls ~/.pi/agent/extensions/agent-teams/

# Reinstall dependencies
cd ~/.pi/agent/extensions/agent-teams
npm install

# Reload pi
pi
> /reload

# Check logs
tail -f ~/.pi/logs/session.log
```

### Commands Not Recognized

```bash
# Make sure you did /reload
/reload

# Check extension is registered
# Should see "agent-teams" in /help output

# Verify syntax (no leading /)
tap "your task"
# NOT: /tap "your task"
```

### Team Spawning Fails

```bash
# Check resources
free -h  # memory
df -h    # disk

# Check ~/.pi/teams/ has write permissions
chmod -R 755 ~/.pi/teams/

# Reduce team size
tap "task" --teams 2  # instead of default 4
```

### Telegram Bot Not Responding

```bash
# Check service is running
pm2 list

# Check environment variables
cat .env.intake

# Verify token is valid
curl -X POST https://api.telegram.org/botYOUR_TOKEN/getMe

# Check logs
pm2 logs telegram-bot
```

### Process Cleanup Issues

```bash
# Kill stuck processes
pkill -f "pi.*agent-teams"

# Cleanup team state
rm -rf ~/.pi/teams/stuck-team-*

# Force cleanup all teams
/team-shutdown "*"
```

---

## Performance Tips

### For Pi (Local)

- Keep teams small: 2-3 agents
- Use simple tasks first to test
- Monitor memory: `top`
- Kill background processes

### For Domain (Production)

```bash
# Increase file descriptors
ulimit -n 65536

# Use PM2 clustering
pm2 start npm --name "team-lead" -i max

# Monitor resources
pm2 monit
```

---

## Security

### Pi (Local) - No special setup needed

### Domain (Production)

```bash
# Restrict bot token in .env
chmod 600 .env.intake

# Restrict domain directory
chmod 700 /home/ubuntu/intake

# Use IAM roles if in cloud
# Set up firewall rules
```

---

## Next Steps

1. **Test Pi locally** - Run `/tap`, `/tav`, `/rawrs` in pi
2. **Setup domain** if needed for production use
3. **Configure Telegram** if you want remote access
4. **Use PM2** to keep services running

---

## References

- Pi Extension Guide: `~/.pi/agent/extensions/agent-teams/analysis/`
- AT Documentation: `https://github.com/hscheema1979/Domain_Agent_Teams`
- Telegram Bot API: https://core.telegram.org/bots/api
