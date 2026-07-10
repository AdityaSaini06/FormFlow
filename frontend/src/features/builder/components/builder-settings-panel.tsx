import { Mail, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { isPlaceholderQuestionTitle, QUESTION_TITLE_PLACEHOLDER } from "@/features/builder/question-title";
import type { Question, QuestionType, QuestionUpdateInput } from "@/types/questions";

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
  onDraftQuestionChange: (questionId: number, changes: QuestionUpdateInput) => void;
  onUpdateQuestion: (questionId: number, changes: QuestionUpdateInput) => Promise<void>;
};

export function BuilderSettingsPanel({
  question,
  onDeleteQuestion,
  onDraftQuestionChange,
  onUpdateQuestion,
}: BuilderSettingsPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    setTitle(isPlaceholderQuestionTitle(question?.title) ? "" : question?.title ?? "");
    setDescription(question?.description ?? "");
    setPlaceholder(question?.placeholder ?? "");
    setOptions(question?.options.map((option) => option.label) ?? []);
  }, [question?.id, question?.title, question?.description, question?.placeholder, question?.options]);

  const optionPayload = useMemo(
    () =>
      options
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label) => ({ label })),
    [options],
  );

  function updateDraft(changes: QuestionUpdateInput) {
    if (question) {
      onDraftQuestionChange(question.id, changes);
    }
  }

  function persist(changes: QuestionUpdateInput) {
    if (question) {
      onUpdateQuestion(question.id, changes);
    }
  }

  function persistTitle() {
    const trimmedTitle = title.trim();
    if (question && trimmedTitle) {
      onUpdateQuestion(question.id, { title: trimmedTitle });
    }
  }

  function setOptionLabel(index: number, label: string) {
    const nextOptions = options.map((option, optionIndex) => (optionIndex === index ? label : option));
    setOptions(nextOptions);
    updateDraft({ options: nextOptions.filter(Boolean).map((optionLabel) => ({ label: optionLabel })) });
  }

  function addOption() {
    const nextOptions = [...options, `Option ${options.length + 1}`];
    setOptions(nextOptions);
    const nextPayload = nextOptions.map((label) => ({ label }));
    updateDraft({ options: nextPayload });
    persist({ options: nextPayload });
  }

  function removeOption(index: number) {
    const nextOptions = options.filter((_, optionIndex) => optionIndex !== index);
    setOptions(nextOptions);
    const nextPayload = nextOptions.map((label) => ({ label }));
    updateDraft({ options: nextPayload });
    persist({ options: nextPayload });
  }

  return (
    <aside className="border-l border-black/10 bg-white">
      <div className="grid grid-cols-3 border-b border-black/10 text-sm">
        <button className="border-b border-black py-4 font-semibold">Design</button>
        <button className="py-4 text-black/60">Logic</button>
        <button className="py-4 text-black/60">AI</button>
      </div>

      {question ? (
        <div className="space-y-7 p-6">
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-black/55">Content</p>
            <label className="block text-sm font-medium">
              Question
              <input
                value={title}
                placeholder={QUESTION_TITLE_PLACEHOLDER}
                onBlur={persistTitle}
                onChange={(event) => {
                  setTitle(event.target.value);
                  updateDraft({ title: event.target.value });
                }}
                className="mt-2 h-10 w-full rounded-md border border-black/10 px-3 text-sm outline-none transition focus:border-black"
              />
            </label>
            <label className="block text-sm font-medium">
              Description
              <textarea
                value={description}
                placeholder="Add helper text for respondents"
                onBlur={() => persist({ description: description || null })}
                onChange={(event) => {
                  setDescription(event.target.value);
                  updateDraft({ description: event.target.value || null });
                }}
                rows={3}
                className="mt-2 w-full resize-none rounded-md border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-black"
              />
            </label>
            <label className="block text-sm font-medium">
              Placeholder
              <input
                value={placeholder}
                placeholder="Example: name@example.com"
                onBlur={() => persist({ placeholder: placeholder || null })}
                onChange={(event) => {
                  setPlaceholder(event.target.value);
                  updateDraft({ placeholder: event.target.value || null });
                }}
                className="mt-2 h-10 w-full rounded-md border border-black/10 px-3 text-sm outline-none transition focus:border-black"
              />
            </label>
          </section>

          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-black/55">Question Type</p>
            <div className="space-y-2">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    updateDraft({ type: type.value });
                    persist({ type: type.value });
                  }}
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

          {question.type === "multiple_choice" ? (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-black/55">Answer Options</p>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={`${question.id}-${index}`} className="flex items-center gap-2">
                    <input
                      value={option}
                      onBlur={() => persist({ options: optionPayload })}
                      onChange={(event) => setOptionLabel(index, event.target.value)}
                      className="h-10 min-w-0 flex-1 rounded-md border border-black/10 px-3 text-sm outline-none transition focus:border-black"
                    />
                    <button
                      onClick={() => removeOption(index)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-black/10 text-black/50 transition hover:text-red-600"
                      aria-label={`Remove option ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-black/15 text-sm font-semibold transition hover:bg-black/[0.03]"
                >
                  <Plus className="h-4 w-4" />
                  Add option
                </button>
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-black/55">Validation</p>
            <label className="flex items-center gap-3 text-sm">
              <input
                checked={question.is_required}
                onChange={(event) => {
                  updateDraft({ is_required: event.target.checked });
                  persist({ is_required: event.target.checked });
                }}
                type="checkbox"
                className="h-4 w-4"
              />
              Required question
            </label>
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
