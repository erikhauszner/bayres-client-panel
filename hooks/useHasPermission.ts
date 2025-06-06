import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";

/**
 * Hook personalizado para verificar si el usuario tiene un permiso específico
 * @param permission El permiso a verificar en formato 'module:action'
 * @returns Un booleano que indica si el usuario tiene el permiso
 */
export function useHasPermission(permission: string): boolean {
  const { employee } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermission = () => {
      if (!employee) {
        setHasPermission(false);
        return;
      }

      const permissions = employee.permissions || [];
      const isAdmin = employee.role === 'admin';
      
      // Si el usuario es admin, tiene todos los permisos
      if (isAdmin) {
        setHasPermission(true);
        return;
      }

      // Verificar si el usuario tiene el permiso específico
      const hasSpecificPermission = permissions.includes(permission);
      
      // Verificar si el usuario tiene el permiso de gestión del módulo
      const [module] = permission.split(':');
      const hasManagePermission = permissions.includes(`${module}:manage`);
      
      setHasPermission(hasSpecificPermission || hasManagePermission);
    };

    checkPermission();
  }, [employee, permission]);

  return hasPermission;
}

export default useHasPermission; 