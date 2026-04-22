"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { hasToken } from '@/services/auth'
import { BatchUploader } from '@/components/productos/BatchUploader'
import { BatchEditor } from '@/components/productos/BatchEditor'
import type { ProductoDraft } from '@/types/batch'

export default function EmpresaProductosPage() {
  const router = useRouter()
  const { empresaId } = useParams<{ empresaId: string }>()
  const [drafts, setDrafts] = useState<ProductoDraft[]>([])

  useEffect(() => { if (!hasToken()) router.replace('/login') }, [router])

  const reset = () => setDrafts([])
  const done = () => {
    setDrafts([])
    router.push('/empresas')
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Link href="/empresas">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver a empresas
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-violet-600" />
            Cargar productos
          </h1>
          <p className="text-sm text-slate-500">Empresa #{empresaId}</p>
        </div>

        {drafts.length === 0 ? (
          <BatchUploader empresaId={Number(empresaId)} onDraftsReady={setDrafts} />
        ) : (
          <BatchEditor empresaId={Number(empresaId)} drafts={drafts} onDone={done} onReset={reset} />
        )}
      </div>
    </div>
  )
}