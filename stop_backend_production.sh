#!/bin/bash
set -e
pm2 --env development stop backend.exomag.pm2.config.js
sleep 5
./backend/redis/stop.sh
