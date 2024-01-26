#!/bin/bash
backend/redis/start.sh
INSTANCE_CONFIG_PATH=config/exomag PROFILE=development_default node tests/import/excel_template/standalone.js
backend/redis/stop.sh