"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";

interface ProfileResponse {
  profile: {
    username: string;
    ranking: number | null;
    avatar: string | null;
    countryName: string | null;
    reputation: number | null;
    starRating: number | null;
    aboutMe: string | null;
    realName: string | null;
    school: string | null;
    websites: string[];
    skillTags: string[];
    submitStats: {
      difficulty: string;
      count: number;
      submissions: number;
    }[];
    recentSubmissions: {
      id: number;
      title: string;
      titleSlug: string;
      statusDisplay: string;
      lang: string;
      timestamp: number;
    }[];
  };
}

type ScrapeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: ProfileResponse["profile"] };

const difficultyColors: Record<string, string> = {
  All: "bg-slate-900 text-slate-50",
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

function formatTimestamp(ts: number) {
  const date = new Date(ts * 1000);
  return `${date.toLocaleDateString()} · ${date.toLocaleTimeString()}`;
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [state, setState] = useState<ScrapeState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setState({ status: "error", message: "Please enter a username." });
      return;
    }
    setState({ status: "loading" });
    startTransition(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmed }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to fetch profile.");
        }

        setState({ status: "success", data: payload.profile });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load profile right now.",
        });
      }
    });
  };

  const totals = useMemo(() => {
    if (state.status !== "success") return null;
    const byDifficulty = state.data.submitStats.reduce<Record<string, number>>(
      (acc, stat) => {
        if (stat.difficulty === "All") return acc;
        acc[stat.difficulty] = stat.count;
        return acc;
      },
      {},
    );

    return {
      solved: state.data.submitStats.find((s) => s.difficulty === "All")?.count ?? 0,
      byDifficulty,
    };
  }, [state]);

  return (
    <div className="min-h-screen bg-slate-950 pb-16 font-sans">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pt-16 md:px-6">
        <header className="flex flex-col gap-3 text-slate-50">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            LeetCode Scraper
          </h1>
          <p className="max-w-2xl text-base text-slate-300">
            Inspect public LeetCode profiles, view accepted submissions by
            difficulty, and review the latest problems completed — all without
            needing an account.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-black/30 backdrop-blur"
        >
          <label className="flex flex-col gap-2 text-slate-200">
            <span className="text-sm font-medium uppercase tracking-wide text-slate-400">
              LeetCode Username
            </span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="e.g. supreme-solver"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/50"
            />
          </label>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={state.status === "loading" || isPending}
          >
            {(state.status === "loading" || isPending) && (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            Scrape Profile
          </button>
        </form>

        {state.status === "error" && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-200">
            {state.message}
          </div>
        )}

        {state.status === "success" && (
          <section className="flex flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/30">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4 text-slate-100">
                {state.data.avatar && (
                  <Image
                    src={state.data.avatar}
                    alt={`${state.data.username} avatar`}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-2xl border border-slate-800 bg-slate-950/50 object-cover"
                  />
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-sm uppercase tracking-wide text-slate-400">
                    Username
                  </span>
                  <p className="text-2xl font-semibold">{state.data.username}</p>
                  {state.data.realName && (
                    <p className="text-sm text-slate-400">{state.data.realName}</p>
                  )}
                </div>
              </div>
              {totals && (
                <div className="flex flex-wrap items-center gap-4 text-slate-200">
                  <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Total Solved
                    </p>
                    <p className="text-2xl font-semibold">{totals.solved}</p>
                  </div>
                  {Object.entries(totals.byDifficulty).map(([key, value]) => {
                    const badgeClass =
                      difficultyColors[key] ?? "bg-slate-950 text-slate-100";
                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-2 text-center"
                      >
                        <p
                          className={`text-xs uppercase tracking-wide ${badgeClass} rounded-full px-2 py-1`}
                        >
                          {key}
                        </p>
                        <p className="mt-2 text-xl font-semibold">{value}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <div className="flex flex-col gap-6">
                <article className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Latest Accepted Submissions
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {state.data.recentSubmissions.length === 0 && (
                      <li className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
                        No recent submissions found.
                      </li>
                    )}
                    {state.data.recentSubmissions.map((submission) => (
                      <li
                        key={submission.id}
                        className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 transition hover:border-emerald-400/60 hover:bg-slate-900"
                      >
                        <a
                          href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                        >
                          {submission.title}
                        </a>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span>Language: {submission.lang}</span>
                          <span>Status: {submission.statusDisplay}</span>
                          <span>{formatTimestamp(submission.timestamp)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>

              <aside className="flex flex-col gap-6">
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Profile Snapshot
                  </h2>
                  <dl className="mt-4 grid gap-3 text-sm text-slate-300">
                    {state.data.countryName && (
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Country</dt>
                        <dd>{state.data.countryName}</dd>
                      </div>
                    )}
                    {state.data.ranking !== null && (
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Global Rank</dt>
                        <dd>#{state.data.ranking.toLocaleString()}</dd>
                      </div>
                    )}
                    {state.data.reputation !== null && (
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Reputation</dt>
                        <dd>{state.data.reputation}</dd>
                      </div>
                    )}
                    {state.data.starRating !== null && (
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Stars</dt>
                        <dd>{state.data.starRating.toFixed(1)}</dd>
                      </div>
                    )}
                    {state.data.school && (
                      <div className="flex justify-between">
                        <dt className="text-slate-400">School</dt>
                        <dd>{state.data.school}</dd>
                      </div>
                    )}
                  </dl>
                  {state.data.aboutMe && (
                    <p className="mt-4 rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-300">
                      {state.data.aboutMe}
                    </p>
                  )}
                </div>

                {state.data.skillTags.length > 0 && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                      Skills
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {state.data.skillTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {state.data.websites.length > 0 && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                      Links
                    </h2>
                    <ul className="mt-3 flex flex-col gap-2 text-sm text-emerald-300">
                      {state.data.websites.map((site) => (
                        <li key={site}>
                          <a
                            className="break-words hover:text-emerald-200"
                            href={site.startsWith("http") ? site : `https://${site}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {site}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
