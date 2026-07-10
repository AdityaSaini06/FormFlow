import { Calendar, Inbox, MessageSquare, MoreVertical, Plus, Rocket } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { FormListItem, FormStatus } from "@/types/forms";

const FORM_ICONS = [MessageSquare, Calendar, Rocket];

type DashboardTableProps = {
  forms: FormListItem[];
  isLoading: boolean;
  onCreateForm: () => void;
};

export function DashboardTable({ forms, isLoading, onCreateForm }: DashboardTableProps) {
  return (
    <div className="mt-10 overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr_44px] border-b border-black/10 px-9 py-5 text-xs font-semibold text-black/70">
        <span>Name</span>
        <span>Status</span>
        <span>Responses</span>
        <span>Last Updated</span>
        <span aria-hidden="true" />
      </div>

      {isLoading ? <DashboardSkeleton /> : null}
      {!isLoading && forms.length === 0 ? <EmptyState onCreateForm={onCreateForm} /> : null}
      {!isLoading && forms.length > 0
        ? forms.map((form, index) => <FormRow key={form.id} form={form} iconIndex={index} />)
        : null}
    </div>
  );
}

function FormRow({ form, iconIndex }: { form: FormListItem; iconIndex: number }) {
  const Icon = FORM_ICONS[iconIndex % FORM_ICONS.length];

  return (
    <article className="grid min-h-24 grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr_44px] items-center border-b border-black/[0.06] px-9 last:border-b-0">
      <div className="flex min-w-0 items-center gap-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-cyan-50 text-[#007b8f]">
          <Icon className="h-5 w-5" />
        </div>
        <Link href={`/forms/${form.id}/builder`} className="min-w-0 rounded-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-black">
          <h2 className="truncate text-sm font-semibold">{form.title}</h2>
          <p className="mt-1 truncate text-xs text-black/45">{form.description ?? form.slug}</p>
        </Link>
      </div>

      <StatusBadge status={form.status} />
      <Link
        href={`/forms/${form.id}/results`}
        className="w-fit rounded-sm text-sm tabular-nums underline-offset-4 hover:underline focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-black"
      >
        {form.response_count.toLocaleString()}
      </Link>
      <span className="text-sm text-black/70">{formatRelativeDate(form.updated_at)}</span>

      <button
        className="grid h-9 w-9 place-items-center rounded-md text-black/65 transition hover:bg-black/[0.04] hover:text-black"
        aria-label={`Open actions for ${form.title}`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
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
  const updatedAt = new Date(value).getTime();
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
  }).format(new Date(value));
}
