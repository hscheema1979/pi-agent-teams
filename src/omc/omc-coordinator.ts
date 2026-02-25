/**
 * OMC Coordinator - Orchestrates RALPH, AUTOPILOT, ULTRAWORK, SWARM engines
 */

import type { OMCEngineConfig, SwarmConfig } from "./types.js";
import {
  RalphEngine,
  AutopilotEngine,
  UltraworkEngine,
  SwarmEngine,
} from "./engines.js";
import { TeamManager } from "../state/team-manager.js";

export class OMCCoordinator {
  private ralph: RalphEngine;
  private autopilot: AutopilotEngine;
  private ultrawork: UltraworkEngine;
  private swarm: SwarmEngine;

  constructor(private teamManager: TeamManager) {
    this.ralph = new RalphEngine(teamManager);
    this.autopilot = new AutopilotEngine(teamManager);
    this.ultrawork = new UltraworkEngine(teamManager);
    this.swarm = new SwarmEngine(teamManager);
  }

  /**
   * AUTOPILOT MODE - Autonomous orchestration
   * Plans and executes without supervision
   */
  async runAutopilot(teamName: string, task: string): Promise<any> {
    console.log("[OMC] Running in AUTOPILOT mode");
    console.log(`[OMC] Team: ${teamName}`);
    console.log(`[OMC] Task: ${task}`);

    try {
      const result = await this.autopilot.run(teamName, task);
      console.log("[OMC] ✅ AUTOPILOT execution complete");
      return result;
    } catch (error) {
      console.error("[OMC] ❌ AUTOPILOT failed:", error);
      throw error;
    }
  }

  /**
   * VERIFIED MODE - Verification loops (RALPH)
   * Runs task, verifies result, iterates until correct
   */
  async runVerified(
    teamName: string,
    task: string,
    verificationFn: (result: any) => Promise<any>
  ): Promise<any> {
    console.log("[OMC] Running in VERIFIED mode (RALPH loops)");
    console.log(`[OMC] Team: ${teamName}`);
    console.log(`[OMC] Task: ${task}`);

    try {
      const result = await this.ralph.run(teamName, task, verificationFn);
      console.log("[OMC] ✅ VERIFIED execution complete");
      return result;
    } catch (error) {
      console.error("[OMC] ❌ VERIFIED failed:", error);
      throw error;
    }
  }

  /**
   * RAWR MODE - Triple engine power!
   * ralph + autopilot + ultrawork
   * Autonomous orchestration + verification loops + max parallelization
   */
  async runRAWR(teamName: string, task: string): Promise<any> {
    console.log("[OMC] Running in RAWR mode (TRIPLE ENGINE POWER!)");
    console.log(`[OMC] ralph + autopilot + ultrawork`);
    console.log(`[OMC] Team: ${teamName}`);
    console.log(`[OMC] Task: ${task}`);

    try {
      // 1. AUTOPILOT: Autonomous decomposition & planning
      console.log("[OMC] [1/3] Starting AUTOPILOT orchestration...");
      const { plan, results: autopilotResults } = await this.autopilot.run(
        teamName,
        task
      );

      // 2. ULTRAWORK: Maximum parallelization of verification
      console.log("[OMC] [2/3] Starting ULTRAWORK parallel verification...");
      const taskList = autopilotResults.map((r) => r.name);
      const { completed, failed } = await this.ultrawork.run(
        teamName,
        taskList
      );

      // 3. RALPH: Verification loop until complete
      console.log("[OMC] [3/3] Starting RALPH verification loop...");
      const verificationResult = await this.ralph.run(
        teamName,
        task,
        async (result) => {
          return {
            passed: failed.length === 0,
            checks: [
              {
                name: "Completion",
                passed: failed.length === 0,
              },
              {
                name: "Quality",
                passed: completed.length > 0,
              },
            ],
            iteration: 1,
            maxIterations: 3,
          };
        }
      );

      console.log("[OMC] ✅ RAWR execution COMPLETE (ALL ENGINES ENGAGED!)");
      return {
        mode: "rawr",
        autopilot: autopilotResults,
        ultrawork: { completed, failed },
        ralph: verificationResult,
      };
    } catch (error) {
      console.error("[OMC] ❌ RAWR failed:", error);
      throw error;
    }
  }

