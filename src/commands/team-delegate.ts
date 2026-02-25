/**
 * /team-delegate command
 * 
 * Interactive task delegation dashboard
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TeamManager } from "../state/team-manager.js";

export async function teamDelegate(
  args: string,
  ctx: ExtensionContext,
  teamManager: TeamManager
): Promise<void> {
  ctx.ui.notify("⚠️ /team-delegate not yet implemented", "warning");
  ctx.ui.notify("Usage: /team-delegate [--rebalance]", "info");
}
