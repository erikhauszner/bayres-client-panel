"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  User,
  Users,
  FileText,
  Settings,
  BarChart3,
  Search,
  Star,
  ClipboardList,
  Shield,
  Mail,
  Calendar,
  ScrollText,
  Plus,
  Trash,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AvatarImage } from "@radix-ui/react-avatar"

// Contexto para useSearchParams
import { createContext, useContext } from "react";
const SearchParamsContext = createContext<ReturnType<typeof useSearchParams> | null>(null);

// Componente para usar useSearchParams con Suspense
function SearchParamsProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  return (
    <SearchParamsContext.Provider value={searchParams}>
      {children}
    </SearchParamsContext.Provider>
  );
}

// Hook personalizado para usar searchParams
function useSearchParamsContext() {
  const context = useContext(SearchParamsContext);
  if (context === null) {
    throw new Error("useSearchParamsContext debe ser usado dentro de SearchParamsProvider");
  }
  return context;
}

// Interfaz para las props del componente DocContent
interface DocContentProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
  router: ReturnType<typeof useRouter>;
}

export default function Documentation() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeSection, setActiveSection] = useState("introduction")
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        <Suspense fallback={
          <main className="netflix-scrollbar w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Documentación</h1>
            </div>
            <div className="flex justify-center mt-8">
              <p className="text-muted-foreground">Cargando contenido...</p>
            </div>
          </main>
        }>
          <SearchParamsProvider>
            <DocContent
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              router={router}
            />
          </SearchParamsProvider>
        </Suspense>
      </div>
    </div>
  )
}

