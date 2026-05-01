# AGENT_CONTEXT.md

## Project
- Name: `UFW Control Panel`
- Goal: Web platform to manage UFW rules safely from a GUI.
- Scope: Angular frontend + Express backend + SQLite + Docker lab with Ubuntu + Node-RED.

## Current Architecture
- Monorepo root: `/home/andres/workspace/dashma/ufw-control-panel`
- Backend: `backend/` (Node.js + Express + TypeScript)
- Frontend: `frontend/` (Angular + Tailwind)
- Infra: `infra/` (Docker compose files and ufw lab)

## Runtime (Docker-first)
Main compose:
- `infra/docker-compose.app-dev.yml`

Services:
1. `ufw-lab` (Ubuntu 24.04)
- Runs UFW in isolated container namespace.
- Installs Node.js + Node-RED.
- Node-RED internal port: `1880`
- Host mapped port: `1890` (current mapping `1890:1880`)
- UFW rule initially allows: `1880/tcp on eth0`

2. `backend` (`ufw-panel-backend`)
- Port: `4000`
- Uses `UFW_CONTAINER_NAME=ufw-lab` to execute UFW commands inside lab container.
- Needs Docker socket mounted: `/var/run/docker.sock`.
- Installs docker client in container startup if missing.

3. `frontend` (`ufw-panel-frontend`)
- Port: `4600`
- Connects to backend `http://localhost:4000`

## Credentials (dev)
- Admin email: `admin@local`
- Admin password: `Admin123!`

## API Highlights
- Auth:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Firewall:
  - `GET /api/firewall/status`
  - `GET /api/firewall/interfaces`
  - `POST /api/firewall/enable`
  - `POST /api/firewall/disable`
  - `POST /api/firewall/reload`
- Rules:
  - `GET /api/rules`
  - `POST /api/rules/preview`
  - `POST /api/rules`
  - `DELETE /api/rules/:ufwNumber`
- Dashboard:
  - `GET /api/dashboard/summary`
- Others:
  - `GET /api/audit`
  - `GET/POST /api/zones`
  - `GET /api/users`

## UFW Rule Builder Notes
- Supported action: `allow|deny|reject|limit`
- Supported protocol: `tcp|udp|any`
- Supports direction + interface:
  - `in|out|any`
  - `interfaceName` (example `eth0`)
- Safe command construction via allowlist logic.
- No free-form command execution allowed from user input.

## Important Networking Note
When controlling Node-RED in `ufw-lab` from the UI:
- Use port `1880` in UFW rules (container internal port).
- Do NOT use `1890` in UFW rules (that is host-published port only).

## Frontend Theme Status
- Theme switched to solid dark technical style.
- Buttons standardized to dark variants:
  - `btn-brand`, `btn-ok`, `btn-danger`, `btn-muted`
- Main updated views:
  - layout, dashboard, rules, audit, zones, users.

## Known Constraints
- UFW management currently targets container lab (`ufw-lab`), not host firewall.
- For host-level UFW management, backend must run on host with restricted sudoers, or a hardened host-control architecture.

## Start / Stop Commands
From `infra/`:
- Start: `docker compose -f docker-compose.app-dev.yml up -d`
- Stop: `docker compose -f docker-compose.app-dev.yml down`
- Logs: `docker compose -f docker-compose.app-dev.yml logs -f backend frontend ufw-lab`

## Validation Checklist
- Frontend reachable: `http://localhost:4600`
- Backend health: `http://localhost:4000/health`
- Node-RED reachable: `http://localhost:1890`
- Interfaces endpoint returns at least `eth0`.
- Rule create/delete reflected in `ufw status numbered` from `ufw-lab`.

## Next Recommended Work
1. Implement rule edit workflow (update existing rule safely).
2. Add import/export JSON with strict validation.
3. Add visual zones graph (drag and drop).
4. Add stronger audit filters/search and pagination.
5. Add production hardening guide for host UFW control.
