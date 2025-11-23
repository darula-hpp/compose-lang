# Real LLM Integration Setup

## Prerequisites

You need an API key from one of the supported providers:

### OpenAI (GPT-4)
1. Get an API key from https://platform.openai.com/api-keys
2. Set environment variable:
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

### Anthropic (Claude) - Coming Soon
1. Get an API key from https://console.anthropic.com/
2. Set environment variable:
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

### Google Gemini ✨ NEW
1. Get an API key from https://makersuite.google.com/app/apikey
2. Set environment variable:
   ```bash
   export GEMINI_API_KEY="..."
   ```

## Configuration

Update `compose.json` to use a real LLM:

### OpenAI GPT-4
```json
{
  "llm": {
    "provider": "openai",
    "model": "gpt-4",
    "apiKey": "${OPENAI_API_KEY}",
    "temperature": 0.2,
    "maxTokens": 2048
  }
}
```

### Google Gemini
```json
{
  "llm": {
    "provider": "gemini",
    "model": "gemini-pro",
    "apiKey": "${GEMINI_API_KEY}",
    "temperature": 0.2,
    "maxTokens": 2048
  }
}
```

## Testing

```bash
# Set your API key
export OPENAI_API_KEY="sk-..."

# Build with real LLM
cd demo
compose build
```

## Cost Estimation

**OpenAI GPT-4:**
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- Typical component: ~500 tokens = $0.045

**Mock Mode (Free):**
Set `"mock": true` in compose.json or omit the API key.

## Supported Models

### OpenAI ✅
- `gpt-4` (recommended for quality)
- `gpt-4-turbo` (faster)
- `gpt-3.5-turbo` (fastest, cheapest)

### Google Gemini ✅ NEW
- `gemini-pro` (recommended)
- `gemini-pro-vision` (with image support)

### Coming Soon
- Anthropic Claude 3 (Opus, Sonnet, Haiku)
- Local Llama models via Ollama

## Error Handling

The compiler automatically falls back to mock mode if:
- No API key is provided
- API key is invalid
- Rate limit exceeded
- Network error

You'll see warnings in the console when falling back.
