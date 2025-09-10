-- Migration 0006: Add dashboard permissions
-- Add specific permissions for dashboard access control

-- Add dashboard permissions
INSERT OR IGNORE INTO permissions (name, display_name, description, module, resource, action, created_at) VALUES
-- Dashboard module permissions
('dashboard_access', 'Acceso al Dashboard', 'Permite acceder al panel de control principal del sistema', 'dashboard', 'dashboard', 'read', datetime('now')),
('dashboard_admin_access', 'Acceso Completo Dashboard', 'Acceso completo a todas las secciones del dashboard', 'dashboard', 'dashboard', 'write', datetime('now')),

-- Section-specific dashboard permissions
('dashboard_projects_view', 'Ver Proyectos en Dashboard', 'Permite ver la sección de proyectos en el dashboard', 'dashboard', 'projects', 'read', datetime('now')),
('dashboard_news_view', 'Ver Noticias en Dashboard', 'Permite ver la sección de noticias en el dashboard', 'dashboard', 'news', 'read', datetime('now')),
('dashboard_events_view', 'Ver Eventos en Dashboard', 'Permite ver la sección de eventos en el dashboard', 'dashboard', 'events', 'read', datetime('now')),
('dashboard_resources_view', 'Ver Recursos en Dashboard', 'Permite ver la sección de recursos en el dashboard', 'dashboard', 'resources', 'read', datetime('now')),
('dashboard_analytics_view', 'Ver Analíticas en Dashboard', 'Permite ver la sección de analíticas en el dashboard', 'dashboard', 'analytics', 'read', datetime('now')),
('dashboard_admin_view', 'Ver Admin en Dashboard', 'Permite ver las secciones administrativas en el dashboard', 'dashboard', 'admin', 'read', datetime('now'));

-- Grant dashboard permissions to administrator role
INSERT OR IGNORE INTO role_permissions (role_id, permission_id, created_at) 
SELECT 1, p.id, datetime('now')
FROM permissions p 
WHERE p.module = 'dashboard';

-- Grant specific dashboard section permissions to other roles based on existing permissions
-- Collaborators get access to projects, news, events sections in dashboard
INSERT OR IGNORE INTO role_permissions (role_id, permission_id, created_at)
SELECT 2, p.id, datetime('now')
FROM permissions p 
WHERE p.name IN ('dashboard_access', 'dashboard_projects_view', 'dashboard_news_view', 'dashboard_events_view')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = 2 AND rp.permission_id = p.id
);

-- Researchers get access to basic dashboard and projects section
INSERT OR IGNORE INTO role_permissions (role_id, permission_id, created_at)
SELECT 3, p.id, datetime('now')
FROM permissions p 
WHERE p.name IN ('dashboard_access', 'dashboard_projects_view')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = 3 AND rp.permission_id = p.id
);