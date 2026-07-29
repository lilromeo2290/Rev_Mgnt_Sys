#!/bin/bash
# Auto-commit and push script for CLIPE Consult Digital Platform
# Usage: ./scripts/git-auto-push.sh "commit message"

set -e
cd /home/z/my-project

COMMIT_MSG="${1:-chore: auto-push $(date '+%Y-%m-%d %H:%M')}"

# Stage all changes
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

# Commit
git commit -m "$COMMIT_MSG"

# Push
git push 2>&1

echo "Pushed successfully: $COMMIT_MSG"
