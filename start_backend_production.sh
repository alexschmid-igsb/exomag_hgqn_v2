#!/bin/bash
set -e
./backend/redis/start.sh
sleep 5
pm2 --env production start backend.exomag.pm2.config.js