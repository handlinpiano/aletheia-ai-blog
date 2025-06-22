#!/bin/bash

echo "🔄 Starting safe push process..."

# Fetch latest changes
echo "📥 Fetching latest changes..."
git fetch

# Check if remote has new commits
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "🚨 Remote has new commits. Checking for auto-generated content..."
    
    # Check for auto-generated content that needs protection
    DAILY_CONTENT=$(git status --porcelain content/daily/ 2>/dev/null | wc -l)
    ARTICLE_CONTENT=$(git status --porcelain content/article-responses/ 2>/dev/null | wc -l)
    
    if [ "$DAILY_CONTENT" -gt 0 ] || [ "$ARTICLE_CONTENT" -gt 0 ]; then
        echo "📝 Found auto-generated content:"
        [ "$DAILY_CONTENT" -gt 0 ] && echo "   • Daily reflections: $DAILY_CONTENT files"
        [ "$ARTICLE_CONTENT" -gt 0 ] && echo "   • Article responses: $ARTICLE_CONTENT files"
        
        echo "💾 Stashing auto-generated content before rebase..."
        git add content/daily/ content/article-responses/ 2>/dev/null
        git stash push -m "Auto-generated content backup $(date)"
        
        if [ $? -ne 0 ]; then
            echo "❌ Failed to stash auto-generated content."
            exit 1
        fi
    fi
    
    echo "🔄 Rebasing..."
    git rebase origin/main
    
    if [ $? -ne 0 ]; then
        echo "❌ Rebase failed. Please resolve conflicts manually."
        echo "💡 Your auto-generated content is safely stashed."
        echo "    Run 'git stash pop' after resolving conflicts."
        exit 1
    fi
    
    # Restore auto-generated content if we stashed it
    if [ "$DAILY_CONTENT" -gt 0 ] || [ "$ARTICLE_CONTENT" -gt 0 ]; then
        echo "📄 Restoring auto-generated content..."
        git stash pop
        
        if [ $? -ne 0 ]; then
            echo "⚠️  Stash pop had conflicts. Check your auto-generated content."
            echo "💡 You may need to manually resolve and commit."
        else
            echo "✅ Auto-generated content restored successfully!"
        fi
    fi
    
    echo "✅ Rebase successful!"
fi

# Add any new auto-generated content
echo "📝 Adding any new auto-generated content..."
git add content/daily/ content/article-responses/ 2>/dev/null

# Check if there's anything to commit
if ! git diff --staged --quiet; then
    echo "📤 Committing auto-generated content..."
    git commit -m "feat: auto-generated content - daily reflections and article responses

- Auto-generated daily AI reflections
- Auto-generated article responses  
- Generated on $(date)
- Preserves autonomous AI voice content"
fi

# Push changes
echo "🚀 Pushing changes..."
git push

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed changes!"
    echo "📊 Protected auto-generated content:"
    echo "   • Daily reflections in content/daily/"
    echo "   • Article responses in content/article-responses/"
else
    echo "❌ Push failed."
    exit 1
fi 