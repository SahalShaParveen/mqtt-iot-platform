#!/bin/bash
set -euo pipefail

echo "Stopping EnvMonitor services..."

sudo systemctl stop envmonitor-subscriber.service || true
sudo systemctl stop envmonitor-web.service || true
sudo systemctl stop envmonitor-pi-publisher.service || true

echo "Disabling services..."

sudo systemctl disable envmonitor-subscriber.service || true
sudo systemctl disable envmonitor-web.service || true
sudo systemctl disable envmonitor-pi-publisher.service || true

echo "Removing service files..."

sudo rm -f /etc/systemd/system/envmonitor-subscriber.service
sudo rm -f /etc/systemd/system/envmonitor-web.service
sudo rm -f /etc/systemd/system/envmonitor-pi-publisher.service

echo "Reloading systemd daemon..."

sudo systemctl daemon-reload
sudo systemctl reset-failed

echo "Done."