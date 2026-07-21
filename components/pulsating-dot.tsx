import { cn } from "@/lib/utils"

type PulsatingDotProps = {
  className?: string
  /** Visual tone — maps to theme colors. */
  tone?: "primary" | "accent"
  label?: string
  active?: boolean
}

export function PulsatingDot({
  className = "",
  tone = "primary",
  label = "Active",
  active = true,
}: PulsatingDotProps) {
  return (
    <output
      className={cn(
        "relative inline-flex size-2.5 shrink-0 items-center justify-center",
        className,
      )}
      aria-live="polite"
      aria-label={label}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-0 rounded-full", {
          "animate-pulsate": active,
          "bg-accent ": active && tone === "accent",
          "bg-primary": active && tone === "primary",
          "bg-muted-foreground/20": !active,
        })}
      />
      <span
        aria-hidden="true"
        className={cn("relative size-2.5 rounded-full", {
          "bg-accent": active && tone === "accent",
          "bg-primary": active && tone === "primary",
          "bg-muted-foreground/20": !active,
        })}
      />
    </output>
  )
}
