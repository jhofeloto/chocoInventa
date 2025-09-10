-- CODECTI Platform - Sample System Logs
-- This file provides sample log data for testing the logs management system

-- Insert sample system logs
INSERT OR IGNORE INTO system_logs (level, module, action, message, user_id, ip_address, user_agent, additional_data, created_at) VALUES
('INFO', 'auth', 'login', 'Usuario admin inició sesión correctamente', 1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"login_method": "email", "remember_me": true}', datetime('now', '-2 hours')),
('INFO', 'projects', 'create', 'Nuevo proyecto creado: Biodiversidad Acuática del Chocó', 1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"project_id": 1, "title": "Biodiversidad Acuática del Chocó"}', datetime('now', '-1 hour 45 minutes')),
('WARN', 'system', 'performance', 'Base de datos responde lentamente', NULL, NULL, NULL, '{"query_time": 1250, "threshold": 1000}', datetime('now', '-1 hour 30 minutes')),
('INFO', 'users', 'update', 'Perfil de usuario actualizado', 2, '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', '{"user_id": 2, "fields_updated": ["name", "email"]}', datetime('now', '-1 hour 15 minutes')),
('ERROR', 'api', 'error', 'Error al procesar solicitud de API', NULL, '192.168.1.110', 'PostmanRuntime/7.32.3', '{"endpoint": "/api/projects", "error": "Database connection timeout", "status_code": 500}', datetime('now', '-1 hour')),
('INFO', 'projects', 'update', 'Proyecto actualizado: Desarrollo de Tecnologías Verdes', 1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"project_id": 2, "changes": {"status": "active"}}', datetime('now', '-50 minutes')),
('DEBUG', 'system', 'cache', 'Cache invalidado para módulo de proyectos', NULL, NULL, NULL, '{"cache_key": "projects_list", "reason": "data_update"}', datetime('now', '-45 minutes')),
('INFO', 'auth', 'logout', 'Usuario cerró sesión', 2, '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', '{"session_duration": 3600}', datetime('now', '-40 minutes')),
('WARN', 'admin', 'access_attempt', 'Intento de acceso no autorizado al panel de administración', NULL, '192.168.1.200', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '{"attempted_url": "/admin", "user_role": "collaborator"}', datetime('now', '-35 minutes')),
('INFO', 'projects', 'delete', 'Proyecto eliminado', 1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"project_id": 3, "title": "Proyecto de Prueba"}', datetime('now', '-30 minutes')),
('ERROR', 'system', 'database', 'Error de conexión a la base de datos', NULL, NULL, NULL, '{"error_code": "SQLITE_BUSY", "retry_count": 3}', datetime('now', '-25 minutes')),
('INFO', 'news', 'create', 'Nueva noticia publicada', 1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"news_id": 1, "title": "Avances en Investigación CTeI"}', datetime('now', '-20 minutes')),
('DEBUG', 'api', 'request', 'Solicitud de API procesada', NULL, '192.168.1.150', 'axios/1.6.0', '{"endpoint": "/public-api/projects", "response_time": 45, "status": 200}', datetime('now', '-15 minutes')),
('INFO', 'events', 'create', 'Nuevo evento creado', 1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"event_id": 1, "title": "Conferencia CTeI 2025"}', datetime('now', '-10 minutes')),
('WARN', 'system', 'storage', 'Espacio de almacenamiento bajo', NULL, NULL, NULL, '{"available_space": "500MB", "threshold": "1GB"}', datetime('now', '-5 minutes')),
('INFO', 'auth', 'login', 'Usuario colaborator inició sesión', 3, '192.168.1.120', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15', '{"login_method": "email", "device": "mobile"}', datetime('now', '-3 minutes')),
('ERROR', 'projects', 'validation', 'Error de validación en formulario de proyecto', 3, '192.168.1.120', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15', '{"field_errors": {"title": "required", "summary": "too_short"}}', datetime('now', '-2 minutes')),
('INFO', 'system', 'maintenance', 'Mantenimiento automático ejecutado', NULL, NULL, NULL, '{"tasks": ["cleanup_sessions", "optimize_database", "clear_temp_files"]}', datetime('now', '-1 minute')),
('DEBUG', 'admin', 'logs_view', 'Administrador accedió a los logs del sistema', 1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"page": "admin_logs", "filters": "none"}', datetime('now'));

-- Assign some user roles for testing
INSERT OR IGNORE INTO user_roles (user_id, role_id, assigned_by, assigned_at, is_active) VALUES
(1, 1, NULL, datetime('now', '-30 days'), TRUE), -- admin user gets super_admin role
(2, 4, 1, datetime('now', '-15 days'), TRUE),    -- researcher role
(3, 5, 1, datetime('now', '-7 days'), TRUE);     -- collaborator role