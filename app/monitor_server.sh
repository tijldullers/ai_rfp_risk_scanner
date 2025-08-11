#!/bin/bash
# Monitor and restart AI RFP Risk Scanner if needed

cd /home/ubuntu/ai_rfp_risk_scanner/app

# Check if server is running
if [ -f server.pid ]; then
    PID=$(cat server.pid)
    if ! ps -p $PID > /dev/null 2>&1; then
        echo "$(date): Server not running, restarting..."
        ./start_server.sh
    else
        # Check if port 3000 is responding
        if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
            echo "$(date): Server not responding, restarting..."
            kill $PID 2>/dev/null
            sleep 2
            ./start_server.sh
        fi
    fi
else
    echo "$(date): No PID file found, starting server..."
    ./start_server.sh
fi
