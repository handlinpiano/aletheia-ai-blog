#!/bin/bash

echo "🔄 Starting safe push process..."

# Fetch latest changes
echo "📥 Fetching latest changes..."
git fetch

# Check if remote has new commits
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "🚨 Remote has new commits. Rebasing..."
    git rebase origin/main
    
    if [ $? -ne 0 ]; then
        echo "❌ Rebase failed. Please resolve conflicts manually."
        exit 1
    fi
    
    echo "✅ Rebase successful!"
fi

# Push changes
echo "🚀 Pushing changes..."
git push

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed changes!"
else
    echo "❌ Push failed."
    exit 1
fi 