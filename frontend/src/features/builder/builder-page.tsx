"use client";

import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BuilderCanvas } from "@/features/builder/components/builder-canvas";
import { BuilderSettingsPanel } from "@/features/builder/components/builder-settings-panel";
import { BuilderSidebar } from "@/features/builder/components/builder-sidebar";
import { createQuestion, deleteQuestion, getBuilderForm, updateQuestion } from "@/services/builder.service";
import type { FormBuilder } from "@/types/forms";
import type { Question } from "@/types/questions";

export function BuilderPage({ formId }: { formId: number }) {
  const [form, setForm] = useState<FormBuilder | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBuilder() {
      try {
        const data = await getBuilderForm(formId);
        if (isMounted) {
          setForm(data);
          setSelectedQuestionId(data.questions[0]?.id ?? null);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load builder.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (Number.isFinite(formId)) {
      loadBuilder();
    } else {
      setError("Invalid form id.");
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [formId]);

  const selectedQuestion = useMemo(
    () => form?.questions.find((question) => question.id === selectedQuestionId) ?? null,
    [form, selectedQuestionId],
  );

  async function handleCreateQuestion() {
    setIsCreating(true);
    setError(null);

    try {
      const question = await createQuestion(formId, {
        type: "short_text",
        title: "Untitled question",
        placeholder: "Type your answer here...",
        is_required: false,
      });
      setForm((currentForm) =>
        currentForm
          ? {
              ...currentForm,
              questions: [...currentForm.questions, question],
            }
          : currentForm,
      );
      setSelectedQuestionId(question.id);
    } catch {
      setError("Unable to add question.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateQuestion(questionId: number, changes: Partial<Question>) {
    try {
      const updated = await updateQuestion(formId, questionId, changes);
      setForm((currentForm) =>
        currentForm
          ? {
              ...currentForm,
              questions: currentForm.questions.map((question) =>
                question.id === updated.id ? updated : question,
              ),
            }
          : currentForm,
      );
    } catch {
      setError("Unable to update question.");
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    try {
      await deleteQuestion(formId, questionId);
      setForm((currentForm) => {
        if (!currentForm) {
          return currentForm;
        }

        const questions = currentForm.questions
          .filter((question) => question.id !== questionId)
          .map((question, index) => ({ ...question, position: index + 1 }));
        setSelectedQuestionId(questions[0]?.id ?? null);
        return { ...currentForm, questions };
      });
    } catch {
      setError("Unable to delete question.");
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f4f2] text-brand-ink">
        <div className="flex items-center gap-3 text-sm font-medium text-black/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading builder
        </div>
      </main>
    );
  }

  if (error || !form) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f4f2] px-6 text-brand-ink">
        <div className="flex max-w-md items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error ?? "Builder unavailable."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4f2] text-brand-ink">
      <header className="grid h-16 grid-cols-[240px_1fr_240px] items-center border-b border-black/10 bg-white px-6">
        <div className="text-xl font-semibold">FormFlow</div>
        <nav className="flex justify-center gap-10 text-sm">
          <span className="border-b border-black pb-2 font-semibold">Create</span>
          <span className="pb-2 text-black/60">Connect</span>
          <span className="pb-2 text-black/60">Share</span>
          <span className="pb-2 text-black/60">Results</span>
        </nav>
        <div className="flex justify-end gap-3">
          <button className="h-9 rounded-md bg-black/[0.04] px-5 text-sm font-semibold">Preview</button>
          <button className="h-9 rounded-md bg-black px-5 text-sm font-semibold text-white">Publish</button>
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-4rem)] grid-cols-[260px_1fr_300px]">
        <BuilderSidebar
          form={form}
          selectedQuestionId={selectedQuestionId}
          isCreating={isCreating}
          onAddQuestion={handleCreateQuestion}
          onSelectQuestion={setSelectedQuestionId}
        />

        <div className="flex flex-col items-center px-6 py-10">
          <BuilderCanvas form={form} question={selectedQuestion} />
          <button
            onClick={handleCreateQuestion}
            disabled={isCreating}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-6 text-sm font-semibold shadow-sm transition hover:bg-black/[0.03] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Next Question
          </button>
        </div>

        <BuilderSettingsPanel
          question={selectedQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onUpdateQuestion={handleUpdateQuestion}
        />
      </section>
    </main>
  );
}
