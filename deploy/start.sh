#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../infra"
docker compose -f docker-compose.app-dev.yml up -d
