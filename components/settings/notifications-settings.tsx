"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar, 
  AlertCircle, 
  Check, 
  User, 
  FileText,
  Clock,
  Save
} from "lucide-react"

export default function NotificationsSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Simulación de configuraciones de notificaciones
  const [platformSettings, setPlatformSettings] = useState({
    messages: true,
    mentions: true,
    system: true,
    lead_updates: true,
    task_reminders: true,
    meeting_reminders: true
  })
  
  const [emailSettings, setEmailSettings] = useState({
    messages: false,
    mentions: true,
    system: true,
    lead_updates: true,
    task_reminders: true,
    meeting_reminders: true,
    marketing: false,
    newsletter: false
  })
  
  const [alertSettings, setAlertSettings] = useState({
    lead_threshold: 50,
    project_deadline: 3,
    invoice_due: 7,
    task_overdue: true,
    login_attempts: true
  })
  
  const handlePlatformToggle = (key: string) => {
    setPlatformSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }
  
  const handleEmailToggle = (key: string) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }
  
  const handleAlertInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    setAlertSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value)
    }))
  }
  
  const handleSavePreferences = async () => {
    setIsLoading(true)
    
    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast({
        title: "Preferencias guardadas",
        description: "Las configuraciones de notificaciones se han actualizado correctamente"
      })
    } catch (error) {
      console.error("Error al guardar preferencias:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificaciones en la Plataforma</CardTitle>
          </div>
          <CardDescription>
            Elige qué notificaciones quieres recibir dentro de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="platform_messages" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span>Mensajes</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Notificaciones cuando recibes un mensaje de otro usuario
              </p>
            </div>
            <Switch 
              id="platform_messages" 
              checked={platformSettings.messages}
              onCheckedChange={() => handlePlatformToggle('messages')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="platform_mentions" className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-500" />
                <span>Menciones</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Notificaciones cuando te mencionan en comentarios o notas
              </p>
            </div>
            <Switch 
              id="platform_mentions" 
              checked={platformSettings.mentions}
              onCheckedChange={() => handlePlatformToggle('mentions')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="platform_system" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>Anuncios del sistema</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Actualizaciones, novedades y anuncios importantes
              </p>
            </div>
            <Switch 
              id="platform_system" 
              checked={platformSettings.system}
              onCheckedChange={() => handlePlatformToggle('system')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="lead_updates" className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Actualización de leads</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Recibir notificaciones cuando un lead cambia de estado
              </p>
            </div>
            <Switch 
              id="lead_updates" 
              checked={platformSettings.lead_updates}
              onCheckedChange={() => handlePlatformToggle('lead_updates')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="task_reminders" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                <span>Recordatorios de tareas</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Recordatorios para tareas con fecha próxima de vencimiento
              </p>
            </div>
            <Switch 
              id="task_reminders" 
              checked={platformSettings.task_reminders}
              onCheckedChange={() => handlePlatformToggle('task_reminders')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="meeting_reminders" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Reuniones</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Recordatorios para reuniones programadas
              </p>
            </div>
            <Switch 
              id="meeting_reminders" 
              checked={platformSettings.meeting_reminders}
              onCheckedChange={() => handlePlatformToggle('meeting_reminders')}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Notificaciones por Email</CardTitle>
          </div>
          <CardDescription>
            Elige qué notificaciones quieres recibir por correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_messages">Mensajes</Label>
              <p className="text-xs text-muted-foreground">
                Recibir un email cuando alguien te envía un mensaje
              </p>
            </div>
            <Switch 
              id="email_messages" 
              checked={emailSettings.messages}
              onCheckedChange={() => handleEmailToggle('messages')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_mentions">Menciones</Label>
              <p className="text-xs text-muted-foreground">
                Recibir un email cuando te mencionan en comentarios
              </p>
            </div>
            <Switch 
              id="email_mentions" 
              checked={emailSettings.mentions}
              onCheckedChange={() => handleEmailToggle('mentions')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_system">Anuncios del sistema</Label>
              <p className="text-xs text-muted-foreground">
                Recibir emails sobre actualizaciones y novedades importantes
              </p>
            </div>
            <Switch 
              id="email_system" 
              checked={emailSettings.system}
              onCheckedChange={() => handleEmailToggle('system')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_lead_updates">Actualización de leads</Label>
              <p className="text-xs text-muted-foreground">
                Recibir emails cuando un lead cambia de estado
              </p>
            </div>
            <Switch 
              id="email_lead_updates" 
              checked={emailSettings.lead_updates}
              onCheckedChange={() => handleEmailToggle('lead_updates')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_task_reminders">Recordatorios de tareas</Label>
              <p className="text-xs text-muted-foreground">
                Recibir emails para tareas próximas a vencer
              </p>
            </div>
            <Switch 
              id="email_task_reminders" 
              checked={emailSettings.task_reminders}
              onCheckedChange={() => handleEmailToggle('task_reminders')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_meeting_reminders">Reuniones</Label>
              <p className="text-xs text-muted-foreground">
                Recibir emails para reuniones programadas
              </p>
            </div>
            <Switch 
              id="email_meeting_reminders" 
              checked={emailSettings.meeting_reminders}
              onCheckedChange={() => handleEmailToggle('meeting_reminders')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_marketing">Marketing</Label>
              <p className="text-xs text-muted-foreground">
                Recibir emails con promociones y novedades comerciales
              </p>
            </div>
            <Switch 
              id="email_marketing" 
              checked={emailSettings.marketing}
              onCheckedChange={() => handleEmailToggle('marketing')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_newsletter">Newsletter</Label>
              <p className="text-xs text-muted-foreground">
                Recibir nuestra newsletter mensual
              </p>
            </div>
            <Switch 
              id="email_newsletter" 
              checked={emailSettings.newsletter}
              onCheckedChange={() => handleEmailToggle('newsletter')}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Alertas y Umbrales</CardTitle>
          </div>
          <CardDescription>
            Configura las condiciones para alertas automáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_threshold" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Umbral de leads sin seguimiento</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="lead_threshold" 
                  name="lead_threshold"
                  type="number" 
                  min="1"
                  value={alertSettings.lead_threshold}
                  onChange={handleAlertInputChange}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  días
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alertar cuando un lead no ha tenido seguimiento durante este período
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project_deadline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Alerta de vencimiento de proyectos</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="project_deadline" 
                  name="project_deadline"
                  type="number" 
                  min="1"
                  value={alertSettings.project_deadline}
                  onChange={handleAlertInputChange}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  días antes
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alertar este número de días antes del vencimiento de un proyecto
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invoice_due" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Alerta de facturas por vencer</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="invoice_due" 
                  name="invoice_due"
                  type="number" 
                  min="1"
                  value={alertSettings.invoice_due}
                  onChange={handleAlertInputChange}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  días antes
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alertar este número de días antes del vencimiento de una factura
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="task_overdue" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Alerta de tareas vencidas</span>
                </Label>
                <Switch 
                  id="task_overdue" 
                  name="task_overdue"
                  checked={alertSettings.task_overdue}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, task_overdue: checked }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Alertar cuando hay tareas que han pasado su fecha de vencimiento
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login_attempts" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Alertas de seguridad</span>
                </Label>
                <Switch 
                  id="login_attempts" 
                  name="login_attempts"
                  checked={alertSettings.login_attempts}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, login_attempts: checked }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Alertar sobre intentos de inicio de sesión sospechosos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar Preferencias'}
        </Button>
      </div>
    </div>
  )
} 