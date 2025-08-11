
#!/bin/bash
echo "🚀 Starting AI RFP Risk Scanner with increased memory allocation..."
export NODE_OPTIONS="--max-old-space-size=8192"
cd /home/ubuntu/ai_rfp_risk_scanner/app
npm run dev
