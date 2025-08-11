#!/bin/bash
cd /home/ubuntu/ai_rfp_risk_scanner/app
export NODE_ENV=production
unset NEXT_DIST_DIR
unset __NEXT_TEST_MODE
nohup npm start > server.log 2>&1 &
echo $! > server.pid
echo "Server started with PID: $(cat server.pid)"
