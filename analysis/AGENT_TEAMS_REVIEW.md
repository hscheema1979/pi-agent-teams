# Agent Teams Plugin Review & Pi Adoption Analysis

## Executive Summary

The **agent-teams** plugin is a well-architected multi-agent orchestration system for Claude Code that provides sophisticated team management, task decomposition, and parallel execution patterns. It can be **largely adapted for pi**, though some architectural differences require careful consideration.

**Key finding**: While Claude Code's "Agent Teams" feature (with Teammate tools) is specific to that platform, the underlying **command/skill/agent pattern** is highly portable to pi's extension system.

---

## 1. Current Architecture Overview

### Structure

```
agent-teams/
├── .claude-plugin/
│   └── plugin.json              # Minimal metadata
├── README.md                     # User-facing documentation
├── agents/                       # Agent role definitions (4 agents)
│   ├── team-lead.md
│   ├── team-reviewer.md
│   ├── team-debugger.md
│   └── team-implementer.md
├── commands/                     # User-facing commands (7 commands)
│   ├── team-spawn.md
│   ├── team-status.md
│   ├── team-shutdown.md
│   ├── team-review.md
│   ├── team-debug.md
│   ├── team-feature.md
│   └── team-delegate.md
└── skills/                       # Knowledge & patterns (6 skills)
    ├── team-composition-patterns/
    ├── task-coordination-strategies/
    ├── parallel-debugging/
    ├── multi-reviewer-patterns/
    ├── parallel-feature-development/
    └── team-communication-protocols/
```

### File Format

- **Agents**: YAML front matter + Markdown (role definitions, tools list, behavioral traits)
- **Commands**: YAML front matter + Markdown (description, arguments, execution phases)
- **Skills**: YAML front matter + Markdown (knowledge base) + optional references subdirectory
- **Plugin metadata**: Minimal JSON (name, version, author)

### Key Concepts

1. **Team Orchestration**: Multi-agent teams spawned via Teammate tool (Claude Code specific)
2. **Task Decomposition**: Breaking work into parallelizable units with file ownership
3. **Role-based Agents**: Specialized agents (lead, reviewer, debugger, implementer)
4. **Preset Configurations**: Pre-built team compositions (review, debug, feature, security, etc.)
5. **Structured Communication**: Message protocols for agent-to-agent coordination
6. **Result Synthesis**: Consolidating outputs from parallel agents

---

## 2. Detailed Feature Analysis

### Commands (7 total)

| Command | Complexity | Portability | Notes |
|---------|-----------|-------------|-------|
| `/team-spawn` | High | Partial | Requires alternative to Teammate tool; could use pi's session forking |
| `/team-status` | Medium | Good | Requires task state tracking; pi can manage via extensions |
| `/team-shutdown` | Medium | Partial | Teammates -> sub-sessions/processes |
| `/team-review` | High | Excellent | Pure orchestration logic; highly portable |
| `/team-debug` | High | Excellent | Core algorithm is portable; uses Teammate API for spawning |
| `/team-feature` | High | Excellent | Orchestration pattern; file ownership logic is portable |
| `/team-delegate` | Medium | Partial | Claude Code's workload UI; could map to pi's task UI |

### Agents (4 total)

All agents follow a consistent structure with YAML metadata + Markdown role definition.

| Agent | Purpose | Portability | Notes |
|-------|---------|-------------|-------|
| `team-lead` | Orchestrator | Excellent | Pure system prompt; no tool dependencies |
| `team-reviewer` | Multi-dimensional reviewer | Excellent | Uses Read/Grep/Bash; all portable tools |
| `team-debugger` | Hypothesis investigator | Excellent | Read/Grep/Bash compatible |
| `team-implementer` | Parallel builder | Excellent | Needs file write access; fully portable |

### Skills (6 total)

Knowledge repositories with markdown + references. Topics:
- Team composition patterns (sizing heuristics, agent selection)
- Task coordination (decomposition, dependency graphs)
- Parallel debugging (hypothesis generation, evidence collection)
- Multi-reviewer patterns (review dimensions, deduplication)
- Parallel feature development (file ownership, merge strategies)
- Team communication (message protocols, coordination)

**Portability**: Excellent - these are pure knowledge base entries with no tool dependencies.

---

## 3. Architecture Comparison: Agent Teams vs Pi

### Similarities ✓

