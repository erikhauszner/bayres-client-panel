"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectToDocsApi() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/docs/api")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redireccionando a la documentación de la API...</p>
    </div>
  )
} 