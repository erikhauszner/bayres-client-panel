import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";

/**
 * Hook personalizado para verificar si el usuario tiene un permiso específico
 * @param permission El permiso a verificar en formato 'module:action'
 * @returns Un booleano que indica si el usuario tiene el permiso
 */
export function useHasPermission(permission: string): boolean | undefined {
  const { employee, loading } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const checkPermission = () => {
      console.log(`🔐 useHasPermission(${permission}) - Estado:`, {
        loading,
        hasEmployee: !!employee,
        employeeRole: employee?.role,
        employeePermissions: employee?.permissions?.length || 0
      });

      // Si aún está cargando, mantener undefined
      if (loading) {
        console.log(`🔐 ${permission}: Loading = true, manteniendo undefined`);
        setHasPermission(undefined);
        return;
      }

      // Si no hay empleado después de cargar, definitivamente no tiene permisos
      if (!employee) {
        console.log(`🔐 ${permission}: No employee, estableciendo false`);
        setHasPermission(false);
        return;
      }

      const permissions = employee.permissions || [];
      const isAdmin = employee.role === 'admin';
      
      // Si el usuario es admin, tiene todos los permisos
      if (isAdmin) {
        console.log(`🔐 ${permission}: Usuario es admin, estableciendo true`);
        setHasPermission(true);
        return;
      }

      // Verificar si el usuario tiene el permiso específico
      const hasSpecificPermission = permissions.includes(permission);
      
      // Verificar si el usuario tiene el permiso de gestión del módulo
      const [module] = permission.split(':');
      const hasManagePermission = permissions.includes(`${module}:manage`);
      
      const finalPermission = hasSpecificPermission || hasManagePermission;
      console.log(`🔐 ${permission}: Verificación completa`, {
        hasSpecificPermission,
        hasManagePermission,
        finalPermission
      });
      
      setHasPermission(finalPermission);
    };

    checkPermission();
  }, [employee, permission, loading]);

  return hasPermission;
}

export default useHasPermission; 