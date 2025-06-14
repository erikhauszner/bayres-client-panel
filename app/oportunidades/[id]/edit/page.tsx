'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, Target } from 'lucide-react';
import Link from 'next/link';
import { useHasPermission } from '@/hooks/useHasPermission';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function EditOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesAgents, setSalesAgents] = useState<Employee[]>([]);
  const [opportunity, setOpportunity] = useState<any>(null);

  const [formData, setFormData] = useState({
    // Información de la oportunidad
    title: '',
    description: '',
    salesAgent: '',
    priority: 'media',
    estimatedValue: '',
    probability: '50',
    expectedCloseDate: '',
    status: 'nueva'
  });

  const hasUpdatePermission = useHasPermission('opportunities:update');

  useEffect(() => {
    if (hasUpdatePermission && params.id) {
      fetchOpportunity();
      fetchEmployees();
    }
  }, [hasUpdatePermission, params.id]);

  const fetchOpportunity = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/opportunities/${params.id}`);
      
      if (response.status === 200) {
        const opportunityData = response.data.data;
        setOpportunity(opportunityData);
        
        // Formatear la fecha para el input de tipo date
        let formattedDate = '';
        if (opportunityData.expectedCloseDate) {
          const date = new Date(opportunityData.expectedCloseDate);
          formattedDate = date.toISOString().split('T')[0];
        }
        
        setFormData({
          title: opportunityData.title || '',
          description: opportunityData.description || '',
          salesAgent: opportunityData.salesAgent?._id || 'none',
          priority: opportunityData.priority || 'media',
          estimatedValue: opportunityData.estimatedValue?.toString() || '',
          probability: opportunityData.probability?.toString() || '50',
          expectedCloseDate: formattedDate,
          status: opportunityData.status || 'nueva'
        });
      } else {
        setError('No se pudo cargar la información de la oportunidad');
        router.push('/oportunidades');
      }
    } catch (error) {
      console.error('Error al cargar la oportunidad:', error);
      setError('Error al cargar la información de la oportunidad');
      router.push('/oportunidades');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setSalesAgents(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.title.trim()) {
      setError('Por favor completa el título de la oportunidad');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        salesAgent: formData.salesAgent === 'none' ? undefined : formData.salesAgent,
        priority: formData.priority,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        probability: parseInt(formData.probability),
        expectedCloseDate: formData.expectedCloseDate || undefined,
        status: formData.status
      };

      const response = await api.put(`/opportunities/${params.id}`, payload);

      if (response.status === 200) {
        toast.success('Oportunidad actualizada correctamente');
        router.push(`/oportunidades/${params.id}`);
      } else {
        setError(response.data.message || 'Error al actualizar la oportunidad');
      }
    } catch (error) {
      console.error('Error updating opportunity:', error);
      setError('Error al actualizar la oportunidad');
    } finally {
      setLoading(false);
    }
  };

  if (!hasUpdatePermission) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No tienes permisos para editar oportunidades.</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground">Cargando oportunidad...</p>
              </div>
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link href={`/oportunidades/${params.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Editar Oportunidad</h1>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información de la Oportunidad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Información de la Oportunidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título de la Oportunidad *</Label>
                      <Input
                        id="title"
                        placeholder="Ej: Venta de software a Empresa ABC"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesAgent">Vendedor Asignado</Label>
                      <Select value={formData.salesAgent} onValueChange={(value) => handleInputChange('salesAgent', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar vendedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin asignar</SelectItem>
                          {salesAgents.map((agent) => (
                            <SelectItem key={agent._id} value={agent._id}>
                              {agent.firstName} {agent.lastName} - {agent.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe la oportunidad..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nueva">Nueva</SelectItem>
                          <SelectItem value="en_proceso">En Proceso</SelectItem>
                          <SelectItem value="negociacion">Negociación</SelectItem>
                          <SelectItem value="propuesta_enviada">Propuesta Enviada</SelectItem>
                          <SelectItem value="cerrada_ganada">Cerrada (Ganada)</SelectItem>
                          <SelectItem value="cerrada_perdida">Cerrada (Perdida)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimatedValue">Valor Estimado (MXN)</Label>
                      <Input
                        id="estimatedValue"
                        type="number"
                        placeholder="0"
                        value={formData.estimatedValue}
                        onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="probability">Probabilidad de Cierre (%)</Label>
                      <Input
                        id="probability"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="50"
                        value={formData.probability}
                        onChange={(e) => handleInputChange('probability', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedCloseDate">Fecha de Cierre Esperada</Label>
                    <Input
                      id="expectedCloseDate"
                      type="date"
                      value={formData.expectedCloseDate}
                      onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Link href={`/oportunidades/${params.id}`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
} 