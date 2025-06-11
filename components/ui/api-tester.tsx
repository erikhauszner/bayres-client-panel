"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from '@/lib/config';
import axios from 'axios';

export function ApiTester() {
  const [url, setUrl] = useState<string>('employees/status/current');
  const [method, setMethod] = useState<string>('GET');
  const [payload, setPayload] = useState<string>('{"status": "online"}');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const makeRequest = async () => {
    setLoading(true);
    setResponse('');
    setError('');

    try {
      console.log(`Realizando solicitud ${method} a: ${url}`);
      console.log(`URL base configurada: ${API_URL}`);
      console.log(`URL completa: ${API_URL}/${url}`);
      
      let result;
      
      // Crear cliente axios temporal para esta solicitud
      const client = axios.create({
        baseURL: API_URL,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      switch (method) {
        case 'GET':
          result = await client.get(url);
          break;
        case 'POST':
          result = await client.post(url, JSON.parse(payload));
          break;
        case 'PUT':
          result = await client.put(url, JSON.parse(payload));
          break;
        case 'DELETE':
          result = await client.delete(url);
          break;
        default:
          setError('Método HTTP no soportado');
          return;
      }
      
      setResponse(JSON.stringify(result.data, null, 2));
    } catch (err: any) {
      console.error('Error en la solicitud:', err);
      setError(`Error: ${err.message}\n${err.response ? JSON.stringify(err.response.data, null, 2) : ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>API Tester</CardTitle>
        <CardDescription>Herramienta para depurar las rutas de API</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-1/3">
              <label className="text-sm font-medium mb-1 block">Método</label>
              <select 
                className="w-full p-2 border rounded" 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="w-2/3">
              <label className="text-sm font-medium mb-1 block">URL (sin prefijo)</label>
              <Input
                type="text"
                placeholder="employees/status/current"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
          
          {(method === 'POST' || method === 'PUT') && (
            <div>
              <label className="text-sm font-medium mb-1 block">Payload (JSON)</label>
              <Textarea
                placeholder='{"key": "value"}'
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={4}
              />
            </div>
          )}
          
          <Button onClick={makeRequest} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </Button>
          
          <div>
            <div className="text-sm font-medium mb-1 block">URL completa:</div>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
              {API_URL}/{url}
            </div>
          </div>
          
          <Tabs defaultValue="response">
            <TabsList>
              <TabsTrigger value="response">Respuesta</TabsTrigger>
              <TabsTrigger value="error">Error</TabsTrigger>
            </TabsList>
            <TabsContent value="response">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded min-h-[200px] font-mono text-sm whitespace-pre overflow-auto">
                {response || 'No hay respuesta aún'}
              </div>
            </TabsContent>
            <TabsContent value="error">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded min-h-[200px] font-mono text-sm whitespace-pre overflow-auto text-red-500">
                {error || 'No hay errores'}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          API URL Base: {API_URL}
        </div>
      </CardFooter>
    </Card>
  );
}