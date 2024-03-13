#!/bin/bash
set -e

CURRENT_PATH=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
APP_ROOT=$( echo $CURRENT_PATH | rev | cut -d'/' -f2- | rev )

SERVICE_FILE=redis_exomag_production.service 
SERVICE_PATH=$APP_ROOT/production/$SERVICE_FILE

sudo systemctl kill $SERVICE_FILE
sudo systemctl disable $SERVICE_FILE
