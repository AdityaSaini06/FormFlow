"use client";

import { AlertCircle, Check, Copy, List, Loader2, Plus, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BuilderCanvas } from "@/features/builder/components/builder-canvas";
import { BuilderSettingsPanel } from "@/features/builder/components/builder-settings-panel";
import { BuilderSidebar } from "@/features/builder/components/builder-sidebar";
import {
  createQuestion,
  deleteQuestion,
  getBuilderForm,
  publishForm,
  reorderQuestions,
  unpublishForm,
  updateQuestion,
} from "@/services/builder.service";
import { updateForm } from "@/services/forms.service";
import type { FormBuilder } from "@/types/forms";
import type { Question, QuestionUpdateInput } from "@/types/questions";

export function BuilderPage({ formId }: { formId: number }) {
  const [form, setForm] = useState<FormBuilder | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"questions" | "settings" | null>(null);
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

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

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

  async function handleDuplicateQuestion(question: Question) {
    setIsCreating(true);
    setError(null);
    try {
      const duplicate = await createQuestion(formId, {
        type: question.type,
        title: question.title.replace(/(?:\s+copy)+\s*$/i, ""),
        description: question.description,
        placeholder: question.placeholder,
        is_required: question.is_required,
        options: question.options.map(({ label, value }) => ({ label, value })),
      });
      setForm((current) =>
        current ? { ...current, questions: [...current.questions, duplicate] } : current,
      );
      setSelectedQuestionId(duplicate.id);
    } catch {
      setError("Unable to duplicate question.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateForm(changes: { title?: string; description?: string | null }) {
    try {
      const updated = await updateForm(formId, changes);
      setForm((current) => (current ? { ...current, ...updated } : current));
    } catch {
      setError("Unable to update form settings.");
    }
  }

  function handleDraftQuestionChange(questionId: number, changes: QuestionUpdateInput) {
    setForm((currentForm) =>
      currentForm
        ? {
            ...currentForm,
            questions: currentForm.questions.map((question) =>
              question.id === questionId ? applyDraftChanges(question, changes) : question,
            ),
          }
        : currentForm,
    );
  }

  async function handleUpdateQuestion(questionId: number, changes: QuestionUpdateInput) {
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

  async function handleReorderQuestions(questionIds: number[]) {
    if (!form) {
      return;
    }

    const previousQuestions = form.questions;
    const optimisticQuestions = questionIds
      .map((questionId) => previousQuestions.find((question) => question.id === questionId))
      .filter((question): question is Question => Boolean(question))
      .map((question, index) => ({ ...question, position: index + 1 }));

    setForm({ ...form, questions: optimisticQuestions });
    setError(null);

    try {
      const updatedQuestions = await reorderQuestions(formId, questionIds);
      setForm((currentForm) =>
        currentForm
          ? {
              ...currentForm,
              questions: updatedQuestions,
            }
          : currentForm,
      );
    } catch {
      setForm((currentForm) => (currentForm ? { ...currentForm, questions: previousQuestions } : currentForm));
      setError("Unable to reorder questions.");
    }
  }

  async function handlePublishForm() {
    if (!form) {
      return;
    }

    setIsPublishing(true);
    setError(null);
    try {
      const publishedForm = await publishForm(form.id);
      setForm({
        ...form,
        status: publishedForm.status,
        published_at: publishedForm.published_at,
        updated_at: publishedForm.updated_at,
      });
      setNotice("Form published");
    } catch {
      setError("Unable to publish form.");
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleUnpublishForm() {
    if (!form) return;
    setIsPublishing(true);
    setError(null);
    try {
      const draft = await unpublishForm(form.id);
      setForm({ ...form, status: draft.status, published_at: draft.published_at, updated_at: draft.updated_at });
      setNotice("Form unpublished");
    } catch {
      setError("Unable to unpublish form.");
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleCopyLink() {
    if (!form || form.status !== "published") return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/to/${form.slug}`);
      setNotice("Public link copied");
    } catch {
      setError("Unable to copy the public link.");
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
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-white px-4 py-3 sm:px-6">
        <div className="text-xl font-semibold">FormFlow</div>
        <nav className="hidden justify-center gap-8 text-sm lg:flex">
          <Link href="/" className="pb-2 text-black/60 transition hover:text-black">
            Dashboard
          </Link>
          <span className="border-b border-black pb-2 font-semibold">Create</span>
          <span className="pb-2 text-black/60">Connect</span>
          <span className="pb-2 text-black/60">Share</span>
          <Link href={`/forms/${form.id}/results`} className="pb-2 text-black/60 transition hover:text-black">
            Results
          </Link>
        </nav>
        <div className="relative flex items-center justify-end gap-2">
          <button onClick={() => setMobilePanel("questions")} className="grid h-9 w-9 place-items-center rounded-md bg-black/[0.04] xl:hidden" aria-label="Open questions">
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setMobilePanel("settings")} className="grid h-9 w-9 place-items-center rounded-md bg-black/[0.04] xl:hidden" aria-label="Open question settings">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          {notice ? (
            <span className="absolute right-0 top-11 z-20 flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-xs font-medium shadow-sm">
              <Check className="h-3.5 w-3.5" />
              {notice}
            </span>
          ) : null}
          <button
            onClick={handleCopyLink}
            disabled={form.status !== "published"}
            title={form.status === "published" ? "Copy public link" : "Publish before sharing"}
            className="hidden h-9 items-center gap-2 rounded-md bg-black/[0.04] px-3 text-sm font-semibold disabled:opacity-40 sm:inline-flex"
          >
            <Copy className="h-4 w-4" />
            Share
          </button>
          <Link
            className="hidden h-9 items-center rounded-md bg-black/[0.04] px-5 text-sm font-semibold sm:inline-flex"
            href={`/to/${form.slug}`}
            target="_blank"
          >
            Preview
          </Link>
          <button
            onClick={form.status === "published" ? handleUnpublishForm : handlePublishForm}
            disabled={isPublishing}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {form.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </header>

      {mobilePanel ? <button onClick={() => setMobilePanel(null)} className="fixed inset-0 z-40 bg-black/30 xl:hidden" aria-label="Close panel" /> : null}

      <section className="grid min-h-[calc(100vh-4rem)] grid-cols-1 xl:grid-cols-[260px_1fr_300px]">
        <div className={mobilePanel === "questions" ? "fixed inset-y-0 left-0 z-50 w-[min(320px,90vw)] overflow-y-auto bg-white xl:static xl:z-auto xl:w-auto" : "hidden xl:block"}>
          <div className="flex h-14 items-center justify-between border-b border-black/10 px-4 xl:hidden">
            <span className="font-semibold">Questions</span>
            <button onClick={() => setMobilePanel(null)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-black/[0.04]" aria-label="Close questions"><X className="h-4 w-4" /></button>
          </div>
          <BuilderSidebar
            form={form}
            selectedQuestionId={selectedQuestionId}
            isCreating={isCreating}
            onAddQuestion={handleCreateQuestion}
            onReorderQuestions={handleReorderQuestions}
            onSelectQuestion={(questionId) => {
              setSelectedQuestionId(questionId);
              setMobilePanel(null);
            }}
            onUpdateForm={handleUpdateForm}
          />
        </div>

        <div className="flex min-w-0 flex-col items-center px-4 py-6 sm:px-6 sm:py-10">
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

        <div className={mobilePanel === "settings" ? "fixed inset-y-0 right-0 z-50 w-[min(360px,92vw)] overflow-y-auto bg-white xl:static xl:z-auto xl:w-auto" : "hidden xl:block"}>
          <div className="flex h-14 items-center justify-between border-b border-black/10 px-4 xl:hidden">
            <span className="font-semibold">Question settings</span>
            <button onClick={() => setMobilePanel(null)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-black/[0.04]" aria-label="Close settings"><X className="h-4 w-4" /></button>
          </div>
          <BuilderSettingsPanel
            question={selectedQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onDuplicateQuestion={handleDuplicateQuestion}
            onDraftQuestionChange={handleDraftQuestionChange}
            onUpdateQuestion={handleUpdateQuestion}
          />
        </div>
      </section>
    </main>
  );
}

function applyDraftChanges(question: Question, changes: QuestionUpdateInput): Question {
  return {
    ...question,
    ...changes,
    description: changes.description === undefined ? question.description : changes.description,
    placeholder: changes.placeholder === undefined ? question.placeholder : changes.placeholder,
    options:
      changes.options?.map((option, index) => ({
        id: question.options[index]?.id ?? -(index + 1),
        question_id: question.id,
        label: option.label,
        value: option.value ?? option.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
        position: index + 1,
        created_at: question.created_at,
        updated_at: question.updated_at,
      })) ?? question.options,
  };
}
