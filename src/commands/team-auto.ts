/**
 * /team-auto command
 *
 * AUTOPILOT Mode - Autonomous orchestration
 * Plans and executes without supervision
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TeamManager } from "../state/team-manager.js";
import { OMCCoordinator } from "../omc/omc-coordinator.js";

export async function teamAuto(
  args: string,
  ctx: ExtensionContext,
  teamManager: TeamManager
): Promise<void> {
  try {
    const task = args.trim();

    if (!task) {
      ctx.ui.notify("Usage: /team-auto <task description>", "error");
      return;
    }

    ctx.ui.notify("🤖 AUTOPILOT: Autonomous execution mode", "info");
    ctx.ui.notify(`Task: ${task}`, "info");

    const teamName = `auto-${Date.now()}`;
    ctx.ui.setStatus("team-auto", "Creating autonomous team...");

    // Create coordinator and run autopilot
    const coordinator = new OMCCoordinator(teamManager);

    ctx.ui.setStatus("team-auto", "AUTOPILOT: Decomposing task...");
    const result = await coordinator.runAutopilot(teamName, task);

    ctx.ui.setStatus("team-auto", "AUTOPILOT: Executing plan...");

    // Display results
    const report = `
## 🤖 AUTOPILOT Execution Complete

**Mode**: AUTOPILOT (Autonomous Orchestration)
**Team**: ${teamName}
**Status**: ✅ Complete

### Execution Plan
- Steps: ${result.plan.steps.length}
- Estimated Time: ${result.plan.estimatedTime}s
- Parallel Groups: ${result.plan.parallelGroups.length}

### Results
${result.results.map((r: any) => `- ✅ ${r.name}: ${r.status}`).join("\n")}

### Summary
Autonomous orchestration completed successfully.
All subtasks executed without supervision.

---
*Powered by OMC AUTOPILOT*
`;

    ctx.ui.notify(report, "info");

    // Cleanup
    await teamManager.shutdown(teamName);
    ctx.ui.notify("✅ AUTOPILOT team shutdown", "info");
  } catch (error) {
    ctx.ui.notify(`❌ AUTOPILOT failed: ${error}`, "error");
  }
}
