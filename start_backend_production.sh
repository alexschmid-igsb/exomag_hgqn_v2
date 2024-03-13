#!/bin/bash
set -e
sudo systemctl start redis_exomag_production.service
sleep 2
production/start_backend.sh
