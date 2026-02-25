# Agent Teams for Pi: Quick Reference

## File Structure Mapping

### Current Agent Teams (Claude Code)
```
agents/
├── team-lead.md              (3.2 KB, 80 lines)
├── team-reviewer.md          (3.4 KB, 90 lines)
├── team-debugger.md          (3.8 KB, 100 lines)
└── team-implementer.md       (3.8 KB, 100 lines)

commands/
├── team-spawn.md             (3.9 KB, 110 lines)
├── team-review.md            (2.9 KB, 85 lines)
├── team-debug.md             (3.7 KB, 105 lines)
├── team-feature.md           (3.7 KB, 105 lines)
├── team-status.md            (2.1 KB, 60 lines)
├── team-shutdown.md          (1.8 KB, 55 lines)
└── team-delegate.md          (2.9 KB, 80 lines)

skills/
├── team-composition-patterns/SKILL.md           (6.1 KB, 180 lines)
├── task-coordination-strategies/SKILL.md       (5.4 KB, 160 lines)
├── parallel-debugging/SKILL.md                 (4.1 KB, 120 lines)
├── multi-reviewer-patterns/SKILL.md            (5.2 KB, 150 lines)
├── parallel-feature-development/SKILL.md       (4.8 KB, 140 lines)
└── team-communication-protocols/SKILL.md       (3.8 KB, 110 lines)

Total: ~77 KB, ~1600 lines of documentation
```

### Proposed for Pi
```
~/.pi/agent/extensions/agent-teams/
├── index.ts                   (400 lines)      # Extension entry
├── package.json               (20 lines)       # Dependencies
├── README.md
│
├── agents/
│   ├── team-lead.ts          (100 lines)      # System prompt
│   ├── team-reviewer.ts      (80 lines)
│   ├── team-debugger.ts      (80 lines)
│   └── team-implementer.ts   (80 lines)
│
├── commands/
│   ├── team-review.ts        (150 lines)      # Implementation
│   ├── team-debug.ts         (150 lines)
│   ├── team-feature.ts       (150 lines)
│   ├── team-status.ts        (80 lines)
│   ├── team-spawn.ts         (100 lines)
│   └── team-shutdown.ts      (60 lines)
│
├── skills/
│   ├── team-composition.ts       (100 lines)  # Knowledge base
│   ├── task-coordination.ts      (100 lines)
│   ├── parallel-debugging.ts     (80 lines)
│   └── parallel-feature-dev.ts   (80 lines)
│
├── state/
│   ├── team-manager.ts       (300 lines)      # Core logic
│   ├── task-manager.ts       (200 lines)
│   └── types.ts              (100 lines)
│
├── utils/
│   ├── rpc.ts                (150 lines)      # Agent communication
│   ├── synthesis.ts          (150 lines)      # Result consolidation
│   └── formatting.ts         (100 lines)      # Report generation
│
└── test/
    └── *.test.ts             (400 lines)      # Test suite

Total: ~2500 lines of TypeScript
```

---

## Command Quick Reference

### /team-review
**Purpose**: Parallel multi-dimensional code review

```
/team-review <path> [--reviewers sec,perf,arch,test,access]
```

**Process**:
1. Spawns N reviewers (one per dimension)
2. Each reviews in parallel
3. Deduplicates findings at same location
4. Consolidates by severity: Critical, High, Medium, Low

**Example**:
```
/team-review src/api --reviewers security,performance
→ Spawns 2 reviewers
→ Collects findings
→ Returns consolidated report
```

---

### /team-debug
**Purpose**: Hypothesis-driven debugging

```
/team-debug <problem description> [--hypotheses 3] [--evidence-limit 10]
```

**Process**:
1. Generates N competing hypotheses
2. Spawns investigator for each
3. Each gathers evidence for/against
4. Ranks by likelihood
5. Recommends fix for top hypothesis

**Example**:
```
/team-debug "API returns 500 on /users POST with valid payload" --hypotheses 3
→ Generates hypotheses
→ Spawns 3 investigators
→ Collects evidence
→ Returns ranked findings + fix
```

---

### /team-feature
**Purpose**: Parallel feature development with coordination

```
/team-feature <description> [--team-size 3] [--plan-first]
```

