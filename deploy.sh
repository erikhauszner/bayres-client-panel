#!/bin/bash

# Script para construir y desplegar la aplicación Next.js con Docker

# Configuración de variables de entorno
export NEXT_PUBLIC_API_URL=http://api.bayreshub.com

# Construir la imagen Docker
echo "Construyendo la imagen Docker..."
docker-compose build

# Iniciar los contenedores
echo "Iniciando los contenedores..."
docker-compose up -d

echo "Despliegue completado. La aplicación está disponible en http://panel.bayreshub.com" 