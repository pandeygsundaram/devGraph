# Renard 🦊

renard is a developer tool that **Logs your LLM interactions** across both **CLI tools** and **browsers**, giving you a unified view of how you work with AI.

It captures:

- Prompts you type
- Responses from the model
- Session boundaries
- Tool metadata (Claude, OpenAI, Gemini, etc.)

---

## ✨ Features

- 🧠 Track LLM CLI usage (Claude, OpenAI, Gemini)
- 📜 Structured session-based logging
- 🧩 Works with any CLI via `renard`
- 📂 JSONL logs (easy to query with `jq`, `grep`, etc.)
- 💾 Reads conversation history directly from CLI storage (Claude & Gemini)
- 🎯 Accurate conversation capture without terminal parsing

---

### Hook supported LLM CLIs

If you have official CLIs installed:

```bash
renard install
```

Supported tools:

```
claude
openai
gemini
```

renard will automatically intercept and track their interactions.

**How it works:**

- **Claude & Gemini**: Reads conversation history directly from their storage files
  - Claude: `~/.claude/projects/`
  - Gemini: `~/.gemini/tmp/*/chats/`
- **OpenAI**: Standard output capture (may be enhanced in future versions)
