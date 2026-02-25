/**
 * /team-swarm command
 *
 * SWARM Mode - Multi-team coordination
 * Coordinates multiple teams for complex tasks
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TeamManager } from "../state/team-manager.js";
import { OMCCoordinator } from "../omc/omc-coordinator.js";

export async function teamSwarm(
  args: string,
  ctx: ExtensionContext,
  teamManager: TeamManager
): Promise<void> {
  try {
    // Parse args: /team-swarm <task> [--teams N] [--mode adaptive|sequential|parallel]
    const parts = args.trim().split(/\s+--/);
    const task = parts[0];

    if (!task) {
      ctx.ui.notify(
        "Usage: /team-swarm <task> [--teams 3] [--mode adaptive|sequential|parallel]",
        "error"
      );
      return;
    }

    // Parse options
    let teamCount = 3;
    let coordinationMode: "sequential" | "parallel" | "adaptive" = "adaptive";

    for (let i = 1; i < parts.length; i++) {
      const option = parts[i];
      if (option.startsWith("teams")) {
        teamCount = parseInt(option.split(" ")[1]) || 3;
      } else if (option.startsWith("mode")) {
        const mode = option.split(" ")[1];
        if (["sequential", "parallel", "adaptive"].includes(mode)) {
          coordinationMode = mode as any;
        }
      }
    }

    ctx.ui.notify("🐝 SWARM: Multi-team coordination mode", "info");
    ctx.ui.notify(`Task: ${task}`, "info");
    ctx.ui.notify(
      `Swarm: ${teamCount} teams in ${coordinationMode} mode`,
      "info"
    );

    const baseTeamName = `swarm-${Date.now()}`;
    ctx.ui.setStatus("team-swarm", "🐝 Creating swarm teams...");

    // Create coordinator and run swarm mode
    const coordinator = new OMCCoordinator(teamManager);

    ctx.ui.setStatus("team-swarm", `🐝 Spawning ${teamCount} teams...`);

    const result = await coordinator.runSwarm(baseTeamName, task, {
      teamCount,
      agentsPerTeam: 3,
      coordinationMode,
      emergenceThreshold: 0.8,
    });

    // Display results
    const teamList = result.teams.map((t: string) => `- ${t}: Processing`).join("\n");

    const report = `
## 🐝 SWARM Coordination Complete

**Mode**: SWARM (Multi-Team Coordination)
**Base Team**: ${baseTeamName}
**Status**: ✅ Coordinated

### Swarm Configuration
- Teams spawned: ${result.teams.length}
- Agents per team: 3
- Coordination mode: ${coordinationMode}
- Total agents: ${result.teams.length * 3}

### Teams in Swarm
${teamList}

### Coordination Results
${result.results.map((r: any) => `- ✅ ${r.team}: ${r.status}`).join("\n")}

### Swarm Dynamics
- Emergence detection: Enabled
- Emergence threshold: 0.8
- Adaptive rebalancing: ${coordinationMode === "adaptive" ? "Enabled" : "Disabled"}
- Cross-team communication: Active

### Summary
Swarm coordination succeeded with ${result.teams.length} coordinated teams.
Multiple agents working together to solve the problem.

---
*Powered by OMC SWARM*
`;

    ctx.ui.notify(report, "info");

    // Cleanup
    for (const team of result.teams) {
      await teamManager.shutdown(team);
    }
    ctx.ui.notify("✅ Swarm teams shutdown", "info");
  } catch (error) {
    ctx.ui.notify(`❌ SWARM failed: ${error}`, "error");
  }
}
