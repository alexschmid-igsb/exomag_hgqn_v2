#!/bin/bash
trap "printf '\n'" SIGINT
if [ -z "$PROFILE" ]; then export PROFILE="development_default"; fi
if [ -z "$INSTANCE_CONFIG_PATH" ]; then export INSTANCE_CONFIG_PATH="./config/hgqn"; fi
./backend/redis/start.sh
code=$?
if [ $code -ne 0 ]; then
    exit $code
fi
node ./test/populate_test.js
./backend/redis/stop.sh
exit 0