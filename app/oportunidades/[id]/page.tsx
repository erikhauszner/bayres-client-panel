'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Save, X, Calendar, DollarSign, BarChart, Clock, AlertCircle, CheckCircle, User, Target, Percent } from 'lucide-react';
import Link from 'next/link';
import useHasPermission from '@/hooks/useHasPermission';
import { useAuth } from '@/contexts/auth-context';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import api from '@/lib/api';
import OpportunityHeader from '@/components/opportunity/OpportunityHeader';
import OpportunityActions from '@/components/opportunity/OpportunityActions';
import OpportunityTabs from '@/components/opportunity/OpportunityTabs';
import ScheduleCallModal from '@/components/opportunity/ScheduleCallModal';
import DateModal from '@/components/opportunity/DateModal';
import FollowUpModal from '@/components/opportunity/FollowUpModal';
import EditFollowUpModal from '@/components/opportunity/EditFollowUpModal';
import EditCommentModal from '@/components/opportunity/EditCommentModal';
import AddInterestModal from '@/components/opportunity/AddInterestModal';
import EditInterestModal from '@/components/opportunity/EditInterestModal';
import DeleteInterestModal from '@/components/opportunity/DeleteInterestModal';
import AddLeadNoteModal from '@/components/opportunity/AddLeadNoteModal';
import EditLeadNoteModal from '@/components/opportunity/EditLeadNoteModal';
import DeleteLeadNoteModal from '@/components/opportunity/DeleteLeadNoteModal';
import AddTaskModal from '@/components/opportunity/AddTaskModal';
import EditTaskModal from '@/components/opportunity/EditTaskModal';
import DeleteTaskModal from '@/components/opportunity/DeleteTaskModal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface OpportunityDetail {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimatedValue?: number;
  probability: number;
  expectedCloseDate?: string;
  deadlineDate?: string;
  originalAgent: {
    firstName: string;
    lastName: string;
    email: string;
  };
  salesAgent?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  collaborators?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  leadSnapshot: {
    // Información Básica
    firstName: string;
    lastName: string;
    company?: string;
    position?: string;
    industry?: string;
    companySize?: string;
    website?: string;
    // Información de Contacto
    phone?: string;
    whatsapp?: string;
    email?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    // Información de Ubicación
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    timezone?: string;
    // Información de Lead
    source: string;
    captureDate: string;
    initialScore: number;
    currentStage: string;
    status: string;
    estimatedValue?: number;
    priority: string;
    interestedProducts?: string[];
    estimatedBudget?: number;
    // Información Adicional
    notes?: Array<{
      _id?: string;
      content: string;
      createdAt: string;
      updatedAt?: string;
      user: {
        firstName: string;
        lastName: string;
      };
      updatedBy?: {
        firstName: string;
        lastName: string;
      };
      deletedAt?: string;
      deletedBy?: {
        firstName: string;
        lastName: string;
      };
      deletionReason?: string;
    }>;
    attachments?: string[];
    interactionHistory?: Array<{
      date: string;
      type: string;
      title?: string;
      description: string;
      user: {
        firstName: string;
        lastName: string;
      };
    }>;
    tasks?: Array<{
      title: string;
      description?: string;
      dueDate: string;
      status: string;
      priority: string;
      completedAt?: string;
      user: {
        firstName: string;
        lastName: string;
      };
      createdAt: string;
    }>;
    documents?: Array<{
      name: string;
      description?: string;
      fileUrl: string;
      fileType: string;
      fileSize?: number;
      tags?: string[];
      uploadDate: string;
      user: {
        firstName: string;
        lastName: string;
      };
      isExternalLink?: boolean;
    }>;
    tags?: string[];
    categories?: string[];
    trackingStatus?: string;
    preferredContactTime?: string;
    assignedTo?: {
      firstName: string;
      lastName: string;
    };
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  };
  comments: Array<{
    _id: string;
    author: {
      firstName: string;
      lastName: string;
    };
    content: string;
    createdAt: string;
    isVisibleToOriginalAgent: boolean;
  }>;
  activities: Array<{
    _id: string;
    type: string;
    description: string;
    performedBy: {
      firstName: string;
      lastName: string;
    };
    date: string;
    isVisibleToOriginalAgent: boolean;
  }>;
  scheduledCalls?: Array<{
    _id: string;
    title: string;
    description?: string;
    medium: string;
    scheduledDate: string;
    participants: Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    }>;
    status: 'programada' | 'completada' | 'cancelada';
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }>;
  followUps?: Array<{
    _id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    status: 'pendiente' | 'completado' | 'cancelado';
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }>;
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
  tasks?: Array<{
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
    priority: 'baja' | 'media' | 'alta' | 'urgente';
    assignedTo?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    completedAt?: string;
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt?: string;
    updatedBy?: {
      firstName: string;
      lastName: string;
    };
  }>;
  createdAt: string;
  transferredAt: string;
}

const statusColors = {
  'nueva': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'en_proceso': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  'negociacion': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  'propuesta_enviada': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'cerrada_ganada': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  'cerrada_perdida': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
};

