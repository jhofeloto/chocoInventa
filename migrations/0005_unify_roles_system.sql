-- Migration to unify roles system to 3 consistent roles
-- Replaces the 5-role system with the 3 roles actually used in user management

-- Clear existing roles and permissions to start fresh
DELETE FROM role_permissions;
DELETE FROM user_roles;
DELETE FROM roles;
DELETE FROM permissions;

-- Create the 3 unified roles that match the frontend user management
INSERT INTO roles (id, name, display_name, description, is_system_role, created_at, updated_at) VALUES
(1, 'admin', 'Administrador', 'Control completo del sistema, gestión de usuarios y configuraciones', 1, datetime('now'), datetime('now')),
(2, 'collaborator', 'Colaborador', 'Gestión de contenido: proyectos, noticias, eventos y recursos', 0, datetime('now'), datetime('now')),
(3, 'researcher', 'Investigador', 'Acceso a herramientas de investigación y gestión de proyectos científicos', 0, datetime('now'), datetime('now'));

-- Create simplified permissions organized by modules
-- Admin Module (Full system control)
INSERT INTO permissions (id, name, display_name, module, action, description, created_at) VALUES
(1, 'admin_full_access', 'Acceso completo de administrador', 'admin', 'manage', 'Control total del sistema y todas las funciones', datetime('now')),
(2, 'admin_users_manage', 'Gestión de usuarios', 'admin', 'manage', 'Crear, editar, eliminar usuarios y asignar roles', datetime('now')),
(3, 'admin_system_config', 'Configuración del sistema', 'admin', 'configure', 'Acceso a configuraciones críticas del sistema', datetime('now')),
(4, 'admin_logs_view', 'Ver logs del sistema', 'admin', 'read', 'Acceso a logs y monitoreo del sistema', datetime('now')),

-- Content Management (For collaborators)
(5, 'projects_create', 'Crear proyectos', 'projects', 'create', 'Crear nuevos proyectos de investigación', datetime('now')),
(6, 'projects_edit', 'Editar proyectos', 'projects', 'update', 'Modificar proyectos existentes', datetime('now')),
(7, 'projects_delete', 'Eliminar proyectos', 'projects', 'delete', 'Eliminar proyectos del sistema', datetime('now')),
(8, 'projects_publish', 'Publicar proyectos', 'projects', 'publish', 'Hacer proyectos visibles al público', datetime('now')),

(9, 'news_create', 'Crear noticias', 'news', 'create', 'Crear artículos y noticias', datetime('now')),
(10, 'news_edit', 'Editar noticias', 'news', 'update', 'Modificar noticias existentes', datetime('now')),
(11, 'news_delete', 'Eliminar noticias', 'news', 'delete', 'Eliminar noticias del sistema', datetime('now')),
(12, 'news_publish', 'Publicar noticias', 'news', 'publish', 'Hacer noticias visibles al público', datetime('now')),

(13, 'events_create', 'Crear eventos', 'events', 'create', 'Crear eventos y actividades', datetime('now')),
(14, 'events_edit', 'Editar eventos', 'events', 'update', 'Modificar eventos existentes', datetime('now')),
(15, 'events_delete', 'Eliminar eventos', 'events', 'delete', 'Eliminar eventos del sistema', datetime('now')),
(16, 'events_publish', 'Publicar eventos', 'events', 'publish', 'Hacer eventos visibles al público', datetime('now')),

(17, 'resources_create', 'Crear recursos', 'resources', 'create', 'Crear recursos y documentos', datetime('now')),
(18, 'resources_edit', 'Editar recursos', 'resources', 'update', 'Modificar recursos existentes', datetime('now')),
(19, 'resources_delete', 'Eliminar recursos', 'resources', 'delete', 'Eliminar recursos del sistema', datetime('now')),
(20, 'resources_publish', 'Publicar recursos', 'resources', 'publish', 'Hacer recursos visibles al público', datetime('now')),

-- Research Tools (For researchers)
(21, 'research_projects_access', 'Acceso a proyectos de investigación', 'research', 'read', 'Ver y colaborar en proyectos científicos', datetime('now')),
(22, 'research_data_manage', 'Gestión de datos de investigación', 'research', 'manage', 'Subir y gestionar datos científicos', datetime('now')),
(23, 'research_publications_create', 'Crear publicaciones científicas', 'research', 'create', 'Crear publicaciones y artículos científicos', datetime('now')),
(24, 'analytics_view', 'Ver analíticas', 'analytics', 'read', 'Acceso a reportes y estadísticas', datetime('now')),

