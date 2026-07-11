import { BarChart3, Calendar, Copy, Edit3, Inbox, MessageSquare, MoreVertical, Plus, Rocket, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { FormListItem, FormStatus } from "@/types/forms";

const FORM_ICONS = [MessageSquare, Calendar, Rocket];

type DashboardTableProps = {
  forms: FormListItem[];
  isLoading: boolean;
  onCreateForm: () => void;
  onDeleteForm: (form: FormListItem) => void;
  onDuplicateForm: (form: FormListItem) => void;
};

export function DashboardTable({ forms, isLoading, onCreateForm, onDeleteForm, onDuplicateForm }: DashboardTableProps) {
  return (
    <div className="mt-10 rounded-lg border border-black/10 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <div className="hidden grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr_44px] border-b border-black/10 px-9 py-5 text-xs font-semibold text-black/70 lg:grid">
        <span>Name</span>
        <span>Status</span>
        <span>Responses</span>
        <span>Last Updated</span>
        <span aria-hidden="true" />
      </div>

      {isLoading ? <DashboardSkeleton /> : null}
      {!isLoading && forms.length === 0 ? <EmptyState onCreateForm={onCreateForm} /> : null}
      {!isLoading && forms.length > 0
        ? forms.map((form, index) => (
            <FormRow
              key={form.id}
              form={form}
              iconIndex={index}
              onDeleteForm={onDeleteForm}
              onDuplicateForm={onDuplicateForm}
            />
          ))
        : null}
    </div>
  );
}

function FormRow({
  form,
  iconIndex,
  onDeleteForm,
  onDuplicateForm,
}: {
  form: FormListItem;
  iconIndex: number;
  onDeleteForm: (form: FormListItem) => void;
  onDuplicateForm: (form: FormListItem) => void;
}) {
  const Icon = FORM_ICONS[iconIndex % FORM_ICONS.length];

  return (
    <article className="grid min-h-24 grid-cols-[minmax(0,1fr)_44px] items-center border-b border-black/[0.06] px-4 transition-colors duration-150 last:border-b-0 hover:bg-[#fafcfc] sm:grid-cols-[minmax(0,1fr)_100px_44px] md:grid-cols-[minmax(0,1fr)_100px_90px_44px] lg:grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr_44px] lg:px-9">
      <div className="flex min-w-0 items-center gap-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-cyan-100 bg-cyan-50 text-[#007b8f] shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <Link href={`/forms/${form.id}/builder`} className="min-w-0 rounded-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-black">
          <h2 className="truncate text-sm font-semibold">{form.title}</h2>
          <p className="mt-1 truncate text-xs text-black/45">{form.description ?? form.slug}</p>
        </Link>
      </div>

      <div className="hidden sm:block"><StatusBadge status={form.status} /></div>
      <Link
        href={`/forms/${form.id}/results`}
        className="hidden w-fit rounded-sm text-sm tabular-nums underline-offset-4 hover:underline focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-black md:block"
      >
        {form.response_count.toLocaleString()}
      </Link>
      <span className="hidden text-sm text-black/70 lg:block">{formatRelativeDate(form.updated_at)}</span>

      <details
        className="group relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.removeAttribute("open");
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.currentTarget.removeAttribute("open");
            event.currentTarget.querySelector("summary")?.focus();
          }
        }}
      >
        <summary
          className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-md text-black/65 transition hover:bg-black/[0.04] hover:text-black"
          aria-label={`Open actions for ${form.title}`}
        >
          <MoreVertical className="h-4 w-4" />
        </summary>
        <div className="menu-enter absolute right-0 top-10 z-20 w-44 rounded-md border border-black/10 bg-white p-1 shadow-xl">
          <Link href={`/forms/${form.id}/builder`} className="flex h-9 items-center gap-2 rounded px-3 text-sm hover:bg-black/[0.04]">
            <Edit3 className="h-4 w-4" /> Edit form
          </Link>
          <Link href={`/forms/${form.id}/results`} className="flex h-9 items-center gap-2 rounded px-3 text-sm hover:bg-black/[0.04]">
            <BarChart3 className="h-4 w-4" /> View results
          </Link>
          <button onClick={(event) => {
            event.currentTarget.closest("details")?.removeAttribute("open");
            onDuplicateForm(form);
          }} className="flex h-9 w-full items-center gap-2 rounded px-3 text-sm hover:bg-black/[0.04]">
            <Copy className="h-4 w-4" /> Duplicate
          </button>
          <button onClick={(event) => {
            event.currentTarget.closest("details")?.removeAttribute("open");
            onDeleteForm(form);
          }} className="flex h-9 w-full items-center gap-2 rounded px-3 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </details>
    </article>
  );
}

function StatusBadge({ status }: { status: FormStatus }) {
  const isPublished = status === "published";

  return (
    <span
      className={
        isPublished
          ? "inline-flex w-fit items-center gap-2 rounded-full bg-cyan-200 px-3 py-1 text-xs font-medium text-[#006a7a]"
          : "inline-flex w-fit items-center gap-2 rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-black/55"
      }
    >
      <span
        className={
          isPublished
            ? "h-1.5 w-1.5 rounded-full bg-[#007b8f]"
            : "h-1.5 w-1.5 rounded-full bg-black/35"
        }
      />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="divide-y divide-black/[0.06]">
      {[0, 1, 2].map((item) => (
        <div key={item} className="grid min-h-24 grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr_44px] items-center px-9">
          <div className="flex items-center gap-5">
            <div className="h-10 w-10 animate-pulse rounded-md bg-black/10" />
            <div className="space-y-2">
              <div className="h-3 w-48 animate-pulse rounded bg-black/10" />
              <div className="h-3 w-32 animate-pulse rounded bg-black/5" />
            </div>
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-black/10" />
          <div className="h-3 w-12 animate-pulse rounded bg-black/10" />
          <div className="h-3 w-20 animate-pulse rounded bg-black/10" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onCreateForm }: { onCreateForm: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-md bg-black/[0.04]">
        <Inbox className="h-5 w-5 text-black/55" />
      </div>
      <h2 className="mt-5 text-lg font-semibold">No forms yet</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-black/55">Create your first form and it will appear here.</p>
      <Button className="mt-6" onClick={onCreateForm}>
        <Plus className="h-4 w-4" />
        Create new form
      </Button>
    </div>
  );
}

function formatRelativeDate(value: string) {
  if (!value) return "";
  let dateStr = value;
  if (!/Z$|[+-]\d{2}(:?\d{2})?$/.test(value)) {
    dateStr = value.includes("T") ? `${value}Z` : `${value.replace(" ", "T")}Z`;
  }
  const updatedAt = new Date(dateStr).getTime();
  const diffMs = Date.now() - updatedAt;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return "Just now";
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffHours < 48) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}
