#!/usr/bin/env bash
set -euo pipefail
sudo systemctl start ufw-control-panel-backend
sudo systemctl reload nginx
sudo systemctl status ufw-control-panel-backend --no-pager -l | sed -n '1,20p'
