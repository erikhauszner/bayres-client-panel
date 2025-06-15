import { activityTracker } from './activityTracker';

/**
 * Ejemplos de uso del sistema de rastreo de actividad
 * Estos métodos pueden ser llamados desde cualquier parte de la aplicación
 */

// ===== LEADS =====
export const trackLeadActivity = {
  create: (leadData: any) => {
    activityTracker.logPlatformActivity('lead_create', {
      leadId: leadData.id,
      leadName: leadData.name,
      source: leadData.source,
      timestamp: new Date().toISOString()
    });
  },

  update: (leadId: string, changes: any) => {
    activityTracker.logPlatformActivity('lead_update', {
      leadId,
      changes: Object.keys(changes),
      timestamp: new Date().toISOString()
    });
  },

  assign: (leadId: string, assignedTo: string) => {
    activityTracker.logPlatformActivity('lead_assign', {
      leadId,
      assignedTo,
      timestamp: new Date().toISOString()
    });
  },

  statusChange: (leadId: string, oldStatus: string, newStatus: string) => {
    activityTracker.logPlatformActivity('lead_status_change', {
      leadId,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString()
    });
  },

  convertToOpportunity: (leadId: string, opportunityId: string) => {
    activityTracker.logPlatformActivity('lead_convert_opportunity', {
      leadId,
      opportunityId,
      timestamp: new Date().toISOString()
    });
  }
};

// ===== OPORTUNIDADES =====
export const trackOpportunityActivity = {
  create: (opportunityData: any) => {
    activityTracker.logPlatformActivity('opportunity_create', {
      opportunityId: opportunityData.id,
      title: opportunityData.title,
      value: opportunityData.value,
      timestamp: new Date().toISOString()
    });
  },

  update: (opportunityId: string, changes: any) => {
    activityTracker.logPlatformActivity('opportunity_update', {
      opportunityId,
      changes: Object.keys(changes),
      timestamp: new Date().toISOString()
    });
  },

  stageChange: (opportunityId: string, oldStage: string, newStage: string) => {
    activityTracker.logPlatformActivity('opportunity_stage_change', {
      opportunityId,
      oldStage,
      newStage,
      timestamp: new Date().toISOString()
    });
  },

  close: (opportunityId: string, result: 'won' | 'lost', reason?: string) => {
    activityTracker.logPlatformActivity('opportunity_close', {
      opportunityId,
      result,
      reason,
      timestamp: new Date().toISOString()
    });
  }
};

// ===== CLIENTES =====
export const trackClientActivity = {
  create: (clientData: any) => {
    activityTracker.logPlatformActivity('client_create', {
      clientId: clientData.id,
      clientName: clientData.name,
      timestamp: new Date().toISOString()
    });
  },

  update: (clientId: string, changes: any) => {
    activityTracker.logPlatformActivity('client_update', {
      clientId,
      changes: Object.keys(changes),
      timestamp: new Date().toISOString()
    });
  },

  contact: (clientId: string, contactType: string) => {
    activityTracker.logPlatformActivity('client_contact', {
      clientId,
      contactType,
      timestamp: new Date().toISOString()
    });
  }
};

// ===== TAREAS =====
export const trackTaskActivity = {
  create: (taskData: any) => {
    activityTracker.logPlatformActivity('task_create', {
      taskId: taskData.id,
      title: taskData.title,
      priority: taskData.priority,
      timestamp: new Date().toISOString()
    });
  },

  complete: (taskId: string) => {
    activityTracker.logPlatformActivity('task_complete', {
      taskId,
      timestamp: new Date().toISOString()
    });
  },

  update: (taskId: string, changes: any) => {
    activityTracker.logPlatformActivity('task_update', {
      taskId,
      changes: Object.keys(changes),
      timestamp: new Date().toISOString()
    });
  }
};

// ===== REPORTES Y ANÁLISIS =====
export const trackAnalyticsActivity = {
  viewReport: (reportType: string, filters?: any) => {
    activityTracker.logPlatformActivity('report_view', {
      reportType,
      filters,
      timestamp: new Date().toISOString()
    });
  },

  exportData: (dataType: string, format: string, recordCount: number) => {
    activityTracker.logPlatformActivity('data_export', {
      dataType,
      format,
      recordCount,
      timestamp: new Date().toISOString()
    });
  },

  searchPerformed: (searchTerm: string, resultCount: number, section: string) => {
    activityTracker.logPlatformActivity('search_performed', {
      searchTerm,
      resultCount,
      section,
      timestamp: new Date().toISOString()
    });
  }
};

// ===== CONFIGURACIÓN Y ADMINISTRACIÓN =====
export const trackAdminActivity = {
  userManagement: (action: string, targetUserId: string) => {
    activityTracker.logPlatformActivity('user_management', {
      action,
      targetUserId,
      timestamp: new Date().toISOString()
    });
  },

  permissionChange: (targetUserId: string, permissions: string[]) => {
    activityTracker.logPlatformActivity('permission_change', {
      targetUserId,
      permissions,
      timestamp: new Date().toISOString()
    });
  },

  systemConfig: (configType: string, changes: any) => {
    activityTracker.logPlatformActivity('system_config', {
      configType,
      changes: Object.keys(changes),
      timestamp: new Date().toISOString()
    });
  }
};

// ===== FUNCIÓN GENÉRICA =====
export const trackCustomActivity = (action: string, details: any = {}) => {
  activityTracker.logPlatformActivity(action, {
    ...details,
    timestamp: new Date().toISOString()
  });
};

// ===== EJEMPLO DE USO =====
/*
// En un componente de React:
import { trackLeadActivity } from '@/lib/services/activityExamples';

const handleCreateLead = async (leadData) => {
  try {
    const newLead = await createLead(leadData);
    
    // Registrar la actividad
    trackLeadActivity.create(newLead);
    
    toast.success('Lead creado exitosamente');
  } catch (error) {
    toast.error('Error al crear lead');
  }
};

// En un hook personalizado:
const { logActivity } = useActivityTracker();

const handleCustomAction = () => {
  logActivity('custom_action', {
    customField: 'value',
    timestamp: new Date().toISOString()
  });
};
*/ 