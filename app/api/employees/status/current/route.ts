import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { API_URL } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/employees/status/current');
    console.log('API_URL configurada en:', API_URL);
    
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.error('API: No se encontró token de autenticación');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('API: Enviando solicitud a backend: employees/status/current');
    const response = await api.get('employees/status/current', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('API: Respuesta recibida del backend con estado:', response.data?.status);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('API: Error al obtener el estado del empleado actual:', error);
    
    // Mostrar más detalles del error para depuración
    if (error.response) {
      console.error('API: Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('API: No se recibió respuesta:', error.request);
    } else {
      console.error('API: Error al configurar la solicitud:', error.message);
    }
    
    return NextResponse.json(
      { error: 'Error al obtener el estado del empleado' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('API Route: PUT /api/employees/status/current');
    console.log('API_URL configurada en:', API_URL);
    
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
    const response = await api.put('employees/status/current', 
      { status: body.status },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log(`API: Estado del empleado actualizado a: ${body.status}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('API: Error al actualizar el estado del empleado:', error);
    
    // Mostrar más detalles del error para depuración
    if (error.response) {
      console.error('API: Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('API: No se recibió respuesta:', error.request);
    } else {
      console.error('API: Error al configurar la solicitud:', error.message);
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el estado del empleado' },
      { status: 500 }
    );
  }
} 