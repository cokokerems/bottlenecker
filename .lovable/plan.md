

# Model Selector + Date Fix for AI Research Chat

## What Changes

1. **Three-model selector button** next to the chat input: Gemini 3 Pro, Gemini 3 Flash, and GPT-5.2
2. **Fix date awareness** so the AI always knows it's 2026 regardless of the question
3. **Model stored per conversation** and sent to the backend

## Files Modified

### 1. `src/hooks/useResearchChat.ts`
- Add `model` field to `Conversation` type with type `"google/gemini-3-pro-preview" | "google/gemini-3-flash-preview" | "openai/gpt-5.2"`
- Default to `"google/gemini-3-pro-preview"`
- Migrate old conversations without a model field (default them to flash)
- Pass `model` in the fetch body: `JSON.stringify({ messages: apiMessages, model: activeModel })`
- Expose `model` (current active conversation's model) and `setModel` function from the hook
- `setModel` updates the active conversation's model field in state

### 2. `src/components/ResearchChat.tsx`
- Import `Popover`, `PopoverTrigger`, `PopoverContent` from UI components and `ChevronDown` icon
- Add a model selector button to the **left** of the Textarea in the input bar
- Button shows short label: "Gemini Pro", "Flash", or "GPT-5.2" with a chevron
- Clicking opens a Popover with three options, each with a name and brief description:
  - **Gemini 3 Pro** -- "Deep reasoning, best for complex analysis"
  - **Gemini 3 Flash** -- "Fast, good for quick questions"
  - **GPT-5.2** -- "OpenAI's latest, strong reasoning"
- Selecting a model calls `setModel()` and closes the popover
- Active model gets a checkmark indicator

### 3. `supabase/functions/ai-research/index.ts`
- Accept optional `model` field from request body
- Validate it's one of the three allowed values; default to `"google/gemini-3-pro-preview"` if missing/invalid
- Use the chosen model in both the tool-calling loop (line 229) and the final streaming call (line 290)
- **Fix system prompt** (line 186): Replace the date instruction with:
  ```
  Today is [YYYY-MM-DD]. The current time is [ISO timestamp] UTC. The year is [YYYY]. 
  ALWAYS use this as your reference for "today", "current", "latest", "recent", and any 
  time-relative language. Your training data may be outdated -- never assume the current 
  year or date from your training knowledge.
  ```
  This makes date awareness unconditional so the model knows it's 2026 for every query, not just when asked "what time is it?"

## Input Bar Layout

```text
[ Model Button v ] [ Textarea ............................... ] [ Send ]
```

## Technical Details

**Allowed models (validated server-side):**
- `google/gemini-3-pro-preview` (default)
- `google/gemini-3-flash-preview`
- `openai/gpt-5.2`

**Conversation type update:**
```text
Conversation {
  id, title, messages, createdAt, updatedAt,
  model: "google/gemini-3-pro-preview" | "google/gemini-3-flash-preview" | "openai/gpt-5.2"
}
```

**Edge function request body:**
```text
{ messages: [...], model?: string }
```

**Edge function model usage:** The `model` field from the request replaces the hardcoded `"google/gemini-3-flash-preview"` in both the tool-calling `fetch` call and the final streaming `fetch` call.

