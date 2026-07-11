"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getPublicForm, submitPublicResponse } from "@/services/public-forms.service";
import type { FormBuilder } from "@/types/forms";
import type { Question } from "@/types/questions";
import type { PublicAnswerInput } from "@/types/responses";

type AnswerMap = Record<number, PublicAnswerInput>;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PublicFormPage({ slug }: { slug: string }) {
  const [form, setForm] = useState<FormBuilder | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadForm() {
      try {
        const data = await getPublicForm(slug);
        if (isMounted) {
          setForm(data);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError("This form is not available.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadForm();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const questions = form?.questions ?? [];
  const currentQuestion = questions[currentIndex] ?? null;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const questionError = currentQuestion ? getQuestionError(currentQuestion, currentAnswer) : null;

  const responsePayload = useMemo(
    () => ({
      answers: Object.values(answers).filter((answer) => hasAnyAnswerValue(answer)),
      completion_time_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
    }),
    [answers, startedAt],
  );

  function setAnswer(question: Question, answer: PublicAnswerInput) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [question.id]: {
        ...answer,
        question_id: question.id,
      },
    }));
    setError(null);
  }

  function goBack() {
    setCurrentIndex((index) => Math.max(0, index - 1));
    setError(null);
  }

  async function continueOrSubmit() {
    if (!currentQuestion || !form) {
      return;
    }

    if (questionError) {
      setError(questionError);
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      setError(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitPublicResponse(form.slug, responsePayload);
      setIsSubmitted(true);
    } catch {
      setError("We could not submit your response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isSubmitted || isSubmitting) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isTextInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      const isTextarea = target?.tagName === "TEXTAREA";

      if (!isTextInput && currentQuestion?.type === "multiple_choice" && event.key.length === 1) {
        const optionIndex = event.key.toUpperCase().charCodeAt(0) - 65;
        const option = currentQuestion.options[optionIndex];
        if (option) {
          event.preventDefault();
          setAnswer(currentQuestion, { question_id: currentQuestion.id, question_option_id: option.id });
          return;
        }
      }

      if (!isTextInput && currentQuestion?.type === "rating" && /^[1-5]$/.test(event.key)) {
        event.preventDefault();
        setAnswer(currentQuestion, { question_id: currentQuestion.id, number_value: Number(event.key) });
        return;
      }

      if (!isTextInput && currentQuestion?.type === "boolean" && ["y", "n"].includes(event.key.toLowerCase())) {
        event.preventDefault();
        setAnswer(currentQuestion, { question_id: currentQuestion.id, boolean_value: event.key.toLowerCase() === "y" });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        goBack();
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        void continueOrSubmit();
      }

      if (event.key === "Enter") {
        if (isTextarea && !event.ctrlKey && !event.metaKey) {
          return;
        }

        event.preventDefault();
        void continueOrSubmit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-white text-brand-ink">
        <div className="flex items-center gap-3 text-sm font-medium text-black/55">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading form
        </div>
      </main>
    );
  }

  if (error && !form) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6 text-brand-ink">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold">Form unavailable</h1>
          <p className="mt-3 text-black/60">{error}</p>
        </div>
      </main>
    );
  }

  if (!form || questions.length === 0) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6 text-brand-ink">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold">No questions yet</h1>
          <p className="mt-3 text-black/60">This form is published but does not have questions to answer.</p>
        </div>
      </main>
    );
  }

  if (isSubmitted) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6 text-brand-ink">
        <div className="max-w-xl text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#007b8f] text-white">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-8 text-4xl font-semibold">Thanks for your response.</h1>
          <p className="mt-4 text-lg text-black/55">{form.title}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-brand-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 py-6 sm:px-8 sm:py-10">
        <div className="flex flex-1 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full"
            >
              <div className="grid gap-5 sm:grid-cols-[56px_1fr] md:gap-8 md:grid-cols-[70px_1fr]">
                <div className="flex items-start gap-3 pt-1 text-xl font-semibold text-[#007b8f] md:pt-2 md:text-2xl">
                  <span>{currentQuestion.position}</span>
                  <ArrowDown className="mt-2 h-4 w-4 text-black/25" />
                </div>

                <div>
                  <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-normal sm:text-4xl md:text-5xl">
                    {currentQuestion.title}
                    {currentQuestion.is_required ? <span className="text-red-500"> *</span> : null}
                  </h1>
                  {currentQuestion.description ? (
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-black/55">
                      {currentQuestion.description}
                    </p>
                  ) : null}

                  <div className="mt-10">
                    <QuestionInput
                      answer={currentAnswer}
                      error={error}
                      question={currentQuestion}
                      onAnswer={(answer) => setAnswer(currentQuestion, answer)}
                    />
                  </div>

                  {error ? <p className="mt-5 text-sm font-medium text-red-600">{error}</p> : null}

                  <div className="mt-8 flex items-center gap-3">
                    <button
                      onClick={continueOrSubmit}
                      disabled={isSubmitting}
                      className="inline-flex h-11 items-center gap-2 rounded-md bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/85 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {currentIndex === questions.length - 1 ? "Submit" : "OK"}
                      {!isSubmitting ? <Check className="h-4 w-4" /> : null}
                    </button>
                    <span className="hidden text-xs font-medium text-black/35 sm:inline">
                      {currentQuestion.type === "long_text" ? "Press Ctrl + Enter" : "Press Enter"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="flex items-center justify-between border-t border-black/10 pt-4 sm:pt-5">
          <div className="text-xs text-black/55">
            Powered by <span className="font-semibold text-black">FormFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              className="grid h-9 w-9 place-items-center rounded-full bg-black/[0.04] text-black/55 transition hover:bg-black/[0.08] disabled:opacity-35"
              aria-label="Previous question"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              onClick={continueOrSubmit}
              className="grid h-9 w-9 place-items-center rounded-full bg-black/[0.04] text-black/55 transition hover:bg-black/[0.08]"
              aria-label="Next question"
            >
              {currentIndex === questions.length - 1 ? <Check className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </button>
          </div>
        </footer>
      </section>

      <div className="fixed bottom-0 left-0 h-1 bg-[#007b8f] transition-all" style={{ width: `${progress}%` }} />
    </main>
  );
}

