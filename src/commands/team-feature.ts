/**
 * /team-feature command
 * 
 * Parallel feature development with file ownership
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TeamManager } from "../state/team-manager.js";

export async function teamFeature(
  args: string,
  ctx: ExtensionContext,
  teamManager: TeamManager
): Promise<void> {
  ctx.ui.notify("⚠️ /team-feature not yet implemented", "warning");
  ctx.ui.notify("Usage: /team-feature <description> [--team-size 3] [--plan-first]", "info");
}
