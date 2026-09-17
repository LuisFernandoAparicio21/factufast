# /harness-gate

Run the exit criteria verification for the current in-progress phase.

## What this does

1. Finds the phase currently `in-progress` in `tasks.json`
2. Reads its `.harness/specs/<fase-id>/spec.md` for the verification command
3. Runs the verification command
4. Checks the Reviewer checklist from `.harness/agents/reviewer.md`
5. Reports APPROVED or REJECTED with specific failures

## Usage

```
/harness-gate
```

or target a specific phase:

```
/harness-gate fase-3
```

## After running

- **APPROVED**: Orchestrator will prompt you to merge the branch to `main` and mark phase `done`
- **REJECTED**: A `progress/<run>/review.md` file is written. Say "fix it" to retry Builder.
