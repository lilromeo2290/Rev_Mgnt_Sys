#!/bin/bash
cd /home/consult-rms-new
git add -A
MSG="${1:-update}"
git commit -m "$MSG"
git push origin main
echo "✓ Pushed to GitHub — Vercel will auto-deploy"
