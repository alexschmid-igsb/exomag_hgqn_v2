#!/bin/bash
trap "printf '\n'" SIGINT
if [ -z "$PROFILE" ]; then export PROFILE="development_default"; fi
if [ -z "$INSTANCE_CONFIG_PATH" ]; then export INSTANCE_CONFIG_PATH="./config/base"; fi
./backend/redis/start.sh
code=$?
if [ $code -ne 0 ]; then
    exit $code
fi
./seeds/run.js "$@"
./backend/redis/stop.sh
exit 0