import { Hash, Mail, Star } from "lucide-react";

import { getQuestionTitleLabel, isPlaceholderQuestionTitle } from "@/features/builder/question-title";
import type { FormBuilder } from "@/types/forms";
import type { Question } from "@/types/questions";

type BuilderCanvasProps = {
  form: FormBuilder;
  question: Question | null;
};

export function BuilderCanvas({ form, question }: BuilderCanvasProps) {
  if (!question) {
    return (
      <section className="w-full max-w-2xl rounded-lg border border-black/10 bg-white px-5 py-10 text-center shadow-sm sm:px-10 sm:py-12">
        <p className="text-sm font-semibold text-black/45">{form.title}</p>
        <h1 className="mt-4 text-3xl font-semibold">Start by adding a question</h1>
      </section>
    );
  }

  const questionTitle = getQuestionTitleLabel(question.title);
  const isPlaceholderTitle = isPlaceholderQuestionTitle(question.title);

  return (
    <section className="w-full max-w-2xl rounded-lg border border-black/10 bg-white px-5 py-8 shadow-sm sm:px-11 sm:py-10">
      <div className="mb-8 flex justify-center">
        <span className="rounded-full bg-black px-4 py-1 text-xs font-semibold text-white">
          Question {question.position}
        </span>
      </div>

      <div className="space-y-4">
        <h1 className={isPlaceholderTitle ? "text-2xl font-semibold tracking-normal text-black/35" : "text-2xl font-semibold tracking-normal"}>
          {questionTitle}
        </h1>
        {question.description ? <p className="text-sm leading-6 text-black/60">{question.description}</p> : null}
      </div>

      <div className="mt-10">
        <QuestionPreview question={question} />
      </div>

      <div className="mt-10 border-t border-black/10 pt-5 text-xs text-black/45">
        Required: {question.is_required ? "Yes" : "No"}
      </div>
    </section>
  );
}

function QuestionPreview({ question }: { question: Question }) {
  if (question.type === "multiple_choice") {
    return (
      <div className="space-y-3">
        {question.options.map((option) => (
          <div key={option.id} className="rounded-md border border-black/10 px-4 py-3 text-sm">
            {option.label}
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "dropdown") {
    return (
      <select disabled className="h-12 w-full rounded-md border border-black/10 bg-white px-4 text-sm text-black/55">
        <option>Select an option</option>
        {question.options.map((option) => <option key={option.id}>{option.label}</option>)}
      </select>
    );
  }

  if (question.type === "rating") {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <div key={rating} className="grid h-11 w-11 place-items-center rounded-md border border-black/10">
            <Star className="h-4 w-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-black/10 px-5 py-5">
      <div className="flex items-center gap-3 border-b border-black/15 pb-3 text-sm text-black/35">
        {question.type === "email" ? <Mail className="h-4 w-4" /> : null}
        {question.type === "number" ? <Hash className="h-4 w-4" /> : null}
        {question.placeholder ?? "Type your answer here..."}
      </div>
    </div>
  );
}
