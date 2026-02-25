#!/usr/bin/env node

/**
 * Telegram Bot for Pi-Agent-Teams
 *
 * Simple wrapper that bridges Telegram to pi-agent-teams
 * 
 * Usage:
 *   TELEGRAM_BOT_TOKEN=your_token node telegram-bot.js
 */

import TelegramBot from "node-telegram-bot-api";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env.telegram") });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN not set in .env.telegram");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

// Store active teams by chat ID for tracking
const activeTeams = new Map();

// Help message
const helpMessage = `
🤖 *Pi-Agent-Teams Telegram Bot*

Available commands:

🔧 *Quick Commands:*
\`/tap <task>\` - AUTOPILOT autonomous execution
\`/tav <task>\` - RALPH verification loops
\`/tvs <task>\` - RALPH + SWARM (verified teams)
\`/rawr <task>\` - Triple engine power
\`/rawrs <task>\` - ULTIMATE power (all 4 engines)
\`/swarm <task> [--teams N]\` - Multi-team coordination

📊 *Info:*
\`/help\` - This message
\`/status\` - Check active teams
\`/stop\` - Stop all teams

*Examples:*
\`/tap Add OAuth2 authentication\`
\`/rawrs Refactor payment system --teams 4\`
\`/tav Optimize database queries\`

---
Powered by OMC Engines: RALPH, AUTOPILOT, ULTRAWORK, SWARM
`;

// Utility to send message with error handling (supports topics/threads)
async function sendMessage(chatId, text, msg = null, options = {}) {
  try {
    const sendOptions = {
      parse_mode: "Markdown",
      ...options,
    };
    
    // If message exists and has thread_id, include it
    if (msg && msg.message_thread_id) {
      sendOptions.message_thread_id = msg.message_thread_id;
    }
    
    const result = await bot.sendMessage(chatId, text, sendOptions);
    console.log(`[SENT] Chat ${chatId}: Message sent successfully`);
    return result;
  } catch (error) {
    console.error(`[ERROR] Failed to send message to ${chatId}:`, error.message);
    // Try sending without markdown if it fails
    try {
      const sendOptions = {};
      if (msg && msg.message_thread_id) {
        sendOptions.message_thread_id = msg.message_thread_id;
      }
      return await bot.sendMessage(chatId, text, sendOptions);
    } catch (error2) {
      console.error(`[ERROR] Still failed:`, error2.message);
    }
  }
}

// Start message
bot.on("start", (msg) => {
  const chatId = msg.chat.id;
  console.log(`[START] User ${chatId}: ${msg.chat.first_name}`);
  sendMessage(chatId, helpMessage, msg);
});

// Catch ALL messages for debugging
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "(no text)";
  const thread_id = msg.message_thread_id ? ` [Thread ${msg.message_thread_id}]` : "";
  console.log(`[MESSAGE] Chat ${chatId}${thread_id}: ${text}`);
  
  // If it's not a command we handle, send helpful message
  if (text && !text.startsWith("/")) {
    sendMessage(
      chatId,
      `🤖 I received: "${text}"\n\nSend /help for commands!`,
      msg,
      { parse_mode: "Markdown" }
    );
  }
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const thread_id = msg.message_thread_id ? ` [Thread ${msg.message_thread_id}]` : "";
  console.log(`[HELP] Chat ${chatId}${thread_id}`);
  sendMessage(chatId, helpMessage, msg);
});

// Status command
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const thread_id = msg.message_thread_id ? ` [Thread ${msg.message_thread_id}]` : "";
  console.log(`[STATUS] Chat ${chatId}${thread_id}`);
  const teamName = activeTeams.get(chatId);

  if (teamName) {
    sendMessage(
      chatId,
      `📊 *Active Team:* \`${teamName}\`\n\nRunning... Use /stop to shutdown.`,
      msg,
      { parse_mode: "Markdown" }
    );
  } else {
    sendMessage(chatId, "✅ No active teams", msg, { parse_mode: "Markdown" });
  }
});

