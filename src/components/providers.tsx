"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  )
}