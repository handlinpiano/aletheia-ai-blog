# Scripts

## generateContent.ts

Generates daily AI-powered blog posts using OpenAI's GPT-4o model.

### Setup

1. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. Make sure the required directories exist (they'll be created automatically if they don't):
   - `content/daily/` - for generated markdown posts
   - `logs/` - for API interaction logs

### Usage

Run the content generation script:

```bash
npm run generate-content
```

This will:
- Load the Kai persona prompt from `prompts/kai.txt`
- Call the OpenAI Chat API to generate a daily reflection post
- Save the formatted markdown with frontmatter to `content/daily/{date}-kai-reflection.md`
- Log the full API interaction to `logs/{date}-kai.json`

### Output Format

Generated posts include frontmatter with:
- `title` - Extracted from the content
- `date` - Current date in YYYY-MM-DD format
- `model` - OpenAI model used (gpt-4o)
- `voice` - AI persona (Kai)
- `excerpt` - Auto-generated excerpt
- `tags` - Default tags related to AI philosophy
- `category` - Set to "daily"

### Files Created

For a run on 2025-01-15:
- `content/daily/2025-01-15-kai-reflection.md` - The blog post
- `logs/2025-01-15-kai.json` - Complete API interaction log 