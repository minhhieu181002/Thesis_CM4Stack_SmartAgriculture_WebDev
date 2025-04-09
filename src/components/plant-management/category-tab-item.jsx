import { cn } from "@/lib/utils";

export function CategoryTabItem({ name, active, onClick }) {
  return (
    <button
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors relative",
        active
          ? "text-primary border-b-2 border-primary"
          : "text-muted-foreground hover:text-primary"
      )}
      onClick={onClick}
    >
      {name}
    </button>
  );
}
