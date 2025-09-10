# 🔐 CREDENCIALES DEL SISTEMA - CODECTI PLATFORM

**Fecha de Actualización:** 2025-09-10  
**Estado:** ✅ **COMPLETAMENTE FUNCIONAL**

---

## 🚀 ACCESO AL SISTEMA

### **URLs de Acceso:**
- **Producción:** https://0f9bcaed.codecti-platform.pages.dev
- **Sandbox (Desarrollo):** https://3000-i4am2qf41l47ryie80zbh-6532622b.e2b.dev
- **Login URL:** Ambas URLs → Hacer clic en "Iniciar Sesión"

---

## 👤 USUARIOS DISPONIBLES

### **🔴 ADMINISTRADOR PRINCIPAL**
- **Email:** `admin@codecti.choco.gov.co`
- **Contraseña:** `password123`
- **Rol:** Administrador (admin)
- **Nombre:** Administrador CODECTI
- **Permisos:** Acceso completo a todas las funcionalidades

### **🟡 USUARIOS COLABORADORES**

#### **1. Investigadora 1**
- **Email:** `investigador1@codecti.choco.gov.co`
- **Contraseña:** `password123`
- **Rol:** Colaborador (collaborator)
- **Nombre:** María Elena Rodríguez
- **Especialidad:** Biodiversidad Acuática y Medicina Tradicional

#### **2. Investigador 2**
- **Email:** `investigador2@codecti.choco.gov.co`
- **Contraseña:** `password123`
- **Rol:** Colaborador (collaborator)
- **Nombre:** Carlos Alberto Mosquera
- **Especialidad:** Tecnologías Verdes y Educación Rural

#### **3. Investigadora 3**
- **Email:** `investigador3@codecti.choco.gov.co`
- **Contraseña:** `password123`
- **Rol:** Colaborador (collaborator)
- **Nombre:** Ana Lucía Palacios
- **Especialidad:** Cadenas Productivas Agrícolas

### **🟢 USUARIO DE PRUEBAS**
- **Email:** `test@codecti.test`
- **Contraseña:** `password123`
- **Rol:** Administrador (admin)
- **Nombre:** Test User
- **Uso:** Para pruebas y desarrollo

### **🔵 USUARIO ADICIONAL**
- **Email:** `jfl2@41gu5.com`
- **Contraseña:** `password123`
- **Rol:** Investigador (researcher)
- **Nombre:** Jhony Lopez

---

## 🎯 GUÍA DE USO POR ROL

### **👑 ADMINISTRADOR (admin)**
**Usuarios:** `admin@codecti.choco.gov.co`, `test@codecti.test`

**Acceso completo a:**
- ✅ Dashboard principal
- ✅ Gestión de proyectos (crear, editar, eliminar)
- ✅ Gestión de usuarios
- ✅ Sistema de noticias (crear, editar, publicar)
- ✅ Gestión de eventos
- ✅ Biblioteca de recursos
- ✅ Analytics y reportes completos
- ✅ Gestión de archivos
- ✅ Sistema de publicaciones
- ✅ Indicadores de rendimiento
- ✅ Sistema de notificaciones
- ✅ Configuración del sistema
- ✅ Logs y monitoreo

### **🤝 COLABORADOR (collaborator)**
**Usuarios:** `investigador1@`, `investigador2@`, `investigador3@codecti.choco.gov.co`

**Acceso a:**
- ✅ Dashboard personal
- ✅ Proyectos asignados (ver y editar)
- ✅ Crear nuevos proyectos (pendientes de aprobación)
- ✅ Sistema de noticias (ver)
- ✅ Eventos (ver y registrarse)
- ✅ Biblioteca de recursos (usar)
- ✅ Analytics limitado (sus proyectos)
- ✅ Gestión de archivos (sus archivos)
- ✅ Notificaciones personales

### **🔬 INVESTIGADOR (researcher)**
**Usuario:** `jfl2@41gu5.com`

**Acceso a:**
- ✅ Portal público
- ✅ Proyectos públicos (ver)
- ✅ Noticias públicas
- ✅ Eventos públicos
- ✅ Recursos públicos
- ✅ Formularios de contacto

