export const APP_NAME = "SNS投稿ゆる診断メーカー";

export const MIN_POST_LENGTH = 1;
export const MAX_POST_LENGTH = 400;

/** 1 IP あたりの診断リクエスト上限（ウィンドウ内） */
export const RATE_LIMIT_MAX = 3;
/** レート制限ウィンドウ（ミリ秒） */
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** OPENAI_MODEL 未設定時のフォールバック（サーバー側の resolveOpenAIModel と API ルートでのみ使用） */
export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
