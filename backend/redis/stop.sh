#!/usr/bin/env bash

CURRENT=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
APP_ROOT=$( echo $CURRENT | rev | cut -d'/' -f3- | rev )

PID_FILE=$APP_ROOT/runtime/redis/redis.pid
if ! [ -f "$PID_FILE" ]; then
    echo "ERROR"
    echo "THE REDIS PID FILE DOES NOT EXIST"
    echo "IT SEEMS THAT THE SERVER IS NOT RUNNING"
    exit 1
fi

kill -15 `cat $PID_FILE`
rm $PID_FILE
echo "Redis server stopped"

