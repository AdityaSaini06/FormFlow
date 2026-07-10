import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-paper">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="text-xl font-semibold tracking-normal">Formflow</div>
          <Button variant="secondary">Dashboard</Button>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 md:grid-cols-[1fr_440px]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm shadow-soft">
              <Sparkles className="h-4 w-4" />
              Typeform-style builder foundation
            </div>
            <h1 className="text-5xl font-semibold leading-tight tracking-normal md:text-7xl">
              Ask better questions, one screen at a time.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/65">
              This milestone sets up the frontend and backend architecture we will use to build the form builder, public respondent flow, and results dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button>
                Start building
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary">View API health</Button>
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
            <div className="mb-5 text-sm font-medium text-black/50">Live preview placeholder</div>
            <div className="rounded-md bg-[#f3eee7] p-6">
              <p className="mb-4 text-sm text-black/50">1 of 3</p>
              <h2 className="text-3xl font-semibold leading-tight">What should we call your form?</h2>
              <div className="mt-8 border-b border-black/30 pb-3 text-xl text-black/35">Type your answer here...</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
