"use client";

import { AlertCircle, ArrowLeft, BarChart3, Clock, ExternalLink, Inbox, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getFormResults } from "@/services/results.service";
import type { FormResults, QuestionResultSummary } from "@/types/responses";

export function ResultsPage({ formId }: { formId: number }) {
  const [results, setResults] = useState<FormResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      try {
        const data = await getFormResults(formId);
        if (isMounted) {
          setResults(data);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load results.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (Number.isFinite(formId)) {
      loadResults();
    } else {
      setError("Invalid form id.");
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [formId]);

  const answeredQuestions = useMemo(
    () => results?.questions.filter((question) => question.response_count > 0).length ?? 0,
    [results],
  );

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f5] text-brand-ink">
        <div className="flex items-center gap-3 text-sm font-medium text-black/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading results
        </div>
      </main>
    );
  }

  if (error || !results) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f5] px-6 text-brand-ink">
        <div className="flex max-w-md items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error ?? "Results unavailable."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-brand-ink">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href={`/forms/${results.id}/builder`} className="rounded-md px-3 py-2 font-medium text-black/65 transition hover:bg-black/[0.04] hover:text-black">
              Builder
            </Link>
            <Link href={`/to/${results.slug}`} target="_blank" className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 font-semibold text-white">
              Open form
              <ExternalLink className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-black/45">
              {results.status === "published" ? "Active form" : "Draft form"}
            </p>
            <h1 className="text-4xl font-semibold tracking-normal">{results.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              {results.description ?? "Response summary and recent submissions."}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard icon={Users} label="Total responses" value={results.response_count.toLocaleString()} />
          <StatCard icon={Clock} label="Avg. completion" value={formatDuration(results.average_completion_time_seconds)} />
          <StatCard icon={BarChart3} label="Answered questions" value={`${answeredQuestions}/${results.questions.length}`} />
        </div>

        {results.response_count === 0 ? (
          <EmptyResults slug={results.slug} />
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <section className="space-y-5">
              {results.questions.map((question) => (
                <QuestionSummary key={question.question_id} question={question} />
              ))}
            </section>

            <section className="rounded-lg border border-black/10 bg-white">
              <div className="border-b border-black/10 px-5 py-4">
                <h2 className="text-sm font-semibold">Recent submissions</h2>
              </div>
              <div className="divide-y divide-black/[0.06]">
                {results.recent_responses.map((response) => (
                  <article key={response.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">Response #{response.id}</p>
                      <p className="text-xs text-black/45">{formatDateTime(response.submitted_at)}</p>
                    </div>
                    <p className="mt-1 text-xs text-black/45">{formatDuration(response.completion_time_seconds)}</p>
                    <div className="mt-3 space-y-2">
                      {response.answers.slice(0, 3).map((answer) => (
                        <p key={`${response.id}-${answer.question_id}`} className="truncate text-xs text-black/65">
                          <span className="font-semibold text-black/80">{answer.question_title}:</span> {answer.value}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-normal text-black/45">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-4 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function QuestionSummary({ question }: { question: QuestionResultSummary }) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-6">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
        <div>
          <h2 className="text-base font-semibold">{question.title}</h2>
          <p className="mt-1 text-xs uppercase tracking-normal text-black/45">
            {question.response_count.toLocaleString()} answers
            {question.average_number !== null ? ` / Avg. ${question.average_number}` : ""}
          </p>
        </div>
      </div>

      {question.options.length > 0 ? (
        <div className="mt-5 space-y-3">
          {question.options.map((option) => (
            <div key={`${question.question_id}-${option.label}`} className="grid grid-cols-[120px_1fr_64px] items-center gap-3 text-sm">
              <span className="truncate font-medium">{option.label}</span>
              <div className="h-3 overflow-hidden rounded-full bg-black/10">
                <div className="h-full rounded-full bg-[#007b8f]" style={{ width: `${option.percentage}%` }} />
              </div>
              <span className="text-right tabular-nums text-black/60">{option.count}</span>
            </div>
          ))}
        </div>
      ) : null}

      {question.text_answers.length > 0 ? (
        <div className="mt-5 space-y-2">
          {question.text_answers.map((answer, index) => (
            <p key={`${question.question_id}-${index}`} className="rounded-md bg-black/[0.03] px-3 py-2 text-sm text-black/70">
              {answer}
            </p>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function EmptyResults({ slug }: { slug: string }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-lg border border-dashed border-black/15 bg-white px-6 py-16 text-center">
      <Inbox className="h-8 w-8 text-black/35" />
      <h2 className="mt-4 text-lg font-semibold">No responses yet</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-black/55">Share the public form to start collecting submissions.</p>
      <Link href={`/to/${slug}`} target="_blank" className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-black px-4 text-sm font-semibold text-white">
        Open form
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
  );
}

function formatDuration(seconds: number | null) {
  if (seconds === null) {
    return "N/A";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