| Aspect | Agent Teams | Pi | Similarity |
|--------|------------|----|-----------
| Modular design | Commands, agents, skills | Extensions, custom tools | ✓ Highly similar |
| Markdown + YAML | Use for definitions | Use for extensions | ✓ Compatible |
| Tool system | LLM-callable tools | LLM-callable tools | ✓ Compatible |
| Event-driven | Message protocols | Event subscriptions | ✓ Similar pattern |
| Session management | Team state tracking | Session/context tracking | ✓ Related |

### Key Differences ⚠

| Aspect | Agent Teams | Pi | Issue |
|--------|------------|---|----|
| **Multi-agent spawning** | `Teammate` tool (native) | No native equivalent | ✗ Must implement alternative |
| **Display modes** | tmux, iTerm2, in-process | Unified TUI | ✗ Different UX paradigm |
| **Task management** | TaskCreate/TaskList/TaskUpdate | Message-based | ✗ Requires new abstractions |
| **Team lifecycle** | Explicit spawn/shutdown | Session-based | ✗ Conceptual shift needed |
| **Role-based agents** | Built-in agent types | General-purpose agents | ~ Can work around with prompts |

### Fundamental Challenge

**Claude Code's "Agent Teams"** is tightly integrated with:
- Teammate tool (spawns actual processes/windows)
- TaskCreate/TaskList APIs (team-aware task management)
- Tmux/iTerm2 integration (visual coordination)

**Pi doesn't have these** - but pi has:
- Session forking capability
- Extension event system
- Custom tools
- State persistence

**Conclusion**: Need to build an **abstraction layer** to map agent-teams concepts to pi primitives.

---

## 4. Adaptation Strategy for Pi

### Option A: Direct Port (Recommended)

Build a pi extension that implements agent-teams features using pi's capabilities.

**Approach**:
1. Create custom tool: `spawnAgent()`
   - Spawns sub-process with pi session
   - Returns communication channel
   
2. Implement task coordination
   - Use extension event system to track state
   - Persist team state in `~/.pi/teams/{name}/`
   
3. Adapt commands
   - Register as pi commands via `registerCommand()`
   - Reuse agent role definitions as system prompts
   
4. Implement skills
   - Convert to pi skills via `registerSkill()` or documentation
   - Embed in extension

**Pros**:
- Pure pi implementation
- Full access to pi's capabilities
- Can leverage pi's session management
- Single entry point (one extension)

