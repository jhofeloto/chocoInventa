-- CODECTI Platform - Simplified Roles System Migration (Fixed)
-- Reduces complexity from 6 roles to 5 practical roles with clear permissions

-- ============================================================================
-- STEP 1: Update existing roles to match new simplified structure
-- ============================================================================

-- Super Admin (id=1) - only update description and ensure system role
UPDATE roles SET 
  display_name = 'Superadministrador',
  description = 'Control absoluto del sistema, configuraciones críticas y gestión completa',
  is_system_role = TRUE
WHERE id = 1;

-- Admin (id=2) - only update description
UPDATE roles SET 
  display_name = 'Administrador',
  description = 'Gestión operativa diaria: usuarios, contenido, proyectos y eventos',
  is_system_role = TRUE
WHERE id = 2;

-- Merge project_manager into researcher role (rename project_manager to researcher)
UPDATE roles SET 
  name = 'researcher_manager',
  display_name = 'Investigador y Gestor',
  description = 'Investigadores y gestores de proyectos CTeI con acceso a herramientas científicas',
  is_system_role = FALSE
WHERE id = 3;

-- Convert collaborator to community
UPDATE roles SET 
  name = 'community',
  display_name = 'Comunidad',
  description = 'Usuarios registrados de la comunidad con acceso a contenido público y dashboard básico',
  is_system_role = FALSE
WHERE id = 5;

-- Convert guest to public
UPDATE roles SET 
  name = 'public',
  display_name = 'Público',
  description = 'Visitantes sin registro con acceso solo a contenido completamente público',
  is_system_role = FALSE
WHERE id = 6;

-- ============================================================================
-- STEP 2: Remove unused role (old researcher id=4)
-- ============================================================================

-- First, migrate users from old researcher role to new merged role (project_manager id=3)
UPDATE user_roles SET role_id = 3 WHERE role_id = 4;

-- Delete old researcher role permissions and role
DELETE FROM role_permissions WHERE role_id = 4;
DELETE FROM roles WHERE id = 4;

-- ============================================================================
-- STEP 3: Clear and rebuild permissions with simplified structure
-- ============================================================================

-- Clear existing permissions to start fresh
DELETE FROM role_permissions;
DELETE FROM permissions;

-- ============================================================================
-- STEP 4: Create simplified permissions structure
-- ============================================================================

-- ADMIN MODULE PERMISSIONS
INSERT INTO permissions (name, display_name, description, module, action, resource) VALUES
('admin.full_access', 'Acceso Completo Admin', 'Acceso total al panel de administración', 'admin', 'manage', 'all'),
('admin.operational', 'Administración Operativa', 'Gestión diaria sin configuraciones críticas', 'admin', 'manage', 'operational'),
('admin.logs_view', 'Ver Logs Sistema', 'Consultar logs y auditoría del sistema', 'admin', 'read', 'logs'),
('admin.settings', 'Configuraciones Sistema', 'Modificar configuraciones del sistema', 'admin', 'manage', 'settings');

-- USERS MODULE PERMISSIONS  
INSERT INTO permissions (name, display_name, description, module, action, resource) VALUES
('users.full_manage', 'Gestión Completa Usuarios', 'CRUD completo de usuarios y roles', 'users', 'manage', 'all'),
('users.view_all', 'Ver Todos los Usuarios', 'Consultar información de usuarios', 'users', 'read', 'all'),
('users.manage_roles', 'Gestionar Roles Usuario', 'Asignar y modificar roles de usuarios', 'users', 'manage', 'roles');

-- PROJECTS MODULE PERMISSIONS
INSERT INTO permissions (name, display_name, description, module, action, resource) VALUES
('projects.full_manage', 'Gestión Completa Proyectos', 'CRUD completo de todos los proyectos', 'projects', 'manage', 'all'),
('projects.manage_own', 'Gestionar Proyectos Propios', 'CRUD de proyectos propios y colaboraciones', 'projects', 'manage', 'own'),
('projects.view_all', 'Ver Todos los Proyectos', 'Consultar todos los proyectos del sistema', 'projects', 'read', 'all'),
('projects.view_public', 'Ver Proyectos Públicos', 'Solo proyectos marcados como públicos', 'projects', 'read', 'public');

-- CONTENT MODULE PERMISSIONS (news/events)
INSERT INTO permissions (name, display_name, description, module, action, resource) VALUES
('content.full_manage', 'Gestión Completa Contenido', 'CRUD de noticias, eventos y recursos', 'content', 'manage', 'all'),
('content.view_all', 'Ver Todo el Contenido', 'Acceso de lectura a noticias y eventos', 'content', 'read', 'all'),
('content.view_public', 'Ver Contenido Público', 'Solo contenido público', 'content', 'read', 'public');

