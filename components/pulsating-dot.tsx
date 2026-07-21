type PulsatingDotProps = {
  className?: string
  /** Visual tone — maps to theme colors. */
  tone?: "primary" | "accent"
  label?: string
}

export function PulsatingDot({
  className = "",
  tone = "primary",
  label = "Active",
}: PulsatingDotProps) {
  const toneClass = tone === "accent" ? "bg-accent" : "bg-primary"

  return (
    <output
      className={`relative inline-flex size-2.5 shrink-0 items-center justify-center ${className}`}
      aria-live="polite"
      aria-label={label}
    >
      <span
        aria-hidden="true"
        className={`animate-pulsate absolute inset-0 rounded-full ${toneClass}`}
      />
      <span aria-hidden="true" className={`relative size-2.5 rounded-full ${toneClass}`} />
    </output>
  )
}
