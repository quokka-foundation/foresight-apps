// components/YieldImage.tsx
// Static yield chart image component: $100 → $112 at 12% APY
// Image is served from public/yield-chart.png (1200×630px)
// Next.js Image serves WebP automatically via built-in optimization.

import Image from 'next/image'

interface YieldImageProps {
  /** Override the alt text if needed */
  alt?: string
  /** Optional extra className on the wrapper */
  className?: string
  /** Set priority hint for LCP optimisation (default: true) */
  priority?: boolean
}

export function YieldImage({
  alt = '$100 → $112 yield projection at 12% APY in 30 days',
  className = '',
  priority = true,
}: YieldImageProps) {
  return (
    <div className={`relative w-full aspect-[1.91/1] overflow-hidden rounded-lg ${className}`}>
      <Image
        src="/yield-chart.png"
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="(max-width: 400px) 400px, 1200px"
      />
    </div>
  )
}

export default YieldImage
