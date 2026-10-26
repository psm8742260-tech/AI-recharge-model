#!/bin/bash
# ==============================================================================
# AI Recharge Models - Automated VPS Setup & Deploy Script
# Author: AI Studio Assistant for Admin Garu
# ==============================================================================

set -e

echo "🚀 [1/6] Updating system packages..."
sudo apt update -y

echo "📦 [2/6] Checking Node.js installation (v20+ recommended)..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "🛠️ [3/6] Installing PM2 process manager globally..."
sudo npm install -g pm2 tsx

echo "📥 [4/6] Installing project dependencies and building..."
npm install
npm run build

# Ensure store file has write permissions
touch server_store.json
chmod 666 server_store.json

echo "🌐 [5/6] Configuring Nginx Reverse Proxy..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi

# Configure Nginx site
NGINX_CONF="/etc/nginx/sites-available/ai-recharge"
sudo bash -c "cat > $NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
}
EOF

# Enable configuration if not already enabled
sudo ln -sf /etc/nginx/sites-available/ai-recharge /etc/nginx/sites-enabled/
# Remove default site if present
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm -f /etc/nginx/sites-enabled/default
fi

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "⚡ [6/6] Starting application backend with PM2..."
pm2 delete ai-recharge 2>/dev/null || true
PORT=8080 NODE_ENV=production pm2 start server.js --name "ai-recharge"
pm2 save
pm2 startup | tail -n 1 | sudo bash 2>/dev/null || true

echo "=============================================================================="
echo "✅ DEPLOYMENT COMPLETE! AI Recharge Models is now live on your VPS IP / Domain."
echo "🔗 Backend and frontend are running together on Port 8080 through Nginx Port 80."
echo "📋 Check logs anytime with: pm2 logs ai-recharge"
echo "🔄 Restart anytime with:    pm2 restart ai-recharge"
echo "=============================================================================="
