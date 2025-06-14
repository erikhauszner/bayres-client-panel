'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, User, Calendar, Target, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useHasPermission } from '@/hooks/useHasPermission';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import api from '@/lib/api';

interface Opportunity {
  _id: string;
  title: string;
  status: string;
  priority: string;
  estimatedValue?: number;
  probability: number;
  expectedCloseDate?: string;
  originalAgent: {
    firstName: string;
    lastName: string;
  };
  salesAgent?: {
    firstName: string;
    lastName: string;
  };
  leadSnapshot: {
    firstName: string;
    lastName: string;
    company?: string;
  };
  interests?: Array<{
    _id: string;
    title: string;
    description?: string;
    approximateBudget?: number;
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    deletedAt?: string;
    deletedBy?: {
      firstName: string;
      lastName: string;
    };
    deletionReason?: string;
  }>;
  createdAt: string;
}

const statusColors = {
  'nueva': 'bg-blue-100 text-blue-800',
  'en_proceso': 'bg-yellow-100 text-yellow-800',
  'negociacion': 'bg-orange-100 text-orange-800',
  'propuesta_enviada': 'bg-purple-100 text-purple-800',
  'cerrada_ganada': 'bg-green-100 text-green-800',
  'cerrada_perdida': 'bg-red-100 text-red-800',
};

const priorityColors = {
  'baja': 'bg-gray-100 text-gray-800',
  'media': 'bg-blue-100 text-blue-800',
  'alta': 'bg-orange-100 text-orange-800',
  'urgente': 'bg-red-100 text-red-800',
};

export default function OpportunityListPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const hasCreatePermission = useHasPermission('opportunities:create');
  const hasViewPermission = useHasPermission('opportunities:read');

  useEffect(() => {
    fetchOpportunities();
  }, [statusFilter, priorityFilter]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter && priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      const response = await api.get(`/opportunities?${params.toString()}`);
      
      if (response.status === 200) {
        setOpportunities(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity =>
    opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.leadSnapshot.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.leadSnapshot.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.leadSnapshot.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No definido';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  // Función para calcular el valor total de los intereses de una oportunidad
  const calculateInterestsTotalValue = (opportunity: Opportunity) => {
    if (!opportunity?.interests) return 0;
    
    // Filtrar solo intereses activos (no eliminados) y sumar sus presupuestos aproximados
    return opportunity.interests
      .filter(interest => !interest.deletedAt)
      .reduce((total, interest) => {
        return total + (interest.approximateBudget || 0);
      }, 0);
  };

  if (!hasViewPermission) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No tienes permisos para ver las oportunidades.</p>
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Oportunidades</h1>
          <p className="text-muted-foreground mt-1">Gestiona las oportunidades de venta</p>
        </div>
        {hasCreatePermission && (
          <Link href="/oportunidades/nueva">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Oportunidad
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar oportunidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="nueva">Nueva</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="negociacion">Negociación</SelectItem>
                <SelectItem value="propuesta_enviada">Propuesta Enviada</SelectItem>
                <SelectItem value="cerrada_ganada">Cerrada Ganada</SelectItem>
                <SelectItem value="cerrada_perdida">Cerrada Perdida</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Oportunidades */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando oportunidades...</p>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron oportunidades.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link 
                        href={`/oportunidades/${opportunity._id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {opportunity.title}
                      </Link>
                      <Badge className={statusColors[opportunity.status as keyof typeof statusColors]}>
                        {opportunity.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={priorityColors[opportunity.priority as keyof typeof priorityColors]}>
                        {opportunity.priority}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      <strong>Cliente:</strong> {opportunity.leadSnapshot.firstName} {opportunity.leadSnapshot.lastName}
                      {opportunity.leadSnapshot.company && (
                        <span> - {opportunity.leadSnapshot.company}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          <strong>Comisionista:</strong> {opportunity.originalAgent.firstName} {opportunity.originalAgent.lastName}
                        </span>
                      </div>
                      
                      {opportunity.salesAgent && (
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>
                            <strong>Vendedor:</strong> {opportunity.salesAgent.firstName} {opportunity.salesAgent.lastName}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>
                          <strong>Valor:</strong> {formatCurrency(calculateInterestsTotalValue(opportunity))}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          <strong>Cierre:</strong> {formatDate(opportunity.expectedCloseDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {opportunity.probability}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      probabilidad
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </main>
      </div>
    </div>
  );
} 