---

## 🔧 PROCEDIMIENTO DE LOGIN

### **1. Acceder al Sistema**
```
1. Visitar cualquiera de las URLs:
   - https://0f9bcaed.codecti-platform.pages.dev (Producción)
   - https://3000-i4am2qf41l47ryie80zbh-6532622b.e2b.dev (Sandbox)

2. Hacer clic en el botón "Iniciar Sesión" en la parte superior derecha
```

### **2. Introducir Credenciales**
```
Email: [Cualquiera de los emails listados arriba]
Contraseña: password123
```

### **3. Acceder al Dashboard**
```
Una vez autenticado:
- Los administradores verán el dashboard completo
- Los colaboradores verán su área de trabajo personal
- Se generará un token JWT válido por 24 horas
```

---

## 🧪 VALIDACIÓN DE CREDENCIALES

### **Test con cURL (Ejemplo)**
```bash
# Probar login de administrador
curl -X POST https://3000-i4am2qf41l47ryie80zbh-6532622b.e2b.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@codecti.choco.gov.co","password":"password123"}'

# Respuesta esperada:
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@codecti.choco.gov.co",
    "name": "Administrador CODECTI",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Inicio de sesión exitoso"
}
```

### **Usar Token JWT**
```bash
# Usar el token recibido para acceder a endpoints protegidos
curl -H "Authorization: Bearer [TOKEN_JWT]" \
  https://3000-i4am2qf41l47ryie80zbh-6532622b.e2b.dev/api/auth/profile
```

---

## 🔒 INFORMACIÓN TÉCNICA DE SEGURIDAD

### **Algoritmo de Hash:** SHA-256
- Las contraseñas se almacenan hasheadas con SHA-256
- Hash de `password123`: `ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f`

### **JWT Configuration:**
- **Algoritmo:** HS256
- **Validez:** 24 horas
- **Secret:** `codecti-platform-secret-key-change-in-production`
- **Payload incluye:** userId, email, role, iat, exp

### **Base de Datos:**
- **Tipo:** Cloudflare D1 SQLite
- **Tabla:** `users`
- **Campos:** id, email, password_hash, name, role, is_active, created_at

---

## 📋 DATOS DE PROYECTOS DISPONIBLES

### **Proyectos Precargados:**
1. **Biodiversidad Acuática del Chocó** (María Elena Rodríguez)
2. **Desarrollo de Tecnologías Verdes para Minería Sostenible** (Carlos Alberto Mosquera)
3. **Fortalecimiento de Cadenas Productivas Agrícolas** (Ana Lucía Palacios)
4. **Medicina Tradicional y Plantas Medicinales** (María Elena Rodríguez)
5. **Tecnologías de Información para Educación Rural** (Carlos Alberto Mosquera)

---

## 🚨 NOTAS IMPORTANTES

### **⚠️ PRODUCCIÓN:**
- Cambiar el JWT secret antes de producción
- Configurar variables de entorno seguras
- Implementar rotación de contraseñas
- Activar logs de auditoría

### **✅ DESARROLLO:**
- Todas las credenciales son válidas y funcionales
- La base de datos contiene datos de prueba
- El sistema está completamente operativo
- Los tests pasan exitosamente

### **🔄 MANTENIMIENTO:**
- Las contraseñas fueron actualizadas el 2025-09-10
- Sistema de autenticación verificado y funcional
- Todos los roles y permisos configurados correctamente

---

## 🎉 CONFIRMACIÓN DE FUNCIONALIDAD

**✅ ESTADO:** Todas las credenciales han sido verificadas y están funcionando correctamente.

**✅ LOGIN:** El sistema de autenticación está completamente operativo.

**✅ TOKENS:** Los JWT se generan y validan correctamente.

**✅ PERMISOS:** Los roles y permisos funcionan según especificación.

---

**Documento actualizado:** 2025-09-10  
**Verificado por:** Sistema de Testing CODECTI Platform  
**Próxima revisión:** Según necesidades del proyecto