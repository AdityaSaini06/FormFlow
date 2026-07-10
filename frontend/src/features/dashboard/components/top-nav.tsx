import { ClipboardList, Share2 } from "lucide-react";

export function TopNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center rounded bg-black text-white">
            <ClipboardList className="h-4 w-4" />
          </div>
          <span className="text-xl font-semibold">FormFlow</span>
        </div>

        <nav className="hidden items-center gap-10 text-sm md:flex">
          <a className="border-b border-black pb-2 font-semibold" href="#">
            Dashboard
          </a>
          <a className="pb-2 text-black/65 transition hover:text-black" href="#">
            Results
          </a>
          <a className="pb-2 text-black/65 transition hover:text-black" href="#">
            Connect
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition hover:bg-black/[0.04] md:inline-flex">
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button className="h-10 rounded-md bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/85">
            Publish
          </button>
        </div>
      </div>
    </header>
  );
}
