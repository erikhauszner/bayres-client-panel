'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { AutomationService } from '@/lib/services/automationService';
import { Automation, AutomationField } from '@/lib/types/automation';
import { useHasPermission } from '@/hooks/useHasPermission';

export default function AutomationFormPage() {
  const params = useParams();
  const router = useRouter();
  const automationId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  // Verificar permisos
  const hasSubmitPermission = useHasPermission('automations:submit');

  useEffect(() => {
    // Verificar permisos primero
    if (!hasSubmitPermission) {
      toast.error('No tienes permisos para usar automatizaciones');
      router.push('/dashboard');
      return;
    }
    
    loadAutomation();
  }, [automationId, hasSubmitPermission, router]);

  const loadAutomation = async () => {
    try {
      setLoading(true);
      const data = await AutomationService.getById(automationId);
      
      if (data.status !== 'active') {
        toast.error('Esta automatización no está disponible');
        return;
      }
      
      setAutomation(data);
      
      // Inicializar formData con valores por defecto
      const initialData: Record<string, string> = {};
      data.fields?.forEach((field: AutomationField) => {
        initialData[field.name] = field.defaultValue || '';
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Error loading automation:', error);
      toast.error('Error al cargar el formulario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!automation) return;

    // Validar campos requeridos
    const requiredFields = automation.fields?.filter(field => field.required) || [];
    const missingFields = requiredFields.filter(field => !formData[field.name]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Por favor completa los campos requeridos: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      await AutomationService.submit(automationId, formData);
      setSubmitted(true);
      toast.success('Formulario enviado exitosamente');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al enviar el formulario');
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldSize = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'xs':
      case 'small':
        return 'md:col-span-1';
      case 'sm':
      case 'md':
      case 'medium':
        return 'md:col-span-2';
      case 'lg':
      case 'xl':
      case 'large':
      case 'full':
        return 'md:col-span-3';
      default:
        return 'md:col-span-2';
    }
  };

  const isLargeField = (size: string) => {
    return size === 'large' || size === 'lg' || size === 'xl' || size === 'full';
  };

  const renderField = (field: AutomationField, index: number) => {
    const fieldSize = getFieldSize(field.size);
    
    return (
      <div key={field.id || `field-${index}`} className={`space-y-2 ${fieldSize}`}>
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}
        
        {isLargeField(field.size) ? (
          <Textarea
            id={field.name}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        ) : (
          <Input
            id={field.name}
            name={field.name}
            type="text"
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <div className="flex items-center justify-center min-h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando formulario...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!hasSubmitPermission) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <div className="flex items-center justify-center min-h-full">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Sin permisos</h2>
                  <p className="text-muted-foreground mb-4">
                    No tienes permisos para usar automatizaciones.
                  </p>
                  <Button onClick={() => router.push('/dashboard')}>
                    Volver al Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!automation) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <div className="flex items-center justify-center min-h-full">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <h2 className="text-2xl font-bold mb-2">Formulario no disponible</h2>
                  <p className="text-muted-foreground">
                    El formulario solicitado no existe o no está activo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <div className="flex items-center justify-center min-h-full">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">¡Formulario enviado!</h2>
                  <p className="text-muted-foreground">
                    Gracias por completar el formulario. Hemos recibido tu información correctamente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <div className="container mx-auto max-w-4xl">
            {/* Título y descripción fuera del Card */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight mb-4">{automation.name}</h1>
              {automation.description && (
                <p className="text-xl text-muted-foreground">
                  {automation.description}
                </p>
              )}
            </div>
            
            <Card className="shadow-xl">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {automation.fields && automation.fields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {automation.fields.map((field, index) => renderField(field, index))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay campos configurados para este formulario.
                    </div>
                  )}
                  
                  {automation.fields && automation.fields.length > 0 && (
                    <div className="flex justify-center pt-6">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={submitting}
                        className="min-w-[200px]"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar Formulario
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
            
            {/* Footer */}
            <div className="text-center mt-8 text-sm text-muted-foreground">
              <p>Formulario generado automáticamente</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 