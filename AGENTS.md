# FactuFastAI — Agent Instructions

**Project:** Serverless CFDI 4.0 invoicing MVP (Mexico) on AWS  
**Spec:** `proyecto-facturacion-mvp.md` | **Plan:** `.harness/state/tasks.json`

## Harness

This repo uses SDD (Spec-Driven Development) with a 4-role harness:
- **Orchestrator** — reads `tasks.json`, routes to the right agent
- **Architect** — translates phase spec into concrete design decisions
- **Builder** — writes code in isolated worktree; follows `.harness/specs/<fase>/spec.md`
- **Reviewer** — verifies exit criteria before approving branch merge

Role prompts: `.harness/agents/`  
Phase specs: `.harness/specs/fase-*/`  
State machine: `.harness/state/tasks.json`

## Commands

| Command | Action |
|---------|--------|
| `/harness-next` | Pick next pending phase, delegate to Architect |
| `/harness-status` | Show current state of all phases |
| `/harness-gate` | Run exit criteria check for current phase |

## Non-Negotiable Rules

1. **Never touch `main` directly** — all work goes through `fase-X/...` branches
2. **Builder only touches files listed in the phase spec** — nothing else
3. **No phase is `done` until the Reviewer explicitly approves** and the branch is merged
4. **`init.sh` runs before every build** — if it fails, stop
5. **Error messages never include request body** (RFC/CP/datos personales under LFPDPPP)
6. **`python-dotenv` never in `backend/layers/python/requirements.txt`** — dev-only
7. **Pre-signed URL expiry = 3600s** (1h, not 24h — LFPDPPP compliance)

## Stack Quick Reference

- Lambda: Python 3.12 | SAM IaC
- DB: DynamoDB On-Demand — `facturas` (pk=rfc_receptor, sk=FOLIO#n) + `facturas-counters`
- GSI: `fecha-estatus-index` (pk=fecha_dia YYYY-MM-DD, sk=timestamp)
- Email: SES v2 (`sesv2`) with ConfigurationSet `factufast-config`
- Credentials: SSM Parameter Store (never env vars)
- PAC: Facturama Multi-issuer sandbox (`apisandbox.facturama.mx`)
- Frontend: React Native (Expo)

## Language Policy

- Code: Python (backend), TypeScript (frontend)
- Comments: Spanish (inline) or English — pick one per file, don't mix
- Commit messages: Conventional Commits in English (`feat:`, `fix:`, `docs:`)