  /**
   * SWARM MODE - Multi-team coordination
   * Coordinates multiple teams for complex tasks
   */
  async runSwarm(
    baseTeamName: string,
    task: string,
    config: SwarmConfig
  ): Promise<any> {
    console.log("[OMC] Running in SWARM mode");
    console.log(`[OMC] Base Team: ${baseTeamName}`);
    console.log(`[OMC] Swarm Size: ${config.teamCount} teams`);
    console.log(`[OMC] Agents per Team: ${config.agentsPerTeam}`);
    console.log(`[OMC] Task: ${task}`);

    try {
      const result = await this.swarm.run(baseTeamName, task, config);
      console.log("[OMC] ✅ SWARM coordination complete");
      return result;
    } catch (error) {
      console.error("[OMC] ❌ SWARM failed:", error);
      throw error;
    }
  }

  /**
   * Auto-detect best mode based on task characteristics
   */
  async autoDetectAndRun(teamName: string, task: string): Promise<any> {
    console.log("[OMC] Auto-detecting optimal execution mode...");

    // Analyze task
    const complexity = this.analyzeTaskComplexity(task);
    const requiresVerification = this.detectVerificationNeeded(task);
    const needsParallelization = this.detectParallelizationNeeded(task);
    const requiresCoordination = this.detectSwarmNeeded(task);

    console.log(`[OMC] Task complexity: ${complexity}`);
    console.log(`[OMC] Requires verification: ${requiresVerification}`);
    console.log(`[OMC] Needs parallelization: ${needsParallelization}`);
    console.log(`[OMC] Requires swarm coordination: ${requiresCoordination}`);

    // Select mode
    if (requiresCoordination) {
      return this.runSwarm(teamName, task, {
        teamCount: 3,
        agentsPerTeam: 3,
        coordinationMode: "adaptive",
        emergenceThreshold: 0.8,
      });
    }

    if (requiresVerification && needsParallelization) {
      return this.runRAWR(teamName, task);
    }

    if (requiresVerification) {
      return this.runVerified(teamName, task, async () => ({
        passed: true,
        checks: [],
        iteration: 1,
        maxIterations: 1,
      }));
    }

    if (needsParallelization) {
      return this.runAutopilot(teamName, task);
    }

    // Default: autopilot
    return this.runAutopilot(teamName, task);
  }

  private analyzeTaskComplexity(task: string): "low" | "medium" | "high" {
    const keywords = [
      "refactor",
      "redesign",
      "migrate",
      "infrastructure",
      "security",
      "scalability",
    ];
    const hasComplexKeywords = keywords.some((kw) =>
      task.toLowerCase().includes(kw)
    );

    if (task.length > 500 || hasComplexKeywords) return "high";
    if (task.length > 200) return "medium";
    return "low";
  }

  private detectVerificationNeeded(task: string): boolean {
    const verificationKeywords = [
      "critical",
      "must",
      "ensure",
      "verify",
      "test",
      "security",
      "production",
    ];
    return verificationKeywords.some((kw) =>
      task.toLowerCase().includes(kw)
    );
  }

  private detectParallelizationNeeded(task: string): boolean {
    const parallelKeywords = [
      "multiple",
      "bulk",
      "batch",
      "all",
      "comprehensive",
      "everything",
    ];
    return parallelKeywords.some((kw) => task.toLowerCase().includes(kw));
  }

  private detectSwarmNeeded(task: string): boolean {
    const swarmKeywords = [
      "multiple teams",
      "domains",
      "cross-functional",
      "collaboration",
      "coordination",
    ];
    return swarmKeywords.some((kw) => task.toLowerCase().includes(kw));
  }

  /**
   * Get available modes
   */
  getAvailableModes(): string[] {
    return [
      "autopilot - Autonomous orchestration",
      "verified - Verification loops (RALPH)",
      "rawr - Triple engine (ralph + autopilot + ultrawork)",
      "swarm - Multi-team coordination",
      "auto - Auto-detect optimal mode",
    ];
  }
}
