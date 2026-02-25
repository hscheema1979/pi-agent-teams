/**
 * TeamManager - Manages multi-agent teams lifecycle
 * 
 * Handles:
 * - Team creation and member spawning
 * - Team state persistence
 * - Agent process management
 * - Task tracking
 * - Result collection
 */

import { spawn, ChildProcess } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { EventEmitter } from "node:events";

export interface TeamMember {
  id: string;
  name: string;
  role: "team-lead" | "team-reviewer" | "team-debugger" | "team-implementer";
  sessionId: string;
  status: "idle" | "working" | "done" | "error";
  process?: ChildProcess;
  ownedFiles?: string[];
  lastUpdate?: Date;
}

export interface Task {
  id: string;
  memberId: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  blockedBy?: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface Team {
  name: string;
  members: TeamMember[];
  tasks: Task[];
  status: "active" | "idle" | "shutdown";
  createdAt: Date;
  results: Map<string, unknown>;
  configDir: string;
}

export class TeamManager extends EventEmitter {
  private teams: Map<string, Team> = new Map();
  private baseDir: string;
  private processMap: Map<string, ChildProcess> = new Map();

  constructor() {
    super();
    this.baseDir = path.join(process.env.HOME || "/", ".pi", "teams");
  }

  /**
   * Load existing teams from disk
   */
  async loadTeams(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      const entries = await fs.readdir(this.baseDir);

      for (const entry of entries) {
        const configPath = path.join(this.baseDir, entry, "state.json");
        try {
          const data = await fs.readFile(configPath, "utf-8");
          const state = JSON.parse(data);
          const team: Team = {
            ...state,
            createdAt: new Date(state.createdAt),
            results: new Map(state.results || []),
            configDir: path.join(this.baseDir, entry),
            members: state.members.map((m: any) => ({
              ...m,
              lastUpdate: m.lastUpdate ? new Date(m.lastUpdate) : undefined,
              process: undefined, // Don't serialize processes
            })),
            tasks: state.tasks.map((t: any) => ({
              ...t,
              createdAt: new Date(t.createdAt),
              completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
            })),
          };
          this.teams.set(team.name, team);
        } catch (e) {
          console.warn(`Failed to load team config from ${entry}:`, e);
        }
      }
    } catch (e) {
      console.warn("Failed to load teams:", e);
    }
  }

  /**
   * Spawn a new agent as part of a team
   */
  async spawnAgent(
    teamName: string,
    agentName: string,
    role: TeamMember["role"],
    systemPrompt: string,
    initialTask: string
  ): Promise<{ sessionId: string; process: ChildProcess }> {
    // Get or create team
    let team = this.teams.get(teamName);
    if (!team) {
      team = {
        name: teamName,
        members: [],
        tasks: [],
        status: "active",
        createdAt: new Date(),
        results: new Map(),
        configDir: path.join(this.baseDir, teamName),
      };
      this.teams.set(teamName, team);
      await fs.mkdir(team.configDir, { recursive: true });
    }

    // Generate session ID
    const sessionId = `${teamName}-${agentName}-${Date.now()}`;

    // Create member
    const member: TeamMember = {
      id: sessionId,
      name: agentName,
      role,
      sessionId,
      status: "idle",
      lastUpdate: new Date(),
      ownedFiles: [],
    };

    team.members.push(member);

    // Create task
    const taskId = `task-${Date.now()}`;
    const task: Task = {
      id: taskId,
      memberId: sessionId,
      description: initialTask,
      status: "pending",
      createdAt: new Date(),
    };
    team.tasks.push(task);

    // Spawn pi subprocess
    const sessionFile = path.join(team.configDir, `${agentName}.session`);
    const process = spawn("pi", ["--session", sessionFile], {
      stdio: ["pipe", "pipe", "pipe"],
      detached: false,
      env: {
        ...process.env,
        AGENT_TEAMS_ROLE: role,
        AGENT_TEAMS_NAME: agentName,
        AGENT_TEAMS_TEAM: teamName,
      },
    });

    member.process = process;
    this.processMap.set(sessionId, process);

    // Send initial setup to agent
    if (process.stdin) {
      const setupMessage = {
        type: "agent-setup",
        systemPrompt,
        task: initialTask,
        role,
      };
      process.stdin.write(JSON.stringify(setupMessage) + "\n");
    }

    // Handle output
    process.stdout?.on("data", (data) => {
      this.emit("agent-output", {
        agentId: sessionId,
        agentName,
        output: data.toString(),
      });
    });

    process.stderr?.on("data", (data) => {
      this.emit("agent-error", {
        agentId: sessionId,
        agentName,
        error: data.toString(),
      });
    });

    process.on("exit", async (code) => {
      member.status = code === 0 ? "done" : "error";
      member.lastUpdate = new Date();
      task.status = code === 0 ? "completed" : "failed";
      if (code === 0) {
        task.completedAt = new Date();
      }
      this.processMap.delete(sessionId);
      await this.saveTeamState(team!);
      this.emit("agent-exit", {
        agentId: sessionId,
        agentName,
        code,
      });
    });

    // Save state
    await this.saveTeamState(team);

    return { sessionId, process };
  }