**Process**:
1. Decomposes into workstreams
2. (Optional) Shows plan for approval
3. Assigns file ownership
4. Spawns implementers
5. Monitors for conflicts
6. Synthesizes final code

**Example**:
```
/team-feature "Add OAuth2 authentication" --team-size 3 --plan-first
→ Creates decomposition plan
→ User approves
→ Spawns 3 implementers with file ownership
→ Returns integrated implementation
```

---

### /team-status
**Purpose**: Monitor team progress

```
/team-status [team-name]
```

**Output**:
```
Team: review-team
Status: active
Members:
  - security-reviewer: done (5 findings)
  - performance-reviewer: working (3 findings so far)
  - architecture-reviewer: idle

Progress: 2/3 complete
Est. completion: 30 seconds
```

---

### /team-shutdown
**Purpose**: Gracefully shut down team

```
/team-shutdown [team-name]
```

**Process**:
1. Sends shutdown message to all members
2. Waits for graceful completion
3. Kills remaining processes
4. Cleans up team state

---

## Agent Role Reference

### team-lead
- **Purpose**: Orchestrate and coordinate
- **Capabilities**: Decompose work, manage lifecycle, synthesize results
- **Tools**: Read, Grep, Bash (no Write)
- **Key skill**: Understanding dependencies, avoiding conflicts

### team-reviewer
- **Purpose**: Focused review on one dimension
- **Capabilities**: Deep analysis of assigned area
- **Tools**: Read, Grep, Bash (no Write)
- **Key skill**: Finding issues specific to dimension

### team-debugger
- **Purpose**: Investigate hypothesis
- **Capabilities**: Gather evidence, test theories
- **Tools**: Read, Grep, Bash (may need Edit for tests)
- **Key skill**: Scientific method, evidence evaluation

### team-implementer
- **Purpose**: Build with file ownership
- **Capabilities**: Implement features within assigned files
- **Tools**: Read, Write, Edit, Bash
- **Key skill**: Respecting ownership boundaries

---

## Review Dimensions

### Security
- Input validation/sanitization
- Auth/authorization
- SQL injection, XSS, CSRF
- Secrets exposure
- Dependency vulns
- Cryptographic misuse

### Performance
- DB query efficiency (N+1, indexes)
- Memory leaks
- Unnecessary computation
- Caching opportunities
- Async/concurrency
- Algorithm complexity

### Architecture
- SOLID principles
- Separation of concerns
- Dependency direction
- API contracts
- Error handling consistency
- Abstraction appropriateness

### Testing
- Coverage gaps
- Test isolation
- Mock appropriateness
- Edge case coverage
- Integration tests
- Test maintainability

### Accessibility
- WCAG 2.1 AA compliance
- Semantic HTML/ARIA
- Keyboard navigation
- Screen reader compat
- Color contrast
- Focus management

---

## Team Preset Configurations

| Preset | Size | Composition | Use Case |
|--------|------|-------------|----------|
| **review** | 3 | 3x team-reviewer | Multi-dimensional code review |
| **debug** | 3 | 3x team-debugger | Hypothesis-driven root cause |
| **feature** | 3 | 1x lead + 2x implementer | Parallel feature development |
| **fullstack** | 4 | 1x lead + 3x implementer (FE/BE/test) | Full-stack feature |
| **security** | 4 | 4x team-reviewer | Comprehensive security audit |
| **research** | 3 | 3x general-purpose | Parallel investigation |
| **migration** | 4 | 1x lead + 2x implementer + 1x reviewer | Large refactor |

---

## Tool Reference

### Custom Tools (Added by Extension)

#### spawnAgent()
Spawns a team member agent

**Parameters**:
- `teamName: string` - Team identifier
- `agentName: string` - Member name
- `role: AgentRole` - team-lead | reviewer | debugger | implementer
- `systemPrompt: string` - Role-specific instructions
- `initialTask: string` - First task description

**Returns**:
```typescript
{
  sessionId: string;    // Unique session ID
  process: Process;     // Node process handle
}
```

#### getTeamStatus()
Get status of a team

**Parameters**:
- `teamName: string`

**Returns**:
```typescript
{
  name: string;
  members: Array<{name, role, status}>;
  overallStatus: "active" | "idle" | "shutdown";
  createdAt: ISO string;
}
```

