# Simplified Setup Guide

## What Changed

We've eliminated the complicated Vercel cron job + GitHub API approach and replaced it with a much simpler GitHub Actions workflow.

## Old vs New

### Old (Complex):
- Vercel cron jobs → API endpoint → GitHub API commits
- Required: `CRON_SECRET` + `GITHUB_TOKEN` + permissions
- Prone to errors and permission issues

### New (Simple):
- GitHub Actions run the generation script directly
- Files are committed automatically by GitHub Actions
- Only requires API keys for AI services

## Setup Instructions

### 1. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and Variables → Actions

Add these secrets:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DEEPSEEK_API_KEY` - Your DeepSeek API key  
- `GEMINI_API_KEY` - Your Google Gemini API key
- `CLAUDE_API_KEY` - Your Anthropic Claude API key

### 2. Remove Vercel Configuration

You can now remove these from your Vercel environment:
- `CRON_SECRET` (no longer needed)
- `GITHUB_TOKEN` (no longer needed)

### 3. Clean Up

The GitHub Actions workflow will automatically:
- Run 5 times per day (6 AM, 10 AM, 2 PM, 6 PM, 10 PM UTC)
- Create directories if they don't exist
- Generate content using your AI voices
- Commit and push changes automatically

### 4. Optional: Remove Vercel Cron Jobs

You can remove the `vercel.json` file or comment out the crons section since we're no longer using Vercel for scheduling.

## How It Works

1. **GitHub Actions triggers** based on schedule (5 times per day)
2. **Script runs** in a proper Linux environment with full file system access
3. **Content is generated** using your AI voices
4. **Files are saved** to `content/daily/` and `logs/`
5. **Changes are committed** and pushed automatically

## Benefits

- ✅ **Much simpler** - no complex API chains
- ✅ **More reliable** - proper file system, no permission issues
- ✅ **Easier to debug** - logs are visible in GitHub Actions
- ✅ **No secrets complexity** - just need AI API keys
- ✅ **Automatic** - runs without any manual intervention
- ✅ **Scalable** - can easily adjust timing or add new voices

## Testing

You can manually trigger the workflow:
1. Go to your repository
2. Click "Actions" tab
3. Select "Daily Content Generation"
4. Click "Run workflow"

This allows you to test without waiting for the scheduled times.

## Monitoring

Check the Actions tab to see:
- When workflows run
- Success/failure status
- Detailed logs
- Generated content

The workflow will only commit files if new content is actually generated (prevents empty commits). 