  /**
   * Save team state to disk
   */
  async saveTeamState(team: Team): Promise<void> {
    const state = {
      name: team.name,
      members: team.members.map((m) => ({
        ...m,
        process: undefined,
      })),
      tasks: team.tasks,
      status: team.status,
      createdAt: team.createdAt.toISOString(),
      results: Array.from(team.results.entries()),
    };

    const statePath = path.join(team.configDir, "state.json");
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
  }

  /**
   * Send message to agent(s)
   */
  async sendMessage(teamName: string, recipientName?: string, message?: string): Promise<number> {
    const team = this.teams.get(teamName);
    if (!team) throw new Error(`Team '${teamName}' not found`);

    const recipients = recipientName
      ? team.members.filter((m) => m.name === recipientName)
      : team.members;

    for (const member of recipients) {
      if (member.process?.stdin) {
        const msg = {
          type: "message",
          from: "lead",
          to: member.name,
          content: message,
        };
        member.process.stdin.write(JSON.stringify(msg) + "\n");
      }
    }

    return recipients.length;
  }

  /**
   * Get team by name
   */
  getTeam(name: string): Team | undefined {
    return this.teams.get(name);
  }

  /**
   * Get all teams
   */
  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  /**
   * Shutdown team gracefully
   */
  async shutdown(teamName: string): Promise<void> {
    const team = this.teams.get(teamName);
    if (!team) return;

    // Send shutdown message to all members
    for (const member of team.members) {
      if (member.process?.stdin) {
        member.process.stdin.write(
          JSON.stringify({
            type: "shutdown",
            save_results: true,
          }) + "\n"
        );
      }
    }

    // Wait a bit for graceful shutdown
    await new Promise((r) => setTimeout(r, 1000));

    // Kill remaining processes
    for (const member of team.members) {
      if (member.process && !member.process.killed) {
        member.process.kill();
      }
    }

    team.status = "shutdown";
    await this.saveTeamState(team);
  }

  /**
   * Delete team (cleanup)
   */
  async delete(teamName: string): Promise<void> {
    await this.shutdown(teamName);
    const team = this.teams.get(teamName);
    if (team?.configDir) {
      try {
        await fs.rm(team.configDir, { recursive: true, force: true });
      } catch (e) {
        console.warn(`Failed to delete team directory: ${e}`);
      }
    }
    this.teams.delete(teamName);
  }

  /**
   * Update team results
   */
  addResult(teamName: string, key: string, result: unknown): void {
    const team = this.teams.get(teamName);
    if (team) {
      team.results.set(key, result);
    }
  }

  /**
   * Get team results
   */
  getResults(teamName: string): Record<string, unknown> {
    const team = this.teams.get(teamName);
    if (!team) return {};
    return Object.fromEntries(team.results);
  }
}
