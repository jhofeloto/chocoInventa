# Plataforma CTeI CODECTI - MVP

## Descripción del Proyecto

La **Plataforma CTeI CODECTI** es un sistema de información centralizado para la gestión de proyectos de Ciencia, Tecnología e Innovación del departamento del Chocó. Este MVP permite a los actores del ecosistema CTeI registrar y consultar proyectos y documentos clave en un único lugar.

## URLs del Proyecto

- **Desarrollo**: https://3000-i4am2qf41l47ryie80zbh-6532622b.e2b.dev
- **GitHub**: (Disponible para configurar)
- **Producción**: (Pendiente de despliegue)

## Funcionalidades Implementadas

### ✅ Historias de Usuario Completadas

#### **HU-01: Autenticación de Usuario**
- Sistema de inicio de sesión seguro con JWT
- Validación de credenciales
- Manejo de sesiones con tokens seguros
- Middleware de autenticación para rutas protegidas

#### **HU-02: Creación de Proyectos**
- Formulario completo para registro de nuevos proyectos
- Campos requeridos: título, responsable, resumen, estado
- Validación de datos del lado servidor
- Interfaz modal intuitiva

#### **HU-03: Carga de Documentos**
- Sistema de carga de archivos (PDF, DOCX)
- Validación de tipos y tamaños de archivo
- Drag & drop interface
- Almacenamiento seguro (R2 en producción, mock en desarrollo)

#### **HU-04: Listado y Búsqueda**
- Vista completa de todos los proyectos
- Búsqueda en tiempo real por título, responsable o contenido
- Filtrado dinámico
- Paginación de resultados

#### **HU-05: Detalles y Descarga**
- Vista detallada de cada proyecto
- Información completa del proyecto
- Descarga de documentos asociados
- Información de metadatos del archivo

## Arquitectura Técnica

### **Stack Tecnológico**
- **Backend**: Hono Framework + TypeScript
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **Base de Datos**: Cloudflare D1 (SQLite distribuida)
- **Almacenamiento**: Cloudflare R2 (S3-compatible)
- **Despliegue**: Cloudflare Pages/Workers
- **Desarrollo**: Mock Database para entorno local

### **Estructura del Proyecto**
```
webapp/
├── src/
│   ├── index.tsx          # Aplicación principal Hono
│   ├── renderer.tsx       # JSX renderer con estilos
│   ├── routes/
│   │   ├── auth.ts        # Rutas de autenticación
│   │   └── projects.ts    # Rutas de proyectos y documentos
│   ├── types/
│   │   └── index.ts       # Definiciones TypeScript
│   └── utils/
│       ├── auth.ts        # Utilidades JWT y hashing
│       ├── files.ts       # Manejo de archivos
│       ├── middleware.ts  # Middleware de autenticación
│       └── mockDb.ts      # Base de datos mock para desarrollo
├── public/static/
│   ├── app.js            # JavaScript frontend
│   └── styles.css        # Estilos CSS personalizados
├── migrations/
│   └── 0001_initial_schema.sql  # Esquema de base de datos
├── ecosystem.config.cjs   # Configuración PM2
├── wrangler.jsonc        # Configuración Cloudflare
└── seed.sql             # Datos de prueba
```

## Modelos de Datos

### **Usuario**
```typescript
{
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'collaborator';
  created_at: string;
  is_active: boolean;
}
```

### **Proyecto**
```typescript
{
  id: number;
  title: string;
  responsible_person: string;
  summary: string;
  status: 'active' | 'completed';
  document_filename?: string;
  document_url?: string;
  document_size?: number;
  document_type?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}
```

## Usuarios de Prueba

### **Administrador**
- **Email**: `admin@codecti.choco.gov.co`
- **Contraseña**: `password123`
- **Rol**: Administrador (puede gestionar todo)

### **Colaboradores**
- **Email**: `investigador1@codecti.choco.gov.co`
- **Contraseña**: `password123`
- **Rol**: Colaborador (puede crear y gestionar proyectos)

- **Email**: `investigador2@codecti.choco.gov.co`
- **Contraseña**: `password123`
- **Rol**: Colaborador

## Guía de Uso

### **1. Inicio de Sesión**
1. Acceder a la URL de la aplicación
2. Ingresar email y contraseña de prueba
3. Hacer clic en "Iniciar Sesión"

### **2. Navegación del Dashboard**
- Ver lista completa de proyectos existentes
- Usar la barra de búsqueda para filtrar proyectos
- Hacer clic en cualquier proyecto para ver detalles

### **3. Crear Nuevo Proyecto**
1. Hacer clic en "Nuevo Proyecto"
2. Llenar todos los campos requeridos
3. Seleccionar estado (Activo/Finalizado)
4. Guardar proyecto

### **4. Gestión de Documentos**
1. Acceder a los detalles de un proyecto
2. Hacer clic en "Subir Documento" (solo propietarios/admin)
3. Arrastrar archivo o seleccionar desde el sistema
4. Confirmar carga
5. Descargar documentos desde la vista de detalles

## Endpoints API

### **Autenticación**
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Cerrar sesión

### **Proyectos**
- `GET /api/projects` - Listar proyectos (con búsqueda)
- `GET /api/projects/:id` - Obtener proyecto específico
- `POST /api/projects` - Crear nuevo proyecto
- `POST /api/projects/:id/upload` - Subir documento
- `GET /api/projects/:id/download` - Descargar documento

## Desarrollo Local

### **Requisitos**
- Node.js 18+
- npm
- Wrangler CLI

### **Instalación y Ejecución**
```bash
# Clonar repositorio
git clone <repository-url>
cd webapp

# Instalar dependencias
npm install

# Construir proyecto
npm run build

# Iniciar servidor de desarrollo
npm run dev:sandbox
# o con PM2
pm2 start ecosystem.config.cjs

# Limpiar puerto si es necesario
npm run clean-port
```

### **Scripts Disponibles**
- `npm run dev` - Servidor de desarrollo Vite
- `npm run dev:sandbox` - Servidor Wrangler para sandbox
- `npm run build` - Construir para producción
- `npm run deploy` - Desplegar a Cloudflare Pages
- `npm test` - Probar conectividad del servidor
- `pm2 logs codecti-platform --nostream` - Ver logs del servidor

## Estado del Despliegue

- **Plataforma**: Cloudflare Pages/Workers
- **Estado**: ✅ Funcionando en desarrollo
- **Base de Datos**: Mock Database (desarrollo) / D1 (producción)
- **Almacenamiento**: Mock Files (desarrollo) / R2 (producción)
- **Última Actualización**: 09/09/2025

## Próximos Pasos

### **Para Producción**
1. Configurar Cloudflare API token
2. Crear base de datos D1 en producción
3. Configurar bucket R2 para documentos
4. Aplicar migraciones a base de datos real
5. Desplegar a Cloudflare Pages

### **Mejoras Futuras (Should-have)**
- Edición y eliminación de proyectos
- Perfiles de usuario personalizados
- Filtros avanzados de búsqueda
- Notificaciones por email
- Dashboard con estadísticas

## Seguridad

- Autenticación JWT con tokens seguros
- Hashing de contraseñas con SHA-256
- Validación de tipos de archivo
- Middleware de autorización por roles
- Protección contra inyección SQL (prepared statements)

## Contacto y Soporte

Para soporte técnico o consultas sobre el proyecto, contactar al equipo de desarrollo de CODECTI.

---

**Versión**: 1.0.0 (MVP)  
**Última actualización**: Septiembre 2025  
**Desarrollado para**: CODECTI - Chocó, Colombia