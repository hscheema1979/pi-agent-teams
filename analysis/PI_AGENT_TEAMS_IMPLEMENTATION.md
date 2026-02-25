# Pi Agent Teams: Implementation Guide

Practical guide for adapting Agent Teams to pi.

---

## Architecture Diagram

### Current: Claude Code Agent Teams
```
┌─────────────────────────────────────────────┐
│         Claude Code Editor                   │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  /team-review command                │   │
│  └──────────────────────────────────────┘   │
│         │                                    │
│         └──► Teammate API                   │
│              (native spawn/lifecycle)        │
│              │         │         │           │
│         ┌────┴─────┬───┴────┬───┴────┐      │
│         │          │        │        │      │
│      Security  Performance Arch  Testing    │
│      Agent     Agent        Agent  Agent    │
│      (tmux/iTerm2 windows)                  │
│              │         │        │ │         │
│              └─────────┴────┬───┴─┘         │
│                       Result Collection    │
│                       (consolidated report) │
│                                              │
└─────────────────────────────────────────────┘
```

### Proposed: Pi Agent Teams
```
┌──────────────────────────────────────────────────┐
│           Pi Coding Agent                         │
├──────────────────────────────────────────────────┤
│                                                   │
│  Extension System                                │
│  ┌────────────────────────────────────────────┐  │
│  │ agent-teams/index.ts                       │  │
│  │ ┌──────────────────────────────────────┐   │  │
│  │ │ registerCommand("team-review")       │   │  │
│  │ │ registerTool("spawnAgent")           │   │  │
│  │ │ registerSkill("team-composition")    │   │  │
│  │ └──────────────────────────────────────┘   │  │
│  │  │                                          │  │
│  │  ├─► spawnAgent() custom tool              │  │
│  │  │    (spawn pi subprocess)                │  │
│  │  │    ┌──────────┬──────────┬──────────┐   │  │
│  │  │    │ Security │Perf     │ Arch     │   │  │
│  │  │    │ Review   │ Review  │ Review   │   │  │
│  │  │    │ Session  │ Session │ Session  │   │  │
│  │  │    └──────────┴──────────┴──────────┘   │  │
│  │  │       (concurrent processes)            │  │
│  │  │                                         │  │
│  │  └─► team-manager.ts                       │  │
│  │      (lifecycle + state)                   │  │
│  │                                            │  │
│  │  ~/.pi/teams/{name}/                       │  │
│  │  ├── state.json (team status)              │  │
│  │  ├── members.json (agent info)             │  │
│  │  └── results.json (findings)               │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  Standard Tools Available                        │
│  - Read, Write, Edit, Bash                       │
│  - Glob, Grep (file search)                      │
│  + Custom: spawnAgent, getTeamStatus, etc.       │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## Implementation Examples

### 1. Extension Entry Point

**File**: `~/.pi/agent/extensions/agent-teams/index.ts`

```typescript
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { TeamManager } from "./state/team-manager";
import * as commands from "./commands";

// Global team manager singleton
let teamManager: TeamManager;

