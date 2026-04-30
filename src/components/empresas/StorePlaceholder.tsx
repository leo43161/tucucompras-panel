import { Store } from 'lucide-react'

export function StorePlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
      <Store className="w-1/2 h-1/2" />
    </div>
  )
}
