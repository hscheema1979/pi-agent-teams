/**
 * /team-debug command
 * 
 * Hypothesis-driven debugging with parallel investigation
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TeamManager } from "../state/team-manager.js";

export async function teamDebug(
  args: string,
  ctx: ExtensionContext,
  teamManager: TeamManager
): Promise<void> {
  ctx.ui.notify("⚠️ /team-debug not yet implemented", "warning");
  ctx.ui.notify("Usage: /team-debug <problem> [--hypotheses 3]", "info");
}