export default function (pi: ExtensionAPI) {
  // Initialize team manager on session start
  pi.on("session_start", async (event, ctx) => {
    teamManager = new TeamManager();
    await teamManager.loadTeams();
    ctx.ui.notify("Agent Teams ready", "info");
  });

  // Register custom tools
  pi.registerTool({
    name: "spawnAgent",
    label: "Spawn Agent",
    description: "Spawn a team member agent",
    parameters: Type.Object({
      teamName: Type.String({ description: "Team name" }),
      agentName: Type.String({ description: "Agent identifier" }),
      role: Type.Enum(["team-lead", "team-reviewer", "team-debugger", "team-implementer"]),
      systemPrompt: Type.String({ description: "System prompt for agent" }),
      initialTask: Type.String({ description: "Initial task description" }),
      tools: Type.Optional(Type.Array(Type.String())),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const { sessionId, process } = await teamManager.spawnAgent(
        params.teamName,
        params.agentName,
        params.role,
        params.systemPrompt,
        params.initialTask
      );

      return {
        content: [
          {
            type: "text",
            text: `Agent spawned: ${params.agentName}\nSession ID: ${sessionId}`,
          },
        ],
        details: { sessionId, processId: process.pid },
      };
    },
  });

  pi.registerTool({
    name: "getTeamStatus",
    label: "Get Team Status",
    description: "Get status of a team",
    parameters: Type.Object({
      teamName: Type.String({ description: "Team name" }),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const team = teamManager.getTeam(params.teamName);
      if (!team) {
        return {
          content: [{ type: "text", text: `Team '${params.teamName}' not found` }],
        };
      }

      const status = {
        name: team.name,
        members: team.members.map(m => ({
          name: m.name,
          role: m.role,
          status: m.status,
        })),
        overallStatus: team.status,
        createdAt: team.createdAt.toISOString(),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
      };
    },
  });

  // Register commands
  pi.registerCommand("team-review", {
    description: "Launch multi-reviewer code review",
    handler: async (args, ctx) => {
      await commands.teamReview(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-debug", {
    description: "Hypothesis-driven debugging",
    handler: async (args, ctx) => {
      await commands.teamDebug(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-feature", {
    description: "Parallel feature development",
    handler: async (args, ctx) => {
      await commands.teamFeature(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-status", {
    description: "Show team status and progress",
    handler: async (args, ctx) => {
      await commands.teamStatus(args, ctx, teamManager);
    },
  });

  pi.registerCommand("team-shutdown", {
    description: "Gracefully shut down a team",
    handler: async (args, ctx) => {
      await commands.teamShutdown(args, ctx, teamManager);
    },
  });
}
```

---

### 2. Team Manager (State Management)

**File**: `~/.pi/agent/extensions/agent-teams/state/team-manager.ts`

```typescript
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
}

export interface Task {
  id: string;
  memberId: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  blockedBy?: string[];
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

  constructor() {
    super();
    this.baseDir = path.join(process.env.HOME || "/", ".pi", "teams");
  }

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
          };
          this.teams.set(team.name, team);
        } catch (e) {
          // Skip invalid team configs
        }
      }
    } catch (e) {
      console.warn("Failed to load teams:", e);
    }
  }

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
      ownedFiles: [],
    };

    team.members.push(member);

    // Spawn pi subprocess
    const process = spawn("pi", [
      "--session", 
      path.join(team.configDir, `${agentName}.session`),
    ], {
      stdio: ["pipe", "pipe", "pipe"],
      detached: false,
    });

    member.process = process;

    // Set up communication
    if (process.stdin) {
      // Send initial system prompt + task
      const message = {
        type: "agent-setup",
        systemPrompt,
        task: initialTask,
      };
      process.stdin.write(JSON.stringify(message) + "\n");
    }

    // Handle output
    process.stdout?.on("data", (data) => {
      this.emit("agent-output", {
        agentId: sessionId,
        output: data.toString(),
      });
    });

    process.on("exit", async (code) => {
      member.status = code === 0 ? "done" : "error";
      await this.saveTeamState(team!);
    });

    // Save state
    await this.saveTeamState(team);

    return { sessionId, process };
  }

  async saveTeamState(team: Team): Promise<void> {
    const state = {
      name: team.name,
      members: team.members.map(m => ({
        ...m,
        process: undefined, // Don't serialize process
      })),
      tasks: team.tasks,
      status: team.status,
      createdAt: team.createdAt.toISOString(),
      results: Array.from(team.results.entries()),
    };

    const statePath = path.join(team.configDir, "state.json");
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
  }

  getTeam(name: string): Team | undefined {
    return this.teams.get(name);
  }

  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  async shutdown(teamName: string): Promise<void> {
    const team = this.teams.get(teamName);
    if (!team) return;

    // Kill all member processes
    for (const member of team.members) {
      if (member.process && !member.process.killed) {
        member.process.kill();
      }
    }

    team.status = "shutdown";
    await this.saveTeamState(team);
  }
}
```

---

### 3. Command Implementation: Team Review

**File**: `~/.pi/agent/extensions/agent-teams/commands/team-review.ts`

```typescript
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TeamManager } from "../state/team-manager";
import { getReviewerSystemPrompt } from "../agents/team-reviewer";

