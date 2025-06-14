"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import axios from 'axios'
import { API_URL, HEALTH_CHECK_URL } from '@/lib/config'

// Interfaz para las props del componente LoginContent
interface LoginContentProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  serverStatus: 'checking' | 'online' | 'offline';
  setServerStatus: React.Dispatch<React.SetStateAction<'checking' | 'online' | 'offline'>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  
  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Limpiar cualquier token potencialmente problemático antes de intentar login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // Si el servidor está offline, mostrar error y no intentar login
    if (serverStatus === 'offline') {
      setError('El servidor no está disponible. Por favor, inténtalo más tarde.');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password)
      
      // Redirigir al dashboard después del login exitoso
      // Usamos window.location para forzar una navegación completa que funcione en producción
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error('Error durante login:', error)
      
      // Manejar diferentes tipos de errores
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setError('Tiempo de espera agotado. El servidor está tardando demasiado en responder.');
        } else if (!error.response) {
          setError('No se puede conectar con el servidor. Verifica tu conexión o contacta al administrador.');
        } else if (error.response.status === 401) {
          setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
        } else {
          setError(`Error de servidor: ${error.response.data?.message || 'Algo salió mal'}`);
        }
      } else {
        setError('Error inesperado al iniciar sesión. Inténtalo de nuevo.');
      }
      
      toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <Card className="w-full max-w-md relative z-10 bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        
        <Suspense fallback={<CardContent className="py-6 text-center text-sm text-muted-foreground">Verificando estado del servidor...</CardContent>}>
          <LoginContent
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
            serverStatus={serverStatus}
            setServerStatus={setServerStatus}
            handleSubmit={handleSubmit}
          />
        </Suspense>
      </Card>
    </div>
  )
}

// Componente de contenido de login
function LoginContent({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  setIsLoading,
  error,
  setError,
  serverStatus,
  setServerStatus,
  handleSubmit
}: LoginContentProps) {
  
  // Limpiar tokens potencialmente expirados al cargar la página de login
  useEffect(() => {
    // Limpiar tokens solo si hay errores relacionados con tokens en localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      
      if (token && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const currentTime = new Date().getTime();
        
        // Si el token está expirado o a punto de expirar (menos de 10 minutos), limpiarlo
        if (currentTime > expiryTime - (10 * 60 * 1000)) {
          console.log('🧹 Limpiando token potencialmente expirado al entrar a login');
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('user');
          localStorage.removeItem('permissions');
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }
    }
  }, []);
  
  // Verificar si el servidor está disponible al cargar la página
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Usar la URL directa para evitar problemas con el cliente de axios configurado
        const response = await fetch(HEALTH_CHECK_URL, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // No incluir credenciales para esta petición simple
          cache: 'no-store'
        });
        
        if (response.ok) {
          setServerStatus('online');
          setError(null);
        } else {
          setServerStatus('offline');
          setError('El servidor no está respondiendo correctamente. Por favor, inténtalo más tarde.');
        }
      } catch (error) {
        console.error('Error al verificar el estado del servidor:', error);
        setServerStatus('offline');
        setError('No se puede conectar con el servidor. Verifica tu conexión o contacta al administrador.');
      }
    };

    checkServerStatus();
  }, [setError, setServerStatus]);
  
  return (
    <>
      {serverStatus === 'checking' && (
        <Alert className="mt-4 bg-amber-500/10 text-amber-600 border-amber-600/20">
          <AlertDescription>
            Verificando conexión con el servidor...
          </AlertDescription>
        </Alert>
      )}
      
      {serverStatus === 'offline' && (
        <Alert className="mt-4 bg-destructive/10 text-destructive border-destructive/20">
          <AlertDescription>
            {error || 'El servidor no está disponible. Por favor, inténtalo más tarde.'}
          </AlertDescription>
        </Alert>
      )}
      
      {error && serverStatus !== 'offline' && (
        <Alert className="mt-4 bg-destructive/10 text-destructive border-destructive/20">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50"
              disabled={serverStatus === 'offline' || isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background/50"
              disabled={serverStatus === 'offline' || isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={serverStatus !== 'online' || isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </CardFooter>
      </form>
    </>
  )
} 