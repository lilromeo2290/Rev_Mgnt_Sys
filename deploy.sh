#!/bin/bash
# ══════════════════════════════════════════════════════════════════════
#  RMS VPS Deployment Script
#  Run this on your VPS:  bash deploy.sh
# ══════════════════════════════════════════════════════════════════════

set -e

APP_DIR="/opt/rms"
REPO_URL=""  # ← Set your Git repo URL here (e.g. git@github.com:user/rms.git)
NODE_VERSION="24"
PORT="3000"
DOMAIN=""  # ← Set your domain here (e.g. rms.yourdomain.com)

# ── Colors ──────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ════════════════════════════════════════════════════════════════════
#  STEP 1: System Dependencies
# ════════════════════════════════════════════════════════════════════
echo ""
echo "═══ Installing system dependencies ═══"
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx ufw > /dev/null 2>&1
log "System packages installed"

# ── Install Node.js via NodeSource ────────────────────────────────
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y -qq nodejs
  log "Node.js $(node -v) installed"
else
  log "Node.js $(node -v) already installed"
fi

# ── Install Bun (fast JS runtime used by start script) ────────────
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
  log "Bun installed"
else
  log "Bun already installed"
fi

# ── Install PM2 (process manager) ────────────────────────────────
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
  log "PM2 installed"
else
  log "PM2 already installed"
fi

# ════════════════════════════════════════════════════════════════════
#  STEP 2: Clone / Pull Code
# ════════════════════════════════════════════════════════════════════
echo ""
echo "═══ Setting up application ═══"
mkdir -p /opt

if [ -d "$APP_DIR" ]; then
  echo "  Pulling latest code..."
  cd "$APP_DIR"
  git pull origin main || warn "Git pull failed — using existing code"
else
  if [ -z "$REPO_URL" ]; then
    err "Set REPO_URL in this script or upload code manually to $APP_DIR"
  fi
  echo "  Cloning repository..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ════════════════════════════════════════════════════════════════════
#  STEP 3: Install Dependencies & Build
# ════════════════════════════════════════════════════════════════════
echo ""
echo "═══ Building application ═══"
npm ci --production=false 2>&1 | tail -1
log "Dependencies installed"

# Prisma
if [ -f "prisma/schema.prisma" ]; then
  npx prisma generate 2>&1 | tail -1
  mkdir -p db
  [ ! -f "db/custom.db" ] && npx prisma db push --accept-data-loss 2>&1 | tail -1
  log "Database initialized"
fi

# Build
npm run build 2>&1 | tail -3
log "Application built"

# ════════════════════════════════════════════════════════════════════
#  STEP 4: Start with PM2
# ════════════════════════════════════════════════════════════════════
echo ""
echo "═══ Starting application with PM2 ═══"
cd "$APP_DIR"

# Stop existing if running
pm2 delete rms 2>/dev/null || true

# Start
PORT=$PORT pm2 start "bun .next/standalone/server.js" --name rms
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1
log "PM2 process 'rms' started on port $PORT"

# ════════════════════════════════════════════════════════════════════
#  STEP 5: Nginx Reverse Proxy
# ════════════════════════════════════════════════════════════════════
echo ""
echo "═══ Configuring Nginx ═══"

cat > /etc/nginx/sites-available/rms << EOF
server {
    listen 80;
    server_name ${DOMAIN} _;  # _ = match any domain when DOMAIN is empty

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$t_http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/rms /etc/nginx/sites-enabled/rms
rm -f /etc/nginx/sites-enabled/default
nginx -t 2>&1 && systemctl reload nginx
log "Nginx configured"

# ════════════════════════════════════════════════════════════════════
#  STEP 6: SSL (optional — only if domain is set)
# ════════════════════════════════════════════════════════════════════
if [ -n "$DOMAIN" ]; then
  echo ""
  echo "═══ Setting up SSL with Certbot ═══"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email 2>&1 | tail -3
  log "SSL certificate obtained for $DOMAIN"
fi

# ════════════════════════════════════════════════════════════════════
#  STEP 7: Firewall
# ════════════════════════════════════════════════════════════════════
echo ""
echo "═══ Configuring firewall (UFW) ═══"
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "y" | ufw enable 2>/dev/null
log "Firewall configured (SSH + HTTP/HTTPS open)"

# ════════════════════════════════════════════════════════════════════
#  DONE
# ════════════════════════════════════════════════════════════════════
echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}  Deployment complete!${NC}"
echo ""
if [ -n "$DOMAIN" ]; then
  echo "  URL:      https://$DOMAIN"
else
  IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
  echo "  URL:      http://$IP"
fi
echo "  App Dir:  $APP_DIR"
echo "  PM2:      pm2 logs rms"
echo "  Restart:  pm2 restart rms"
echo "  Update:   cd $APP_DIR && git pull && npm ci && npm run build && pm2 restart rms"
echo "════════════════════════════════════════════════════════════════"
