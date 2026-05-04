import type { DiagnoseResult } from "@/types/diagnose";

/** API キー未設定・プレースホルダー時に返す固定の診断結果（ローカル確認用） */
export const MOCK_DIAGNOSE_RESULT: DiagnoseResult = {
  score: 82,
  goodPoints: [
    "投稿のテーマがわかりやすいです",
    "前向きな雰囲気があり、読み手が反応しやすい傾向があります",
  ],
  improvements: [
    "誰に向けた投稿かを少し足すと、より伝わりやすくなります",
    "最後に一言問いかけを入れると、コメントにつながりやすい傾向があります",
  ],
  rewrite:
    "今日からゆるく自炊ダイエットを始めます。無理せず続けたいので、まずは簡単なごはんから。 同じようにゆるく始めたい人いますか？",
  hashtags: ["#自炊", "#ダイエット", "#ゆるダイエット", "#習慣化"],
};
