import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps {
  size?: Size
  withIcon?: boolean
  withTagline?: boolean
  className?: string
}

const sizeMap: Record<Size, { text: string; icon: string; gap: string }> = {
  sm: { text: 'text-lg',  icon: 'h-5 w-5',  gap: 'gap-1.5' },
  md: { text: 'text-2xl', icon: 'h-6 w-6',  gap: 'gap-2'   },
  lg: { text: 'text-3xl', icon: 'h-7 w-7',  gap: 'gap-2.5' },
  xl: { text: 'text-5xl', icon: 'h-10 w-10',gap: 'gap-3'   },
}

export function Logo({
  size = 'md',
  withIcon = true,
  withTagline = false,
  className,
}: LogoProps) {
  const s = sizeMap[size]
  return (
    <div className={cn('inline-flex items-center', s.gap, className)}>
      {withIcon && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-lg gradient-brand',
            'shrink-0',
            size === 'xl' ? 'p-2.5' : size === 'lg' ? 'p-2' : 'p-1.5'
          )}
        >
          <ShoppingBag className={cn(s.icon, 'text-white')} strokeWidth={2.4} />
        </span>
      )}
      <div className="flex flex-col leading-none">
        <span className={cn(s.text, 'font-extrabold tracking-tight')}>
          <span style={{ color: '#3b82f6' }}>Tucu</span>
          <span style={{ color: '#f8fafc' }}>compras</span>
        </span>
        {withTagline && (
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
            Panel de Administración
          </span>
        )}
      </div>
    </div>
  )
}