// Componente que usa searchParams
function DocContent({
  searchTerm,
  setSearchTerm,
  activeSection,
  setActiveSection,
  router
}: DocContentProps) {
  const searchParams = useSearchParamsContext();
  
  // Lista de secciones para el índice
  const sections = [
    { id: "introduction", label: "Introducción", icon: <BookOpen className="h-4 w-4" /> },
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "leads", label: "Gestión de Leads", icon: <Star className="h-4 w-4" /> },
    { id: "clients", label: "Gestión de Clientes", icon: <Users className="h-4 w-4" /> },
    { id: "projects", label: "Proyectos", icon: <ClipboardList className="h-4 w-4" /> },
    { id: "users", label: "Usuarios", icon: <User className="h-4 w-4" /> },
    { id: "roles", label: "Roles y Permisos", icon: <Shield className="h-4 w-4" /> },
    { id: "communications", label: "Comunicaciones", icon: <Mail className="h-4 w-4" /> },
    { id: "calendar", label: "Calendario", icon: <Calendar className="h-4 w-4" /> },
    { id: "reports", label: "Informes", icon: <FileText className="h-4 w-4" /> },
    { id: "settings", label: "Configuraciones", icon: <Settings className="h-4 w-4" /> },
  ]

  // Filtrar secciones por búsqueda
  const filteredSections = sections.filter(section => 
    section.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Establecer la sección activa basada en el parámetro de búsqueda
  useEffect(() => {
    const section = searchParams.get("section") || "introduction";
    if (section) {
      setActiveSection(section)
      
      // Scroll a la sección correspondiente
      const sectionElement = document.getElementById(section)
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [searchParams])

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    
    // Actualizar la URL sin recargar la página
    const url = new URL(window.location.href)
    url.searchParams.set("section", sectionId)
    window.history.pushState({}, "", url.toString())
    
    // Scroll al elemento
    const sectionElement = document.getElementById(sectionId)
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <main className="netflix-scrollbar w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-8 pb-16">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Documentación</h1>
        </div>

        {/* Barra de búsqueda */}
        <div className="w-full max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar en la documentación..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Botón de acceso a la API */}
        <div className="flex justify-center mb-4">
          <Button variant="default" className="flex items-center gap-2" onClick={() => router.push("/docs/api")}>
            <FileText className="h-4 w-4" />
            <span>Documentación de la API</span>
          </Button>
        </div>

        {/* Navegación en formato horizontal para escritorio */}
        <div className="hidden md:block">
          <div className="overflow-x-auto pb-1">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {filteredSections.map(section => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "outline"}
                  className="flex flex-col h-auto py-3 px-2 items-center justify-center text-center"
                  onClick={() => scrollToSection(section.id)}
                >
                  <span className="mb-2">{section.icon}</span>
                  <span className="text-xs">{section.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Barra de navegación móvil */}
        <div className="md:hidden">
          <div className="overflow-x-auto pb-1">
            <div className="flex space-x-2 min-w-max">
              {filteredSections.map(section => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "outline"}
                  className="flex flex-col h-auto py-2 px-3 items-center justify-center text-center whitespace-nowrap"
                  onClick={() => scrollToSection(section.id)}
                >
                  <span className="mb-1">{section.icon}</span>
                  <span className="text-xs">{section.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sección de Introducción */}
        <section id="introduction" className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Introducción</h2>
          <p>
            Bienvenido a la documentación de Bayres CRM, una plataforma integral para la gestión de relaciones con clientes diseñada específicamente para empresas de servicios profesionales.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Acerca de Bayres CRM</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Bayres CRM es una solución completa para gestionar leads, clientes, proyectos y comunicaciones en un solo lugar. Diseñado con una interfaz moderna e intuitiva, facilita la organización, seguimiento y análisis de toda la información relacionada con tus clientes y prospectos.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Características Principales</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Gestión de leads y seguimiento del ciclo de ventas</li>
                  <li>Administración de clientes y sus proyectos</li>
                  <li>Control de usuarios con sistema de roles y permisos</li>
                  <li>Herramientas de comunicación integradas</li>
                  <li>Informes detallados y dashboard personalizado</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sección de Dashboard */}
        <section id="dashboard" className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p>
            El dashboard es la pantalla principal que muestra un resumen visual del estado actual de tu negocio. Proporciona métricas clave, indicadores de rendimiento y accesos rápidos a las secciones más utilizadas.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Componentes del Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Métricas de Leads</h3>
                  <p>Visualiza el número de leads nuevos, leads en proceso y tasa de conversión.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Proyectos Activos</h3>
                  <p>Consulta el estado de los proyectos en curso, fechas límite próximas y asignaciones.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Calendario de Actividades</h3>
                  <p>Vista rápida de reuniones, seguimientos y tareas programadas.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Rendimiento de Ventas</h3>
                  <p>Gráficos y estadísticas sobre el rendimiento de ventas, conversiones y proyecciones.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sección de Leads - Detallada */}
        <section id="leads" className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Leads</h2>
          <p>
            El módulo de gestión de leads permite capturar, organizar y hacer seguimiento de los prospectos de clientes a lo largo de todo el proceso de ventas, desde el primer contacto hasta la conversión a cliente.
          </p>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              <TabsTrigger value="create">Crear Leads</TabsTrigger>
              <TabsTrigger value="edit">Editar Leads</TabsTrigger>
              <TabsTrigger value="interact">Interacciones</TabsTrigger>
              <TabsTrigger value="tasks">Tareas</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Panel de Leads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    El panel de leads ofrece una vista completa de todos tus prospectos con herramientas de filtrado y búsqueda para localizar rápidamente la información que necesitas.
                  </p>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Características principales:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Vista de tarjetas resumen con métricas clave</li>
                      <li>Tabla de leads con filtros por estado, prioridad y origen</li>
                      <li>Búsqueda por nombre, email o empresa</li>
                      <li>Selección múltiple para acciones masivas</li>
                      <li>Menú contextual con acciones rápidas</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Estados de leads:</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-100 text-blue-800 border border-blue-300">Nuevo</Badge>
                      <Badge className="bg-purple-100 text-purple-800 border border-purple-300">En Proceso</Badge>
                      <Badge className="bg-orange-100 text-orange-800 border border-orange-300">Contactado</Badge>
                      <Badge className="bg-green-100 text-green-800 border border-green-300">Calificado</Badge>
                      <Badge className="bg-red-100 text-red-800 border border-red-300">No Calificado</Badge>
                    </div>
                    <p>
                      Los estados permiten hacer un seguimiento visual del progreso de cada lead en el proceso de ventas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="create" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Nuevos Leads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Puedes crear nuevos leads de forma manual o mediante importación de datos. Cada lead requiere información básica como nombre, email y origen.
                  </p>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Información requerida:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Nombre y apellido:</strong> Datos personales del contacto</li>
                      <li><strong>Email:</strong> Dirección de correo electrónico (debe ser única)</li>
                      <li><strong>Origen:</strong> Origen de captación del lead (sitio web, referido, redes sociales, etc.)</li>
                      <li><strong>Estado:</strong> Estado inicial del lead (nuevo por defecto)</li>
                      <li><strong>Etapa actual:</strong> Etapa en el embudo de ventas</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Información adicional:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Teléfono:</strong> Número de contacto</li>
                      <li><strong>Empresa:</strong> Organización a la que representa</li>
                      <li><strong>Cargo:</strong> Posición en la empresa</li>
                      <li><strong>Prioridad:</strong> Nivel de importancia (alta, media, baja)</li>
                      <li><strong>Notas:</strong> Información adicional relevante</li>
                    </ul>
                  </div>
                  <p>
                    Para crear un lead, haz clic en el botón "+ Nuevo Lead" en el panel de leads y completa el formulario con la información disponible.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="edit" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Editar y Actualizar Leads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Puedes editar toda la información de un lead en cualquier momento para mantenerla actualizada o corregir datos.
                  </p>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Acceder a la edición:</h3>
                    <ol className="list-decimal pl-6 space-y-1">
                      <li>Desde el panel de leads, haz clic en el botón "Editar" en el menú de acciones del lead.</li>
                      <li>Desde el perfil del lead, utiliza el botón "Editar" en la parte superior.</li>
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Formulario de edición:</h3>
                    <p>
                      El formulario de edición está organizado en tres pestañas para mayor claridad:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Información General:</strong> Datos personales, email, teléfono, empresa...</li>
                      <li><strong>Información de Contacto:</strong> Dirección, ciudad, país...</li>
                      <li><strong>Información de Negocio:</strong> Estado, etapa, origen, prioridad, valores estimados...</li>
                    </ul>
                  </div>
                  <p>
                    Después de realizar los cambios necesarios, haz clic en "Guardar Cambios" para actualizar la información del lead.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="interact" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Interacciones con Leads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Las interacciones permiten registrar todas las comunicaciones y puntos de contacto con el lead, creando un historial completo del relacionamiento.
                  </p>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Tipos de interacciones:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Nota:</strong> Comentarios generales o recordatorios</li>
                      <li><strong>Llamada:</strong> Registro de conversaciones telefónicas</li>
                      <li><strong>Reunión:</strong> Encuentros presenciales o virtuales</li>
                      <li><strong>Email:</strong> Comunicaciones por correo electrónico</li>
                      <li><strong>Cambio de estado:</strong> Actualización en el proceso de ventas</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Gestión de interacciones:</h3>
                    <p>
                      Para cada interacción puedes:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Agregar:</strong> Crea una nueva interacción con fecha y descripción</li>
                      <li><strong>Editar:</strong> Actualiza la información de una interacción existente</li>
                      <li><strong>Eliminar:</strong> Borra una interacción del historial</li>
                    </ul>
                  </div>
                  <p>
                    Todas las interacciones se muestran en la pestaña "Actividades" dentro del perfil del lead, organizadas cronológicamente.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tareas Relacionadas a Leads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Las tareas permiten planificar y dar seguimiento a acciones específicas que deben realizarse con respecto a un lead.
                  </p>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Componentes de una tarea:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Título:</strong> Nombre descriptivo de la tarea</li>
                      <li><strong>Descripción:</strong> Detalles sobre lo que debe realizarse</li>
                      <li><strong>Fecha de vencimiento:</strong> Cuándo debe completarse</li>
                      <li><strong>Estado:</strong> Pendiente, En Progreso, Completada o Cancelada</li>
                      <li><strong>Prioridad:</strong> Alta, Media o Baja</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Gestión de tareas:</h3>
                    <p>
                      Desde la pestaña "Tareas" del perfil del lead puedes:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Crear nuevas tareas</li>
                      <li>Editar información de tareas existentes</li>
                      <li>Actualizar el estado de las tareas</li>
                      <li>Eliminar tareas ya no necesarias</li>
                    </ul>
                  </div>
                  <p>
                    Las tareas próximas a vencer aparecerán destacadas en el dashboard para facilitar su seguimiento.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos de Leads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    El sistema permite adjuntar y gestionar documentos relacionados con cada lead, facilitando el acceso a contratos, propuestas, presentaciones y otros archivos relevantes.
                  </p>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Características de documentos:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Subida directa de documentos desde el perfil del lead</li>
                      <li>Organización con nombre, descripción y etiquetas</li>
                      <li>Visualización inmediata de documentos PDF e imágenes</li>
                      <li>Descarga de archivos en cualquier momento</li>
                      <li>Edición de metadatos y eliminación de documentos</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Tipos de archivos soportados:</h3>
                    <p>
                      El sistema admite documentos de múltiples formatos:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Documentos: PDF, Word, Excel, PowerPoint</li>
                      <li>Imágenes: JPG, PNG, GIF</li>
                      <li>Otros: CSV, TXT</li>
                    </ul>
                  </div>
                  <p>
                    Para subir un documento, ve a la pestaña "Documentos" en el perfil del lead y utiliza el botón "Subir Documento".
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Cards adicionales sobre leads */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversión de Lead a Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Cuando un lead avanza hasta el punto de cierre de venta, puedes convertirlo en cliente con un proceso simple:
                </p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Navega al perfil del lead calificado</li>
                  <li>Usa el menú desplegable de acciones</li>
                  <li>Selecciona "Convertir a Cliente"</li>
                  <li>Confirma la acción cuando se te solicite</li>
                </ol>
                <p className="mt-2">
                  El sistema transferirá automáticamente toda la información relevante, historial de interacciones y documentos al nuevo perfil de cliente.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Mejores Prácticas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Mantén la información de contacto actualizada</li>
                  <li>Registra todas las interacciones importantes inmediatamente</li>
                  <li>Asigna tareas con fechas de vencimiento claras</li>
                  <li>Actualiza el estado y etapa regularmente</li>
                  <li>Añade notas detalladas sobre necesidades y objeciones</li>
                  <li>Utiliza etiquetas para categorizar leads por interés o producto</li>
                  <li>Adjunta propuestas y documentos importantes al perfil</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Secciones adicionales con información resumida */}
        <section id="clients" className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Clientes</h2>
          <p>
            El módulo de clientes proporciona herramientas para administrar y mantener relaciones con clientes activos, organizar sus proyectos y garantizar su satisfacción continua.
          </p>
          <Card>
            <CardContent className="p-6">
              <p>
                Los perfiles de cliente contienen toda la información vital, historial de proyectos, datos de facturación, contactos clave y registro de comunicaciones. Puedes visualizar métricas importantes como valor total, proyectos activos y oportunidades de venta adicionales.
              </p>
              <Button className="mt-4" onClick={() => scrollToSection("leads")}>
                Ver más detalles en la documentación completa
              </Button>
            </CardContent>
          </Card>
        </section>

        <section id="projects" className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Proyectos</h2>
          <p>
            La gestión de proyectos permite planificar, ejecutar y monitorear proyectos para tus clientes, con seguimiento de tareas, recursos y plazos.
          </p>
          <Card>
            <CardContent className="p-6">
              <p>
                Cada proyecto está vinculado a un cliente específico y puede contener múltiples tareas, hitos, asignaciones de personal y documentos. El sistema proporciona vistas de calendario, diagramas de Gantt y reportes de progreso para mantener todo bajo control.
              </p>
              <Button className="mt-4" onClick={() => scrollToSection("leads")}>
                Ver más detalles en la documentación completa
              </Button>
            </CardContent>
          </Card>
        </section>

        <section id="users" className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
          <p>
            Administra el acceso de los miembros de tu equipo al sistema CRM, establece roles y supervisa su actividad.
          </p>
          <Card>
            <CardContent className="p-6">
              <p>
                La administración de usuarios permite crear nuevas cuentas, asignar roles específicos, modificar permisos y desactivar cuentas cuando sea necesario. Cada usuario tiene su propio perfil con información de contacto, departamento y función.
              </p>
              <Button className="mt-4" onClick={() => scrollToSection("leads")}>
                Ver más detalles en la documentación completa
              </Button>
            </CardContent>
          </Card>
        </section>

        <section id="roles" className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Roles y Permisos</h2>
          <p>
            Define niveles de acceso y capacidades específicas para diferentes tipos de usuarios en el sistema.
          </p>
          <Card>
            <CardContent className="p-6">
              <p>
                Los roles permiten controlar qué funciones puede utilizar cada usuario, qué datos puede ver y qué acciones puede realizar. El sistema incluye roles predefinidos como Administrador, Vendedor, Gestor de Proyectos y Visor, pero también permite crear roles personalizados.
              </p>
              <Button className="mt-4" onClick={() => scrollToSection("leads")}>
                Ver más detalles en la documentación completa
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Secciones adicionales condensadas */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section id="communications" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Comunicaciones</h2>
            <Card>
              <CardContent className="p-6">
                <p>
                  Herramientas integradas para mantener comunicación efectiva con leads y clientes mediante correos electrónicos, plantillas de mensajería y registro automático de interacciones.
                </p>
                <Button className="mt-4" onClick={() => scrollToSection("leads")}>
                  Ver más detalles
                </Button>
              </CardContent>
            </Card>
          </section>

          <section id="calendar" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Calendario</h2>
            <Card>
              <CardContent className="p-6">
                <p>
                  Vista consolidada de eventos, reuniones, fechas límite de proyectos y seguimientos programados, con sincronización con calendarios externos como Google Calendar o Outlook.
                </p>
                <Button className="mt-4" onClick={() => scrollToSection("leads")}>
                  Ver más detalles
                </Button>
              </CardContent>
            </Card>
          </section>

          <section id="reports" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Informes</h2>
            <Card>
              <CardContent className="p-6">
                <p>
                  Herramientas para generar reportes detallados sobre conversión de ventas, rendimiento de leads, satisfacción de clientes, progreso de proyectos y métricas financieras clave.
                </p>
                <Button className="mt-4" onClick={() => scrollToSection("leads")}>
                  Ver más detalles
                </Button>
              </CardContent>
            </Card>
          </section>

          <section id="settings" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Configuraciones</h2>
            <Card>
              <CardContent className="p-6">
                <p>
                  Opciones para personalizar el sistema según las necesidades de tu empresa, incluyendo ajustes de notificaciones, campos personalizados, integraciones con otras plataformas y apariencia.
                </p>
                <Button className="mt-4" onClick={() => scrollToSection("leads")}>
                  Ver más detalles
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Navegación entre secciones */}
        <div className="mt-12 flex justify-between border-t border-border/10 pt-4">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => {
              const currentIndex = sections.findIndex(s => s.id === activeSection)
              if (currentIndex > 0) {
                scrollToSection(sections[currentIndex - 1].id)
              }
            }}
            disabled={sections.findIndex(s => s.id === activeSection) === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Sección anterior</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => {
              const currentIndex = sections.findIndex(s => s.id === activeSection)
              if (currentIndex < sections.length - 1) {
                scrollToSection(sections[currentIndex + 1].id)
              }
            }}
            disabled={sections.findIndex(s => s.id === activeSection) === sections.length - 1}
          >
            <span>Siguiente sección</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>
  )
} 