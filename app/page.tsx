"use client";

import { useState } from "react";
import { DiagnoseForm } from "@/app/components/DiagnoseForm";
import { DiagnoseResult } from "@/app/components/DiagnoseResult";
import { APP_NAME } from "@/lib/constants";
import type { DiagnoseResult as DiagnoseResultType } from "@/types/diagnose";

export default function Home() {
  const [result, setResult] = useState<DiagnoseResultType | null>(null);
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-violet-50 via-white to-fuchsia-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <header className="border-b border-violet-100/80 bg-white/70 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-8 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
            MVP
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            {APP_NAME}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            X / Instagram / Threads
            向けの投稿文を入力すると、AIがやさしく診断。良いところ・改善のヒント・書き換え案・ハッシュタグ案をまとめてお届けします。
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
        <DiagnoseForm
          onResult={(r) => {
            setError("");
            setResult(r);
          }}
          onError={setError}
        />

        {error ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {result ? (
          <DiagnoseResult result={result} onReset={() => setResult(null)} />
        ) : null}

        <footer className="mt-auto border-t border-zinc-200/80 pt-8 text-center text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <p>
            このツールの結果は参考です。最終的な投稿内容はご自身の判断で調整してください。
          </p>
        </footer>
      </main>
    </div>
  );
}
