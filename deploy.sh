#!/bin/bash
# ============================================================
#  Deploy Script — Consult RMS on Webuzo VPS
#  Usage: chmod +x deploy.sh && ./deploy.sh
# ============================================================
set -e

APP_DIR="/home/consult-rms"
REPO="https://github.com/lilromeo2290/consult-.git"
BRANCH="main"
PORT=3000

echo ""
echo "============================================"
echo "  Consult RMS — VPS Deployment"
echo "============================================"
echo ""

# ── 1. Install system dependencies if missing ──────────────
echo "[1/7] Checking system dependencies..."
if ! command -v git &> /dev/null; then
  echo "  Installing git..."
  sudo apt-get update -qq && sudo apt-get install -y -qq git
fi
if ! command -v node &> /dev/null; then
  echo "  Installing Node.js 20.x..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y -qq nodejs
fi
if ! command -v bun &> /dev/null; then
  echo "  Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi
if ! command -v pm2 &> /dev/null; then
  echo "  Installing PM2 globally..."
  sudo npm install -g pm2
fi
echo "  Done."

# ── 2. Check if port 3000 is available ──────────────────────
echo ""
echo "[2/7] Checking port $PORT..."
if lsof -i :$PORT &> /dev/null; then
  echo "  WARNING: Port $PORT is already in use by:"
  lsof -i :$PORT
  echo ""
  echo "  To free it, run: sudo kill \\$(lsof -t -i:$PORT)"
  echo "  Or change PORT in this script and ecosystem.config.cjs"
  exit 1
else
  echo "  Port $PORT is available."
fi

# ── 3. Clone or pull repository ─────────────────────────────
echo ""
echo "[3/7] Setting up project directory..."
if [ -d "$APP_DIR" ]; then
  echo "  Directory exists. Pulling latest changes..."
  cd "$APP_DIR"
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
else
  echo "  Cloning repository..."
  git clone -b "$BRANCH" "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 4. Install dependencies ─────────────────────────────────
echo ""
echo "[4/7] Installing dependencies..."
bun install --frozen-lockfile 2>/dev/null || bun install

# ── 5. Build the application ─────────────────────────────────
echo ""
echo "[5/7] Building Next.js application..."
bun run build

# ── 6. Copy static assets (required for standalone) ─────────
echo ""
echo "[6/7] Copying static assets..."
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
cp -r public .next/standalone/ 2>/dev/null || true

# ── 7. Start/restart with PM2 ───────────────────────────────
echo ""
echo "[7/7] Starting application with PM2..."
# Create logs directory
mkdir -p "$APP_DIR/logs"

# Stop existing if running
pm2 stop consult-rms 2>/dev/null || true
pm2 delete consult-rms 2>/dev/null || true

# Start fresh
pm2 start ecosystem.config.cjs

# Save PM2 config for auto-restart on reboot
pm2 save
pm2 startup 2>/dev/null || true

echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo ""
echo "  App URL:  http://YOUR_SERVER_IP:$PORT"
echo "  PM2 cmds: pm2 logs consult-rms"
echo "            pm2 restart consult-rms"
echo "            pm2 stop consult-rms"
echo ""
