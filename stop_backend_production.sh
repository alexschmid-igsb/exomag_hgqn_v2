#!/bin/bash
set -e
production/stop_backend.sh
sleep 2
sudo systemctl stop redis_exomag_production.service