"use client"
import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Copy, Check, Mail, KeyRound, AlertTriangle } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onClose: () => void
  email: string
  password: string
  empresaNombre: string
}

export function CreatedEmpresaSuccess({ open, onClose, email, password, empresaNombre }: Props) {
  const [copied, setCopied] = useState<'email' | 'password' | 'all' | null>(null)

  const copy = async (val: string, key: 'email' | 'password' | 'all') => {
    try {
      await navigator.clipboard.writeText(val)
      setCopied(key)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full grid place-items-center bg-primary/15 text-primary border border-primary/20 mb-2">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Empresa creada</DialogTitle>
          <p className="text-sm text-center text-muted-foreground">
            <strong className="text-foreground">{empresaNombre}</strong> ya está registrada.
            Compartile estos datos al dueño para que pueda ingresar.
          </p>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <CopyRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={email}
            isCopied={copied === 'email'}
            onCopy={() => copy(email, 'email')}
          />
          <CopyRow
            icon={<KeyRound className="h-4 w-4" />}
            label="Contraseña inicial"
            value={password}
            mono
            isCopied={copied === 'password'}
            onCopy={() => copy(password, 'password')}
          />

          <div className="flex gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs">
            <AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Importante:</span> esta contraseña no
              se vuelve a mostrar. Guardala antes de cerrar este aviso.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => copy(`Email: ${email}\nContraseña: ${password}`, 'all')}
          >
            {copied === 'all' ? <><Check className="h-4 w-4 mr-2" /> Copiado</> : <><Copy className="h-4 w-4 mr-2" /> Copiar todo</>}
          </Button>
          <Button onClick={onClose} className="flex-1 gradient-brand text-white font-semibold">
            Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CopyRow({
  icon, label, value, mono, isCopied, onCopy,
}: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
  isCopied: boolean
  onCopy: () => void
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-1.5">
        {icon} {label}
      </p>
      <div className="flex items-center gap-2">
        <code
          className={[
            'flex-1 truncate rounded-md bg-muted px-3 py-2 text-sm select-all',
            mono ? 'font-mono tracking-widest font-semibold' : '',
          ].join(' ')}
        >
          {value}
        </code>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={onCopy}
          title="Copiar"
        >
          {isCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
