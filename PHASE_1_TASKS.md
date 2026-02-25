# Phase 1: MVP Implementation Tasks

Current Status: **Foundation Ready** ✅

## Completed ✅
- [x] Repository structure created
- [x] Core TeamManager class (state management)
- [x] Extension entry point (index.ts)
- [x] Custom tools registered (spawnAgent, getTeamStatus, etc.)
- [x] All 7 command stubs created
- [x] Agent system prompts (reviewer, lead, debugger, implementer)
- [x] /team-review command (partial implementation)
- [x] Comprehensive analysis & documentation
- [x] Git repository initialized
- [x] NPM configuration

## In Progress 🔄
- [ ] Complete /team-review implementation
- [ ] Test team spawning
- [ ] Test result synthesis

## To Do 📋

### Week 1: Core Functionality
- [ ] Fix TypeScript compilation issues
- [ ] Implement result collection from agents
- [ ] Test spawnAgent() tool with real pi session
- [ ] Implement message passing between lead and agents
- [ ] Test basic 1-agent scenario
- [ ] Write unit tests for TeamManager

### Week 2: Complete MVP
- [ ] Test 3-agent parallel review scenario
- [ ] Implement result deduplication logic
- [ ] Complete report synthesis
- [ ] Error handling and recovery
- [ ] Manual testing with real code
- [ ] Documentation updates

### Remaining Phases
- [ ] Phase 2: Additional commands (debug, feature)
- [ ] Phase 3: Polish and optimization

## Testing Checklist for MVP

- [ ] Single agent spawning works
- [ ] Multiple agents spawn in parallel
- [ ] Agent can receive initial task
- [ ] Agent can send messages back
- [ ] Team state persists to disk
- [ ] Team state loads from disk
- [ ] Process cleanup on shutdown
- [ ] /team-review command parses args correctly
- [ ] /team-review creates review team
- [ ] /team-review collects results
- [ ] /team-review synthesizes report
- [ ] /team-review cleans up

## Known Limitations (MVP)

1. **Simple IPC**: Uses stdin/stdout for agent communication (not optimized)
2. **No result parsing**: Currently stubbed out with empty findings
3. **Timeout handling**: Basic timeout logic, may need refinement
4. **Single dimension**: /team-review works but needs multi-reviewer sync
5. **No file ownership**: Not enforced yet (Phase 2+)

## Next Immediate Steps

1. **Verify environment**:
   ```bash
   cd ~/picat
   npm install
   npm run type-check
   ```

2. **Test with pi**:
   ```bash
   # Link extension to pi
   ln -s ~/picat ~/.pi/agent/extensions/agent-teams
   
   # Reload pi
   pi
   # Inside pi: /reload
   ```

3. **Test MVP**:
   ```
   /team-review src/test/ --reviewers security
   ```

4. **Debug issues**:
   - Check ~/.pi/teams/ for state files
   - Look at process logs
   - Enable debug output in index.ts

## Development Notes

### Spawning Architecture
- Uses Node.js `child_process.spawn()` to start pi subprocess
- Each agent gets its own pi session
- Communication via stdin/stdout JSON messages
- Processes tracked in processMap

### State Management
- Persistent state in ~/.pi/teams/{teamName}/state.json
- Loaded on extension start
- Updated after each member change
- Cleaned up on shutdown

### Future Improvements
- Process pooling for efficiency
- Better IPC mechanism (could use Node.js cluster module)
- WebSocket-based agent communication
- Real-time progress UI
- Result caching

## Performance Targets (MVP)

- Spawn time: < 1 second per agent
- Report synthesis: < 2 seconds for 3 agents
- Memory usage: < 300MB for 3 agents
- Startup time: < 500ms

