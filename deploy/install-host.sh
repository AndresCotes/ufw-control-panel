#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-/opt/ufw-control-panel}"
DOMAIN_OR_IP="${2:-_}"
RUN_USER="${3:-ufwpanel}"

echo "[1/9] Installing system dependencies..."
sudo apt update
sudo apt install -y rsync curl ca-certificates gnupg lsb-release nginx ufw

if ! command -v node >/dev/null 2>&1; then
  echo "[2/9] Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo "[2/9] Node already installed: $(node -v)"
fi

if ! id -u "$RUN_USER" >/dev/null 2>&1; then
  echo "[3/9] Creating service user $RUN_USER..."
  sudo useradd -r -m -d "$APP_DIR" -s /usr/sbin/nologin "$RUN_USER"
fi

echo "[4/9] Copying project to $APP_DIR ..."
sudo mkdir -p "$APP_DIR"
sudo rsync -a --delete ./ "$APP_DIR/" --exclude .git --exclude node_modules --exclude dist --exclude backend/.env
sudo chown -R "$RUN_USER":"$RUN_USER" "$APP_DIR"

echo "[5/9] Backend env setup ..."
if [ ! -f "$APP_DIR/backend/.env" ]; then
  sudo -u "$RUN_USER" cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
fi
sudo -u "$RUN_USER" sed -i "s|^NODE_ENV=.*|NODE_ENV=production|" "$APP_DIR/backend/.env" || true
sudo -u "$RUN_USER" sed -i "s|^HOST=.*|HOST=127.0.0.1|" "$APP_DIR/backend/.env" || true
sudo -u "$RUN_USER" sed -i "s|^PORT=.*|PORT=4000|" "$APP_DIR/backend/.env" || true
sudo -u "$RUN_USER" sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=https://$DOMAIN_OR_IP|" "$APP_DIR/backend/.env" || true
if grep -q '^UFW_CONTAINER_NAME=' "$APP_DIR/backend/.env"; then
  sudo -u "$RUN_USER" sed -i "s|^UFW_CONTAINER_NAME=.*|UFW_CONTAINER_NAME=|" "$APP_DIR/backend/.env"
else
  echo 'UFW_CONTAINER_NAME=' | sudo -u "$RUN_USER" tee -a "$APP_DIR/backend/.env" >/dev/null
fi

echo "[6/9] Installing/building backend+frontend ..."
sudo -u "$RUN_USER" bash -lc "cd '$APP_DIR/backend' && npm install && npm run build && npm run seed:admin"
sudo -u "$RUN_USER" bash -lc "cd '$APP_DIR/frontend' && npm install && npm run build"

echo "[7/9] Creating systemd service ..."
sudo tee /etc/systemd/system/ufw-control-panel-backend.service >/dev/null <<SERVICE
[Unit]
Description=UFW Control Panel Backend
After=network.target

[Service]
Type=simple
User=$RUN_USER
WorkingDirectory=$APP_DIR/backend
ExecStart=/usr/bin/node $APP_DIR/backend/dist/server.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable --now ufw-control-panel-backend

echo "[8/9] Configuring Nginx ..."
sudo tee /etc/nginx/sites-available/ufw-control-panel >/dev/null <<NGINX
server {
  listen 80;
  server_name $DOMAIN_OR_IP;

  root $APP_DIR/frontend/dist/frontend/browser;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:4000/api/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  }

  location /health {
    proxy_pass http://127.0.0.1:4000/health;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
NGINX
sudo ln -sf /etc/nginx/sites-available/ufw-control-panel /etc/nginx/sites-enabled/ufw-control-panel
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "[9/9] Sudoers note (manual step required):"
echo "  Run: sudo visudo"
echo "  Add:  $RUN_USER ALL=(root) NOPASSWD: /usr/sbin/ufw"

echo "Done. Open: http://$DOMAIN_OR_IP"
