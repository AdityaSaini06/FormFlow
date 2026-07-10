"use client";

import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DashboardTable } from "@/features/dashboard/components/dashboard-table";
import { TopNav } from "@/features/dashboard/components/top-nav";
import { createForm, listForms } from "@/services/forms.service";
import type { FormListItem } from "@/types/forms";

export function DashboardPage() {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
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

  const totalResponses = useMemo(
    () => forms.reduce((total, form) => total + form.response_count, 0),
    [forms],
  );

  async function handleCreateForm() {
    setIsCreating(true);
    setError(null);

    try {
      const form = await createForm({
        title: "Untitled form",
        description: "Draft form ready to customize.",
      });
      setForms((currentForms) => [form, ...currentForms]);
    } catch {
      setError("Unable to create form.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-brand-ink">
      <TopNav />

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-black/45">
              {forms.length} forms / {totalResponses.toLocaleString()} responses
            </p>
            <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">My Workspace</h1>
            <p className="mt-3 text-base text-black/65">Manage and analyze your active forms.</p>
          </div>

          <Button onClick={handleCreateForm} disabled={isCreating} className="w-full md:w-auto">
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create new form
          </Button>
        </div>

        {error ? (
          <div className="mt-8 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : null}

        <DashboardTable forms={forms} isLoading={isLoading} onCreateForm={handleCreateForm} />
      </section>
    </main>
  );
}
