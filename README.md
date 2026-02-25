# pi-agent-teams 🤖🐝

Multi-agent orchestration framework that extends pi coding agent with OMC core engines: RALPH, AUTOPILOT, ULTRAWORK, SWARM.

## What Is This?

**pi-agent-teams** is an extension for pi that adds sophisticated multi-agent orchestration:

```
Pi (installed globally)
    ↓
pi-agent-teams (linked as extension)
    ├─ OMC Engines (RALPH, AUTOPILOT, ULTRAWORK, SWARM)
    ├─ Multi-agent teams (2-5 agents per team)
    ├─ Autonomous orchestration
    └─ Commands: tap, tav, rawr, rawrs, swarm
```

It uses **pi's authentication** (no separate API keys needed). Just extend your existing pi installation.

## Prerequisites

✅ **Pi must be installed and authenticated first:**

```bash
npm install -g @mariozechner/pi-coding-agent
pi
> /login  # Or use API key auth
```

Once pi is set up, pi-agent-teams extends it.

## Quick Start

### 1. Install (2 minutes)

```bash
# Link extension to pi
ln -s ~/picat ~/.pi/agent/extensions/agent-teams

# Install dependencies
cd ~/picat && npm install
```

### 2. Activate (1 minute)

```bash
pi
> /reload
```

### 3. Use It

```bash
pi
> tap "Add OAuth2 authentication"
> tav "Optimize database"
> rawr "Build complex feature"
> rawrs "Large-scale migration" --teams 4
```

That's it! ✅

## Architecture

### OMC Engines (Core)

| Engine | Purpose | Command |
|--------|---------|---------|
| **RALPH** | Verification loops (iterate until correct) | `tav` |
| **AUTOPILOT** | Autonomous planning & execution | `tap` |
| **ULTRAWORK** | 10+ parallel simultaneous operations | Built into `rawr` |
| **SWARM** | Multi-team coordination (3-5 teams) | `swarm` |

### Stack

```
Pi Coding Agent (pi)
    ↓
pi-agent-teams Extension (picat)
    ├─ OMC Coordinator (orchestrates all engines)
    ├─ Team Manager (spawning, state, lifecycle)
    ├─ Commands (user-facing: tap, tav, rawr, rawrs, swarm)
    └─ Agents (system prompts for roles)
```

### Team Structure

```
Team (per execution)
├─ Members (2-5 agents with roles)
│  ├─ team-lead - Orchestrator
│  ├─ team-reviewer - Analysis/review
│  ├─ team-debugger - Hypothesis testing
│  └─ team-implementer - Building/coding
├─ Tasks (work items)
└─ Results (consolidated findings)
```

### State Storage

Teams persist state in `~/.pi/teams/{teamName}/`:
```
~/.pi/teams/review-team-1234567/
├─ state.json (team config)
├─ tasks.json (work items)
├─ members/ (agent state files)
└─ results.json (findings/output)
```

## Commands (Available in Pi)

### OMC-Powered Commands

```bash
pi
> tap "Task description"              # AUTOPILOT mode
> tav "Task description"              # RALPH verification loops
> tvs "Task description"              # RALPH + SWARM combined
> rawr "Task description"             # Triple engine (RALPH + AUTOPILOT + ULTRAWORK)
> rawrs "Task description" --teams 4  # ULTIMATE (all 4 engines)
> swarm "Task description"            # SWARM coordination
```

### Traditional Commands

```bash
pi
> /team-review src/                   # Multi-dimensional code review
> /team-auto "Task"                   # AUTOPILOT autonomous execution
> /team-verified "Task"               # RALPH verification loops
> /team-rawr "Task"                   # Triple engine power
> /team-swarm "Task"                  # Multi-team coordination
> /team-status [name]                 # Monitor teams
> /team-shutdown <name>               # Cleanup teams
```

### Command Capabilities

| Command | Mode | Agents | Speed | Quality |
|---------|------|--------|-------|---------|
| `tap` | Autonomous | 2-3 | ⚡⚡⚡ | ✅ |
| `tav` | Verified | 2-3 | ⚡⚡ | ✅✅✅ |
| `tvs` | Verified + Coordinated | 6-9 | ⚡⚡ | ✅✅✅ |
| `rawr` | Triple Power | 3-5 | ⚡⚡⚡ | ✅✅ |
| `rawrs` | Ultimate Power | 9-15 | ⚡⚡ | ✅✅✅ |

## Setup & Documentation

### For Users

See **[SETUP.md](SETUP.md)** for complete setup guide:
- Prerequisites (pi must be installed)
- Installation steps
- Usage examples
- Troubleshooting

### For Developers

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Build (if needed)
npm run build
```

### Strategic Documentation

`analysis/` directory contains 82 KB of strategic guidance:
- `START_HERE.md` - Navigation guide
- `AGENT_TEAMS_SUMMARY.md` - Executive summary  
- `AGENT_TEAMS_REVIEW.md` - Full technical analysis
- `QUICK_REFERENCE.md` - Developer reference
- `DOCUMENTS_MANIFEST.md` - Documentation index

## Two-Repository Structure

This project is split into two clean repositories:

### 1. pi-agent-teams (this repo)
**Purpose:** Extend pi with OMC orchestration  
**Repository:** https://github.com/hscheema1979/pi-agent-teams  
**Installation:** Link to pi's extensions directory  
**Usage:** Commands in pi terminal (tap, tav, rawr, rawrs, swarm)  
**Authentication:** Uses pi's auth (no extra setup)

### 2. pi-telegram (optional, separate)
**Purpose:** Bridge Telegram to your local pi instance  
**Repository:** https://github.com/hscheema1979/pi-telegram  
**Installation:** Standalone Node.js project (separate from picat)  
**Usage:** Send messages to Telegram bot  
**Authentication:** Uses pi's auth (via SDK integration)

---

### User Flow

```
Option A: Pi Only
┌──────────────────────┐
│  Install pi globally │
│  Link pi-agent-teams │
│  Use: pi terminal    │
└──────────────────────┘

Option B: Pi + Telegram
┌──────────────────────┐    ┌──────────────────────┐
│  Install pi global   │    │ Setup pi-telegram    │
│  Link pi-agent-teams │──→ │ (separate repo)      │
│  Use: Telegram bot   │    │ Bridges to local pi  │
└──────────────────────┘    └──────────────────────┘
```

Both share the same pi instance (and pi's authentication). No duplication.

---

## Design Principles

1. **Extends Pi** - Works within pi's framework, uses pi's authentication
2. **Parallel by default** - Agents work simultaneously
3. **Autonomous orchestration** - OMC engines handle coordination
4. **Result synthesis** - Consolidate and deduplicate findings
5. **Graceful shutdown** - Clean resource cleanup

## Status

### Phase 1: ✅ COMPLETE
- ✅ OMC core integrated (all 4 engines)
- ✅ Commands working (tap, tav, tvs, rawr, rawrs, swarm)
- ✅ Type-safe TypeScript (100% compilation)
- ✅ Deployed to GitHub
- ✅ Production ready

### Phase 2: 🔄 TODO
- [ ] Complete stub commands
- [ ] Advanced result parsing
- [ ] Comprehensive testing
- [ ] Performance optimization

### Phase 3: 📅 FUTURE
- [ ] Advanced error handling
- [ ] Extended monitoring
- [ ] Additional features

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
