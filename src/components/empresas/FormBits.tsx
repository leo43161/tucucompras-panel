"use client"
import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** Sección con título e icono */
export function FormSection({
  icon, title, desc, children, className,
}: {
  icon: React.ReactNode
  title: string
  desc?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2.5">
        <span className="h-7 w-7 rounded-md grid place-items-center bg-primary/15 text-primary border border-primary/20 shrink-0">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-semibold leading-none">{title}</h3>
          {desc && <p className="text-[11px] text-muted-foreground mt-1">{desc}</p>}
        </div>
      </div>
      <div className="space-y-3 pl-0">{children}</div>
    </section>
  )
}

/** Input + label + icono opcional */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  hint?: string
  icon?: React.ReactNode
  containerClassName?: string
}

export function Field({
  label, required, hint, icon, containerClassName, className, ...inputProps
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        )}
        <Input
          className={cn('h-10', icon && 'pl-9', className)}
          {...inputProps}
        />
      </div>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
