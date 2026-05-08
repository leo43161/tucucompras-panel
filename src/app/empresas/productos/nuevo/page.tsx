"use client"
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Sparkles, PencilLine, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { hasToken, getSession } from '@/services/auth'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { BatchUploader } from '@/components/productos/BatchUploader'
import { BatchEditor } from '@/components/productos/BatchEditor'
import { ManualProductForm } from '@/components/productos/ManualProductForm'
import { Topbar } from '@/components/Topbar'
import type { ProductoDraft } from '@/types/batch'

type Mode = 'ia' | 'manual'

function NuevoContent() {
  useAuthGuard()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>('ia')
  const [drafts, setDrafts] = useState<ProductoDraft[]>([])

  const session = useMemo(() => (typeof window !== 'undefined' ? getSession() : null), [])
  const isEmpresaAdmin = session?.rol_id === 2

  const queryId = searchParams.get('id')
  const empresaId =
    isEmpresaAdmin && session?.empresa_id
      ? session.empresa_id
      : queryId
        ? Number(queryId)
        : null

  useEffect(() => {
    if (!hasToken()) router.replace('/login')
  }, [router])

  useEffect(() => {
    if (!empresaId) router.replace('/empresas')
  }, [empresaId, router])

  if (!empresaId) return null

  const backHref = `/empresas/productos?id=${empresaId}`
  const inEditor = drafts.length > 0

  return (
    <div className="min-h-dvh bg-background bg-app-grid">
      <Topbar />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <Link href={backHref} className="inline-flex">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Volver al catálogo
          </Button>
        </Link>

        {/* Hero */}
        <header className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 mb-6">
          <div className="absolute inset-0 gradient-brand opacity-[0.06]" />
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" /> Agregar productos
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
              Nuevo producto
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Cargá tus productos eligiendo el método más cómodo. Podés usar la IA para detectarlos
              desde fotos o llenar el formulario manualmente uno por uno.
            </p>
          </div>
        </header>

        {/* Tabs de modo (ocultas mientras estamos en el editor del lote IA) */}
        {!inEditor && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <ModeCard
              active={mode === 'ia'}
              onClick={() => setMode('ia')}
              icon={<Sparkles className="h-5 w-5" />}
              title="Con IA"
              desc="Subí fotos y la IA detecta nombre, precio y categoría."
              badge="Recomendado"
            />
            <ModeCard
              active={mode === 'manual'}
              onClick={() => setMode('manual')}
              icon={<PencilLine className="h-5 w-5" />}
              title="Manual"
              desc="Llená el formulario completo con los datos del producto."
            />
          </div>
        )}

        {/* Contenido según modo */}
        <section className="mb-12">
          {mode === 'ia' ? (
            !inEditor ? (
              <BatchUploader empresaId={empresaId} onDraftsReady={setDrafts} />
            ) : (
              <BatchEditor
                empresaId={empresaId}
                drafts={drafts}
                onDone={() => {
                  setDrafts([])
                  router.push(backHref)
                }}
                onReset={() => setDrafts([])}
              />
            )
          ) : (
            <ManualProductForm
              empresaId={empresaId}
              onCreated={() => router.push(backHref)}
              onCancel={() => router.push(backHref)}
            />
          )}
        </section>
      </div>
    </div>
  )
}

function ModeCard({
  active, onClick, icon, title, desc, badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
  badge?: string
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'relative text-left rounded-xl border p-4 md:p-5 transition-all',
        active
          ? 'border-primary/60 bg-primary/[0.07] ring-brand-soft'
          : 'border-border bg-card/40 hover:bg-card/70 hover:border-primary/30',
      ].join(' ')}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-bold text-accent border border-accent/30 bg-accent/10 rounded px-1.5 py-0.5">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <span
          className={[
            'h-10 w-10 rounded-lg grid place-items-center shrink-0',
            active ? 'gradient-brand text-white' : 'bg-muted text-muted-foreground',
          ].join(' ')}
        >
          {icon}
        </span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
    </button>
  )
}

export default function NuevoProductoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <NuevoContent />
    </Suspense>
  )
}
