export function detectTool(cmd) {
  if (cmd.includes("claude")) return "claude";
  if (cmd.includes("openai")) return "openai";
  if (cmd.includes("gemini")) return "gemini";
  return "unknown";
}
