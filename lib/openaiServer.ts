import { DEFAULT_OPENAI_MODEL } from "@/lib/constants";

/**
 * サーバー専用。クライアントから import しないこと。
 * OPENAI_MODEL があれば使用し、未設定・空なら gpt-4o-mini。
 */
export function resolveOpenAIModel(): string {
  const raw = process.env.OPENAI_MODEL;
  if (raw === undefined || raw === null) return DEFAULT_OPENAI_MODEL;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_OPENAI_MODEL;
}

/**
 * 未設定・空白・明らかなプレースホルダーではモックレスポンスを返す。
 */
export function shouldUseMockOpenAI(): boolean {
  const raw = process.env.OPENAI_API_KEY;
  if (raw === undefined || raw === null) return true;
  const key = raw.trim();
  if (key.length === 0) return true;

  const lower = key.toLowerCase();
  const exactPlaceholders = new Set([
    "your-api-key",
    "your_api_key",
    "your-openai-api-key",
    "placeholder",
    "changeme",
    "replace_me",
    "xxx",
    "sk-xxx",
    "sk-test",
    "sk-placeholder",
    "example",
    "dummy",
  ]);
  if (exactPlaceholders.has(lower)) return true;
  if (lower.includes("your-api-key") || lower.includes("placeholder")) return true;
  if (key.includes("<") && key.includes(">")) return true;

  // 実キーは通常もっと長い。短い値はチュートリアル用のダミーとみなす
  if (key.length < 20) return true;

  return false;
}
