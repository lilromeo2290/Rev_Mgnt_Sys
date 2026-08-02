#!/bin/bash
# ============================================================
#  Deploy Script — Consult RMS on Webuzo VPS
#  Usage: chmod +x deploy.sh && ./deploy.sh
# ============================================================
set -e

APP_DIR="/home/consult-rms"
DATA_DIR="/home/consult-rms/data"
REPO="https://github.com/lilromeo2290/consult-.git"
BRANCH="main"
PORT=3001

echo ""
echo "============================================"
echo "  Consult RMS — VPS Deployment"
echo "============================================"
echo ""

# ── 0. Ensure persistent data directory exists ────────────
echo "[0/8] Ensuring persistent data directory..."
mkdir -p "$DATA_DIR"
if [ ! -f "$DATA_DIR/rms.db" ]; then
  echo "  No existing database found. A fresh one will be created on first run."
else
  echo "  Existing database preserved: $DATA_DIR/rms.db"
  DB_SIZE=$(du -h "$DATA_DIR/rms.db" | cut -f1)
  echo "  Database size: $DB_SIZE"
fi

# ── 1. Install system dependencies if missing ──────────────
echo ""
echo "[1/8] Checking system dependencies..."
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

# ── 2. Check if port is available ──────────────────────────
echo ""
echo "[2/8] Checking port $PORT..."
if lsof -i :$PORT &> /dev/null; then
  echo "  WARNING: Port $PORT is already in use by:"
  lsof -i :$PORT
  echo ""
  echo "  Stopping existing process to free port..."
  pm2 stop consult-rms 2>/dev/null || true
  sleep 2
  if lsof -i :$PORT &> /dev/null; then
    echo "  Port $PORT still in use. Killing remaining process..."
    sudo kill $(lsof -t -i:$PORT) 2>/dev/null || true
    sleep 1
  fi
else
  echo "  Port $PORT is available."
fi

# ── 3. Clone or pull repository ─────────────────────────────
echo ""
echo "[3/8] Setting up project directory..."
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
echo "[4/8] Installing dependencies..."
bun install --frozen-lockfile 2>/dev/null || bun install

# ── 5. Create .env with persistent DATABASE_URL ─────────────
echo ""
echo "[5/8] Configuring environment..."
cat > "$APP_DIR/.env" << EOF
DATABASE_URL=file:$DATA_DIR/rms.db
EOF
echo "  DATABASE_URL set to: file:$DATA_DIR/rms.db"

# ── 6. Build the application ─────────────────────────────────
echo ""
echo "[6/8] Building Next.js application..."
bun run build

# ── 7. Copy static assets (required for standalone) ─────────
echo ""
echo "[7/8] Copying static assets..."
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
cp -r public .next/standalone/ 2>/dev/null || true
cp -r prisma .next/standalone/ 2>/dev/null || true

# ── 8. Start/restart with PM2 ───────────────────────────────
echo ""
echo "[8/8] Starting application with PM2..."
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
echo "  Database: $DATA_DIR/rms.db (PERSISTENT)"
echo "  PM2 cmds: pm2 logs consult-rms"
echo "            pm2 restart consult-rms"
echo "            pm2 stop consult-rms"
echo ""
