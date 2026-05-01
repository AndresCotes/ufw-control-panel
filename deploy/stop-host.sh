#!/usr/bin/env bash
set -euo pipefail
sudo systemctl stop ufw-control-panel-backend
sudo systemctl status ufw-control-panel-backend --no-pager -l | sed -n '1,20p'
