#!/usr/bin/env node
/**
 * Deterministic task selector for FactuFastAI harness.
 * Reads .harness/state/tasks.json and prints the next actionable phase.
 * Usage: node .harness/tools/next-task.js [--json]
 */

const fs = require("fs");
const path = require("path");

const STATE_FILE = path.join(__dirname, "..", "state", "tasks.json");

function main() {
  const asJson = process.argv.includes("--json");

  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch (e) {
    console.error("ERROR: Cannot read tasks.json:", e.message);
    process.exit(1);
  }

  const phases = state.phases;
  const doneIds = new Set(phases.filter((p) => p.status === "done").map((p) => p.id));

  // Find first phase where status is not done AND all depends_on are done
  const next = phases.find((p) => {
    if (p.status === "done") return false;
    const depsOk = p.depends_on.every((dep) => doneIds.has(dep));
    return depsOk;
  });

  if (!next) {
    const allDone = phases.every((p) => p.status === "done");
    if (allDone) {
      if (asJson) {
        console.log(JSON.stringify({ status: "complete", message: "All phases done. MVP complete." }));
      } else {
        console.log("✓ All phases complete. MVP done.");
      }
    } else {
      const blocked = phases.filter((p) => p.status !== "done" && !p.depends_on.every((d) => doneIds.has(d)));
      if (asJson) {
        console.log(JSON.stringify({ status: "blocked", blocked: blocked.map((p) => p.id) }));
      } else {
        console.log("BLOCKED. Waiting for:", blocked.map((p) => p.depends_on.filter((d) => !doneIds.has(d))).flat().join(", "));
      }
    }
    process.exit(0);
  }

  if (asJson) {
    console.log(JSON.stringify({ status: "ok", next }));
  } else {
    console.log(`\nNext phase: ${next.id} — ${next.name}`);
    console.log(`Status:     ${next.status}`);
    console.log(`Branch:     ${next.branch}`);
    console.log(`Spec:       ${next.spec}`);
    console.log(`Criterio:   ${next.criterio_salida}`);
    console.log(`\nFiles to create:  ${next.files_to_create.join(", ") || "(none)"}`);
    console.log(`Files to modify:  ${next.files_to_modify.join(", ") || "(none)"}`);
  }
}

main();
