import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  AtSign,
  CircleDot,
  Copy,
  Hash,
  ListChecks,
  ListFilter,
  Plus,
  Star,
  ToggleLeft,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { isPlaceholderQuestionTitle, QUESTION_TITLE_PLACEHOLDER } from "@/features/builder/question-title";
import type { Question, QuestionType, QuestionUpdateInput } from "@/types/questions";

const QUESTION_TYPES: Array<{ label: string; value: QuestionType; icon: LucideIcon }> = [
  { label: "Short text", value: "short_text", icon: CircleDot },
  { label: "Long text", value: "long_text", icon: AlignLeft },
  { label: "Email", value: "email", icon: AtSign },
  { label: "Multiple choice", value: "multiple_choice", icon: ListChecks },
  { label: "Dropdown", value: "dropdown", icon: ListFilter },
  { label: "Number", value: "number", icon: Hash },
  { label: "Rating", value: "rating", icon: Star },
  { label: "Yes / No", value: "boolean", icon: ToggleLeft },
];

type BuilderSettingsPanelProps = {
  question: Question | null;
  onDeleteQuestion: (questionId: number) => Promise<void>;
  onDuplicateQuestion: (question: Question) => Promise<void>;
  onDraftQuestionChange: (questionId: number, changes: QuestionUpdateInput) => void;
  onUpdateQuestion: (questionId: number, changes: QuestionUpdateInput) => Promise<void>;
};

export function BuilderSettingsPanel({
  question,
  onDeleteQuestion,
  onDuplicateQuestion,
  onDraftQuestionChange,
  onUpdateQuestion,
}: BuilderSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"design" | "logic" | "ai">("design");
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

  function moveOption(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= options.length) return;
    const nextOptions = [...options];
    [nextOptions[index], nextOptions[nextIndex]] = [nextOptions[nextIndex], nextOptions[index]];
    setOptions(nextOptions);
    const nextPayload = nextOptions.map((label) => ({ label }));
    updateDraft({ options: nextPayload });
    persist({ options: nextPayload });
  }

  return (
    <aside className="border-l border-black/10 bg-white">
      <div className="grid grid-cols-3 border-b border-black/10 text-sm">
        {(["design", "logic", "ai"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "border-b border-black py-4 font-semibold capitalize" : "py-4 capitalize text-black/60"}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "design" ? question ? (
        <div className="space-y-7 p-6">
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-black/55">Content</p>
            <label className="block text-sm font-medium">
              Question
              <input
                key={question.id}
                autoFocus={isPlaceholderQuestionTitle(question.title)}
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
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </section>

          {["multiple_choice", "dropdown"].includes(question.type) ? (
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
                      onClick={() => moveOption(index, -1)}
                      disabled={index === 0}
                      className="grid h-10 w-8 shrink-0 place-items-center text-black/45 disabled:opacity-25"
                      aria-label={`Move option ${index + 1} up`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveOption(index, 1)}
                      disabled={index === options.length - 1}
                      className="grid h-10 w-8 shrink-0 place-items-center text-black/45 disabled:opacity-25"
                      aria-label={`Move option ${index + 1} down`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
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
      ) : (
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-normal text-black/45">Coming Soon</p>
          <h2 className="mt-3 text-lg font-semibold">{activeTab === "logic" ? "Logic and branching" : "AI form assistant"}</h2>
          <p className="mt-2 text-sm leading-6 text-black/55">
            {activeTab === "logic"
              ? "Route respondents to different questions based on their answers."
              : "Generate and refine questions from a short description."}
          </p>
        </div>
      )}

      {activeTab === "design" ? <div className="flex gap-5 border-t border-black/10 p-6">
        <button
          disabled={!question}
          onClick={() => question && onDuplicateQuestion(question)}
          className="flex h-10 items-center gap-2 rounded-md text-sm font-semibold disabled:opacity-40"
        >
          <Copy className="h-4 w-4" />
          Duplicate
        </button>
        <button
          disabled={!question}
          onClick={() => question && onDeleteQuestion(question.id)}
          className="flex h-10 items-center gap-2 rounded-md text-sm font-semibold text-red-600 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div> : null}
    </aside>
  );
}
