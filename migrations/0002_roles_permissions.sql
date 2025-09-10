-- CODECTI Platform - Roles and Permissions System
-- This migration adds comprehensive role-based access control

-- Roles table - Define system roles
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table - Define granular permissions
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    module TEXT NOT NULL, -- e.g., 'projects', 'users', 'admin', 'reports'
    action TEXT NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'manage'
    resource TEXT, -- e.g., 'all', 'own', 'assigned'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

-- User-Role mapping table (users can have multiple roles)
CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_by INTEGER,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

-- System logs table for audit trail
CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    additional_data TEXT, -- JSON string for extra context
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default system roles
INSERT OR IGNORE INTO roles (name, display_name, description, is_system_role) VALUES
('super_admin', 'Super Administrador', 'Acceso completo al sistema', TRUE),
('admin', 'Administrador', 'Administrador del sistema con acceso casi completo', TRUE),
('project_manager', 'Gestor de Proyectos', 'Gestión completa de proyectos CTeI', FALSE),
('researcher', 'Investigador', 'Acceso a proyectos asignados y recursos', FALSE),
('collaborator', 'Colaborador', 'Acceso básico de solo lectura', FALSE),
('guest', 'Invitado', 'Acceso muy limitado al portal público', FALSE);

-- Insert comprehensive permissions
INSERT OR IGNORE INTO permissions (name, display_name, description, module, action, resource) VALUES
-- Dashboard permissions
('dashboard.view', 'Ver Dashboard', 'Acceso al dashboard principal', 'dashboard', 'read', 'all'),
('dashboard.manage', 'Gestionar Dashboard', 'Administrar configuración del dashboard', 'dashboard', 'manage', 'all'),

-- Project permissions
('projects.view_all', 'Ver Todos los Proyectos', 'Ver todos los proyectos del sistema', 'projects', 'read', 'all'),
('projects.view_own', 'Ver Proyectos Propios', 'Ver solo proyectos propios', 'projects', 'read', 'own'),
('projects.create', 'Crear Proyectos', 'Crear nuevos proyectos', 'projects', 'create', 'all'),
('projects.edit_all', 'Editar Todos los Proyectos', 'Editar cualquier proyecto', 'projects', 'update', 'all'),
('projects.edit_own', 'Editar Proyectos Propios', 'Editar solo proyectos propios', 'projects', 'update', 'own'),
('projects.delete_all', 'Eliminar Todos los Proyectos', 'Eliminar cualquier proyecto', 'projects', 'delete', 'all'),
('projects.delete_own', 'Eliminar Proyectos Propios', 'Eliminar solo proyectos propios', 'projects', 'delete', 'own'),
('projects.manage', 'Gestión Completa de Proyectos', 'Administración total de proyectos', 'projects', 'manage', 'all'),

-- User management permissions
('users.view', 'Ver Usuarios', 'Ver lista de usuarios del sistema', 'users', 'read', 'all'),
('users.create', 'Crear Usuarios', 'Crear nuevos usuarios', 'users', 'create', 'all'),
('users.edit', 'Editar Usuarios', 'Modificar información de usuarios', 'users', 'update', 'all'),
('users.delete', 'Eliminar Usuarios', 'Eliminar usuarios del sistema', 'users', 'delete', 'all'),
('users.manage_roles', 'Gestionar Roles de Usuario', 'Asignar y modificar roles', 'users', 'manage', 'roles'),

-- Role and permission management
('roles.view', 'Ver Roles', 'Ver roles del sistema', 'roles', 'read', 'all'),
('roles.create', 'Crear Roles', 'Crear nuevos roles', 'roles', 'create', 'all'),
('roles.edit', 'Editar Roles', 'Modificar roles existentes', 'roles', 'update', 'all'),
('roles.delete', 'Eliminar Roles', 'Eliminar roles no sistema', 'roles', 'delete', 'all'),
('permissions.manage', 'Gestionar Permisos', 'Administrar permisos del sistema', 'permissions', 'manage', 'all'),

-- Admin panel permissions
('admin.panel', 'Acceso Panel Admin', 'Acceso al panel de administración', 'admin', 'read', 'all'),
('admin.system_settings', 'Configuración del Sistema', 'Modificar configuraciones del sistema', 'admin', 'manage', 'settings'),
('admin.logs', 'Ver Logs del Sistema', 'Acceso a logs y auditoria', 'admin', 'read', 'logs'),
('admin.maintenance', 'Modo Mantenimiento', 'Activar/desactivar modo mantenimiento', 'admin', 'manage', 'maintenance'),

-- Reports and analytics permissions
('reports.view', 'Ver Reportes', 'Acceso a reportes del sistema', 'reports', 'read', 'all'),
('reports.export', 'Exportar Reportes', 'Exportar reportes en diferentes formatos', 'reports', 'export', 'all'),
('reports.create', 'Crear Reportes', 'Crear reportes personalizados', 'reports', 'create', 'all'),

-- News management permissions
('news.view', 'Ver Noticias', 'Ver noticias del sistema', 'news', 'read', 'all'),
('news.create', 'Crear Noticias', 'Crear nuevas noticias', 'news', 'create', 'all'),
('news.edit', 'Editar Noticias', 'Modificar noticias existentes', 'news', 'update', 'all'),
('news.delete', 'Eliminar Noticias', 'Eliminar noticias', 'news', 'delete', 'all'),
('news.publish', 'Publicar Noticias', 'Publicar y despublicar noticias', 'news', 'manage', 'publication'),

-- Events management permissions
('events.view', 'Ver Eventos', 'Ver eventos del sistema', 'events', 'read', 'all'),
('events.create', 'Crear Eventos', 'Crear nuevos eventos', 'events', 'create', 'all'),
('events.edit', 'Editar Eventos', 'Modificar eventos existentes', 'events', 'update', 'all'),
('events.delete', 'Eliminar Eventos', 'Eliminar eventos', 'events', 'delete', 'all'),
('events.manage_registration', 'Gestionar Inscripciones', 'Administrar inscripciones a eventos', 'events', 'manage', 'registration');

-- Assign permissions to super_admin role (full access)
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'super_admin';

-- Assign permissions to admin role (almost full access, excluding some critical operations)
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin' 
AND p.name NOT IN ('roles.delete', 'users.delete', 'admin.maintenance');

-- Assign permissions to project_manager role
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'project_manager' 
AND p.module IN ('dashboard', 'projects', 'reports', 'news', 'events')
AND p.name NOT IN ('projects.delete_all', 'news.delete', 'events.delete');

-- Assign permissions to researcher role
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'researcher' 
AND (p.name LIKE '%view%' OR p.name LIKE '%own%' OR p.name = 'dashboard.view');

-- Assign permissions to collaborator role
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'collaborator' 
AND p.action = 'read'
AND p.module IN ('dashboard', 'projects', 'news', 'events');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_module ON system_logs(module);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);