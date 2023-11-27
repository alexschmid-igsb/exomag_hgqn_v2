#!/bin/bash
trap "printf '\n'" SIGINT
npm run redis:start
code=$?
if [ $code -ne 0 ]; then
    exit $code
fi
sleep 1
npm run backend:dev:execute
npm run redis:stop
exit 0