import { AlignLeft, Bot, Copy, Mail, Trash2 } from "lucide-react";

import type { Question, QuestionType } from "@/types/questions";

const QUESTION_TYPES: Array<{ label: string; value: QuestionType }> = [
  { label: "Short text", value: "short_text" },
  { label: "Long text", value: "long_text" },
  { label: "Email", value: "email" },
  { label: "Multiple choice", value: "multiple_choice" },
  { label: "Rating", value: "rating" },
];

type BuilderSettingsPanelProps = {
  question: Question | null;
  onDeleteQuestion: (questionId: number) => Promise<void>;
  onUpdateQuestion: (questionId: number, changes: Partial<Question>) => Promise<void>;
};

export function BuilderSettingsPanel({
  question,
  onDeleteQuestion,
  onUpdateQuestion,
}: BuilderSettingsPanelProps) {
  return (
    <aside className="border-l border-black/10 bg-white">
      <div className="grid grid-cols-3 border-b border-black/10 text-sm">
        <button className="border-b border-black py-4 font-semibold">Design</button>
        <button className="py-4 text-black/60">Logic</button>
        <button className="py-4 text-black/60">AI</button>
      </div>

      {question ? (
        <div className="space-y-8 p-6">
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-black/55">Question Type</p>
            <div className="space-y-2">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onUpdateQuestion(question.id, { type: type.value })}
                  className={
                    question.type === type.value
                      ? "flex h-10 w-full items-center gap-3 rounded-md border border-black bg-black px-3 text-sm font-semibold text-white"
                      : "flex h-10 w-full items-center gap-3 rounded-md border border-black/10 px-3 text-sm transition hover:bg-black/[0.03]"
                  }
                >
                  <Mail className="h-4 w-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-black/55">Layout</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex h-16 flex-col items-center justify-center gap-1 rounded-md border border-black bg-black/[0.03] text-xs font-semibold">
                <AlignLeft className="h-4 w-4" />
                Standard
              </button>
              <button className="flex h-16 flex-col items-center justify-center gap-1 rounded-md border border-black/10 text-xs font-semibold">
                <Copy className="h-4 w-4" />
                Split
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-black/55">Validation</p>
            <label className="flex items-center gap-3 text-sm">
              <input
                checked={question.is_required}
                onChange={(event) => onUpdateQuestion(question.id, { is_required: event.target.checked })}
                type="checkbox"
                className="h-4 w-4"
              />
              Required question
            </label>
          </section>

          <section className="rounded-md bg-[#24211f] p-5 text-white">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4" />
              AI Suggestion
            </div>
            <p className="text-sm leading-6 text-white/65">
              Add a short helper sentence so respondents know exactly what kind of answer you expect.
            </p>
          </section>
        </div>
      ) : (
        <div className="p-6 text-sm text-black/55">Select a question to edit its settings.</div>
      )}

      <div className="border-t border-black/10 p-6">
        <button
          disabled={!question}
          onClick={() => question && onDeleteQuestion(question.id)}
          className="flex h-10 items-center gap-2 rounded-md text-sm font-semibold text-red-600 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </aside>
  );
}
