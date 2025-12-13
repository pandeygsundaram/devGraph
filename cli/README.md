# DevGraph

DevGraph is a developer tool that **tracks and logs your LLM interactions** across both **CLI tools** and **browsers**, giving you a unified view of how you work with AI.

It captures:

- Prompts you type
- Responses from the model
- Session boundaries
- Tool metadata (Claude, OpenAI, Gemini, etc.)

---

## ✨ Features

- 🧠 Track LLM CLI usage (Claude, OpenAI, Gemini)
- 📜 Structured session-based logging
- 🧩 Works with any CLI via `devgraph run`
- 📂 JSONL logs (easy to query with `jq`, `grep`, etc.)

---

## 📦 Installation

### Npm Package

```bash
git clone https://github.com/your-username/devgraph.git
cd devgraph/cli
npm install
npm link
```

### Hook supported LLM CLIs

If you have official CLIs installed:

```bash
devgraph install
```

Supported tools:

```
claude
openai
gemini
```

DevGraph will automatically intercept and track their interactions.