-- RESOURCES & PUBLICATIONS PERMISSIONS
INSERT INTO permissions (name, display_name, description, module, action, resource) VALUES
('resources.full_manage', 'Gestión Completa Recursos', 'CRUD de recursos y publicaciones', 'resources', 'manage', 'all'),
('resources.manage_own', 'Gestionar Recursos Propios', 'CRUD de recursos propios', 'resources', 'manage', 'own'),
('resources.view_all', 'Ver Todos los Recursos', 'Acceso completo a recursos', 'resources', 'read', 'all'),
('resources.view_public', 'Ver Recursos Públicos', 'Solo recursos públicos', 'resources', 'read', 'public');

-- ANALYTICS & REPORTS PERMISSIONS
INSERT INTO permissions (name, display_name, description, module, action, resource) VALUES
('analytics.full_access', 'Analíticas Completas', 'Acceso total a analíticas y reportes', 'analytics', 'manage', 'all'),
('analytics.operational', 'Analíticas Operativas', 'Reportes operativos y estadísticas', 'analytics', 'read', 'operational'),
('analytics.own_data', 'Analíticas Propias', 'Solo datos propios y colaboraciones', 'analytics', 'read', 'own');

-- FILES & UPLOADS PERMISSIONS
INSERT INTO permissions (name, display_name, description, module, action, resource) VALUES
('files.full_manage', 'Gestión Completa Archivos', 'CRUD completo del sistema de archivos', 'files', 'manage', 'all'),
('files.manage_own', 'Gestionar Archivos Propios', 'Gestión de archivos propios', 'files', 'manage', 'own');

-- NOTIFICATIONS PERMISSIONS
INSERT INTO permissions (name, display_name, description, module, action, resource) VALUES
('notifications.full_manage', 'Gestión Completa Notificaciones', 'Envío masivo y gestión de notificaciones', 'notifications', 'manage', 'all'),
('notifications.manage_own', 'Notificaciones Propias', 'Gestión de notificaciones personales', 'notifications', 'manage', 'own'),
('notifications.receive_basic', 'Recibir Notificaciones', 'Recibir notificaciones básicas', 'notifications', 'read', 'basic');

-- DASHBOARD PERMISSIONS
INSERT INTO permissions (name, display_name, description, module, action, resource) VALUES
('dashboard.full_access', 'Dashboard Completo', 'Acceso total al dashboard administrativo', 'dashboard', 'read', 'all'),
('dashboard.basic_access', 'Dashboard Básico', 'Dashboard básico para usuarios registrados', 'dashboard', 'read', 'basic');

-- ============================================================================
-- STEP 5: Assign permissions to simplified roles
-- ============================================================================

-- SUPERADMINISTRATOR (role_id = 1) - ALL PERMISSIONS
INSERT INTO role_permissions (role_id, permission_id, granted) 
SELECT 1, id, TRUE FROM permissions;

-- ADMINISTRATOR (role_id = 2) - OPERATIONAL MANAGEMENT  
INSERT INTO role_permissions (role_id, permission_id, granted) 
SELECT 2, id, TRUE FROM permissions 
WHERE name IN (
  'admin.operational', 'admin.logs_view',
  'users.full_manage', 'users.view_all', 'users.manage_roles',
  'projects.full_manage', 'projects.view_all',
  'content.full_manage', 'content.view_all',
  'resources.full_manage', 'resources.view_all',
  'analytics.operational', 'analytics.full_access',
  'files.full_manage',
  'notifications.full_manage',
  'dashboard.full_access'
);

-- INVESTIGADOR Y GESTOR (role_id = 3) - RESEARCH & PROJECT MANAGEMENT
INSERT INTO role_permissions (role_id, permission_id, granted) 
SELECT 3, id, TRUE FROM permissions 
WHERE name IN (
  'projects.manage_own', 'projects.view_all',
  'content.view_all',
  'resources.manage_own', 'resources.view_all',
  'analytics.own_data',
  'files.manage_own',
  'notifications.manage_own',
  'dashboard.basic_access'
);

-- COMUNIDAD (role_id = 5) - REGISTERED USERS
INSERT INTO role_permissions (role_id, permission_id, granted) 
SELECT 5, id, TRUE FROM permissions 
WHERE name IN (
  'projects.view_public',
  'content.view_public',
  'resources.view_public',
  'notifications.receive_basic',
  'dashboard.basic_access'
);

-- PÚBLICO (role_id = 6) - PUBLIC ACCESS (minimal permissions)
INSERT INTO role_permissions (role_id, permission_id, granted) 
SELECT 6, id, TRUE FROM permissions 
WHERE name IN (
  'projects.view_public',
  'content.view_public',
  'resources.view_public'
);

-- ============================================================================
-- Final role structure summary:
-- 1. super_admin (Superadministrador) - Full system access
-- 2. admin (Administrador) - Operational management
-- 3. researcher_manager (Investigador y Gestor) - Research and project management  
-- 5. community (Comunidad) - Registered users
-- 6. public (Público) - Public access
-- ============================================================================