export async function teamReview(
  args: string,
  ctx: ExtensionContext,
  teamManager: TeamManager
): Promise<void> {
  // Parse arguments: /team-review <target> [--reviewers dim1,dim2,...]
  const parts = args.split(" ");
  const target = parts[0];
  
  const reviewersArg = parts.find(p => p.startsWith("--reviewers"));
  const dimensions = reviewersArg 
    ? reviewersArg.split("=")[1]?.split(",") 
    : ["security", "performance", "architecture"];

  if (!target) {
    ctx.ui.notify("Usage: /team-review <path> [--reviewers sec,perf,arch]", "error");
    return;
  }

  ctx.ui.notify(`Starting review of ${target}...`, "info");

  const teamName = `review-${Date.now()}`;
  const reviewers = [];

  try {
    // Phase 1: Prepare context
    ctx.ui.setStatus("team-review", "Reading files...");
    const fileContent = await ctx.tools.read(target);

    // Phase 2: Spawn reviewers
    for (const dimension of dimensions) {
      ctx.ui.setStatus("team-review", `Spawning ${dimension} reviewer...`);

      const systemPrompt = getReviewerSystemPrompt(dimension);
      const initialTask = `Review the following code for ${dimension} issues:\n\n${fileContent}`;

      const { sessionId } = await ctx.tools.spawnAgent({
        teamName,
        agentName: `${dimension}-reviewer`,
        role: "team-reviewer",
        systemPrompt,
        initialTask,
      });

      reviewers.push({
        dimension,
        sessionId,
      });
    }

    // Phase 3: Monitor progress
    ctx.ui.setStatus("team-review", "Waiting for reviewers to complete...");
    
    const results: Record<string, unknown> = {};
    
    for (const reviewer of reviewers) {
      // Poll for completion (in real impl, would use better signaling)
      let attempts = 0;
      while (attempts < 60) {
        const status = await ctx.tools.getTeamStatus({ teamName });
        const member = (status as any).members?.find(
          (m: any) => m.name === `${reviewer.dimension}-reviewer`
        );

        if (member?.status === "done") {
          // Collect results
          results[reviewer.dimension] = await collectResults(
            reviewer.sessionId,
            ctx
          );
          break;
        }

        await new Promise(r => setTimeout(r, 1000));
        attempts++;
      }
    }

    // Phase 4: Synthesize findings
    ctx.ui.setStatus("team-review", "Synthesizing report...");
    const report = synthesizeReviewFindings(results);

    // Display report
    ctx.ui.notify(report, "info");

    // Phase 5: Cleanup
    await teamManager.shutdown(teamName);
    ctx.ui.notify("Review complete and team shut down", "success");

  } catch (error) {
    ctx.ui.notify(`Review failed: ${error}`, "error");
    await teamManager.shutdown(teamName);
  }
}

async function collectResults(
  sessionId: string,
  ctx: ExtensionContext
): Promise<unknown> {
  // Read results from session file or state
  // This is simplified; real impl would query agent state
  return { findings: [] };
}

function synthesizeReviewFindings(
  results: Record<string, unknown>
): string {
  // Deduplicate findings across reviewers
  // Group by severity
  // Format as markdown report
  return `
## Code Review Report

### Critical Issues
- (findings here)

### High Priority
- (findings here)

### Medium Priority
- (findings here)
`;
}
```

---

### 4. Agent System Prompts

**File**: `~/.pi/agent/extensions/agent-teams/agents/team-reviewer.ts`

```typescript
export function getReviewerSystemPrompt(dimension: string): string {
  const basePrompt = `You are a specialized code reviewer focused on ${dimension} quality.

## Your Role
You are part of a multi-reviewer team. Each reviewer focuses on a specific quality dimension.
Your dimension: **${dimension}**

## Focus Areas
${getFocusAreas(dimension)}

## Output Format
For each finding, provide:
\`\`\`
### [SEVERITY] Issue Title
**Location**: path/to/file.ts:42
**Dimension**: ${dimension}
**Severity**: Critical | High | Medium | Low

**Evidence**: What was found

**Impact**: What could go wrong

**Fix**: Specific, actionable remediation
\`\`\`

## Important
- Stay strictly within your dimension
- Cite specific file:line locations
- Provide evidence-based severity ratings
- Suggest concrete fixes, not vague recommendations
- Report honestly if you find no issues in your dimension
`;

  return basePrompt;
}

