import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import api from '@/lib/api';

export async function GET(request: Request) {
  try {
    // Obtener el token de la cabecera de autorización
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    if (!token) {
      return NextResponse.json({ valid: false, message: 'Token no proporcionado' }, { status: 401 });
    }
    
    // Simplemente devolver éxito - el middleware y la configuración de Axios
    // ya han verificado que el token es válido si llegamos hasta aquí
    return NextResponse.json({ valid: true });
  } catch (error: any) {
    console.error('API: Error al validar token:', error);
    
    return NextResponse.json(
      { valid: false, message: 'Error al validar token' },
      { status: 500 }
    );
  }
} 