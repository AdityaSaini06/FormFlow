"use client";

import { AlertCircle, Check, Loader2, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DashboardTable } from "@/features/dashboard/components/dashboard-table";
import { TopNav } from "@/features/dashboard/components/top-nav";
import { createForm, deleteForm, duplicateForm, listForms } from "@/services/forms.service";
import type { FormListItem } from "@/types/forms";

export function DashboardPage() {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormListItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadForms() {
      try {
        const data = await listForms();
        if (isMounted) {
          setForms(data);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load forms.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadForms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const totalResponses = useMemo(
    () => forms.reduce((total, form) => total + form.response_count, 0),
    [forms],
  );

  async function handleCreateForm() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setIsCreating(true);
    setError(null);

    try {
      const form = await createForm({
        title: trimmedTitle,
        description: description.trim() || null,
      });
      setForms((currentForms) => [form, ...currentForms]);
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setNotice("Form created");
    } catch {
      setError("Unable to create form.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDuplicateForm(form: FormListItem) {
    setError(null);
    try {
      const duplicate = await duplicateForm(form.id);
      setForms((current) => [duplicate, ...current]);
      setNotice("Form duplicated");
    } catch {
      setError("Unable to duplicate form.");
    }
  }

  async function handleDeleteForm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteForm(deleteTarget.id);
      setForms((current) => current.filter((form) => form.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotice("Form deleted");
    } catch {
      setError("Unable to delete form.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-brand-ink">
      <TopNav />

      <section className="page-enter mx-auto w-full max-w-5xl px-6 py-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-black/45">
              {forms.length} forms / {totalResponses.toLocaleString()} responses
            </p>
            <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">My Workspace</h1>
            <p className="mt-3 text-base text-black/65">Manage and analyze your active forms.</p>
          </div>

          <Button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto">
            <Plus className="h-4 w-4" />
            Create new form
          </Button>
        </div>

        {error ? (
          <div role="alert" className="mt-8 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error" className="grid h-7 w-7 place-items-center rounded hover:bg-red-100"><X className="h-4 w-4" /></button>
          </div>
        ) : null}

        <DashboardTable
          forms={forms}
          isLoading={isLoading}
          onCreateForm={() => setShowCreateModal(true)}
          onDeleteForm={setDeleteTarget}
          onDuplicateForm={handleDuplicateForm}
        />
      </section>

      {notice ? (
        <div className="toast-enter fixed bottom-6 right-6 flex items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-medium shadow-lg">
          <Check className="h-4 w-4" /> {notice}
        </div>
      ) : null}

      {showCreateModal ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/35 px-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="create-form-title">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreateForm();
            }}
            className="panel-enter w-full max-w-md rounded-lg border border-black/10 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="create-form-title" className="text-xl font-semibold">Create a form</h2>
                <p className="mt-1 text-sm text-black/55">Start with a title. You can change it later.</p>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-md hover:bg-black/[0.04]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-6 block text-sm font-medium">
              Form title
              <input autoFocus required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Customer feedback survey" className="mt-2 h-11 w-full rounded-md border border-black/15 px-3 outline-none focus:border-black" />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Description <span className="font-normal text-black/40">(optional)</span>
              <textarea maxLength={1000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What this form is for" className="mt-2 w-full resize-none rounded-md border border-black/15 px-3 py-2 outline-none focus:border-black" />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="h-10 rounded-md px-4 text-sm font-semibold hover:bg-black/[0.04]">Cancel</button>
              <Button type="submit" disabled={isCreating || !title.trim()}>
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create form
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/35 px-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="delete-form-title">
          <div className="panel-enter w-full max-w-md rounded-lg border border-black/10 bg-white p-6 shadow-2xl">
            <h2 id="delete-form-title" className="text-xl font-semibold">Delete {deleteTarget.title}?</h2>
            <p className="mt-3 text-sm leading-6 text-black/60">This permanently removes the form, its questions, and all collected responses.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="h-10 rounded-md px-4 text-sm font-semibold hover:bg-black/[0.04]">Cancel</button>
              <button onClick={handleDeleteForm} disabled={isDeleting} className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50">
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Delete form
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
