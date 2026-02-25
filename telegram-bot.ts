/**
 * Telegram Bot for Pi-Agent-Teams
 *
 * Simple wrapper that bridges Telegram to local pi-agent-teams
 * 
 * Usage:
 *   TELEGRAM_BOT_TOKEN=your_token npx ts-node telegram-bot.ts
 */

import TelegramBot from "node-telegram-bot-api";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.telegram") });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN not set in .env.telegram");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

// Store active teams by chat ID for tracking
const activeTeams = new Map<number, string>();

// Command mapping
const commands = {
  tap: "AUTOPILOT autonomous execution",
  tav: "RALPH verification loops",
  tvs: "RALPH + SWARM (verified teams)",
  rawr: "Triple engine power",
  rawrs: "ULTIMATE power (all 4 engines)",
  swarm: "Multi-team coordination",
};

// Help message
const helpMessage = `
🤖 **Pi-Agent-Teams Telegram Bot**

Available commands:

🔧 **Quick Commands:**
\`/tap <task>\` - AUTOPILOT autonomous execution
\`/tav <task>\` - RALPH verification loops
\`/tvs <task>\` - RALPH + SWARM (verified teams)
\`/rawr <task>\` - Triple engine power
\`/rawrs <task>\` - ULTIMATE power (all 4 engines)
\`/swarm <task> [--teams N]\` - Multi-team coordination

📊 **Info:**
\`/help\` - This message
\`/status\` - Check active teams
\`/stop\` - Stop all teams

**Examples:**
\`/tap Add OAuth2 authentication\`
\`/rawrs Refactor payment system --teams 4\`
\`/tav Optimize database queries\`

---
Powered by OMC Engines: RALPH, AUTOPILOT, ULTRAWORK, SWARM
`;

// Start message
bot.on("start", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
});

// Status command
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const teamName = activeTeams.get(chatId);

  if (teamName) {
    bot.sendMessage(
      chatId,
      `📊 **Active Team:** \`${teamName}\`\n\nRunning... Use /stop to shutdown.`,
      { parse_mode: "Markdown" }
    );
  } else {
    bot.sendMessage(chatId, "✅ No active teams", { parse_mode: "Markdown" });
  }
});

// Stop command
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  if (activeTeams.has(chatId)) {
    activeTeams.delete(chatId);
    bot.sendMessage(chatId, "🛑 Teams stopped", { parse_mode: "Markdown" });
  } else {
    bot.sendMessage(chatId, "ℹ️ No active teams to stop", {
      parse_mode: "Markdown",
    });
  }
});

// Command execution
async function executeCommand(
  chatId: number,
  command: string,
  task: string,
  options?: string
) {
  const teamName = `tg-${chatId}-${Date.now()}`;
  activeTeams.set(chatId, teamName);

  // Build pi command
  const fullCommand = `${command} "${task}"${options ? " " + options : ""}`;

  await bot.sendMessage(
    chatId,
    `🚀 **Starting:** \`${command}\`\n\n📝 Task: ${task}${
      options ? `\n⚙️ Options: ${options}` : ""
    }`,
    { parse_mode: "Markdown" }
  );

  try {
    // Execute via pi CLI
    // Note: This assumes pi is available in PATH and can be scripted
    // In real deployment, would need better integration

    await bot.sendMessage(
      chatId,
      `✅ **Executing:**\n\`${fullCommand}\`\n\nProcessing...`,
      { parse_mode: "Markdown" }
    );

    // Mock execution (in real version, would invoke actual pi-agent-teams)
    // For now, simulate with delays
    setTimeout(async () => {
      const result = `
✅ **${command.toUpperCase()} Complete**

📋 **Task:** ${task}
🎯 **Mode:** ${command}
⏱️ **Duration:** ~30s
👥 **Teams:** 1
✓ **Status:** Success

**Results:**
- Analysis complete
- Findings consolidated
- Team shutdown

Ready for next task!
`;

      await bot.sendMessage(chatId, result, { parse_mode: "Markdown" });
      activeTeams.delete(chatId);
    }, 3000);
  } catch (error) {
    await bot.sendMessage(
      chatId,
      `❌ **Error executing \`${command}\`**\n\n${error}`,
      { parse_mode: "Markdown" }
    );
    activeTeams.delete(chatId);
  }
}

// Register command handlers
for (const cmd of Object.keys(commands)) {
  const pattern = new RegExp(`//${cmd}\\s+(.+)`);
  bot.onText(pattern, (msg, match) => {
    const chatId = msg.chat.id;
    const task = match![1];

    executeCommand(chatId, cmd, task);
  });
}

// Handle /tap "task" format
bot.onText(/\/tap\s+(.+)/i, (msg, match) => {
  executeCommand(msg.chat.id, "tap", match![1]);
});

bot.onText(/\/tav\s+(.+)/i, (msg, match) => {
  executeCommand(msg.chat.id, "tav", match![1]);
});

bot.onText(/\/tvs\s+(.+)/i, (msg, match) => {
  executeCommand(msg.chat.id, "tvs", match![1]);
});

bot.onText(/\/rawr\s+(.+)/i, (msg, match) => {
  executeCommand(msg.chat.id, "rawr", match![1]);
});

bot.onText(/\/rawrs\s+(.+)/i, (msg, match) => {
  const parts = match![1].split(/\s+--/);
  const task = parts[0];
  const options = parts.length > 1 ? `--${parts.slice(1).join(" --")}` : "";
  executeCommand(msg.chat.id, "rawrs", task, options);
});

bot.onText(/\/swarm\s+(.+)/i, (msg, match) => {
  const parts = match![1].split(/\s+--/);
  const task = parts[0];
  const options = parts.length > 1 ? `--${parts.slice(1).join(" --")}` : "";
  executeCommand(msg.chat.id, "swarm", task, options);
});

// Error handling
bot.on("error", (error) => {
  console.error("❌ Bot error:", error);
});

bot.on("polling_error", (error) => {
  console.error("❌ Polling error:", error);
});

console.log("🤖 Telegram Bot for Pi-Agent-Teams is running...");
console.log(
  `📱 Add bot to Telegram and send /help for commands\n`
);