---

## State Storage

Teams persist state in `~/.pi/teams/{teamName}/`:

```
~/.pi/teams/review-team-1708956234/
├── state.json           # Team status, member list
├── tasks.json           # Task tracking
├── members/
│   ├── security-reviewer.json
│   ├── performance-reviewer.json
│   └── architecture-reviewer.json
└── results.json         # Consolidated findings
```

---

## Communication Protocol

### Message Flow

```
User
  ↓
/team-review command
  ↓
Spawn lead agent
  ↓
Lead spawns reviewers (3x)
  ↓
Reviewers work in parallel
  ↓
Lead collects results
  ↓
Lead synthesizes report
  ↓
Return consolidated findings
  ↓
Shutdown team
```

### Agent-to-Agent Messages

```typescript
// Lead → Reviewer
{
  type: "task";
  dimension: "security";
  target: "src/api";
  diff: "...code...";
  deadline?: 300; // seconds
}

// Reviewer → Lead
{
  type: "result";
  findings: [{ location, severity, evidence, fix }];
  complete: true;
}

// Lead → All
{
  type: "shutdown";
  save_results: true;
}
```

---

## Performance Guidelines

### Optimal Team Sizes

- **Simple task**: 1-2 agents
- **Moderate task**: 2-3 agents
- **Complex task**: 3-4 agents
- **Very complex**: 4-5 agents

**Rule**: More agents = more overhead. 3-4 is optimal sweet spot.

### Time Estimates (Per Agent)

- Process spawn: ~500ms
- Initial setup: ~500ms
- Review/analysis work: variable (2-30s typically)
- Result collection: ~500ms
- Synthesis: ~1-2s

**Example**: 3-agent review of medium codebase: ~40-60 seconds total

### Memory Usage

- Per spawned agent: ~50-100MB
- 3-agent team: ~200-300MB
- 5-agent team: ~300-500MB

---

## Error Handling

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Agent timeout | Task too complex | Increase timeout, simplify target |
| Process spawn failure | Resource limits | Wait, close other processes |
| File not found | Ownership boundary | Extend file ownership |
| IPC timeout | Communication lag | Retry, check network |
| Conflicting edits | Ownership overlap | Reassign files |

---

## Extension Integration Points

```typescript
// In ~/.pi/agent/extensions/agent-teams/index.ts

pi.on("session_start", () => {
  // Load team state from disk
  // Initialize team manager
});

pi.on("tool_call", async (event) => {
  // Enforce file ownership
  // Prevent editing non-owned files
  // Log tool usage per agent
});

pi.registerTool("spawnAgent", {
  // Spawn agent subprocess
  // Set up IPC channel
  // Return session handle
});

pi.registerCommand("team-review", {
  // Parse arguments
  // Execute orchestration
  // Return results
});
```

---

## Testing Checklist

- [ ] Team spawning (1-5 agents)
- [ ] Agent communication (message passing)
- [ ] Task execution (all agent types)
- [ ] Result collection (from all agents)
- [ ] State persistence (load/save)
- [ ] Graceful shutdown (all cases)
- [ ] Error recovery (timeout, crash)
- [ ] File ownership enforcement
- [ ] Deduplication logic
- [ ] Report formatting
- [ ] Performance (under load)

---

## Resources

### Documentation
- Full analysis: `/home/ubuntu/AGENT_TEAMS_REVIEW.md` (18KB)
- Implementation guide: `/home/ubuntu/PI_AGENT_TEAMS_IMPLEMENTATION.md` (24KB)
- Executive summary: `/home/ubuntu/AGENT_TEAMS_SUMMARY.md` (9KB)
- Quick reference: This file

### Original Source
- GitHub: https://github.com/hscheema1979/Domain_Agent_Teams
- Local: `/home/ubuntu/projects/dev-at/agents/wshobson/agent-teams/`

### Pi Documentation
- Extensions: `/usr/lib/node_modules/@mariozechner/pi-coding-agent/docs/extensions.md`
- SDK: `/usr/lib/node_modules/@mariozechner/pi-coding-agent/docs/sdk.md`
- RPC: `/usr/lib/node_modules/@mariozechner/pi-coding-agent/docs/rpc.md`

