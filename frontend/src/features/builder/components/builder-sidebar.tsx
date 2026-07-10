import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Settings } from "lucide-react";

import type { FormBuilder } from "@/types/forms";
import type { Question } from "@/types/questions";

type BuilderSidebarProps = {
  form: FormBuilder;
  selectedQuestionId: number | null;
  isCreating: boolean;
  onAddQuestion: () => void;
  onReorderQuestions: (questionIds: number[]) => void;
  onSelectQuestion: (questionId: number) => void;
};

export function BuilderSidebar({
  form,
  selectedQuestionId,
  isCreating,
  onAddQuestion,
  onReorderQuestions,
  onSelectQuestion,
}: BuilderSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = form.questions.findIndex((question) => question.id === active.id);
    const newIndex = form.questions.findIndex((question) => question.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedQuestions = arrayMove(form.questions, oldIndex, newIndex);
    onReorderQuestions(reorderedQuestions.map((question) => question.id));
  }

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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={form.questions.map((question) => question.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 space-y-1 p-3">
            {form.questions.map((question) => (
              <SortableQuestionRow
                key={question.id}
                question={question}
                isSelected={question.id === selectedQuestionId}
                onSelectQuestion={onSelectQuestion}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="border-t border-black/10 p-4">
        <button className="flex h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-black/70 transition hover:bg-black/[0.03]">
          <Settings className="h-4 w-4" />
          Form Settings
        </button>
      </div>
    </aside>
  );
}

type SortableQuestionRowProps = {
  question: Question;
  isSelected: boolean;
  onSelectQuestion: (questionId: number) => void;
};

function SortableQuestionRow({ question, isSelected, onSelectQuestion }: SortableQuestionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        isDragging
          ? "relative z-10 rounded-md bg-white opacity-90 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
          : undefined
      }
    >
      <div
        className={
          isSelected
            ? "flex h-11 w-full items-center gap-3 rounded-md bg-black/[0.06] px-3 text-left text-sm font-semibold"
            : "flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition hover:bg-black/[0.03]"
        }
      >
        <button
          {...attributes}
          {...listeners}
          className="grid h-7 w-5 shrink-0 cursor-grab place-items-center rounded text-black/35 active:cursor-grabbing"
          aria-label={`Drag ${question.title}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          onClick={() => onSelectQuestion(question.id)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
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
      </div>
    </div>
  );
}
