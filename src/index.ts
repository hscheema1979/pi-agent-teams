/**
 * pi-agent-teams Extension
 * 
 * Multi-agent orchestration for pi: parallel code reviews, hypothesis-driven debugging,
 * and coordinated feature development.
 * 
 * Ported from Claude Code's Agent Teams plugin.
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { TeamManager } from "./state/team-manager.js";
import * as commands from "./commands/index.js";

// Global team manager singleton
let teamManager: TeamManager;

export default function (pi: ExtensionAPI) {
  // Initialize team manager on session start
  pi.on("session_start", async (_event, ctx) => {
    try {
      teamManager = new TeamManager();
      await teamManager.loadTeams();
      ctx.ui.notify("🤝 Agent Teams loaded and ready", "info");
    } catch (error) {
      ctx.ui.notify(`Failed to load Agent Teams: ${error}`, "error");
    }
  });

  // ============================================================================
  // CUSTOM TOOLS
  // ============================================================================

  /**
   * Spawn an agent to join a team
   */
  pi.registerTool({
    name: "spawnAgent",
    label: "Spawn Agent",
    description: "Spawn a team member agent for parallel work",
    parameters: Type.Object({
      teamName: Type.String({ description: "Team identifier" }),
      agentName: Type.String({ description: "Unique agent name in team" }),
      role: Type.Union([
        Type.Literal("team-lead"),
        Type.Literal("team-reviewer"),
        Type.Literal("team-debugger"),
        Type.Literal("team-implementer"),
      ], { description: "Agent role/type" }),
      systemPrompt: Type.String({ description: "System prompt for agent" }),
      initialTask: Type.String({ description: "Initial task description" }),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      try {
        const { sessionId, process: proc } = await teamManager.spawnAgent(
          params.teamName,
          params.agentName,
          params.role as any,
          params.systemPrompt,
          params.initialTask
        );

        return {
          content: [
            {
              type: "text",
              text: `✅ Agent spawned: ${params.agentName}\n\nSession ID: ${sessionId}\nProcess ID: ${proc.pid}`,
            },
          ],
          details: { sessionId, processId: proc.pid },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to spawn agent: ${error}`,
            },
          ],
          details: {},
        };
      }
    },
  });

  /**
   * Get status of a team
   */
  pi.registerTool({
    name: "getTeamStatus",
    label: "Get Team Status",
    description: "Get current status of a team and its members",
    parameters: Type.Object({
      teamName: Type.String({ description: "Team name" }),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      try {
        const team = teamManager.getTeam(params.teamName);
        if (!team) {
          return {
            content: [
              {
                type: "text",
                text: `Team '${params.teamName}' not found. Active teams: ${teamManager
                  .getAllTeams()
                  .map((t) => t.name)
                  .join(", ") || "none"}`,
              },
            ],
            details: {},
          };
        }

        const status = {
          name: team.name,
          status: team.status,
          createdAt: team.createdAt.toISOString(),
          members: team.members.map((m) => ({
            name: m.name,
            role: m.role,
            status: m.status,
            ownedFiles: m.ownedFiles?.length || 0,
          })),
          tasks: team.tasks.map((t) => ({
            id: t.id,
            status: t.status,
            description: t.description,
          })),
          resultsCount: team.results.size,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(status, null, 2),
            },
          ],
          details: {},
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting team status: ${error}`,
            },
          ],
          details: {},
        };
      }
    },
  });

  /**
   * Send message to agent(s)
   */
  pi.registerTool({
    name: "sendAgentMessage",
    label: "Send Message to Agent",
    description: "Send a message to team member(s)",
    parameters: Type.Object({
      teamName: Type.String({ description: "Team name" }),
      recipientName: Type.Optional(Type.String({ description: "Agent name (omit for broadcast)" })),
      message: Type.String({ description: "Message content" }),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      try {
        const sent = await teamManager.sendMessage(
          params.teamName,
          params.recipientName,
          params.message
        );

        return {
          content: [
            {
              type: "text",
              text: `✅ Message sent to ${sent} recipient(s)`,
            },
          ],
          details: {},
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error sending message: ${error}`,
            },
          ],
          details: {},
        };
      }
    },
  });

  // ============================================================================
  // COMMANDS
  // ============================================================================

  pi.registerCommand("team-review", {
    description: "Launch multi-reviewer parallel code review",
    handler: async (args, ctx) => {
      await commands.teamReview(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-debug", {
    description: "Hypothesis-driven debugging with competing investigations",
    handler: async (args, ctx) => {
      await commands.teamDebug(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-feature", {
    description: "Parallel feature development with file ownership",
    handler: async (args, ctx) => {
      await commands.teamFeature(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-spawn", {
    description: "Spawn a custom team with preset or custom composition",
    handler: async (args, ctx) => {
      await commands.teamSpawn(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-status", {
    description: "Show team status and progress",
    handler: async (args, ctx) => {
      await commands.teamStatus(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-shutdown", {
    description: "Gracefully shut down a team",
    handler: async (args, ctx) => {
      await commands.teamShutdown(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-delegate", {
    description: "Interactive task delegation dashboard",
    handler: async (args, ctx) => {
      await commands.teamDelegate(args, ctx, teamManager);
    },
  });

  // ============================================================================
  // OMC ENGINE COMMANDS
  // ============================================================================

  pi.registerCommand("team-auto", {
    description: "🤖 AUTOPILOT - Autonomous orchestration (OMC)",
    handler: async (args, ctx) => {
      await commands.teamAuto(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-verified", {
    description: "🔄 RALPH - Verification loops (OMC)",
    handler: async (args, ctx) => {
      await commands.teamVerified(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-rawr", {
    description: "🐯 RAWR - Triple engine power! (ralph + autopilot + ultrawork)",
    handler: async (args, ctx) => {
      await commands.teamRAWR(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-swarm", {
    description: "🐝 SWARM - Multi-team coordination (OMC)",
    handler: async (args, ctx) => {
      await commands.teamSwarm(args, ctx, teamManager);
    },
  });

  // ============================================================================
  // SHORTHAND ALIASES (3-letter + special)
  // ============================================================================

  pi.registerCommand("tap", {
    description: "🤖 tap: AUTOPILOT autonomous mode",
    handler: async (args, ctx) => {
      await commands.teamAuto(args, ctx, teamManager);
    },
  });

  pi.registerCommand("tav", {
    description: "🔄 tav: RALPH verification loops",
    handler: async (args, ctx) => {
      await commands.teamVerified(args, ctx, teamManager);
    },
  });

  pi.registerCommand("rawr", {
    description: "🐯 rawr: RAWR triple engine (ralph + autopilot + ultrawork)",
    handler: async (args, ctx) => {
      await commands.teamRAWR(args, ctx, teamManager);
    },
  });

  pi.registerCommand("swarm", {
    description: "🐝 swarm: SWARM multi-team coordination",
    handler: async (args, ctx) => {
      await commands.teamSwarm(args, ctx, teamManager);
    },
  });

  // ============================================================================
  // COMBINED MODES (Multiple engines)
  // ============================================================================

  pi.registerCommand("tvs", {
    description: "🔄🐝 tvs: RALPH + SWARM combined - Multiple verified teams",
    handler: async (args, ctx) => {
      await commands.teamVerifiedSwarm(args, ctx, teamManager);
    },
  });

  pi.registerCommand("rawrs", {
    description: "🐯🐝 rawrs: ULTIMATE POWER - RAWR + SWARM (all 4 engines)",
    handler: async (args, ctx) => {
      await commands.teamRAWRS(args, ctx, teamManager);
    },
  });
}