type QuestionInputProps = {
  answer: PublicAnswerInput | undefined;
  error: string | null;
  question: Question;
  onAnswer: (answer: PublicAnswerInput) => void;
};

function QuestionInput({ answer, error, question, onAnswer }: QuestionInputProps) {
  if (question.type === "multiple_choice") {
    return (
      <div className="max-w-xl space-y-3">
        {question.options.map((option, index) => {
          const isSelected = answer?.question_option_id === option.id;
          const shortcut = String.fromCharCode(65 + index);

          return (
            <button
              key={option.id}
              onClick={() => onAnswer({ question_id: question.id, question_option_id: option.id })}
              className={
                isSelected
                  ? "flex min-h-12 w-full items-center gap-3 rounded-md border border-[#007b8f] bg-cyan-50 px-4 text-left text-base font-semibold"
                  : "flex min-h-12 w-full items-center gap-3 rounded-md border border-black/10 px-4 text-left text-base transition hover:border-black/30"
              }
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-black/[0.06] text-xs font-semibold text-black/55">
                {shortcut}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "dropdown") {
    return (
      <select
        autoFocus
        value={answer?.question_option_id ?? ""}
        onChange={(event) =>
          onAnswer({
            question_id: question.id,
            question_option_id: event.target.value ? Number(event.target.value) : undefined,
          })
        }
        aria-invalid={Boolean(error)}
        className="h-14 w-full max-w-2xl rounded-md border border-black/15 bg-white px-4 text-lg outline-none focus:border-black"
      >
        <option value="">Select an option</option>
        {question.options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    );
  }

  if (question.type === "rating") {
    return (
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onAnswer({ question_id: question.id, number_value: rating })}
            className={
              answer?.number_value === rating
                ? "grid h-14 w-14 place-items-center rounded-md border border-[#007b8f] bg-cyan-50 text-lg font-semibold"
                : "grid h-14 w-14 place-items-center rounded-md border border-black/10 text-lg font-semibold transition hover:border-black/30"
            }
          >
            {rating}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "boolean") {
    return (
      <div className="flex gap-3">
        {[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ].map((option) => (
          <button
            key={option.label}
            onClick={() => onAnswer({ question_id: question.id, boolean_value: option.value })}
            className={
              answer?.boolean_value === option.value
                ? "h-12 rounded-md border border-[#007b8f] bg-cyan-50 px-8 text-base font-semibold"
                : "h-12 rounded-md border border-black/10 px-8 text-base font-semibold transition hover:border-black/30"
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "number") {
    return (
      <input
        autoFocus
        value={answer?.number_value ?? ""}
        onChange={(event) =>
          onAnswer({
            question_id: question.id,
            number_value: event.target.value === "" ? undefined : Number(event.target.value),
          })
        }
        placeholder={question.placeholder ?? "Type a number..."}
        type="number"
        inputMode="decimal"
        step="any"
        aria-invalid={Boolean(error)}
        className="w-full max-w-2xl border-b border-black/20 bg-transparent py-3 text-xl outline-none placeholder:text-black/35 focus:border-black sm:text-2xl"
      />
    );
  }

  const isLongText = question.type === "long_text";
  const placeholder = question.placeholder ?? "Type your answer here...";

  if (isLongText) {
    return (
      <textarea
        autoFocus
        value={answer?.text_value ?? ""}
        onChange={(event) => onAnswer({ question_id: question.id, text_value: event.target.value })}
        placeholder={placeholder}
        rows={4}
        aria-invalid={Boolean(error)}
        className="w-full max-w-2xl resize-none border-b border-black/20 bg-transparent py-3 text-xl outline-none placeholder:text-black/35 focus:border-black sm:text-2xl"
      />
    );
  }

  return (
    <input
      autoFocus
      value={answer?.text_value ?? ""}
      onChange={(event) => onAnswer({ question_id: question.id, text_value: event.target.value })}
      placeholder={placeholder}
      type={question.type === "email" ? "email" : "text"}
      inputMode={question.type === "email" ? "email" : "text"}
      aria-invalid={Boolean(error)}
      className="w-full max-w-2xl border-b border-black/20 bg-transparent py-3 text-xl outline-none placeholder:text-black/35 focus:border-black sm:text-2xl"
    />
  );
}

function getQuestionError(question: Question, answer: PublicAnswerInput | undefined) {
  if (!answer) {
    return question.is_required ? "This question is required." : null;
  }

  if (question.is_required && !hasAnyAnswerValue(answer)) {
    return "This question is required.";
  }

  if (question.type === "email" && answer.text_value?.trim() && !EMAIL_PATTERN.test(answer.text_value.trim())) {
    return "Enter a valid email address.";
  }

  return null;
}

function hasAnyAnswerValue(answer: PublicAnswerInput) {
  return Boolean(
    answer.text_value?.trim() ||
      answer.number_value !== undefined ||
      answer.boolean_value !== undefined ||
      answer.question_option_id !== undefined,
  );
}