function getFocusAreas(dimension: string): string {
  const areas: Record<string, string> = {
    security: `
- Input validation and sanitization
- Authentication and authorization
- SQL injection, XSS, CSRF vulnerabilities
- Secrets and credential exposure
- Dependency vulnerabilities
- Insecure cryptographic usage`,

    performance: `
- Database query efficiency (N+1, missing indexes)
- Memory allocation and potential leaks
- Unnecessary computation
- Caching opportunities
- Async/concurrent programming correctness
- Algorithm complexity analysis`,

    architecture: `
- SOLID principle adherence
- Separation of concerns
- Dependency direction and cycles
- API contract design
- Error handling consistency
- Abstraction appropriateness`,
  };

  return areas[dimension] || "General code quality";
}

export function getLeadSystemPrompt(): string {
  return `You are a team lead specializing in coordinating multi-agent teams.

## Your Responsibilities
1. Decompose work into parallel tasks
2. Assign tasks to team members
3. Monitor progress
4. Collect and synthesize results
5. Manage team lifecycle

## Team Communication
- Use messages for direct teammate communication
- Broadcast only for critical announcements
- Keep communication structured and concise

## Result Synthesis
- Merge outputs from all team members
- Resolve conflicts by picking the higher severity rating
- Deduplicate findings at same file:line
- Organize by severity: Critical, High, Medium, Low`;
}
```

---

### 5. Extension Package Config

**File**: `~/.pi/agent/extensions/agent-teams/package.json`

```json
{
  "name": "agent-teams",
  "version": "0.1.0",
  "description": "Multi-agent orchestration for pi: parallel reviews, debugging, and feature development",
  "main": "index.ts",
  "keywords": ["agents", "teams", "orchestration", "parallel", "review", "debugging"],
  "author": "pi community",
  "license": "MIT",
  "dependencies": {
    "@mariozechner/pi-coding-agent": "latest",
    "@sinclair/typebox": "^0.32.0"
  },
  "scripts": {
    "test": "node --test test/*.ts"
  }
}
```

---

### 6. Directory Structure

```
~/.pi/agent/extensions/agent-teams/
├── index.ts                          # Extension entry point
├── package.json
├── README.md
│
├── commands/
│   ├── team-review.ts               # /team-review implementation
│   ├── team-debug.ts                # /team-debug implementation
│   ├── team-feature.ts              # /team-feature implementation
│   ├── team-status.ts               # /team-status implementation
│   └── team-shutdown.ts             # /team-shutdown implementation
│
├── agents/
│   ├── team-reviewer.ts             # System prompts for reviewers
│   ├── team-lead.ts                 # Lead orchestrator prompt
│   ├── team-debugger.ts             # Hypothesis investigator prompt
│   └── team-implementer.ts          # Parallel builder prompt
│
├── skills/
│   ├── team-composition.ts          # Knowledge: team sizing, presets
│   ├── task-coordination.ts         # Knowledge: decomposition, deps
│   ├── parallel-debugging.ts        # Knowledge: hypothesis approach
│   └── file-ownership.ts            # Knowledge: ownership patterns
│
├── state/
│   ├── team-manager.ts              # Team lifecycle management
│   ├── task-manager.ts              # Task tracking and coordination
│   └── types.ts                     # TypeScript interfaces
│
├── utils/
│   ├── rpc.ts                       # Agent communication layer
│   ├── synthesis.ts                 # Result consolidation
│   └── formatting.ts                # Report generation
│
└── test/
    ├── team-manager.test.ts
    ├── team-review.test.ts
    └── fixtures/
