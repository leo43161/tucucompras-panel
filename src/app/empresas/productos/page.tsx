"use client"
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { hasToken } from '@/services/auth'
import { BatchUploader } from '@/components/productos/BatchUploader'
import { BatchEditor } from '@/components/productos/BatchEditor'
import { ProductoList } from '@/components/productos/ProductoList'
import type { ProductoDraft } from '@/types/batch'

function ProductosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const empresaIdStr = searchParams.get('id')
  const empresaId = empresaIdStr ? Number(empresaIdStr) : null
  const [drafts, setDrafts] = useState<ProductoDraft[]>([])

  useEffect(() => {
    if (!hasToken()) router.replace('/login')
  }, [router])

  useEffect(() => {
    if (!empresaId) router.replace('/empresas')
  }, [empresaId, router])

  if (!empresaId) return null

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 dark:text-slate-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Link href="/empresas">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4 dark:text-violet-50" /> Volver a empresas
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <Package className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Cargar productos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Empresa #{empresaId}</p>
        </div>

        {drafts.length === 0 ? (
          <BatchUploader empresaId={empresaId} onDraftsReady={setDrafts} />
        ) : (
          <BatchEditor
            empresaId={empresaId}
            drafts={drafts}
            onDone={() => setDrafts([])}
            onReset={() => setDrafts([])}
          />
        )}

        <Separator className="my-8" />

        <ProductoList empresaId={empresaId} />
      </div>
    </div>
  )
}

export default function EmpresaProductosPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>}>
      <ProductosContent />
    </Suspense>
  )
}