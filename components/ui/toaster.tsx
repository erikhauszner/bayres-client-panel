"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Seleccionar el icono según la variante
        let Icon = Info
        if (variant === 'destructive') Icon = XCircle
        else if (variant === 'success') Icon = CheckCircle2
        else if (variant === 'warning') Icon = AlertCircle

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3 items-start">
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
