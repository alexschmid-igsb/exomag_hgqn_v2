#!/usr/bin/env bash

# alternative search paths for the redis executable should be added here
REDIS_CHECK=(
    /usr/bin/redis-server
    /usr/sbin/redis-server
)

REDIS_CMD=

for CMD in "${REDIS_CHECK[@]}"
do
    if [ -x "$(command -v $CMD)" ]; then
        REDIS_CMD=$CMD
    fi
done

if ! [ -x "$(command -v $REDIS_CMD)" ]; then
    echo 'FATAL: COULD NOT FIND REDIS EXECUTABLE' >&2
    exit 1
fi

CURRENT=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
APP_ROOT=$( echo $CURRENT | rev | cut -d'/' -f3- | rev )

PID_FILE=$APP_ROOT/runtime/redis/redis.pid

if [ -f "$PID_FILE" ]; then
    echo "ERROR"
    echo "THE REDIS PID FILE AREADY EXIST"
    echo "IT SEEMS THAT THE SERVER IS ALREADY RUNNING"
    exit 1
fi

: > ${APP_ROOT}/runtime/redis/redis.log

$REDIS_CMD \
    --bind 127.0.0.1 \
    --port 8482 \
    --protected-mode yes \
    --daemonize yes \
    --save "" \
    --appendonly no \
    --dir ${APP_ROOT}/runtime/redis  \
    --pidfile ${APP_ROOT}/runtime/redis/redis.pid \
    --logfile ${APP_ROOT}/runtime/redis/redis.log 

echo "Redis server started"
