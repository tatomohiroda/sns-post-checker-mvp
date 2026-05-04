"use client";

import { useState } from "react";
import type { DiagnoseResult as DiagnoseResultType } from "@/types/diagnose";

type Props = {
  result: DiagnoseResultType;
  onReset?: () => void;
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {done ? "コピーしました" : label}
    </button>
  );
}

export function DiagnoseResult({ result, onReset }: Props) {
  const hashtagLine = result.hashtags.join(" ");

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-emerald-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-emerald-900/50 dark:bg-zinc-900/80">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            ゆる総合スコア
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
            {result.score}
            <span className="ml-1 text-lg font-semibold text-zinc-500">/100</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            いいところ
          </h3>
          <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {result.goodPoints.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
            もうひと伸び
          </h3>
          <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {result.improvements.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-violet-800 dark:text-violet-300">
            書き換え案
          </h3>
          <CopyButton text={result.rewrite} label="本文をコピー" />
        </div>
        <p className="whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm leading-relaxed text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100">
          {result.rewrite}
        </p>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-fuchsia-800 dark:text-fuchsia-300">
            ハッシュタグ案
          </h3>
          <CopyButton text={hashtagLine} label="タグをコピー" />
        </div>
        <p className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm leading-relaxed text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
          {hashtagLine}
        </p>
      </div>

      {onReset && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            もう一度診断する
          </button>
        </div>
      )}
    </section>
  );
}
