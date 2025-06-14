'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Loader2, User, BarChart3, MapPin, Phone, Target } from 'lucide-react';
import Link from 'next/link';
import { useHasPermission } from '@/hooks/useHasPermission';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/api';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function NewOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [salesAgents, setSalesAgents] = useState<Employee[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Información de la oportunidad
    title: '',
    description: '',
    salesAgent: 'none',
    priority: 'media',
    estimatedValue: '',
    probability: '50',
    expectedCloseDate: '',
    
    // Información del lead/contacto
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    industry: '',
    companySize: '',
    website: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    facebook: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    source: 'web',
    interestedProducts: '',
    estimatedBudget: '',
    tags: ''
  });

  const hasCreatePermission = useHasPermission('opportunities:create');

  useEffect(() => {
    if (hasCreatePermission) {
      fetchInitialData();
    }
  }, [hasCreatePermission]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Obtener empleados para asignar como vendedores
      const employeesResponse = await api.get('/employees');
      setSalesAgents(employeesResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoadingData(false);
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

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('Por favor completa la información básica del contacto (nombre, apellido y email son requeridos)');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        salesAgent: formData.salesAgent !== 'none' ? formData.salesAgent : undefined,
        priority: formData.priority,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        probability: parseInt(formData.probability),
        expectedCloseDate: formData.expectedCloseDate || undefined,
        // Información del lead
        leadInfo: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          position: formData.position.trim(),
          industry: formData.industry.trim(),
          companySize: formData.companySize,
          website: formData.website.trim(),
          instagram: formData.instagram.trim(),
          twitter: formData.twitter.trim(),
          linkedin: formData.linkedin.trim(),
          facebook: formData.facebook.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
          postalCode: formData.postalCode.trim(),
          source: formData.source,
          interestedProducts: formData.interestedProducts ? formData.interestedProducts.split(',').map(p => p.trim()) : [],
          estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : undefined,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
        }
      };

      const response = await api.post('/opportunities/transfer-from-lead', payload);

      if (response.status === 200 || response.status === 201) {
        router.push(`/oportunidades/${response.data.data._id}`);
      } else {
        setError(response.data.message || 'Error al crear la oportunidad');
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
      setError('Error al crear la oportunidad');
    } finally {
      setLoading(false);
    }
  };

  if (!hasCreatePermission) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No tienes permisos para crear oportunidades.</p>
              </CardContent>
            </Card>
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
              <Link href="/oportunidades">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Nueva Oportunidad</h1>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Información Personal del Contacto */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal del Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        placeholder="Nombre del contacto"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        placeholder="Apellido del contacto"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@ejemplo.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        placeholder="+52 55 1234 5678"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información Empresarial */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Información Empresarial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        placeholder="Nombre de la empresa"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Cargo</Label>
                      <Input
                        id="position"
                        placeholder="Director, Gerente, etc."
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industria</Label>
                      <Input
                        id="industry"
                        placeholder="Tecnología, Salud, etc."
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companySize">Tamaño de la Empresa</Label>
                      <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tamaño" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 empleados</SelectItem>
                          <SelectItem value="11-50">11-50 empleados</SelectItem>
                          <SelectItem value="51-200">51-200 empleados</SelectItem>
                          <SelectItem value="201-500">201-500 empleados</SelectItem>
                          <SelectItem value="501+">Más de 500 empleados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input
                        id="website"
                        placeholder="https://ejemplo.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source">Fuente</Label>
                      <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web">Sitio Web</SelectItem>
                          <SelectItem value="referido">Referido</SelectItem>
                          <SelectItem value="redes_sociales">Redes Sociales</SelectItem>
                          <SelectItem value="email_marketing">Email Marketing</SelectItem>
                          <SelectItem value="llamada_fria">Llamada Fría</SelectItem>
                          <SelectItem value="evento">Evento</SelectItem>
                          <SelectItem value="publicidad">Publicidad</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Redes Sociales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Redes Sociales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        placeholder="https://linkedin.com/in/usuario"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        placeholder="@usuario"
                        value={formData.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        placeholder="@usuario"
                        value={formData.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        placeholder="https://facebook.com/usuario"
                        value={formData.facebook}
                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ubicación */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Textarea
                      id="address"
                      placeholder="Dirección completa"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        placeholder="Ciudad"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado/Provincia</Label>
                      <Input
                        id="state"
                        placeholder="Estado o Provincia"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        placeholder="País"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input
                        id="postalCode"
                        placeholder="Código Postal"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información Adicional */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="interestedProducts">Productos de Interés</Label>
                      <Input
                        id="interestedProducts"
                        placeholder="Producto 1, Producto 2, etc."
                        value={formData.interestedProducts}
                        onChange={(e) => handleInputChange('interestedProducts', e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">Separar con comas</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimatedBudget">Presupuesto Estimado (MXN)</Label>
                      <Input
                        id="estimatedBudget"
                        type="number"
                        placeholder="0"
                        value={formData.estimatedBudget}
                        onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Etiquetas</Label>
                    <Input
                      id="tags"
                      placeholder="etiqueta1, etiqueta2, etc."
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">Separar con comas</p>
                  </div>
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={loading || loadingData} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Crear Oportunidad
                    </>
                  )}
                </Button>
                <Link href="/oportunidades">
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