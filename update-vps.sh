#!/bin/bash
# ==============================================================================
# AI Recharge Models - One-Command VPS Live Update Script
# Usage: bash update-vps.sh
# ==============================================================================

set -e

echo "🔄 [1/4] Pulling latest updates from GitHub..."
git pull origin main || git pull origin master || git pull || echo "Git pull warning: proceeding with local files..."

echo "📦 [2/4] Installing dependencies..."
npm install --production=false

echo "⚡ [3/4] Building production assets..."
npm run build

echo "🚀 [4/4] Restarting PM2 process..."
if command -v pm2 &> /dev/null; then
    pm2 restart all || pm2 start server.js --name "ai-recharge-gateway"
    pm2 save
else
    echo "PM2 not found. Starting server in background..."
    nohup node server.js > server.log 2>&1 &
fi

echo "================================================================="
echo "✅ VPS LIVE UPDATE COMPLETED SUCCESSFULLY!"
echo "================================================================="
