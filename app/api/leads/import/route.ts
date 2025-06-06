import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_ENDPOINT = `${API_URL}/api`;

export async function POST(req: NextRequest) {
  try {
    // Obtener el token de la cookie o del encabezado Authorization
    const token = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { message: 'No autorizado. Token no proporcionado.' },
        { status: 401 }
      );
    }
    
    // Obtener los datos del formulario
    const formData = await req.formData();
    
    // Enviar la solicitud al servidor
    const response = await fetch(`${API_ENDPOINT}/leads/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    
    // Obtener los datos de la respuesta
    const data = await response.json();
    
    // Devolver la respuesta
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error en el proxy de importación de leads:', error);
    return NextResponse.json(
      { message: 'Error en el servidor al procesar la importación.' },
      { status: 500 }
    );
  }
} 