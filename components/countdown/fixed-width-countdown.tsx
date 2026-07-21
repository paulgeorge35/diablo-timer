import { cn } from "@/lib/utils"

/** Renders digits in fixed-width cells so the countdown doesn't shift as numbers change. */
export function FixedWidthCountdown({
  value,
  className = "",
}: {
  value: string
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-baseline", className)} aria-label={value}>
      {value.split("").map((char, index) =>
        /\d/.test(char) ? (
          <span key={index} className="inline-flex w-[0.9ch] justify-center">
            {char}
          </span>
        ) : (
          <span key={index}>{char}</span>
        ),
      )}
    </span>
  )
}
