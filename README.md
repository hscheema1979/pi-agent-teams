# pi-agent-teams

Multi-agent orchestration for pi: parallel code reviews, hypothesis-driven debugging, and coordinated feature development.

**Ported from Claude Code's Agent Teams plugin** to the pi coding agent framework.

## Status

🚧 **In Development** - MVP Phase (Phase 1/3)

- [x] Core infrastructure (team manager, process spawning)
- [x] `/team-review` command (MVP)
- [ ] `/team-debug` command (Phase 2)
- [ ] `/team-feature` command (Phase 2)
- [ ] All commands (Phase 3)

## Quick Start

### Installation

Place in pi's extension directory:
```bash
mkdir -p ~/.pi/agent/extensions/agent-teams
cp -r ~/picat/* ~/.pi/agent/extensions/agent-teams/
cd ~/.pi/agent/extensions/agent-teams
npm install
```

### Usage

Once installed, try the MVP:

```
/team-review src/ --reviewers security,performance
```

This will:
1. Spawn parallel code reviewers
2. Each analyzes their dimension
3. Consolidates findings into prioritized report
4. Shuts down team

## Architecture

### Core Components

- **TeamManager** (`src/state/team-manager.ts`) - Manages teams, spawning, state
- **Commands** (`src/commands/*.ts`) - User-facing commands
- **Agents** (`src/agents/*.ts`) - System prompts for each agent role
- **Custom Tools** (`src/index.ts`) - spawnAgent, getTeamStatus, sendAgentMessage

### Team Structure

```
Team
├── Members (agents with roles)
│   ├── team-lead - Orchestrator
│   ├── team-reviewer - Code reviewer
│   ├── team-debugger - Hypothesis investigator
│   └── team-implementer - Builder
├── Tasks (work items)
└── Results (consolidation)
```

### State Storage

Teams persist state in `~/.pi/teams/{teamName}/`:
```
~/.pi/teams/review-team-1234567/
├── state.json
├── tasks.json
├── members/
│   ├── security-reviewer.json
│   └── ...
└── results.json
```

## Commands

### `/team-review` (MVP) ✅
Multi-dimensional code review in parallel

```
/team-review <path> [--reviewers sec,perf,arch,test,access]
```

### `/team-debug` (Phase 2)
Hypothesis-driven debugging

```
/team-debug <problem> [--hypotheses 3]
```

### `/team-feature` (Phase 2)
Parallel feature development with file ownership

```
/team-feature <description> [--team-size 3] [--plan-first]
```

### `/team-spawn` (Phase 3)
Create team with preset or custom composition

```
/team-spawn [review|debug|feature|security|research|migration|custom]
```

### `/team-status` (Phase 3)
Monitor team progress

```
/team-status [team-name]
```

### `/team-shutdown` (Phase 3)
Gracefully shut down team

```
/team-shutdown <team-name>
```

### `/team-delegate` (Phase 3)
Interactive task delegation

```
/team-delegate [--rebalance]
```

## Development

### Setup

```bash
npm install
```

### Testing

```bash
npm test
```

### Type Checking

```bash
npm run type-check
```

## Documentation

See `analysis/` directory for complete analysis:

- `START_HERE.md` - Navigation guide
- `AGENT_TEAMS_SUMMARY.md` - Executive summary
- `AGENT_TEAMS_REVIEW.md` - Full technical analysis
- `PI_AGENT_TEAMS_IMPLEMENTATION.md` - Implementation guide
- `QUICK_REFERENCE.md` - Developer reference
- `DOCUMENTS_MANIFEST.md` - Documentation index

See `reference/` directory for original Agent Teams plugin documentation.

## Design Principles

1. **Parallel by default** - Agents work simultaneously
2. **Clear ownership** - Each agent has defined responsibilities
3. **Structured communication** - Message protocols for coordination
4. **Result synthesis** - Consolidate and deduplicate findings
5. **Graceful shutdown** - Clean resource cleanup

## Implementation Phases

### Phase 1: MVP (Current)
- ✅ Core infrastructure
- ✅ `/team-review` command
- Basic result synthesis
- 2 weeks

### Phase 2: Expand
- [ ] `/team-debug` command
- [ ] `/team-feature` command
- Dependency management
- 2 weeks

### Phase 3: Polish
- [ ] All commands
- [ ] Advanced features
- [ ] Optimization
- 1-2 weeks

## Technology

- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Framework**: pi coding agent
- **Schema**: TypeBox (JSON schema)

## Contributing

This is a port of Claude Code's Agent Teams. Original source:
https://github.com/hscheema1979/Domain_Agent_Teams

## Performance

### Recommended Team Sizes
- Simple task: 1-2 agents
- Moderate: 2-3 agents
- Complex: 3-4 agents
- Very complex: 4-5 agents (coordination overhead increases)

### Performance Estimate
- Process spawn: ~500ms per agent
- Review/analysis: 2-30s per agent
- Result collection: ~500ms
- Synthesis: 1-2s

**Example**: 3-agent review of medium codebase: ~40-60 seconds

## Troubleshooting

### Agent spawning fails
- Check available system resources
- Ensure pi is properly installed
- Check file permissions on ~/.pi/teams/

### Commands not recognized
- Verify extension is installed in ~/.pi/agent/extensions/
- Run `npm install` to install dependencies
- Reload pi with `/reload`

### Agents timing out
- Increase timeout in command (if parameter available)
- Simplify target (smaller files/scope)
- Check process resources

## License

MIT

## References

- [pi documentation](https://github.com/mariozechner/pi)
- [Original Agent Teams](https://github.com/hscheema1979/Domain_Agent_Teams)
- [pi extensions guide](docs/extensions.md)

---

**Created**: February 25, 2026
**Status**: MVP Phase 1
**Maintainer**: pi community
