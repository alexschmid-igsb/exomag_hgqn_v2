#!/bin/bash
set -e
CURRENT_PATH=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
APP_ROOT=$( echo $CURRENT_PATH | rev | cut -d'/' -f2- | rev )
pm2 --env production start $APP_ROOT/backend.exomag.pm2.config.js