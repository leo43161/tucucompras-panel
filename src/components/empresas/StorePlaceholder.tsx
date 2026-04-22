import { Store } from 'lucide-react'

export function StorePlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 ${className}`}>
      <Store className="w-1/2 h-1/2" />
    </div>
  )
}