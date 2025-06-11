import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`API: Solicitando estado del empleado ${params.id}...`);
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.error('API: No se encontró token de autenticación');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log(`API: Enviando solicitud a backend: employees/${params.id}/status`);
    const response = await api.get(`employees/${params.id}/status`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(`API: Respuesta recibida para el empleado ${params.id} con estado:`, response.data?.status);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`API: Error al obtener el estado del empleado ${params.id}:`, error);
    
    // Mostrar más detalles del error para depuración
    if (error.response) {
      console.error('API: Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    return NextResponse.json(
      { error: `Error al obtener el estado del empleado ${params.id}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`API: Actualizando estado del empleado ${params.id}`);
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.error('API: No se encontró token de autenticación');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    if (!body.status || !['online', 'offline', 'break'].includes(body.status)) {
      console.error(`API: Estado inválido: ${body.status}`);
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    console.log(`API: Enviando solicitud para actualizar estado a: ${body.status}`);
    const response = await api.put(`employees/${params.id}/status`, 
      { status: body.status },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log(`API: Estado del empleado ${params.id} actualizado a: ${body.status}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`API: Error al actualizar el estado del empleado ${params.id}:`, error);
    
    // Mostrar más detalles del error para depuración
    if (error.response) {
      console.error('API: Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el estado del empleado' },
      { status: 500 }
    );
  }
} 