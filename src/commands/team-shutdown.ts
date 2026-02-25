/**
 * /team-shutdown command
 * 
 * Gracefully shut down a team
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TeamManager } from "../state/team-manager.js";

export async function teamShutdown(
  args: string,
  ctx: ExtensionContext,
  teamManager: TeamManager
): Promise<void> {
  const teamName = args.trim();

  if (!teamName) {
    ctx.ui.notify("Usage: /team-shutdown <team-name>", "error");
    return;
  }

  const team = teamManager.getTeam(teamName);
  if (!team) {
    ctx.ui.notify(`Team '${teamName}' not found`, "error");
    return;
  }

  ctx.ui.setStatus("team-shutdown", "Shutting down...");
  try {
    await teamManager.shutdown(teamName);
    ctx.ui.notify(`✅ Team '${teamName}' shut down successfully`, "info");
  } catch (e) {
    ctx.ui.notify(`Failed to shutdown team: ${e}`, "error");
  }
}
