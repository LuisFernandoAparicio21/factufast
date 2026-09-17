# /harness-next

Advance the FactuFastAI harness to the next phase.

## What this does

1. Reads `.harness/state/tasks.json`
2. Runs `node .harness/tools/next-task.js` to find the next actionable phase
3. Routes to the correct agent based on current phase status:
   - `pending` → spawn **Architect** (reads spec, produces design decisions, waits for approval)
   - `spec-ready` → spawn **Builder** (writes code in worktree isolation)
   - `in-progress` → spawn **Reviewer** (verifies exit criteria)
4. Appends to `.harness/progress/history.md`
5. **PAUSES for user approval** before any merge or status transition to `done`

## Usage

```
/harness-next
```

No arguments. Reads all state from `tasks.json`.

## After running

- If Architect delivered spec: review `.harness/specs/<fase-id>/spec.md`, then say "ok" to proceed to Builder
- If Reviewer approved: confirm branch merge to `main`
- If Reviewer rejected: check `progress/*/review.md` for details, say "fix it" to retry Builder
