/**
 * /team-spawn command
 * 
 * Spawn team with preset or custom composition
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TeamManager } from "../state/team-manager.js";

export async function teamSpawn(
  args: string,
  ctx: ExtensionContext,
  teamManager: TeamManager
): Promise<void> {
  ctx.ui.notify("⚠️ /team-spawn not yet implemented", "warning");
  ctx.ui.notify(
    "Usage: /team-spawn [review|debug|feature|security|research|migration|custom]",
    "info"
  );
}
