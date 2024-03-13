#!/bin/bash
set -e

CURRENT_PATH=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
APP_ROOT=$( echo $CURRENT_PATH | rev | cut -d'/' -f2- | rev )

SERVICE_FILE=redis_exomag_production.service 
SERVICE_PATH=$APP_ROOT/production/$SERVICE_FILE

[ -e $SERVICE_PATH ] && rm $SERVICE_PATH

cat <<EOT >> $SERVICE_PATH
[Unit]
Description=Redis for ExomAG Backend [Production]
After=network.target

[Service]
Type=forking
ExecStart=$APP_ROOT/backend/redis/start.sh
ExecStop=$APP_ROOT/backend/redis/stop.sh
WorkingDirectory=$APP_ROOT
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOT

sudo systemctl enable $SERVICE_PATH







