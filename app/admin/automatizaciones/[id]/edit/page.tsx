'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { AutomationService } from '@/lib/services/automationService';
import { Automation, AutomationField } from '@/lib/types/automation';

export default function EditAutomationPage() {
  const router = useRouter();
  const params = useParams();
  const automationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [automation, setAutomation] = useState<Automation | null>(null);
  
  // Estados del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<AutomationField[]>([]);
  
  // Estados de webhook
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookMethod, setWebhookMethod] = useState<'POST' | 'GET'>('POST');
  const [webhookHeaders, setWebhookHeaders] = useState<Record<string, string>>({});
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [sendLeadData, setSendLeadData] = useState(true);
  const [customPayload, setCustomPayload] = useState('');

  useEffect(() => {
    if (automationId) {
      loadAutomation();
    }
  }, [automationId]);

  const loadAutomation = async () => {
    try {
      console.log('=== loadAutomation INICIO ===');
      setLoading(true);
      console.log('🔄 Loading state activado');
      console.log('📡 Llamando AutomationService.getById con ID:', automationId);
      
      const data = await AutomationService.getById(automationId);
      console.log('✅ Datos recibidos del backend:', data);
      console.log('📊 Estructura de datos:', {
        hasName: !!data.name,
        hasStatus: !!data.status,
        hasConfig: !!data.config,
        hasFields: !!data.fields,
        fieldsLength: data.fields?.length || 0
      });
      
      setAutomation(data);
      setName(data.name);
      setDescription(data.description || '');
      
      // Mapear status del backend a isActive del frontend
      const isActiveValue = data.status === 'active';
      console.log('🔄 Mapeando status:', data.status, '→ isActive:', isActiveValue);
      setIsActive(isActiveValue);
      
      // Asegurar que cada campo tenga un ID único y mapear tamaños del backend
      const fieldsWithIds = (data.fields || []).map((field, index) => ({
        ...field,
        id: field.id || `field_${index}_${Date.now()}`,
        size: mapSizeFromBackend(field.size)
      }));
      console.log('📝 Campos procesados:', fieldsWithIds.length);
      setFields(fieldsWithIds);
      
      // Configuración de webhook - mapear desde config del backend
      if (data.config) {
        console.log('⚙️ Configurando webhook desde config:', data.config);
        setWebhookUrl(data.config.webhookUrl || '');
        setWebhookMethod('POST');
        setWebhookHeaders({});
        setWebhookEnabled(!!data.config.webhookUrl);
        setSendLeadData(data.config.sendEmployeeId || false);
        setCustomPayload('');
      } else {
        console.log('⚠️ No hay configuración de webhook');
      }
      
      console.log('✅ loadAutomation completado exitosamente');
    } catch (error: any) {
      console.error('❌ Error en loadAutomation:', error);
      console.log('📊 Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // Manejo más específico de errores
      if (error.response?.status === 404) {
        toast.error('Automatización no encontrada');
        router.push('/admin/automatizaciones');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('No tienes permisos para acceder a esta automatización');
        router.push('/admin/automatizaciones');
      } else {
        toast.error(`Error al cargar la automatización: ${error.message || 'Error desconocido'}`);
      }
    } finally {
      console.log('🔄 Loading state desactivado');
      setLoading(false);
    }
  };

  // Función para mapear nuevos tamaños a valores compatibles con el backend
  const mapSizeForBackend = (size: string): 'small' | 'medium' | 'large' => {
    switch (size) {
      case 'xs':
      case 'sm':
        return 'small';
      case 'md':
        return 'medium';
      case 'lg':
      case 'xl':
      case 'full':
        return 'large';
      default:
        return 'medium';
    }
  };

  // Función para mapear tamaños del backend a los nuevos valores del frontend
  const mapSizeFromBackend = (size: string): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' => {
    switch (size) {
      case 'small':
        return 'sm';
      case 'medium':
        return 'md';
      case 'large':
        return 'lg';
      default:
        return 'md';
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      setSaving(true);
      
      // Mapear los campos con tamaños compatibles para el backend
      const mappedFields = fields.map(field => ({
        ...field,
        size: mapSizeForBackend(field.size)
      })) as any;
      
      const updateData = {
        name: name.trim(),
        description: description.trim(),
        status: isActive ? 'active' : 'inactive',
        fields: mappedFields,
        config: {
          webhookUrl: webhookUrl.trim(),
          sendEmployeeId: sendLeadData,
          apiKey: '', // No se usa por ahora
          notificationEmail: '', // No se usa por ahora
          successRedirectUrl: '', // No se usa por ahora
          errorRedirectUrl: '' // No se usa por ahora
        }
      };

      await AutomationService.update(automationId, updateData);
      toast.success('Automatización actualizada exitosamente');
      router.push('/admin/automatizaciones');
    } catch (error) {
      console.error('Error updating automation:', error);
      toast.error('Error al actualizar la automatización');
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    const newField: AutomationField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
      size: 'md',
      placeholder: '',
      description: '',
      defaultValue: ''
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<AutomationField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items);
  };

  const addWebhookHeader = () => {
    setWebhookHeaders({ ...webhookHeaders, '': '' });
  };

  const updateWebhookHeader = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...webhookHeaders };
    if (oldKey !== newKey) {
      delete newHeaders[oldKey];
    }
    newHeaders[newKey] = value;
    setWebhookHeaders(newHeaders);
  };

  const removeWebhookHeader = (key: string) => {
    const newHeaders = { ...webhookHeaders };
    delete newHeaders[key];
    setWebhookHeaders(newHeaders);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando automatización...</p>
        </div>
      </div>
    );
  }

  if (!automation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Automatización no encontrada</h2>
          <Button onClick={() => router.push('/admin/automatizaciones')}>
            Volver a automatizaciones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/automatizaciones')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Automatización</h1>
            <p className="text-muted-foreground">
              Modifica la configuración de la automatización
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={automation.status === 'active' ? "default" : "secondary"}>
            {automation.status === 'active' ? "Activa" : automation.status === 'inactive' ? "Inactiva" : "Borrador"}
          </Badge>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Básica */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Configuración general de la automatización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre de la automatización"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Automatización activa</Label>
              </div>
            </CardContent>
          </Card>

          {/* Campos del Formulario */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campos del Formulario</CardTitle>
                  <CardDescription>
                    Configura los campos que aparecerán en el formulario
                  </CardDescription>
                </div>
                <Button onClick={addField} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Campo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay campos configurados
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="fields">
                    {(provided: DroppableProvided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided: DraggableProvided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border rounded-lg p-4 space-y-4 bg-card"
                              >
                                <div className="flex items-center justify-between">
                                  <div {...provided.dragHandleProps} className="cursor-move">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeField(index)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <Label>Nombre del campo *</Label>
                                  <Input
                                    value={field.name}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      updateField(index, { name: value, label: value });
                                    }}
                                    placeholder="Ej: Palabras clave, Ubicación"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Nombre del campo que verá el usuario
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  
                                  <div className="space-y-2">
                                    <Label>Tamaño</Label>
                                    <Select
                                      value={field.size}
                                      onValueChange={(value: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full') => 
                                        updateField(index, { size: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="xs">Extra Pequeño</SelectItem>
                                        <SelectItem value="sm">Pequeño</SelectItem>
                                        <SelectItem value="md">Mediano</SelectItem>
                                        <SelectItem value="lg">Grande</SelectItem>
                                        <SelectItem value="xl">Extra Grande</SelectItem>
                                        <SelectItem value="full">Ancho Completo</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex items-center space-x-2 pt-6">
                                    <Switch
                                      checked={field.required}
                                      onCheckedChange={(checked) => updateField(index, { required: checked })}
                                    />
                                    <Label>Campo requerido</Label>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Descripción</Label>
                                  <Input
                                    value={field.description}
                                    onChange={(e) => updateField(index, { description: e.target.value })}
                                    placeholder="Descripción opcional del campo"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Placeholder</Label>
                                    <Input
                                      value={field.placeholder}
                                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                      placeholder="Texto de ayuda"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Valor por defecto</Label>
                                    <Input
                                      value={field.defaultValue}
                                      onChange={(e) => updateField(index, { defaultValue: e.target.value })}
                                      placeholder="Valor inicial"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuración de Webhook */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Webhook</CardTitle>
              <CardDescription>
                Configura el webhook para recibir los datos del formulario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={webhookEnabled}
                  onCheckedChange={setWebhookEnabled}
                />
                <Label>Webhook habilitado</Label>
              </div>

              {webhookEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>URL del Webhook *</Label>
                    <Input
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://tu-servidor.com/webhook"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Método HTTP</Label>
                    <Select
                      value={webhookMethod}
                      onValueChange={(value: 'POST' | 'GET') => setWebhookMethod(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="GET">GET</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Headers HTTP</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addWebhookHeader}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(webhookHeaders).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <Input
                            placeholder="Header"
                            value={key}
                            onChange={(e) => updateWebhookHeader(key, e.target.value, value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Valor"
                            value={value}
                            onChange={(e) => updateWebhookHeader(key, key, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWebhookHeader(key)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={sendLeadData}
                      onCheckedChange={setSendLeadData}
                    />
                    <Label>Incluir datos del lead</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Payload personalizado (JSON)</Label>
                    <Textarea
                      value={customPayload}
                      onChange={(e) => setCustomPayload(e.target.value)}
                      placeholder='{"custom": "data"}'
                      rows={4}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
            </div>
          </main>
        </div>
      </div>
    );
  } 