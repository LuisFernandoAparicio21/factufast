# /harness-status

Show the current state of all FactuFastAI phases.

## What this does

1. Reads `.harness/state/tasks.json`
2. Runs `node .harness/tools/next-task.js` to identify the next actionable phase
3. Prints a table:

```
Phase    | Status      | Branch                      | Criterio de salida (short)
---------|-------------|-----------------------------|--------------------------
fase-1   | ✓ done      | fase-1/facturama-standalone | UUID impreso en terminal
fase-2   | ▶ in-progress | fase-2/sam-infrastructure | sam deploy sin errores
fase-3   | ⏸ pending   | fase-3/lambda-complete      | sam local invoke OK
...
```

4. Shows the last 3 entries from `.harness/progress/history.md`

## Usage

```
/harness-status
```
