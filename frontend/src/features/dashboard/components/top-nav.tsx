import { ClipboardList } from "lucide-react";

export function TopNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center rounded bg-black text-white">
            <ClipboardList className="h-4 w-4" />
          </div>
          <span className="text-xl font-semibold">FormFlow</span>
        </div>

      </div>
    </header>
  );
}