const statusIcons = {
  'nueva': <AlertCircle className="h-4 w-4" />,
  'en_proceso': <Clock className="h-4 w-4" />,
  'negociacion': <BarChart className="h-4 w-4" />,
  'propuesta_enviada': <Calendar className="h-4 w-4" />,
  'cerrada_ganada': <CheckCircle className="h-4 w-4" />,
  'cerrada_perdida': <X className="h-4 w-4" />,
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { employee } = useAuth();
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  
  // Estados para el modal de asignar vendedor/colaborador
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [employees, setEmployees] = useState<Array<{_id: string, firstName: string, lastName: string, email: string, position: string, isActive: boolean, department?: string}>>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedSalesAgent, setSelectedSalesAgent] = useState<string>('');
  const [assigningAgent, setAssigningAgent] = useState(false);
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);

  // Estados para los nuevos modales
  const [showScheduleCallModal, setShowScheduleCallModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateModalType, setDateModalType] = useState<'expected' | 'deadline'>('expected');
  const [currentDateValue, setCurrentDateValue] = useState<string | undefined>(undefined);
  const [updatingDates, setUpdatingDates] = useState(false);
  const [schedulingCall, setSchedulingCall] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [creatingFollowUp, setCreatingFollowUp] = useState(false);
  const [showEditFollowUpModal, setShowEditFollowUpModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<{
    _id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    status: 'pendiente' | 'completado' | 'cancelado';
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  } | null>(null);
  const [updatingFollowUp, setUpdatingFollowUp] = useState(false);
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState<{
    _id: string;
    content: string;
    isVisibleToOriginalAgent: boolean;
    author: {
      _id?: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  } | null>(null);
  const [updatingComment, setUpdatingComment] = useState(false);

  // Estados para modales de intereses
  const [showAddInterestModal, setShowAddInterestModal] = useState(false);
  const [showEditInterestModal, setShowEditInterestModal] = useState(false);
  const [showDeleteInterestModal, setShowDeleteInterestModal] = useState(false);
  const [editingInterest, setEditingInterest] = useState<{
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
  } | null>(null);
  const [deletingInterest, setDeletingInterest] = useState<{
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
  } | null>(null);
  const [creatingInterest, setCreatingInterest] = useState(false);
  const [updatingInterest, setUpdatingInterest] = useState(false);
  const [deletingInterestLoading, setDeletingInterestLoading] = useState(false);

  // Estados para modales de notas del lead
  const [showAddLeadNoteModal, setShowAddLeadNoteModal] = useState(false);
  const [showEditLeadNoteModal, setShowEditLeadNoteModal] = useState(false);
  const [showDeleteLeadNoteModal, setShowDeleteLeadNoteModal] = useState(false);
  const [editingLeadNote, setEditingLeadNote] = useState<{
    _id?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    user: {
      firstName: string;
      lastName: string;
    };
    updatedBy?: {
      firstName: string;
      lastName: string;
    };
    deletedAt?: string;
    deletedBy?: {
      firstName: string;
      lastName: string;
    };
    deletionReason?: string;
  } | null>(null);
  const [deletingLeadNote, setDeletingLeadNote] = useState<{
    _id?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    user: {
      firstName: string;
      lastName: string;
    };
    updatedBy?: {
      firstName: string;
      lastName: string;
    };
    deletedAt?: string;
    deletedBy?: {
      firstName: string;
      lastName: string;
    };
    deletionReason?: string;
  } | null>(null);
  const [creatingLeadNote, setCreatingLeadNote] = useState(false);
  const [updatingLeadNote, setUpdatingLeadNote] = useState(false);
  const [deletingLeadNoteLoading, setDeletingLeadNoteLoading] = useState(false);

  // Estados para modales de tareas
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
    priority: 'baja' | 'media' | 'alta' | 'urgente';
    assignedTo?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    completedAt?: string;
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt?: string;
    updatedBy?: {
      firstName: string;
      lastName: string;
    };
  } | null>(null);
  const [deletingTask, setDeletingTask] = useState<{
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
    priority: 'baja' | 'media' | 'alta' | 'urgente';
    assignedTo?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    completedAt?: string;
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt?: string;
    updatedBy?: {
      firstName: string;
      lastName: string;
    };
  } | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [deletingTaskLoading, setDeletingTaskLoading] = useState(false);
  
  // Estados para editar probabilidad
  const [showProbabilityModal, setShowProbabilityModal] = useState(false);
  const [newProbability, setNewProbability] = useState<string>('0');
  const [updatingProbability, setUpdatingProbability] = useState(false);

  // Estados para modal de desasignar
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [unassignType, setUnassignType] = useState<'salesAgent' | 'collaborator' | 'all'>('salesAgent');
  const [selectedCollaboratorToUnassign, setSelectedCollaboratorToUnassign] = useState<string>('');
  const [unassigning, setUnassigning] = useState(false);

  // Permisos funcionales - patrón estándar
  const hasReadPermission = useHasPermission('opportunities:read');
  const hasUpdatePermission = useHasPermission('opportunities:update');
  const hasDeletePermission = useHasPermission('opportunities:delete');
  const hasAssignPermission = useHasPermission('opportunities:assign');
  const hasCommentPermission = useHasPermission('opportunities:comment');
  const hasClosePermission = useHasPermission('opportunities:close');
  const hasTransferPermission = useHasPermission('opportunities:transfer');
  const hasViewAllPermission = useHasPermission('opportunities:view_all');
  const hasViewOwnPermission = useHasPermission('opportunities:view_own');
  const hasUnassignPermission = useHasPermission('opportunities:unassign');

  useEffect(() => {
    fetchOpportunity();
  }, [params.id]);

  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/opportunities/${params.id}`);
      
      if (response.status === 200) {
        setOpportunity(response.data.data);
        setNewStatus(response.data.data.status);
      } else {
        router.push('/oportunidades');
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      router.push('/oportunidades');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener empleados (vendedores)
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      // Obtener todos los empleados sin filtros
      const response = await api.get('/employees');
      
      if (response.status === 200) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      toast.error('No se pudieron cargar los empleados');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleOpenAssignDialog = () => {
    setSelectedSalesAgent('');
    setIsAddingCollaborator(false);
    fetchEmployees();
    setShowAssignDialog(true);
  };

  const handleOpenCollaboratorDialog = () => {
    setSelectedSalesAgent('');
    setIsAddingCollaborator(true);
    fetchEmployees();
    setShowAssignDialog(true);
  };

  const handleAssignSalesAgent = async () => {
    if (!selectedSalesAgent) {
      toast.error('Debes seleccionar un empleado');
      return;
    }

    try {
      setAssigningAgent(true);
      
      // Si estamos añadiendo un colaborador o asignando un vendedor principal
      const endpoint = isAddingCollaborator 
        ? `/opportunities/${params.id}/collaborators` 
        : `/opportunities/${params.id}/assign`;
      
      const payload = isAddingCollaborator 
        ? { collaboratorId: selectedSalesAgent }
        : { salesAgentId: selectedSalesAgent };

      const response = await api.post(endpoint, payload);

      if (response.status === 200) {
        toast.success(isAddingCollaborator 
          ? 'Colaborador agregado exitosamente' 
          : 'Empleado asignado exitosamente');
        setShowAssignDialog(false);
        fetchOpportunity(); // Recargar la oportunidad para mostrar el empleado asignado
      }
    } catch (error) {
      console.error(isAddingCollaborator 
        ? 'Error al agregar colaborador:' 
        : 'Error al asignar empleado:', error);
      toast.error(isAddingCollaborator 
        ? 'Error al agregar colaborador' 
        : 'Error al asignar empleado');
    } finally {
      setAssigningAgent(false);
    }
  };

  const updateStatus = async () => {
    if (!opportunity || newStatus === opportunity.status) {
      setEditingStatus(false);
      return;
    }

    try {
      const response = await api.put(`/opportunities/${opportunity._id}/status`, { 
        status: newStatus 
      });

      if (response.status === 200) {
        setOpportunity({ ...opportunity, status: newStatus });
        setEditingStatus(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);
      const response = await api.post(`/opportunities/${params.id}/comments`, { 
        content: newComment,
        isVisibleToOriginalAgent: true 
      });

      if (response.status === 200) {
        setNewComment('');
        fetchOpportunity(); // Refrescar para ver el nuevo comentario
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setAddingComment(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No definido';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX');
  };

  // Función para calcular el valor total de los intereses
  const calculateInterestsTotalValue = () => {
    if (!opportunity?.interests) return 0;
    
    // Filtrar solo intereses activos (no eliminados) y sumar sus presupuestos aproximados
    return opportunity.interests
      .filter(interest => !interest.deletedAt)
      .reduce((total, interest) => {
        return total + (interest.approximateBudget || 0);
      }, 0);
  };

  const handleEditOpportunity = () => {
    router.push(`/oportunidades/${params.id}/edit`);
  };

  const handleDeleteOpportunity = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta oportunidad?')) {
      return;
    }

    try {
      const response = await api.delete(`/opportunities/${params.id}`);
      
      if (response.status === 200) {
        router.push('/oportunidades');
      }
    } catch (error) {
      console.error('Error al eliminar oportunidad:', error);
    }
  };

  const handleConfirmAgenda = async () => {
    try {
      const response = await api.post(`/opportunities/${params.id}/confirm-agenda`);
      
      if (response.status === 200) {
        toast.success('Agenda confirmada exitosamente');
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al confirmar agenda:', error);
      toast.error('Error al confirmar agenda');
    }
  };

  const handleScheduleCall = async (callData: {
    title: string;
    description?: string;
    medium: string;
    scheduledDate: string;
    participants: string[];
  }) => {
    try {
      setSchedulingCall(true);
      const response = await api.post(`/opportunities/${params.id}/schedule-call`, callData);
      
      if (response.status === 200) {
        toast.success('Llamada agendada exitosamente');
        setShowScheduleCallModal(false);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al agendar llamada:', error);
      toast.error('Error al agendar llamada');
    } finally {
      setSchedulingCall(false);
    }
  };

  const handleUpdateDates = async (date: string, note?: string) => {
    try {
      setUpdatingDates(true);
      const payload = dateModalType === 'expected' 
        ? { expectedCloseDate: date }
        : { deadlineDate: date };

      const response = await api.put(`/opportunities/${params.id}/dates`, payload);
      
      if (response.status === 200) {
        toast.success(`Fecha ${dateModalType === 'expected' ? 'esperada' : 'límite'} actualizada exitosamente`);
        setShowDateModal(false);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al actualizar fecha:', error);
      toast.error('Error al actualizar fecha');
    } finally {
      setUpdatingDates(false);
    }
  };

  const handleCreateFollowUp = async (followUpData: {
    title: string;
    description?: string;
    scheduledDate: string;
  }) => {
    try {
      setCreatingFollowUp(true);
      
      const response = await api.post(`/opportunities/${params.id}/follow-ups`, followUpData);
      
      if (response.status === 200) {
        toast.success('Seguimiento creado exitosamente');
        setShowFollowUpModal(false);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al crear seguimiento:', error);
      toast.error('Error al crear el seguimiento');
    } finally {
      setCreatingFollowUp(false);
    }
  };

  const handleUpdateFollowUpStatus = async (followUpId: string, status: 'completado' | 'cancelado') => {
    try {
      const response = await api.put(`/opportunities/${params.id}/follow-ups/${followUpId}/status`, { status });
      
      if (response.status === 200) {
        toast.success(`Seguimiento marcado como ${status === 'completado' ? 'completado' : 'cancelado'}`);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al actualizar seguimiento:', error);
      toast.error('Error al actualizar el seguimiento');
    }
  };

  const handleEditFollowUp = (followUp: {
    _id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    status: 'pendiente' | 'completado' | 'cancelado';
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }) => {
    setEditingFollowUp(followUp);
    setShowEditFollowUpModal(true);
  };

  const handleUpdateFollowUp = async (followUpId: string, followUpData: {
    title: string;
    description?: string;
    scheduledDate: string;
  }) => {
    try {
      setUpdatingFollowUp(true);
      const response = await api.put(`/opportunities/${params.id}/follow-ups/${followUpId}`, followUpData);
      
      if (response.status === 200) {
        toast.success('Seguimiento actualizado exitosamente');
        setShowEditFollowUpModal(false);
        setEditingFollowUp(null);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al actualizar seguimiento:', error);
      toast.error('Error al actualizar el seguimiento');
    } finally {
      setUpdatingFollowUp(false);
    }
  };

  const handleEditComment = (comment: {
    _id: string;
    content: string;
    isVisibleToOriginalAgent: boolean;
    author: {
      _id?: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }) => {
    setEditingComment(comment);
    setShowEditCommentModal(true);
  };

  const handleUpdateComment = async (commentId: string, commentData: {
    content: string;
    isVisibleToOriginalAgent: boolean;
  }) => {
    try {
      setUpdatingComment(true);
      const response = await api.put(`/opportunities/${params.id}/comments/${commentId}`, commentData);
      
      if (response.status === 200) {
        toast.success('Comentario actualizado exitosamente');
        setShowEditCommentModal(false);
        setEditingComment(null);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      toast.error('Error al actualizar el comentario');
    } finally {
      setUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await api.delete(`/opportunities/${params.id}/comments/${commentId}`);
      
      if (response.status === 200) {
        toast.success('Comentario eliminado exitosamente');
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      toast.error('Error al eliminar el comentario');
    }
  };

  // Funciones para manejar intereses
  const handleAddInterest = () => {
    setShowAddInterestModal(true);
  };

  const handleCreateInterest = async (interestData: {
    title: string;
    description?: string;
    approximateBudget?: number;
  }) => {
    try {
      setCreatingInterest(true);
      const response = await api.post(`/opportunities/${params.id}/interests`, interestData);
      
      if (response.status === 200) {
        toast.success('Interés agregado exitosamente');
        setShowAddInterestModal(false);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al crear interés:', error);
      toast.error('Error al agregar el interés');
    } finally {
      setCreatingInterest(false);
    }
  };

  const handleEditInterest = (interest: {
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
  }) => {
    setEditingInterest(interest);
    setShowEditInterestModal(true);
  };

  const handleUpdateInterest = async (interestId: string, interestData: {
    title: string;
    description?: string;
    approximateBudget?: number;
  }) => {
    try {
      setUpdatingInterest(true);
      const response = await api.put(`/opportunities/${params.id}/interests/${interestId}`, interestData);
      
      if (response.status === 200) {
        toast.success('Interés editado exitosamente');
        setShowEditInterestModal(false);
        setEditingInterest(null);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al editar interés:', error);
      toast.error('Error al editar el interés');
    } finally {
      setUpdatingInterest(false);
    }
  };

  const handleDeleteInterest = (interest: {
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
  }) => {
    setDeletingInterest(interest);
    setShowDeleteInterestModal(true);
  };

  const handleConfirmDeleteInterest = async (interestId: string, reason?: string) => {
    try {
      setDeletingInterestLoading(true);
      const response = await api.delete(`/opportunities/${params.id}/interests/${interestId}`, {
        data: { reason }
      });
      
      if (response.status === 200) {
        toast.success('Interés eliminado exitosamente');
        setShowDeleteInterestModal(false);
        setDeletingInterest(null);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al eliminar interés:', error);
      toast.error('Error al eliminar el interés');
    } finally {
      setDeletingInterestLoading(false);
    }
  };

  // Funciones para manejar notas del lead
  const handleAddLeadNote = () => {
    setShowAddLeadNoteModal(true);
  };

  const handleCreateLeadNote = async (noteData: { content: string }) => {
    try {
      setCreatingLeadNote(true);
      const response = await api.post(`/opportunities/${params.id}/lead-notes`, noteData);

      if (response.status === 200) {
        toast.success('Nota agregada exitosamente');
        setShowAddLeadNoteModal(false);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al crear nota del lead:', error);
      toast.error('Error al agregar la nota');
    } finally {
      setCreatingLeadNote(false);
    }
  };

  const handleEditLeadNote = (note: {
    _id?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    user: {
      firstName: string;
      lastName: string;
    };
    updatedBy?: {
      firstName: string;
      lastName: string;
    };
    deletedAt?: string;
    deletedBy?: {
      firstName: string;
      lastName: string;
    };
    deletionReason?: string;
  }) => {
    setEditingLeadNote(note);
    setShowEditLeadNoteModal(true);
  };

  const handleUpdateLeadNote = async (noteId: string, noteData: { content: string }) => {
    try {
      setUpdatingLeadNote(true);
      const response = await api.put(`/opportunities/${params.id}/lead-notes/${noteId}`, noteData);

      if (response.status === 200) {
        toast.success('Nota editada exitosamente');
        setShowEditLeadNoteModal(false);
        setEditingLeadNote(null);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al editar nota del lead:', error);
      toast.error('Error al editar la nota');
    } finally {
      setUpdatingLeadNote(false);
    }
  };

  const handleDeleteLeadNote = (note: {
    _id?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    user: {
      firstName: string;
      lastName: string;
    };
    updatedBy?: {
      firstName: string;
      lastName: string;
    };
    deletedAt?: string;
    deletedBy?: {
      firstName: string;
      lastName: string;
    };
    deletionReason?: string;
  }) => {
    setDeletingLeadNote(note);
    setShowDeleteLeadNoteModal(true);
  };

  const handleConfirmDeleteLeadNote = async (noteId: string, reason?: string) => {
    try {
      setDeletingLeadNoteLoading(true);
      const response = await api.delete(`/opportunities/${params.id}/lead-notes/${noteId}`, {
        data: { reason }
      });

      if (response.status === 200) {
        toast.success('Nota eliminada exitosamente');
        setShowDeleteLeadNoteModal(false);
        setDeletingLeadNote(null);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al eliminar nota del lead:', error);
      toast.error('Error al eliminar la nota');
    } finally {
      setDeletingLeadNoteLoading(false);
    }
  };

  // Handlers para tareas
  const handleAddTask = () => {
    setShowAddTaskModal(true);
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description?: string;
    dueDate: string;
    priority: string;
    assignedTo?: string;
  }) => {
    try {
      setCreatingTask(true);
      const response = await api.post(`/opportunities/${params.id}/tasks`, taskData);

      if (response.status === 200) {
        toast.success('Tarea creada exitosamente');
        setShowAddTaskModal(false);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al crear tarea:', error);
      toast.error('Error al crear la tarea');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleEditTask = (task: {
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
    priority: 'baja' | 'media' | 'alta' | 'urgente';
    assignedTo?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    completedAt?: string;
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt?: string;
    updatedBy?: {
      firstName: string;
      lastName: string;
    };
  }) => {
    setEditingTask(task);
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = async (taskId: string, taskData: {
    title: string;
    description?: string;
    dueDate: string;
    priority: string;
    assignedTo?: string;
    status: string;
  }) => {
    try {
      setUpdatingTask(true);
      const response = await api.put(`/opportunities/${params.id}/tasks/${taskId}`, taskData);

      if (response.status === 200) {
        toast.success('Tarea actualizada exitosamente');
        setShowEditTaskModal(false);
        setEditingTask(null);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error('Error al actualizar la tarea');
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleDeleteTask = (task: {
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
    priority: 'baja' | 'media' | 'alta' | 'urgente';
    assignedTo?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    completedAt?: string;
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt?: string;
    updatedBy?: {
      firstName: string;
      lastName: string;
    };
  }) => {
    setDeletingTask(task);
    setShowDeleteTaskModal(true);
  };

  const handleConfirmDeleteTask = async (taskId: string) => {
    try {
      setDeletingTaskLoading(true);
      const response = await api.delete(`/opportunities/${params.id}/tasks/${taskId}`);

      if (response.status === 200) {
        toast.success('Tarea eliminada exitosamente');
        setShowDeleteTaskModal(false);
        setDeletingTask(null);
        fetchOpportunity(); // Recargar la oportunidad
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      toast.error('Error al eliminar la tarea');
    } finally {
      setDeletingTaskLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await api.put(`/opportunities/${params.id}/tasks/${taskId}/status`, { status });
      
      if (response.data.success) {
        setOpportunity(response.data.data);
        const statusLabels: { [key: string]: string } = {
          'completada': 'completada',
          'cancelada': 'cancelada',
          'pendiente': 'pendiente'
        };
        toast.success(`Tarea marcada como ${statusLabels[status]}`);
      }
    } catch (error: any) {
      console.error('Error al actualizar estado de tarea:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el estado de la tarea');
    }
  };

  const handleEditProbability = () => {
    if (opportunity) {
      setNewProbability(opportunity.probability.toString());
      setShowProbabilityModal(true);
    }
  };

  const handleUpdateProbability = async () => {
    const probabilityNumber = Number(newProbability);
    if (!opportunity || probabilityNumber < 0 || probabilityNumber > 100 || isNaN(probabilityNumber)) {
      toast.error('La probabilidad debe estar entre 0 y 100');
      return;
    }

    try {
      setUpdatingProbability(true);
      const response = await api.put(`/opportunities/${opportunity._id}/probability`, {
        probability: probabilityNumber
      });

      if (response.status === 200) {
        setOpportunity({ ...opportunity, probability: probabilityNumber });
        setShowProbabilityModal(false);
        toast.success('Probabilidad actualizada exitosamente');
      }
    } catch (error) {
      console.error('Error updating probability:', error);
      toast.error('Error al actualizar la probabilidad');
    } finally {
      setUpdatingProbability(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="flex items-center justify-center h-64">
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

  // Verificación básica de permisos (patrón estándar)
  if (!hasReadPermission && !hasViewAllPermission && !hasViewOwnPermission) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin permisos</h3>
                <p className="text-muted-foreground mb-4">
                  No tienes permisos para ver esta oportunidad.
                </p>
                <Button onClick={() => router.push('/oportunidades')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Oportunidades
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Oportunidad no encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  La oportunidad que buscas no existe o ha sido eliminada.
                </p>
                <Button onClick={() => router.push('/oportunidades')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Oportunidades
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'nueva': 'Nueva',
      'en_proceso': 'En Proceso',
      'negociacion': 'Negociación',
      'propuesta_enviada': 'Propuesta Enviada',
      'cerrada_ganada': 'Cerrada (Ganada)',
      'cerrada_perdida': 'Cerrada (Perdida)',
    };
    return labels[status] || status.replace('_', ' ');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Breadcrumb y acciones principales */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild className="rounded-full">
                <Link href="/oportunidades">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{opportunity.title}</h1>
                  <div className="flex items-center gap-1">
                    {!editingStatus ? (
                      <Badge className={`flex items-center gap-1 px-2 py-1 ${statusColors[opportunity.status as keyof typeof statusColors]}`}>
                        {statusIcons[opportunity.status as keyof typeof statusIcons]}
                        <span>{getStatusLabel(opportunity.status)}</span>
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Cliente: {opportunity.leadSnapshot.firstName} {opportunity.leadSnapshot.lastName}
                  {opportunity.leadSnapshot.company && ` · ${opportunity.leadSnapshot.company}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {editingStatus ? (
                <div className="flex items-center gap-2 bg-card p-1 rounded-md border">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-44 border-none shadow-none">
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
                  <div className="flex items-center">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={updateStatus}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => setEditingStatus(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Resumen de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Valor Estimado</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(calculateInterestsTotalValue())}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40 border-green-200 dark:border-green-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-green-700 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">Probabilidad</p>
                  <p className="text-lg font-bold text-foreground">{opportunity.probability}%</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Fecha Esperada</p>
                  <p className="text-lg font-bold text-foreground">{formatDate(opportunity.expectedCloseDate)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/40 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Prioridad</p>
                  <p className="text-lg font-bold text-foreground capitalize">{opportunity.priority}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Segunda fila de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/40 border-indigo-200 dark:border-indigo-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
                </div>
                <div>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">Comisionista Original</p>
                  <p className="text-lg font-bold text-foreground">{opportunity.originalAgent.firstName} {opportunity.originalAgent.lastName}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center">
                  <Target className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Vendedor Asignado</p>
                  <p className="text-lg font-bold text-foreground">
                    {opportunity.salesAgent 
                      ? `${opportunity.salesAgent.firstName} ${opportunity.salesAgent.lastName}`
                      : 'No asignado'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/40 dark:to-cyan-900/40 border-cyan-200 dark:border-cyan-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-cyan-200 dark:bg-cyan-800 flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm text-cyan-700 dark:text-cyan-300">Etapa</p>
                  <p className="text-lg font-bold text-foreground">{opportunity.leadSnapshot.currentStage}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/40 border-rose-200 dark:border-rose-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-rose-200 dark:bg-rose-800 flex items-center justify-center">
                  {statusIcons[opportunity.status as keyof typeof statusIcons] || <AlertCircle className="h-5 w-5 text-rose-700 dark:text-rose-300" />}
                </div>
                <div>
                  <p className="text-sm text-rose-700 dark:text-rose-300">Estado</p>
                  <p className="text-lg font-bold text-foreground">{getStatusLabel(opportunity.status)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Columna izquierda - Información principal */}
            <div className="lg:col-span-3 space-y-6">
              <OpportunityHeader 
                leadSnapshot={opportunity.leadSnapshot}
                priority={opportunity.priority}
                status={opportunity.status}
                probability={opportunity.probability}
              />
              
              <OpportunityTabs
                opportunity={opportunity}
                hasCommentPermission={hasCommentPermission ?? false}
                hasUpdatePermission={hasUpdatePermission ?? false}
                newComment={newComment}
                setNewComment={setNewComment}
                addingComment={addingComment}
                addComment={addComment}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                formatDateTime={formatDateTime}
                onUpdateFollowUpStatus={handleUpdateFollowUpStatus}
                onEditFollowUp={handleEditFollowUp}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                currentUserId={employee?._id}
                onAddInterest={handleAddInterest}
                onEditInterest={handleEditInterest}
                onDeleteInterest={handleDeleteInterest}
                onAddLeadNote={handleAddLeadNote}
                onEditLeadNote={handleEditLeadNote}
                onDeleteLeadNote={handleDeleteLeadNote}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>

            {/* Columna derecha - Acciones y detalles */}
            <OpportunityActions
              hasUpdatePermission={hasUpdatePermission ?? false}
              hasDeletePermission={hasDeletePermission ?? false}
              hasAssignPermission={hasAssignPermission ?? false}
              onEdit={handleEditOpportunity}
              onDelete={handleDeleteOpportunity}
              onAssignSalesAgent={handleOpenAssignDialog}
              onAddCollaborator={handleOpenCollaboratorDialog}
              onConfirmAgenda={handleConfirmAgenda}
              onScheduleCall={() => {
                fetchEmployees();
                setShowScheduleCallModal(true);
              }}
              onSetExpectedDate={() => {
                setDateModalType('expected');
                setCurrentDateValue(undefined);
                setShowDateModal(true);
              }}
              onSetDeadlineDate={() => {
                setDateModalType('deadline');
                setCurrentDateValue(undefined);
                setShowDateModal(true);
              }}
              onEditExpectedDate={() => {
                setDateModalType('expected');
                setCurrentDateValue(opportunity.expectedCloseDate);
                setShowDateModal(true);
              }}
              onEditDeadlineDate={() => {
                setDateModalType('deadline');
                setCurrentDateValue(opportunity.deadlineDate);
                setShowDateModal(true);
              }}
              onChangeStatus={() => setEditingStatus(true)}
              onCreateFollowUp={() => setShowFollowUpModal(true)}
              onAddInterest={handleAddInterest}
              onEditProbability={handleEditProbability}
              estimatedValue={opportunity.estimatedValue}
              probability={opportunity.probability}
              expectedCloseDate={opportunity.expectedCloseDate}
              deadlineDate={opportunity.deadlineDate}
              currentStage={opportunity.leadSnapshot.currentStage}
              originalAgent={opportunity.originalAgent}
              salesAgent={opportunity.salesAgent}
              collaborators={opportunity.collaborators}
              transferredAt={opportunity.transferredAt}
              createdAt={opportunity.createdAt}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </div>

          {/* Modal para asignar vendedor o agregar colaborador */}
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{isAddingCollaborator ? 'Agregar Colaborador' : 'Asignar Empleado'}</DialogTitle>
                <DialogDescription>
                  {isAddingCollaborator 
                    ? 'Selecciona un empleado para agregar como colaborador a esta oportunidad'
                    : 'Selecciona un empleado para asignar a esta oportunidad'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="salesAgent">Empleado</Label>
                    <Select value={selectedSalesAgent} onValueChange={setSelectedSalesAgent} disabled={loadingEmployees}>
                      <SelectTrigger id="salesAgent">
                        <SelectValue placeholder={loadingEmployees ? "Cargando empleados..." : "Selecciona un empleado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.length === 0 ? (
                          <SelectItem value="no-employees" disabled>
                            No hay empleados disponibles
                          </SelectItem>
                        ) : (
                          employees.map((employee) => (
                            <SelectItem key={employee._id} value={employee._id}>
                              {employee.firstName} {employee.lastName}
                              {employee.department && ` - ${employee.department.charAt(0).toUpperCase() + employee.department.slice(1)}`}
                              {!employee.isActive && " (Inactivo)"}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSalesAgent && (
                    <div className="mt-4 p-3 border rounded-md bg-muted/20">
                      {employees.filter(emp => emp._id === selectedSalesAgent).map(employee => (
                        <div key={employee._id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Nombre:</span>
                            <span className="text-sm">{employee.firstName} {employee.lastName}</span>
                          </div>
                          {employee.position && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Cargo:</span>
                              <span className="text-sm">{employee.position}</span>
                            </div>
                          )}
                          {employee.department && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Departamento:</span>
                              <span className="text-sm">{employee.department.charAt(0).toUpperCase() + employee.department.slice(1)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Estado:</span>
                            <span className={`text-sm ${employee.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {employee.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Email:</span>
                            <span className="text-sm">{employee.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAssignSalesAgent} 
                  disabled={!selectedSalesAgent || assigningAgent}
                >
                  {assigningAgent 
                    ? (isAddingCollaborator ? "Agregando..." : "Asignando...") 
                    : (isAddingCollaborator ? "Agregar Colaborador" : "Asignar Empleado")
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal para agendar llamada */}
          <ScheduleCallModal
            isOpen={showScheduleCallModal}
            onClose={() => setShowScheduleCallModal(false)}
            onSchedule={handleScheduleCall}
            employees={employees}
            loading={schedulingCall}
          />

          {/* Modal para fechas */}
          <DateModal
            isOpen={showDateModal}
            onClose={() => setShowDateModal(false)}
            onSave={handleUpdateDates}
            type={dateModalType}
            currentDate={currentDateValue}
            loading={updatingDates}
          />

          {/* Modal para crear seguimiento */}
          <FollowUpModal
            isOpen={showFollowUpModal}
            onClose={() => setShowFollowUpModal(false)}
            onCreateFollowUp={handleCreateFollowUp}
            loading={creatingFollowUp}
          />

          {/* Modal para editar seguimiento */}
          <EditFollowUpModal
            isOpen={showEditFollowUpModal}
            onClose={() => {
              setShowEditFollowUpModal(false);
              setEditingFollowUp(null);
            }}
            onUpdateFollowUp={handleUpdateFollowUp}
            followUp={editingFollowUp}
            loading={updatingFollowUp}
          />

          {/* Modal para editar comentario */}
          <EditCommentModal
            isOpen={showEditCommentModal}
            onClose={() => {
              setShowEditCommentModal(false);
              setEditingComment(null);
            }}
            onUpdateComment={handleUpdateComment}
            comment={editingComment}
            loading={updatingComment}
          />

          {/* Modal para agregar interés */}
          <AddInterestModal
            isOpen={showAddInterestModal}
            onClose={() => setShowAddInterestModal(false)}
            onCreateInterest={handleCreateInterest}
            loading={creatingInterest}
          />

          {/* Modal para editar interés */}
          <EditInterestModal
            isOpen={showEditInterestModal}
            onClose={() => {
              setShowEditInterestModal(false);
              setEditingInterest(null);
            }}
            onUpdateInterest={handleUpdateInterest}
            interest={editingInterest}
            loading={updatingInterest}
          />

          {/* Modal para eliminar interés */}
          <DeleteInterestModal
            isOpen={showDeleteInterestModal}
            onClose={() => {
              setShowDeleteInterestModal(false);
              setDeletingInterest(null);
            }}
            onDeleteInterest={handleConfirmDeleteInterest}
            interest={deletingInterest}
            loading={deletingInterestLoading}
          />

          {/* Modal para agregar nota del lead */}
          <AddLeadNoteModal
            isOpen={showAddLeadNoteModal}
            onClose={() => setShowAddLeadNoteModal(false)}
            onSubmit={handleCreateLeadNote}
            isLoading={creatingLeadNote}
          />

          {/* Modal para editar nota del lead */}
          <EditLeadNoteModal
            isOpen={showEditLeadNoteModal}
            onClose={() => {
              setShowEditLeadNoteModal(false);
              setEditingLeadNote(null);
            }}
            onSubmit={handleUpdateLeadNote}
            note={editingLeadNote}
            isLoading={updatingLeadNote}
          />

          {/* Modal para eliminar nota del lead */}
          <DeleteLeadNoteModal
            isOpen={showDeleteLeadNoteModal}
            onClose={() => {
              setShowDeleteLeadNoteModal(false);
              setDeletingLeadNote(null);
            }}
            onConfirm={handleConfirmDeleteLeadNote}
            note={deletingLeadNote}
            isLoading={deletingLeadNoteLoading}
          />

          {/* Modal para agregar tarea */}
          <AddTaskModal
            isOpen={showAddTaskModal}
            onClose={() => setShowAddTaskModal(false)}
            onSubmit={handleCreateTask}
            employees={employees}
            isLoading={creatingTask}
          />

          {/* Modal para editar tarea */}
          <EditTaskModal
            isOpen={showEditTaskModal}
            onClose={() => {
              setShowEditTaskModal(false);
              setEditingTask(null);
            }}
            onSubmit={handleUpdateTask}
            task={editingTask}
            employees={employees}
            isLoading={updatingTask}
          />

          {/* Modal para eliminar tarea */}
          <DeleteTaskModal
            isOpen={showDeleteTaskModal}
            onClose={() => {
              setShowDeleteTaskModal(false);
              setDeletingTask(null);
            }}
            onConfirm={handleConfirmDeleteTask}
            task={deletingTask}
            isLoading={deletingTaskLoading}
          />

          {/* Modal para modificar probabilidad */}
          <Dialog open={showProbabilityModal} onOpenChange={setShowProbabilityModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Modificar Probabilidad</DialogTitle>
                <DialogDescription>
                  Actualiza la probabilidad de éxito de esta oportunidad (0-100%).
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probabilidad (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={newProbability}
                      onChange={(e) => setNewProbability(e.target.value)}
                      placeholder="Ingresa la probabilidad (0-100)"
                      disabled={updatingProbability}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowProbabilityModal(false)}
                  disabled={updatingProbability}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateProbability}
                  disabled={updatingProbability}
                >
                  {updatingProbability ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal para desasignar */}
          <Dialog open={showUnassignModal} onOpenChange={setShowUnassignModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Desasignar Empleado</DialogTitle>
                <DialogDescription>
                  Selecciona el tipo de empleado que deseas desasignar y el empleado a desasignar.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unassignType">Tipo de Empleado</Label>
                    <Select value={unassignType} onValueChange={(value) => setUnassignType(value as 'salesAgent' | 'collaborator' | 'all')}>
                      <SelectTrigger id="unassignType">
                        <SelectValue placeholder="Selecciona el tipo de empleado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salesAgent">Vendedor</SelectItem>
                        <SelectItem value="collaborator">Colaborador</SelectItem>
                        <SelectItem value="all">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {unassignType === 'salesAgent' && (
                    <div className="mt-4 p-3 border rounded-md bg-muted/20">
                      <div className="space-y-2">
                        <Label htmlFor="selectedCollaboratorToUnassign">Empleado</Label>
                        <Select value={selectedCollaboratorToUnassign} onValueChange={setSelectedCollaboratorToUnassign}>
                          <SelectTrigger id="selectedCollaboratorToUnassign">
                            <SelectValue placeholder="Selecciona un empleado" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem key={employee._id} value={employee._id}>
                                {employee.firstName} {employee.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUnassignModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    setUnassigning(true);
                    // Implementa la lógica para desasignar el empleado
                  }}
                  disabled={!selectedCollaboratorToUnassign || unassigning}
                >
                  {unassigning ? 'Desasignando...' : 'Desasignar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
} 