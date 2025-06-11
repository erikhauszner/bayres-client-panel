import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    // Extraer el path para determinar si se solicita todos los estados o uno específico
    const path = req.nextUrl.pathname;
    let apiPath = '';

    if (path.endsWith('/all')) {
      // Solicitud para todos los empleados
      apiPath = '/employees/status/all';
    } else {
      // Si no es 'all', asumimos que es una solicitud individual y mantenemos la URL original
      apiPath = path.replace('/api', '');
    }

    // Realizar la solicitud al backend
    const response = await api.get(apiPath);

    // Devolver la respuesta del backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error al obtener el estado de los empleados:', error);
    
    // Determinar el código de estado apropiado
    const status = error.response?.status || 500;
    
    return NextResponse.json(
      { message: 'Error al obtener el estado de los empleados', error: error.message },
      { status }
    );
  }
} 