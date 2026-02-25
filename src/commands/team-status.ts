/**
 * /team-status command
 * 
 * Show team status and progress
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TeamManager } from "../state/team-manager.js";

export async function teamStatus(
  args: string,
  ctx: ExtensionContext,
  teamManager: TeamManager
): Promise<void> {
  const teamName = args.trim() || "";

  if (!teamName) {
    const teams = teamManager.getAllTeams();
    if (teams.length === 0) {
      ctx.ui.notify("No active teams", "info");
      return;
    }

    const report = teams
      .map(
        (t) =>
          `${t.name}: ${t.status} (${t.members.length} members, ${t.tasks.length} tasks)`
      )
      .join("\n");

    ctx.ui.notify(`Active Teams:\n${report}`, "info");
    return;
  }

  const team = teamManager.getTeam(teamName);
  if (!team) {
    ctx.ui.notify(`Team '${teamName}' not found`, "error");
    return;
  }

  const memberStatus = team.members
    .map((m) => `  ${m.name} (${m.role}): ${m.status}`)
    .join("\n");

  const taskStatus = team.tasks
    .map((t) => `  ${t.id}: ${t.status}`)
    .join("\n");

  const report = `
Team: ${team.name}
Status: ${team.status}
Created: ${team.createdAt.toISOString()}

Members (${team.members.length}):
${memberStatus}

Tasks (${team.tasks.length}):
${taskStatus}

Results: ${team.results.size}
`;

  ctx.ui.notify(report, "info");
}
