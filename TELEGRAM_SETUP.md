# Telegram Bot Setup for Pi-Agent-Teams

## Quick Setup (5 minutes)

### Step 1: Get a Telegram Bot Token

1. Open Telegram
2. Search for **@BotFather**
3. Send `/newbot`
4. Follow instructions:
   - Enter bot name (e.g., "Pi Agent Teams")
   - Enter bot username (e.g., "pi_agent_teams_bot")
5. **Copy the token** you receive (looks like: `123456789:ABCdefGHIjklmnOPQRstuvWXYZ...`)

### Step 2: Configure Bot

```bash
cd ~/picat

# Copy example to actual config
cp .env.telegram.example .env.telegram

# Edit and paste your token
nano .env.telegram
# Change: TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE
# To:     TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklmnOPQRstuvWXYZ...
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start Bot

```bash
npm run telegram:bot
```

You should see:
```
🤖 Telegram Bot for Pi-Agent-Teams is running...
📱 Add bot to Telegram and send /help for commands
```

### Step 5: Test in Telegram

1. Find your bot in Telegram (search for the username you created)
2. Send `/help`
3. Try a command: `/tap Add OAuth2 authentication`

---

## Available Commands

Once bot is running, use in Telegram:

### Basic Commands

```
/tap <task>          AUTOPILOT autonomous execution
/tav <task>          RALPH verification loops
/tvs <task>          RALPH + SWARM (verified teams)
/rawr <task>         Triple engine power
/rawrs <task>        ULTIMATE power (all 4 engines)
/swarm <task>        Multi-team coordination
```

### Info Commands

```
/help                Show help message
/status              Check active teams
/stop                Stop all teams
```

### Examples

```
/tap Add OAuth2 authentication
/tav Optimize database queries
/rawr Implement real-time notifications
/rawrs Migrate database to PostgreSQL --teams 4
/swarm Build new feature --teams 3
```

---

## How It Works

```
You (Telegram)
    ↓
Bot receives message
    ↓
Parses command (tap, tav, rawr, etc)
    ↓
Invokes pi-agent-teams
    ↓
OMC Engines run (RALPH, AUTOPILOT, ULTRAWORK, SWARM)
    ↓
Results sent back to Telegram
```

---

## Troubleshooting

### Bot Not Starting

```bash
# Check token is set correctly
cat .env.telegram

# Check dependencies are installed
npm install

# Check for errors
npm run telegram:bot
```

### Bot Not Responding to Commands

```bash
# Verify bot is running
npm run telegram:bot

# Verify you're sending commands correctly
# Format: /command task description

# Check Telegram privacy settings
# Make sure bot is running in foreground or with PM2
```

### Token Invalid

```bash
# Get new token from @BotFather
# Replace in .env.telegram
nano .env.telegram

# Restart bot
npm run telegram:bot
```

### Keep Bot Running (Optional)

Use PM2 to run bot as background service:

```bash
npm install -g pm2

pm2 start "npm run telegram:bot" --name "pi-agent-bot"
pm2 save
pm2 startup
```

Check status:
```bash
pm2 list
pm2 logs pi-agent-bot
```

---

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit `.env.telegram`** to git
2. **Keep your token secret** - it controls your bot
3. **Verify requests** if deploying publicly
4. **Use environment variables** in production

### Securing Your Bot

```bash
# Make .env.telegram readable only by you
chmod 600 .env.telegram

# Add to .gitignore
echo ".env.telegram" >> .gitignore
```

---

## Architecture

### Local Mode (Current)

```
Telegram → Bot Service → Pi-Agent-Teams → Results → Telegram
           (local Node.js)    (local pi)
```

- ✅ Simple setup
- ✅ No server needed
- ✅ Works offline (except Telegram connection)
- ❌ Bot must run locally

### Cloud Mode (Optional Future)

```
Telegram → Telegram Servers → Your Server → Pi-Agent-Teams → Telegram
```

- ✅ Bot runs 24/7
- ✅ Accessible from anywhere
- ❌ Requires cloud deployment
- ❌ More complex setup

For now, we're using Local Mode - simple and fast!

---

## Integration with Pi

The Telegram bot **does not require pi to be running**. It:

1. Reads pi-agent-teams source code directly
2. Executes commands in Node.js
3. Sends results back to Telegram

So you can:

- ✅ Run pi locally AND use Telegram bot
- ✅ Use Telegram bot without pi running
- ✅ Use both independently

---

## Next Steps

1. ✅ Get token from @BotFather
2. ✅ Create `.env.telegram` with your token
3. ✅ Run `npm run telegram:bot`
4. ✅ Test commands in Telegram
5. ✅ (Optional) Use PM2 to keep bot running 24/7

---

## References

- Telegram Bot API: https://core.telegram.org/bots/api
- @BotFather: https://t.me/BotFather
- node-telegram-bot-api: https://www.npmjs.com/package/node-telegram-bot-api

---

**Setup complete!** 🎉

Got a token? Just run:
```bash
npm run telegram:bot
```

Then send `/help` in Telegram! 🤖
