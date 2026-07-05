#!/bin/bash
set -e

INSTALL_DIR=$(realpath "$(dirname "$0")")
VENV_DIR="$INSTALL_DIR/venv"
PYTHON="$VENV_DIR/bin/python"
PIP="$VENV_DIR/bin/pip"
USER_NAME=${SUDO_USER:-$USER}

echo "Installing system packages..."
sudo apt update
sudo apt install -y \
    python3 \
    python3-venv \
    mosquitto \
    mosquitto-clients

echo "Creating virtual environment..."
python3 -m venv "$VENV_DIR"

echo "Upgrading pip..."
"$PIP" install --upgrade pip

echo "Installing Python packages..."
"$PIP" install -r requirements.txt

echo "Initialising database..."
"$PYTHON" "$INSTALL_DIR/raspberry-pi/init_db.py"

echo "Creating systemd service files..."

sudo tee /etc/systemd/system/envmonitor-subscriber.service > /dev/null <<EOF
[Unit]
Description=EnvMonitor MQTT Subscriber
After=network.target mosquitto.service

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$INSTALL_DIR
ExecStart=$PYTHON $INSTALL_DIR/subscriber.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF


sudo tee /etc/systemd/system/envmonitor-web.service > /dev/null <<EOF
[Unit]
Description=EnvMonitor Web Dashboard
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$INSTALL_DIR
ExecStart=$PYTHON $INSTALL_DIR/app.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF


sudo tee /etc/systemd/system/envmonitor-pi-publisher.service > /dev/null <<EOF
[Unit]
Description=EnvMonitor Pi Publisher
After=network.target mosquitto.service

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$INSTALL_DIR
ExecStart=$PYTHON $INSTALL_DIR/pi_publisher.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd..."
sudo systemctl daemon-reload

sudo systemctl enable mosquitto
sudo systemctl enable envmonitor-subscriber
sudo systemctl enable envmonitor-web
sudo systemctl enable envmonitor-pi-publisher

sudo systemctl start mosquitto
sudo systemctl start envmonitor-subscriber
sudo systemctl start envmonitor-web
sudo systemctl start envmonitor-pi-publisher

echo "Done."