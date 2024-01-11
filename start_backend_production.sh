#!/bin/bash
set -e
./backend/redis/start.sh
sleep 5
pm2 --env development start backend.exomag.pm2.config.js