-- Public Access
(25, 'public_view_projects', 'Ver proyectos públicos', 'public', 'read', 'Acceso a proyectos publicados', datetime('now')),
(26, 'public_view_news', 'Ver noticias públicas', 'public', 'read', 'Acceso a noticias publicadas', datetime('now')),
(27, 'public_view_events', 'Ver eventos públicos', 'public', 'read', 'Acceso a eventos publicados', datetime('now')),
(28, 'public_view_resources', 'Ver recursos públicos', 'public', 'read', 'Acceso a recursos publicados', datetime('now'));

-- Assign permissions to roles
-- ADMIN: Full access to everything
INSERT INTO role_permissions (role_id, permission_id, granted, created_at) VALUES
-- Admin permissions
(1, 1, TRUE, datetime('now')), -- admin_full_access
(1, 2, TRUE, datetime('now')), -- admin_users_manage
(1, 3, TRUE, datetime('now')), -- admin_system_config
(1, 4, TRUE, datetime('now')), -- admin_logs_view
-- Content management permissions
(1, 5, TRUE, datetime('now')), -- projects_create
(1, 6, TRUE, datetime('now')), -- projects_edit
(1, 7, TRUE, datetime('now')), -- projects_delete
(1, 8, TRUE, datetime('now')), -- projects_publish
(1, 9, TRUE, datetime('now')), -- news_create
(1, 10, TRUE, datetime('now')), -- news_edit
(1, 11, TRUE, datetime('now')), -- news_delete
(1, 12, TRUE, datetime('now')), -- news_publish
(1, 13, TRUE, datetime('now')), -- events_create
(1, 14, TRUE, datetime('now')), -- events_edit
(1, 15, TRUE, datetime('now')), -- events_delete
(1, 16, TRUE, datetime('now')), -- events_publish
(1, 17, TRUE, datetime('now')), -- resources_create
(1, 18, TRUE, datetime('now')), -- resources_edit
(1, 19, TRUE, datetime('now')), -- resources_delete
(1, 20, TRUE, datetime('now')), -- resources_publish
-- Research permissions
(1, 21, TRUE, datetime('now')), -- research_projects_access
(1, 22, TRUE, datetime('now')), -- research_data_manage
(1, 23, TRUE, datetime('now')), -- research_publications_create
(1, 24, TRUE, datetime('now')), -- analytics_view
-- Public permissions
(1, 25, TRUE, datetime('now')), -- public_view_projects
(1, 26, TRUE, datetime('now')), -- public_view_news
(1, 27, TRUE, datetime('now')), -- public_view_events
(1, 28, TRUE, datetime('now')); -- public_view_resources

-- COLLABORATOR: Content management focused
INSERT INTO role_permissions (role_id, permission_id, granted, created_at) VALUES
-- Content management permissions
(2, 5, TRUE, datetime('now')), -- projects_create
(2, 6, TRUE, datetime('now')), -- projects_edit
(2, 8, TRUE, datetime('now')), -- projects_publish
(2, 9, TRUE, datetime('now')), -- news_create
(2, 10, TRUE, datetime('now')), -- news_edit
(2, 12, TRUE, datetime('now')), -- news_publish
(2, 13, TRUE, datetime('now')), -- events_create
(2, 14, TRUE, datetime('now')), -- events_edit
(2, 16, TRUE, datetime('now')), -- events_publish
(2, 17, TRUE, datetime('now')), -- resources_create
(2, 18, TRUE, datetime('now')), -- resources_edit
(2, 20, TRUE, datetime('now')), -- resources_publish
-- Analytics access
(2, 24, TRUE, datetime('now')), -- analytics_view
-- Public permissions
(2, 25, TRUE, datetime('now')), -- public_view_projects
(2, 26, TRUE, datetime('now')), -- public_view_news
(2, 27, TRUE, datetime('now')), -- public_view_events
(2, 28, TRUE, datetime('now')); -- public_view_resources

-- RESEARCHER: Research and project access focused
INSERT INTO role_permissions (role_id, permission_id, granted, created_at) VALUES
-- Limited project permissions
(3, 5, TRUE, datetime('now')), -- projects_create
(3, 6, TRUE, datetime('now')), -- projects_edit
-- Research permissions
(3, 21, TRUE, datetime('now')), -- research_projects_access
(3, 22, TRUE, datetime('now')), -- research_data_manage
(3, 23, TRUE, datetime('now')), -- research_publications_create
(3, 24, TRUE, datetime('now')), -- analytics_view
-- Public permissions
(3, 25, TRUE, datetime('now')), -- public_view_projects
(3, 26, TRUE, datetime('now')), -- public_view_news
(3, 27, TRUE, datetime('now')), -- public_view_events
(3, 28, TRUE, datetime('now')); -- public_view_resources