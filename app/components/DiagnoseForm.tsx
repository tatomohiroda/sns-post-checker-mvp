"use client";

import { useState } from "react";
import type { DiagnoseFormPayload, DiagnoseResult, Genre, SnsType, TargetReaction } from "@/types/diagnose";
import { MAX_POST_LENGTH } from "@/lib/constants";

const SNS_OPTIONS: SnsType[] = ["X", "Instagram", "Threads"];
const TARGET_OPTIONS: TargetReaction[] = [
  "いいね",
  "保存",
  "コメント",
  "フォロー",
];
const GENRE_OPTIONS: Genre[] = [
  "副業",
  "育児",
  "料理",
  "美容",
  "ビジネス",
  "趣味",
  "その他",
];

type Props = {
  onResult: (r: DiagnoseResult) => void;
  onError: (message: string) => void;
};

export function DiagnoseForm({ onResult, onError }: Props) {
  const [postText, setPostText] = useState("");
  const [sns, setSns] = useState<SnsType>("Instagram");
  const [targetReaction, setTargetReaction] =
    useState<TargetReaction>("いいね");
  const [genre, setGenre] = useState<Genre>("趣味");
  const [customGenre, setCustomGenre] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError("");

    const trimmed = postText.trim();
    if (!trimmed) {
      onError("投稿文を入力してください。");
      return;
    }
    if (trimmed.length > MAX_POST_LENGTH) {
      onError(`投稿文は${MAX_POST_LENGTH}文字以内にしてください。`);
      return;
    }

    const payload: DiagnoseFormPayload = {
      postText: trimmed,
      sns,
      targetReaction,
      genre,
      ...(genre === "その他" && customGenre.trim()
        ? { customGenre: customGenre.trim() }
        : {}),
    };

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = (await res.json()) as {
        result?: DiagnoseResult;
        error?: string;
        retryAfterSec?: number;
      };

      if (!res.ok) {
        const extra =
          res.status === 429 && data.retryAfterSec
            ? `（約${data.retryAfterSec}秒後）`
            : "";
        onError((data.error ?? "エラーが発生しました。") + extra);
        return;
      }
      if (!data.result) {
        onError("結果を取得できませんでした。");
        return;
      }
      onResult(data.result);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        onError("タイムアウトしました。時間をおいて再度お試しください。");
      } else {
        onError("通信に失敗しました。ネットワークを確認してください。");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-2xl border border-violet-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-violet-900/50 dark:bg-zinc-900/80"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="postText"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          投稿文
        </label>
        <textarea
          id="postText"
          name="postText"
          required
          rows={8}
          maxLength={MAX_POST_LENGTH}
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="診断したい投稿文を貼り付けてください（X / Instagram / Threads 向け）"
          className="min-h-[160px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-zinc-900 outline-none ring-violet-400/40 placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <p className="text-right text-xs text-zinc-500">
          {postText.length} / {MAX_POST_LENGTH}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="sns"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            投稿先
          </label>
          <select
            id="sns"
            name="sns"
            value={sns}
            onChange={(e) => setSns(e.target.value as SnsType)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {SNS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="targetReaction"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            狙う反応
          </label>
          <select
            id="targetReaction"
            name="targetReaction"
            value={targetReaction}
            onChange={(e) =>
              setTargetReaction(e.target.value as TargetReaction)
            }
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {TARGET_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="genre"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          ジャンル
        </label>
        <select
          id="genre"
          name="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value as Genre)}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {GENRE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {genre === "その他" && (
          <input
            type="text"
            name="customGenre"
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            maxLength={40}
            placeholder="具体的なテーマ（任意）"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-sm font-semibold text-white shadow-md transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "ゆる診断中…" : "ゆる診断する"}
      </button>
    </form>
  );
}
