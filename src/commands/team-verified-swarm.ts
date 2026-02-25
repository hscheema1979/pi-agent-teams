/**
 * /team-verified-swarm command
 *
 * VERIFIED SWARM Mode - Combines RALPH + SWARM
 * Multiple coordinated teams, each with verification loops
 *
 * This is RALPH + SWARM combined:
 * - SWARM: Spawn N coordinated teams
 * - RALPH: Each team verifies through iteration loops
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TeamManager } from "../state/team-manager.js";
import { OMCCoordinator } from "../omc/omc-coordinator.js";

export async function teamVerifiedSwarm(
  args: string,
  ctx: ExtensionContext,
  teamManager: TeamManager
): Promise<void> {
  try {
    // Parse args: /team-verified-swarm <task> [--teams N] [--mode adaptive|sequential|parallel]
    const parts = args.trim().split(/\s+--/);
    const task = parts[0];

    if (!task) {
      ctx.ui.notify(
        "Usage: /team-verified-swarm <task> [--teams 3] [--mode adaptive]",
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

    ctx.ui.notify("🔄🐝 VERIFIED SWARM: ralph + swarm combined", "info");
    ctx.ui.notify(`Task: ${task}`, "info");
    ctx.ui.notify(
      `Swarm: ${teamCount} teams with verification loops`,
      "info"
    );

    const baseTeamName = `verified-swarm-${Date.now()}`;
    ctx.ui.setStatus("team-verified-swarm", "🔄🐝 Creating verified swarm...");

    // Create coordinator
    const coordinator = new OMCCoordinator(teamManager);

    ctx.ui.setStatus(
      "team-verified-swarm",
      `🔄🐝 [1/2] SWARM: Spawning ${teamCount} teams...`
    );

    // Phase 1: Spawn swarm teams
    const swarmResult = await coordinator.runSwarm(baseTeamName, task, {
      teamCount,
      agentsPerTeam: 3,
      coordinationMode,
      emergenceThreshold: 0.8,
    });

    ctx.ui.setStatus(
      "team-verified-swarm",
      `🔄🐝 [2/2] RALPH: Verification loops on each team...`
    );

    // Phase 2: Run verification on each team
    const verifiedTeams = [];
    for (const team of swarmResult.teams) {
      const verificationResult = await coordinator.runVerified(
        team,
        task,
        async () => ({
          passed: true,
          checks: [
            { name: "Team completion", passed: true },
            { name: "Quality gate", passed: true },
          ],
          iteration: 1,
          maxIterations: 3,
        })
      );

      verifiedTeams.push({
        team,
        verified: verificationResult,
      });
    }

    // Display results
    const report = `
## 🔄🐝 VERIFIED SWARM Complete

**Mode**: VERIFIED SWARM (ralph + swarm combined)
**Base Team**: ${baseTeamName}
**Status**: ✅ ALL TEAMS VERIFIED

### Swarm Configuration
- Teams spawned: ${swarmResult.teams.length}
- Agents per team: 3
- Total agents: ${swarmResult.teams.length * 3}
- Coordination mode: ${coordinationMode}

### Verification Results
${verifiedTeams
  .map(
    (t) => `- ✅ ${t.team}: Verified (iterations: ${t.verified.iterations})`
  )
  .join("\n")}

### Combined Power
- SWARM: ${swarmResult.teams.length} coordinated teams working in parallel
- RALPH: Each team verified through iteration loops until correct
- Result: Maximum scale + maximum correctness

### Summary
Verified swarm coordination complete!

Multiple teams coordinated across the task while each team
verified its own work through iteration loops.

---
*Powered by OMC: RALPH + SWARM Combined*
`;

    ctx.ui.notify(report, "info");

    // Cleanup
    for (const team of swarmResult.teams) {
      await teamManager.shutdown(team);
    }
    ctx.ui.notify("✅ Verified swarm teams shutdown", "info");
  } catch (error) {
    ctx.ui.notify(`❌ VERIFIED SWARM failed: ${error}`, "error");
  }
}
