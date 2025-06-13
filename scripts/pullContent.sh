#!/bin/bash

# Safe Content Pull Script
# Pulls AI-generated content without affecting your local code changes

echo "🤖 Pulling AI-generated content safely..."

# Stash any local changes
echo "📦 Stashing local changes..."
git stash push -m "Local changes before content pull $(date)"

# Pull the latest content
echo "⬇️ Pulling remote changes..."
git pull origin main

# Restore your local changes
echo "📤 Restoring local changes..."
git stash pop

echo "✅ Content pulled successfully!"
echo "📝 Check content/daily/ for new posts"

# Show what's new
echo ""
echo "🆕 Recent content files:"
ls -la content/daily/ | tail -5 