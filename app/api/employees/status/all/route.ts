import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Solicitando estado de todos los empleados...');
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.error('API: No se encontró token de autenticación');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('API: Enviando solicitud a backend: employees/status/all');
    const response = await api.get('employees/status/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(`API: Respuesta recibida con ${response.data.length} empleados`);
    
    // Imprimir algunos datos para depuración
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((emp: any, index: number) => {
        if (index < 3) { // Solo mostrar los primeros 3 para no sobrecargar los logs
          console.log(`API: Empleado #${index+1}: ${emp.firstName} ${emp.lastName}, Estado: ${emp.status}`);
        }
      });
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('API: Error al obtener el estado de los empleados:', error);
    
    // Mostrar más detalles del error para depuración
    if (error.response) {
      console.error('API: Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    return NextResponse.json(
      { error: 'Error al obtener el estado de los empleados' },
      { status: 500 }
    );
  }
} 