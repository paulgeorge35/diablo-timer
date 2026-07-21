import Image from "next/image"

export const BOSS_AVATAR_DISPLAY_PX = {
  row: 32,
  hero: 112,
} as const

export type BossAvatarSize = keyof typeof BOSS_AVATAR_DISPLAY_PX

export function BossAvatar({
  src,
  alt,
  size,
  className = "",
  priority = false,
}: {
  src: string
  alt: string
  size: BossAvatarSize
  className?: string
  priority?: boolean
}) {
  const requestPx = BOSS_AVATAR_DISPLAY_PX[size] * 2
  const frameClass =
    size === "row"
      ? "size-8 shrink-0 rounded-full border border-primary/80 bg-secondary/40 p-px shadow-[0_0_12px_-4px_hsl(var(--primary)/0.45)]"
      : "mb-4 size-24 shrink-0 rounded-full border-2 border-primary/80 bg-secondary/40 p-1 shadow-[0_0_20px_-6px_hsl(var(--primary)/0.55)] sm:size-28"

  return (
    <div className={`${frameClass} ${className}`}>
      <div className="size-full overflow-hidden rounded-full">
        <Image
          src={src}
          alt={alt}
          width={requestPx}
          height={requestPx}
          className="size-full object-cover object-center"
          priority={priority}
          unoptimized
        />
      </div>
    </div>
  )
}
