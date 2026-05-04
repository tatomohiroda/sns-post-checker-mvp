import OpenAI from "openai";
import { NextResponse } from "next/server";
import { MAX_POST_LENGTH, MIN_POST_LENGTH } from "@/lib/constants";
import { MOCK_DIAGNOSE_RESULT } from "@/lib/mockDiagnoseResult";
import {
  resolveOpenAIModel,
  shouldUseMockOpenAI,
} from "@/lib/openaiServer";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";
import type { DiagnoseFormPayload, DiagnoseResult, Genre, SnsType, TargetReaction } from "@/types/diagnose";

export const maxDuration = 60;

const SNS_TYPES: SnsType[] = ["X", "Instagram", "Threads"];
const TARGETS: TargetReaction[] = ["いいね", "保存", "コメント", "フォロー"];
const GENRES: Genre[] = [
  "副業",
  "育児",
  "料理",
  "美容",
  "ビジネス",
  "趣味",
  "その他",
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseDiagnoseResult(raw: unknown): DiagnoseResult | null {
  if (!isRecord(raw)) return null;
  const score = raw.score;
  const goodPoints = raw.goodPoints;
  const improvements = raw.improvements;
  const rewrite = raw.rewrite;
  const hashtags = raw.hashtags;

  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  if (!Array.isArray(goodPoints) || !goodPoints.every((x) => typeof x === "string"))
    return null;
  if (!Array.isArray(improvements) || !improvements.every((x) => typeof x === "string"))
    return null;
  if (typeof rewrite !== "string") return null;
  if (!Array.isArray(hashtags) || !hashtags.every((x) => typeof x === "string"))
    return null;

  const clampedScore = Math.min(95, Math.max(50, Math.round(score)));
  return {
    score: clampedScore,
    goodPoints,
    improvements,
    rewrite,
    hashtags,
  };
}

function validatePayload(body: unknown): DiagnoseFormPayload | null {
  if (!isRecord(body)) return null;
  const postText = body.postText;
  const sns = body.sns;
  const targetReaction = body.targetReaction;
  const genre = body.genre;
  const customGenre = body.customGenre;

  if (typeof postText !== "string") return null;
  const trimmed = postText.trim();
  if (trimmed.length < MIN_POST_LENGTH || trimmed.length > MAX_POST_LENGTH)
    return null;

  if (typeof sns !== "string" || !SNS_TYPES.includes(sns as SnsType))
    return null;
  if (
    typeof targetReaction !== "string" ||
    !TARGETS.includes(targetReaction as TargetReaction)
  )
    return null;
  if (typeof genre !== "string" || !GENRES.includes(genre as Genre)) return null;

  let custom: string | undefined;
  if (genre === "その他") {
    if (customGenre === undefined || customGenre === null) {
      custom = undefined;
    } else if (typeof customGenre === "string") {
      const g = customGenre.trim();
      if (g.length > 40) return null;
      custom = g.length > 0 ? g : undefined;
    } else {
      return null;
    }
  }

  return {
    postText: trimmed,
    sns: sns as SnsType,
    targetReaction: targetReaction as TargetReaction,
    genre: genre as Genre,
    customGenre: custom,
  };
}

function buildUserMessage(payload: DiagnoseFormPayload): string {
  const genreLine =
    payload.genre === "その他" && payload.customGenre
      ? `${payload.genre}（${payload.customGenre}）`
      : payload.genre;

  return [
    "以下の投稿文を診断してください。",
    "",
    `【投稿文】`,
    payload.postText,
    "",
    `【SNS】${payload.sns}`,
    `【狙う反応】${payload.targetReaction}`,
    `【ジャンル】${genreLine}`,
  ].join("\n");
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON の形式が不正です。" }, { status: 400 });
  }

  const payload = validatePayload(json);
  if (!payload) {
    return NextResponse.json({ error: "入力内容を確認してください。" }, { status: 400 });
  }

  const clientKey = getClientKey(request);
  const limited = checkRateLimit(clientKey);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: "しばらく待ってから再度お試しください。",
        retryAfterSec: limited.retryAfterSec,
      },
      { status: 429 },
    );
  }

  if (shouldUseMockOpenAI()) {
    return NextResponse.json({ result: MOCK_DIAGNOSE_RESULT });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (!apiKey) {
    return NextResponse.json({ result: MOCK_DIAGNOSE_RESULT });
  }

  const openai = new OpenAI({ apiKey });
  const model = resolveOpenAIModel();

  const system = `あなたはSNS投稿のライティングコーチです。ユーザーの投稿文を「やさしく」フィードバックします。
次のJSONだけを返してください（説明文やMarkdownは禁止）:
{
  "score": 50〜95の整数（総合スコア）,
  "goodPoints": ["良い点を短く", ...],
  "improvements": ["改善点を短く", ...],
  "rewrite": "改善を反映した書き換え案（1つ、本文のみ）",
  "hashtags": ["#ハッシュタグ", ...]
}

ルール:
- トーンは前向きで否定的すぎない。
- goodPoints / improvements は各2〜4個程度。
- hashtags はそのSNSに合う形式（Xは短め、Instagramはやや多めでも可）で3〜8個。
- rewrite はSNSに合わせる：Xなら短くインパクト重視、Instagramなら保存したくなるよう丁寧に、Threadsなら会話的で自然に。
- rewrite は元の意図を尊重し、過度にハードセルしない。
- 「必ずバズる」「確実に伸びる」などの断定表現は使わない。
- 日本語で書く。`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.6,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: buildUserMessage(payload) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "診断結果を取得できませんでした。" },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content) as unknown;
    } catch {
      return NextResponse.json(
        { error: "診断結果の解析に失敗しました。" },
        { status: 502 },
      );
    }

    const result = parseDiagnoseResult(parsed);
    if (!result) {
      return NextResponse.json(
        { error: "診断結果の形式が不正でした。" },
        { status: 502 },
      );
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { error: "診断に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 },
    );
  }
}
