#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-/opt/ufw-control-panel}"

echo "[1/6] Installing system dependencies..."
sudo apt update
sudo apt install -y git curl ca-certificates gnupg lsb-release

if ! command -v docker >/dev/null 2>&1; then
  echo "[2/6] Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER" || true
else
  echo "[2/6] Docker already installed"
fi

if ! command -v docker compose >/dev/null 2>&1; then
  echo "Docker Compose plugin missing. Install docker-compose-plugin package."
  sudo apt install -y docker-compose-plugin || true
fi

echo "[3/6] Creating app directory ${APP_DIR}..."
sudo mkdir -p "${APP_DIR}"
sudo chown -R "$USER":"$USER" "${APP_DIR}"

echo "[4/6] Copying project files..."
rsync -a --delete ./ "${APP_DIR}/" --exclude .git --exclude node_modules --exclude dist

cd "${APP_DIR}/infra"

echo "[5/6] Starting stack..."
docker compose -f docker-compose.app-dev.yml up -d

echo "[6/6] Done"
echo "Frontend: http://localhost:4600"
echo "Backend:  http://localhost:4000/health"
echo "Node-RED: http://localhost:1890"
