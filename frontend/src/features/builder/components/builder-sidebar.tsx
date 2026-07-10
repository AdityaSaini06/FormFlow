import { GripVertical, Plus, Settings } from "lucide-react";

import type { FormBuilder } from "@/types/forms";

type BuilderSidebarProps = {
  form: FormBuilder;
  selectedQuestionId: number | null;
  isCreating: boolean;
  onAddQuestion: () => void;
  onSelectQuestion: (questionId: number) => void;
};

export function BuilderSidebar({
  form,
  selectedQuestionId,
  isCreating,
  onAddQuestion,
  onSelectQuestion,
}: BuilderSidebarProps) {
  return (
    <aside className="flex min-h-full flex-col border-r border-black/10 bg-white">
      <div className="border-b border-black/10 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-black/60">Content</p>
        <button
          onClick={onAddQuestion}
          disabled={isCreating}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-black/15 text-sm font-medium transition hover:bg-black/[0.03] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </button>
      </div>

      <div className="flex-1 space-y-1 p-3">
        {form.questions.map((question) => {
          const isSelected = question.id === selectedQuestionId;

          return (
            <button
              key={question.id}
              onClick={() => onSelectQuestion(question.id)}
              className={
                isSelected
                  ? "flex h-11 w-full items-center gap-3 rounded-md bg-black/[0.06] px-3 text-left text-sm font-semibold"
                  : "flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition hover:bg-black/[0.03]"
              }
            >
              <GripVertical className="h-4 w-4 shrink-0 text-black/35" />
              <span
                className={
                  isSelected
                    ? "grid h-6 w-6 shrink-0 place-items-center rounded bg-black text-xs text-white"
                    : "grid h-6 w-6 shrink-0 place-items-center rounded bg-black/10 text-xs text-black/50"
                }
              >
                {question.position}
              </span>
              <span className="truncate">{question.title}</span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-black/10 p-4">
        <button className="flex h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-black/70 transition hover:bg-black/[0.03]">
          <Settings className="h-4 w-4" />
          Form Settings
        </button>
      </div>
    </aside>
  );
}