**Cons**:
- Significant engineering (RPC layer for agent communication)
- Process management complexity
- No tmux/iTerm2 visual coordination (but pi's TUI is better)

### Option B: Wrapper Extension

Thin extension layer that calls Claude Code tools (if pi can invoke them).

**Approach**:
1. Create extension that detects Claude Code environment
2. Use Anthropic API directly to spawn agents
3. Map pi commands to Claude Code agents
4. Adapt result collection to pi's event model

**Pros**:
- Leverages existing Claude Code infrastructure
- Less engineering effort
- Can use all Claude Code features

**Cons**:
- Requires Claude Code to be available
- Cross-platform complexity
- Maintains two code paths (pi native, Claude Code integration)

### Option C: Conceptual Adoption (Lightweight)

Don't port the tool implementation, but adopt the **patterns** and **design principles**.

**Approach**:
1. Keep agent role definitions (team-lead, reviewer, etc.) as system prompts
2. Create pi extension with `/review`, `/debug`, `/feature` commands
3. Use pi's session forking to spawn "sub-agents"
4. Reuse skill knowledge base
5. Implement task coordination via extension state

**Pros**:
- Lightweight implementation
- Focuses on proven patterns
- Maximum compatibility with pi philosophy
- Faster to implement

**Cons**:
- Not a full port of Agent Teams
- Limited to pi's capabilities
- Less sophisticated orchestration

---

## 5. Recommended Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

**Create `pi-agent-teams` extension** with:

```
~/.pi/agent/extensions/agent-teams/
├── index.ts                  # Extension entry point
├── package.json
├── tools/
│   ├── spawn-agent.ts       # spawnAgent() tool
│   ├── list-teams.ts        # List active teams
│   └── shutdown-team.ts     # Clean up team
├── commands/
│   ├── team-review.ts       # /team-review command
│   ├── team-debug.ts        # /team-debug command
│   └── team-feature.ts      # /team-feature command
├── agents/
│   ├── team-lead.ts         # System prompts
│   ├── team-reviewer.ts
│   ├── team-debugger.ts
│   └── team-implementer.ts
├── skills/
│   ├── team-composition-patterns.ts
│   ├── task-coordination-strategies.ts
│   └── parallel-debugging.ts
└── state/
    └── team-manager.ts      # Team lifecycle management
```

**Deliverables**:
- [ ] `spawnAgent()` custom tool (spawns pi subprocess)
- [ ] Team state manager (tracks team members, tasks, completion)
- [ ] Agent lifecycle (spawn, monitor, shutdown)
- [ ] Skill injection in system prompts

### Phase 2: Commands (Weeks 2-3)

**Implement core commands**:

- [ ] `/team-spawn` - Create teams with presets
- [ ] `/team-review` - Multi-reviewer code review
- [ ] `/team-debug` - Hypothesis-driven debugging
- [ ] `/team-feature` - Parallel feature development

**Each command**:
- Orchestration logic (decompose → spawn → monitor → synthesize)
- Agent communication protocol
- Result consolidation

### Phase 3: Advanced Features (Week 4+)

- [ ] `/team-status` - Progress monitoring
- [ ] `/team-shutdown` - Graceful cleanup
- [ ] `/team-delegate` - Workload visualization
- [ ] File ownership enforcement
- [ ] Dependency graph management
- [ ] Conflict detection & resolution

---

## 6. Key Implementation Details

### Custom Tool: `spawnAgent()`

```typescript
interface SpawnAgentParams {
  role: "team-lead" | "team-reviewer" | "team-debugger" | "team-implementer" | "general-purpose";
  teamName: string;
  agentName: string;
  systemPrompt: string;
  initialTask: string;
  tools?: Tool[];
}

// Returns:
interface AgentHandle {
  id: string;
  process: ChildProcess;
  sessionId: string;
  messageChannel: MessagePort;
}
```

### Team State Structure

```typescript
interface Team {
  name: string;
  members: TeamMember[];
  tasks: Task[];
  status: "active" | "idle" | "shutdown";
  createdAt: Date;
  results: Map<string, AgentResult>;
}

interface TeamMember {
  id: string;
  name: string;
  role: AgentRole;
  sessionId: string;
  status: "idle" | "working" | "done";
  ownedFiles?: string[];
}
```

### Communication Protocol

Between lead and team members:
```typescript
type Message = 
  | { type: "task"; task: Task }
  | { type: "status"; state: "idle" | "working" | "done" }
  | { type: "result"; result: AgentResult }
  | { type: "error"; error: string }
  | { type: "shutdown" };
```

---

## 7. Strengths of Agent Teams Design

### What Works Well ✓

1. **Modular command structure** - Clear separation of concerns
2. **Agent role definitions** - Well-thought-out personas with clear boundaries
3. **Skill knowledge base** - Reusable patterns across teams
4. **Preset compositions** - Smart defaults for common workflows
5. **File ownership concept** - Prevents conflicts in parallel implementation
6. **Task decomposition framework** - Clear phases for orchestration
7. **Result synthesis patterns** - Deduplication, conflict resolution, reporting

### Documentation Quality ✓

- Comprehensive READMEs (user facing)
- Clear command specifications (arguments, phases)
- Agent role definitions with behavioral traits
- Skill documentation with references

---

## 8. Gaps & Limitations for Pi Adoption

### Technical Gaps

1. **No native process spawning tool in pi** 
   - Must implement via Node child_process
   - Communication overhead (RPC/IPC)
   - Process lifecycle management

2. **No task-tracking UI like Claude Code**
   - Can't match Teammate tool's visual coordination
   - Pi's TUI shows conversation, not team dashboard

3. **No built-in role-based agent types**
   - Must implement as system prompt variations
   - Less sophisticated than Claude Code's native agents

### Conceptual Gaps

1. **Pi uses sessions, not teams**
   - Teams = persistent lifecycle with multiple members
   - Sessions = implicit; new session = new agent
   - Requires rethinking state management

2. **File ownership enforcement**
   - Agent Teams can control which files agents see
   - Pi agents see full codebase
   - Need to implement permission layer

3. **Inter-agent communication**
   - Agent Teams has message passing built in
   - Pi would need custom tool for agent-to-agent messaging

---

## 9. Risk Assessment

### High Risk

- **Process lifecycle management** - Spawning/monitoring multiple pi processes reliably
- **IPC complexity** - Communication overhead between agents
- **State consistency** - Tracking team state across multiple processes

### Medium Risk

- **File ownership enforcement** - Preventing agents from editing non-owned files
- **Result synthesis** - Collecting and deduplicating findings from multiple agents
- **Performance** - Multiple processes may be slower than Agent Teams' native approach

### Low Risk

- **Skill documentation porting** - Just markdown conversion
- **Agent role definitions** - Just system prompts
- **Command logic porting** - Mostly algorithmic, no tool dependencies

---

## 10. Comparison: What Can Be Reused

### 100% Portable (No Changes Needed)

```
✓ All skill documentation
✓ Agent role definitions  
✓ Command specifications (phases, logic)
✓ File ownership patterns
✓ Task decomposition strategies
✓ Result synthesis algorithms
```

### 80% Portable (Minor Adaptation)

```
~ Agent system prompts (adjust tool references)
~ Command implementations (rewrite for pi architecture)
~ Team preset configurations (map to pi spawning)
```

### 20% Portable (Major Rewrite Needed)

```
✗ Teammate/Task tool APIs (implement IPC layer)
✗ Display modes (adapt to pi's TUI)
✗ Team lifecycle management (session-based vs process-based)
```

---

## 11. Recommended Approach: Hybrid Port

**Best option for pi: "Conceptual + Lightweight Implementation"**

Rather than a full port, adopt:

1. **Agent role definitions** → System prompts
2. **Skill knowledge** → Documentation + context injection
3. **Command patterns** → Pi extension commands
4. **Orchestration logic** → Pi custom tools

**Key simplifications**:
- Use pi's session forking instead of spawning new processes
- Implement team state as persistent JSON files
- Leverage pi's event system for coordination
- Use standard pi tools (Read, Write, Bash) without custom tools

**Estimated effort**: 4-6 weeks for full implementation
**Estimated code size**: 2000-3000 LOC

---

## 12. Proof of Concept Implementation

### Minimal MVP (1-2 weeks)

```typescript
// commands/team-review.ts
pi.registerCommand("team-review", {
  description: "Multi-reviewer code review",
  handler: async (args, ctx) => {
    const target = args.split(" ")[0];
    const reviewers = ["security", "performance", "architecture"];
    
    // Phase 1: Prepare review
    const files = await ctx.tools.read(target);
    
    // Phase 2: Spawn reviewers (fork sessions)
    const results = await Promise.all(
      reviewers.map(dimension =>
        ctx.tools.spawnAgent({
          role: "team-reviewer",
          dimension,
          target: files
        })
      )
    );
    
    // Phase 3: Consolidate
    return synthesizeReview(results);
  }
});
```

---

## 13. Final Recommendation

### Summary Table

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Architectural fit** | ⭐⭐⭐⭐ | Patterns align well with pi's extension system |
| **Portability** | ⭐⭐⭐⭐ | 70-80% of logic is directly portable |
| **Effort required** | ⭐⭐⭐☆ | 4-6 weeks for full implementation |
| **User value** | ⭐⭐⭐⭐⭐ | Parallel workflows are powerful for pi users |
| **Maintenance burden** | ⭐⭐⭐☆ | Some complexity in process management |

### Go/No-Go Decision

**✅ RECOMMENDED: Adopt for Pi**

The agent-teams patterns are valuable and largely portable. The effort is justified by the powerful capabilities it adds to pi.

**Suggested path**:
1. Start with Lightweight MVP (Phase 1: foundation + basic commands)
2. Get feedback from pi community
3. Expand to full feature set based on demand

---

## 14. Next Steps

### Immediate Actions

1. **Review adoption strategy** with team
2. **Prototype MVP** for `/team-review` command
3. **Build process spawning layer** (custom tool or extension hook)
4. **Create template system prompts** for agent roles

### For Implementation

1. Fork/create `pi-agent-teams` repository
2. Set up extension scaffolding in pi's structure
3. Port Phase 1 components
4. Test with real workflows
5. Gather user feedback

---

## Appendix: File Structure Mapping

### Claude Code Structure → Pi Extension Structure

```
agent-teams/
├── agents/
│   ├── team-lead.md         → agents/team-lead.ts (system prompt)
│   ├── team-reviewer.md     → agents/team-reviewer.ts
│   ├── team-debugger.md     → agents/team-debugger.ts
│   └── team-implementer.md  → agents/team-implementer.ts
├── commands/
│   ├── team-spawn.md        → commands/team-spawn.ts (registerCommand)
│   ├── team-review.md       → commands/team-review.ts
│   └── team-debug.md        → commands/team-debug.ts
├── skills/
│   ├── team-composition.../SKILL.md → skills/team-composition.ts
│   └── ...                  → ...
└── plugin.json              → package.json + index.ts

```

---

## Conclusion

The **agent-teams plugin is highly adoptable for pi**. While some features rely on Claude Code's native agent infrastructure, the core patterns, strategies, and orchestration logic translate well. A thoughtful port focusing on the strengths (multi-agent coordination, task decomposition, result synthesis) would add significant value to pi while maintaining architectural coherence.