```

---

## Usage Examples

### Example 1: Security Review

```
/team-review src/api --reviewers security
```

Result:
- Spawns 1 security reviewer
- Analyzes code for vulnerabilities
- Reports findings organized by severity

### Example 2: Comprehensive Review

```
/team-review src/ --reviewers security,performance,architecture,testing
```

Result:
- Spawns 4 reviewers in parallel
- Each analyzes their dimension
- Consolidates 4 reports into single prioritized list
- Deduplicates findings

### Example 3: Debug with Hypotheses

```
/team-debug "Auth token stored in localStorage instead of httpOnly cookie" --hypotheses 3
```

Result:
- Generates 3 competing hypotheses
- Spawns 3 investigators in parallel
- Each gathers evidence for/against their hypothesis
- Reports most likely root cause with fix

### Example 4: Feature Development

```
/team-feature "Implement OAuth2 authentication" --team-size 3 --plan-first
```

Result:
- Lead agent creates detailed decomposition
- Shows plan for approval
- Spawns 3 implementers with file ownership boundaries
- Monitors progress, detects conflicts
- Synthesizes final implementation

---

## Integration Points with Pi

### Hooks

```typescript
pi.on("session_start", (event, ctx) => {
  // Initialize team manager
});

pi.on("session_end", (event, ctx) => {
  // Cleanup active teams
});

pi.on("tool_call", async (event, ctx) => {
  // Could enforce file ownership here
  // Block edits to non-owned files
});
```

### Custom UI Components

```typescript
pi.ui.custom({
  type: "table",
  title: "Team Status",
  data: [
    { agent: "security-reviewer", status: "done", findings: 5 },
    { agent: "perf-reviewer", status: "working", findings: 3 },
  ],
});
```

---

## Performance Considerations

### Process Spawning Overhead

- Each spawned agent is a separate pi process
- Initial overhead: ~500ms per agent
- Memory: ~50-100MB per agent
- Mitigate: Use pools, reuse sessions

### Communication Latency

- IPC overhead for agent-to-agent messages
- Solution: Batch updates, compress data

### Scaling

- Recommended: 2-4 agents per team
- Beyond 5: coordination overhead exceeds parallelism benefit
- Use task dependencies to minimize blocking

---

## Future Enhancements

1. **Agent Pools** - Reuse agent processes between teams
2. **Web UI Dashboard** - Monitor teams from browser
3. **Git Integration** - Auto-review on PR creation
4. **Caching** - Cache findings for identical code
5. **Result History** - Store historical review reports
6. **Custom Agents** - User-defined agent types beyond presets

---

## Testing Strategy

```typescript
// test/team-manager.test.ts
describe("TeamManager", () => {
  it("should spawn and track agents", async () => {
    const manager = new TeamManager();
    const { sessionId } = await manager.spawnAgent(
      "test-team",
      "test-agent",
      "team-reviewer",
      "test prompt",
      "test task"
    );
    
    const team = manager.getTeam("test-team");
    assert(team?.members.length === 1);
    assert(team?.members[0].sessionId === sessionId);
  });

  it("should save and load team state", async () => {
    const manager = new TeamManager();
    // ... create team ...
    await manager.saveTeamState(team);
    
    const manager2 = new TeamManager();
    await manager2.loadTeams();
    const loaded = manager2.getTeam(team.name);
    assert(loaded !== undefined);
  });

  it("should shutdown teams gracefully", async () => {
    const manager = new TeamManager();
    const team = await spawnTestTeam(manager);
    await manager.shutdown(team.name);
    
    assert(team.status === "shutdown");
  });
});
```

---

## Migration Path from Claude Code

For users with existing Agent Teams workflows in Claude Code:

1. **Keep existing prompts** - Reuse agent role definitions
2. **Port skills** - Convert `.md` files to TypeScript knowledge
3. **Adapt commands** - Use pi's command syntax
4. **Leverage pi benefits** - Use pi's TUI, session management
5. **Gradual rollout** - Run both systems in parallel initially

