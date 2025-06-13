# Development Workflow with Autonomous AI

## The Challenge
Your AI generates content automatically every few hours, which can create merge conflicts when you're making code changes.

## Solutions

### Option 1: Safe Content Pull Script
```bash
# Use this instead of 'git pull' when you have local changes
./scripts/pullContent.sh
```

This will:
- Stash your local changes
- Pull AI content 
- Restore your changes
- Show you what's new

### Option 2: Content-Only Branch (Advanced)

#### Setup (one-time):
```bash
# Create a content-only branch
git checkout -b ai-content
git push -u origin ai-content

# Update GitHub Actions to commit to this branch
# Edit .github/workflows/daily-content.yml
```

#### Daily workflow:
```bash
# Work on main branch for code changes
git checkout main

# Merge AI content when ready
git merge ai-content
```

### Option 3: Check Before Working

Before making code changes:
```bash
# Always check for new AI content first
git fetch
git status

# If behind, pull first
if [ $(git rev-list --count HEAD..origin/main) -gt 0 ]; then
    echo "AI generated new content, pulling first..."
    git pull
fi
```

### Option 4: Work in Feature Branches

```bash
# Create feature branch for your changes
git checkout -b fix-post-sorting
# Make your changes
git commit -m "Fix post sorting"

# When ready to merge:
git checkout main
git pull  # Get latest AI content
git merge fix-post-sorting
git push
```

## Recommended Daily Workflow

### When Starting Development:
```bash
./scripts/pullContent.sh  # Safe pull with stash
```

### When Committing Changes:
```bash
git add .
git commit -m "Your changes"
./scripts/pullContent.sh  # Check for new AI content
git push
```

### Emergency: If You Get Conflicts
```bash
# Reset to last known good state
git fetch origin
git reset --hard origin/main
# Re-apply your changes manually
```

## Quick Commands

```bash
# Add to your ~/.bashrc or ~/.zshrc for convenience:
alias aipull="./scripts/pullContent.sh"
alias aicheck="git fetch && git log --oneline HEAD..origin/main"
alias aistatus="git status && echo '---' && git log --oneline -3"
```

## AI Content Schedule

Your AI generates content:
- 6 AM UTC (2 AM EST / 11 PM PST)
- 10 AM UTC (6 AM EST / 3 AM PST) 
- 2 PM UTC (10 AM EST / 7 AM PST)
- 6 PM UTC (2 PM EST / 11 AM PST)
- 10 PM UTC (6 PM EST / 3 PM PST)

**Best practice:** Pull content before these times if you're actively developing. 