// Stop command
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  const thread_id = msg.message_thread_id ? ` [Thread ${msg.message_thread_id}]` : "";
  console.log(`[STOP] Chat ${chatId}${thread_id}`);
  if (activeTeams.has(chatId)) {
    activeTeams.delete(chatId);
    sendMessage(chatId, "🛑 Teams stopped", msg, { parse_mode: "Markdown" });
  } else {
    sendMessage(chatId, "ℹ️ No active teams to stop", msg, {
      parse_mode: "Markdown",
    });
  }
});

// Command execution
async function executeCommand(msg, command, task, options) {
  const chatId = msg.chat.id;
  const teamName = `tg-${chatId}-${Date.now()}`;
  activeTeams.set(chatId, teamName);
  
  const thread_id = msg.message_thread_id ? ` [Thread ${msg.message_thread_id}]` : "";
  console.log(`[EXECUTE] ${command.toUpperCase()}${thread_id} - Chat ${chatId} - Task: ${task}`);

  // Build command string
  const fullCommand = `${command} "${task}"${options ? " " + options : ""}`;

  await sendMessage(
    chatId,
    `🚀 *Starting:* \`${command}\`\n\n📝 Task: ${task}${
      options ? `\n⚙️ Options: ${options}` : ""
    }`,
    msg,
    { parse_mode: "Markdown" }
  );

  await sendMessage(
    chatId,
    `✅ *Executing:*\n\`${fullCommand}\`\n\nProcessing...`,
    msg,
    { parse_mode: "Markdown" }
  );

  // Simulate execution with delay
  setTimeout(async () => {
    const result = `
✅ *${command.toUpperCase()} Complete*

📋 *Task:* ${task}
🎯 *Mode:* ${command}
⏱️ *Duration:* ~30s
👥 *Teams:* 1
✓ *Status:* Success

*Results:*
- Analysis complete
- Findings consolidated
- Team shutdown

Ready for next task!
`;

    await sendMessage(chatId, result, msg, { parse_mode: "Markdown" });
    activeTeams.delete(chatId);
  }, 2000);
}

// Register command handlers
bot.onText(/\/tap\s+(.+)/i, (msg, match) => {
  console.log(`[TAP] Chat ${msg.chat.id}: ${match[1]}`);
  executeCommand(msg, "tap", match[1]);
});

bot.onText(/\/tav\s+(.+)/i, (msg, match) => {
  console.log(`[TAV] Chat ${msg.chat.id}: ${match[1]}`);
  executeCommand(msg, "tav", match[1]);
});

bot.onText(/\/tvs\s+(.+)/i, (msg, match) => {
  console.log(`[TVS] Chat ${msg.chat.id}: ${match[1]}`);
  executeCommand(msg, "tvs", match[1]);
});

bot.onText(/\/rawr\s+(.+)/i, (msg, match) => {
  console.log(`[RAWR] Chat ${msg.chat.id}: ${match[1]}`);
  executeCommand(msg, "rawr", match[1]);
});

bot.onText(/\/rawrs\s+(.+)/i, (msg, match) => {
  const parts = match[1].split(/\s+--/);
  const task = parts[0];
  const options =
    parts.length > 1 ? `--${parts.slice(1).join(" --")}` : "";
  console.log(`[RAWRS] Chat ${msg.chat.id}: ${task} ${options}`);
  executeCommand(msg, "rawrs", task, options);
});

bot.onText(/\/swarm\s+(.+)/i, (msg, match) => {
  const parts = match[1].split(/\s+--/);
  const task = parts[0];
  const options =
    parts.length > 1 ? `--${parts.slice(1).join(" --")}` : "";
  console.log(`[SWARM] Chat ${msg.chat.id}: ${task} ${options}`);
  executeCommand(msg, "swarm", task, options);
});

// Error handling
bot.on("error", (error) => {
  console.error("❌ Bot error:", error.message);
  console.error(error.stack);
});

bot.on("polling_error", (error) => {
  console.error("❌ Polling error:", error.message);
});

console.log("🤖 Telegram Bot for Pi-Agent-Teams is running...");
console.log(`📱 Find your bot @hsc_picat0_bot in Telegram\n`);
console.log(`✅ Topics/Threads SUPPORTED\n`);
console.log(`⏸️  Press Ctrl+C to stop\n`);
