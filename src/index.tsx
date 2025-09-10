import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { renderer } from './renderer';
import { staticRenderer } from './staticRenderer';
import type { Bindings } from './types';
import { auth } from './routes/auth';
import projects from './routes/projects';
import users from './routes/users';
import monitoring from './routes/monitoring';
import settings from './routes/settings';
import publicRoutes from './routes/public';
import newsRoutes from './routes/news';
import publicNewsRoutes from './routes/publicNews';
import eventsRoutes from './routes/events';
import publicEventsRoutes from './routes/publicEvents';
import resourcesRoutes from './routes/resources';
import publicResourcesRoutes from './routes/publicResources';
import { loggingMiddleware, logger } from './monitoring/logger';
import { systemLoggingMiddleware, systemLogger } from './monitoring/systemLogger';
import systemLogs from './routes/systemLogs';
import { errorHandlerMiddleware } from './monitoring/errorHandler';
import { performanceMiddleware, performanceMonitor } from './monitoring/performance';
// Temporarily removed middleware for testing
// import { authMiddleware, adminMiddleware } from './utils/middleware';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for frontend-backend communication
app.use('/api/*', cors());

// Simple test endpoint at the top
app.get('/api/test-early', async (c) => {
  return c.json({ success: true, message: 'Early test endpoint working' });
});

// Admin API endpoints - moved early to avoid middleware conflicts
app.get('/api/admin/roles', async (c) => {
  try {
    const roles = await c.env?.DB?.prepare('SELECT * FROM roles ORDER BY is_system_role DESC, name ASC').all() || { results: [] };
    return c.json({
      success: true,
      roles: roles.results || []
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading roles',
      roles: []
    }, 500);
  }
});

app.get('/api/admin/permissions', async (c) => {
  try {
    const permissions = await c.env?.DB?.prepare('SELECT * FROM permissions ORDER BY module ASC, name ASC').all() || { results: [] };
    return c.json({
      success: true,
      permissions: permissions.results || []
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading permissions',
      permissions: []
    }, 500);
  }
});

app.get('/api/admin/logs', async (c) => {
  try {
    const logs = await c.env?.DB?.prepare(`
      SELECT sl.*, u.email as user_email, u.name as user_name
      FROM system_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      ORDER BY sl.created_at DESC
      LIMIT 100
    `).all() || { results: [] };
    
    return c.json({
      success: true,
      logs: logs.results || []
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading system logs',
      logs: []
    }, 500);
  }
});

app.get('/api/admin/user-roles', async (c) => {
  try {
    const userRoles = await c.env?.DB?.prepare(`
      SELECT ur.*, 
             u.name as user_name, u.email as user_email,
             r.name as role_name, r.display_name as role_display_name,
             ab.name as assigned_by_name
      FROM user_roles ur
      INNER JOIN users u ON ur.user_id = u.id
      INNER JOIN roles r ON ur.role_id = r.id
      LEFT JOIN users ab ON ur.assigned_by = ab.id
      ORDER BY ur.assigned_at DESC
    `).all() || { results: [] };
    
    return c.json({
      success: true,
      userRoles: userRoles.results || []
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading user roles',
      userRoles: []
    }, 500);
  }
});

app.get('/api/admin/role-permissions', async (c) => {
  try {
    const rolePermissions = await c.env?.DB?.prepare(`
      SELECT rp.role_id, rp.permission_id, rp.granted
      FROM role_permissions rp
      WHERE rp.granted = TRUE
    `).all() || { results: [] };
    
    return c.json({
      success: true,
      rolePermissions: rolePermissions.results || []
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading role permissions',
      rolePermissions: []
    }, 500);
  }
});

// POST endpoint to save role permissions
app.post('/api/admin/role-permissions', async (c) => {
  try {
    const { role_id, permission_id, granted } = await c.req.json();
    
    // Validate input
    if (!role_id || !permission_id || typeof granted !== 'boolean') {
      return c.json({
        success: false,
        message: 'Invalid input parameters'
      }, 400);
    }
    
    // Check if the role-permission relationship exists
    const existing = await c.env?.DB?.prepare(`
      SELECT id FROM role_permissions 
      WHERE role_id = ? AND permission_id = ?
    `).bind(role_id, permission_id).first();
    
    if (existing) {
      // Update existing record
      await c.env?.DB?.prepare(`
        UPDATE role_permissions 
        SET granted = ?
        WHERE role_id = ? AND permission_id = ?
      `).bind(granted, role_id, permission_id).run();
    } else {
      // Create new record
      await c.env?.DB?.prepare(`
        INSERT INTO role_permissions (role_id, permission_id, granted, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `).bind(role_id, permission_id, granted).run();
    }
    
    return c.json({
      success: true,
      message: 'Permission updated successfully'
    });
  } catch (error) {
    console.error('Error updating role permission:', error);
    return c.json({
      success: false,
      message: 'Error updating role permission'
    }, 500);
  }
});

// Dashboard permissions API endpoint
app.get('/api/dashboard/permissions/:roleId', async (c) => {
  try {
    const roleId = c.req.param('roleId');
    
    const dashboardPermissions = await c.env?.DB?.prepare(`
      SELECT p.name, p.display_name, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ? AND rp.granted = TRUE AND p.module = 'dashboard'
      ORDER BY p.name ASC
    `).bind(roleId).all() || { results: [] };
    
    return c.json({
      success: true,
      permissions: dashboardPermissions.results || []
    });
  } catch (error) {
    console.error('Error loading dashboard permissions:', error);
    return c.json({
      success: false,
      message: 'Error loading dashboard permissions',
      permissions: []
    }, 500);
  }
});

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// Handle favicon.ico specifically
app.get('/favicon.ico', (c) => {
  return c.redirect('/static/favicon.ico', 301);
});

// Use the renderer middleware
app.use(renderer);

// Add monitoring middleware
app.use('*', performanceMiddleware(performanceMonitor));
app.use('*', loggingMiddleware(logger));
app.use('*', systemLoggingMiddleware()); // Nuevo sistema de logs avanzado
app.use('*', errorHandlerMiddleware());

// API Routes
app.route('/api/auth', auth);
app.route('/api/projects', projects);
app.route('/api/users', users);
app.route('/api/news', newsRoutes); // HU-09: News/Blog System (Admin)
app.route('/api/events', eventsRoutes); // HU-10: Events System (Admin)
app.route('/api/resources', resourcesRoutes); // HU-11: Resources System (Admin)
app.route('/api/monitoring', monitoring);
app.route('/api/system-logs', systemLogs); // Nueva ruta para logs del sistema
app.route('/api/settings', settings);

// HU-12: Analytics and Reports System
import analyticsRoutes from './routes/analytics';
app.route('/api/analytics', analyticsRoutes);

// HU-13: Advanced File Management System
import filesRoutes from './routes/files';
app.route('/api/files', filesRoutes);

// HU-14: Scientific Publications and DOI System
import publicationsRoutes from './routes/publications';
app.route('/api/publications', publicationsRoutes);

// HU-15: CTeI Indicators and Visualization System
import { indicatorsRoutes } from './routes/indicators';
app.route('/api/indicators', indicatorsRoutes);

// HU-17: Sistema de Notificaciones y Comunicación Inteligente
import { notifications } from './routes/notifications';
app.route('/api', notifications);

// Public API Routes (No authentication required) - HU-08: Portal Público, HU-09: Noticias, HU-10: Eventos, HU-11: Recursos
// Create simple direct routes to avoid middleware conflicts
app.get('/public-api/projects', async (c) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '12');
    const search = c.req.query('search') || '';
    const status = c.req.query('status') || '';
    const area = c.req.query('area') || '';
    const institution = c.req.query('institution') || '';
    const sort = c.req.query('sort') || 'created_at';
    const order = c.req.query('order') || 'desc';

    // Build base query
    let whereConditions = [];
    let bindParams = [];

    // Always show active projects by default, unless status filter is specified
    if (status) {
      whereConditions.push('status = ?');
      bindParams.push(status);
    } else {
      whereConditions.push('status = ?');
      bindParams.push('active');
    }

    // Search filter (title, summary, responsible_person)
    if (search) {
      whereConditions.push('(title LIKE ? OR summary LIKE ? OR responsible_person LIKE ?)');
      const searchTerm = `%${search}%`;
      bindParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Area filter (simulate based on project titles/content)
    if (area) {
      switch (area) {
        case 'Biodiversidad':
          whereConditions.push('(title LIKE ? OR summary LIKE ?)');
          bindParams.push('%Biodiversidad%', '%Acuática%');
          break;
        case 'Tecnología':
          whereConditions.push('(title LIKE ? OR summary LIKE ?)');
          bindParams.push('%Tecnología%', '%Minería%');
          break;
        case 'Medicina':
          whereConditions.push('(title LIKE ? OR summary LIKE ?)');
          bindParams.push('%Medicina%', '%Plantas%');
          break;
        case 'Desarrollo':
          whereConditions.push('title LIKE ?');
          bindParams.push('%Desarrollo%');
          break;
        case 'Clima':
          whereConditions.push('title LIKE ?');
          bindParams.push('%Clima%');
          break;
      }
    }

    // Institution filter (simulate based on responsible_person)
    if (institution) {
      switch (institution) {
        case 'Universidad':
          whereConditions.push('responsible_person LIKE ?');
          bindParams.push('%María%');
          break;
        case 'CODECTI':
          whereConditions.push('responsible_person LIKE ?');
          bindParams.push('%Carlos%');
          break;
        case 'SINCHI':
          whereConditions.push('responsible_person LIKE ?');
          bindParams.push('%Ana%');
          break;
      }
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    const validSortFields = ['created_at', 'title', 'start_date'];
    const validOrders = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = validOrders.includes(order) ? order.toUpperCase() : 'DESC';

    // First, get total count
    const countQuery = `SELECT COUNT(*) as total FROM projects ${whereClause}`;
    const countResult = await c.env?.DB?.prepare(countQuery).bind(...bindParams).first() || { total: 0 };
    const total = countResult.total || 0;

    // Then get paginated results
    const offset = (page - 1) * limit;
    const dataQuery = `SELECT id, title, summary, status, responsible_person, created_at FROM projects ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    const projects = await c.env?.DB?.prepare(dataQuery).bind(...bindParams, limit, offset).all() || { results: [] };
    
    const projectData = projects.results || [];
    const totalPages = Math.ceil(total / limit);
    
    return c.json({
      success: true,
      data: projectData,
      total: total,
      page: page,
      totalPages: totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages
    });
  } catch (error) {
    console.error('Error loading projects:', error);
    return c.json({
      success: false,
      message: 'Error loading projects',
      data: []
    }, 500);
  }
});

// Public Stats API
app.get('/public-api/stats', async (c) => {
  try {
    // Get all projects to calculate stats
    const allProjects = await c.env?.DB?.prepare('SELECT * FROM projects').all() || { results: [] };
    const projects = allProjects.results || [];

    // Calculate overview statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    // Get unique researchers
    const uniqueResearchers = [...new Set(projects.filter(p => p.responsible_person).map(p => p.responsible_person))];
    const totalResearchers = uniqueResearchers.length;
    
    // Calculate total budget
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    // Categorize by research area based on titles
    const areaGroups = {};
    projects.forEach(p => {
      let area = 'Otros';
      if (p.title.includes('Biodiversidad') || p.title.includes('Acuática')) {
        area = 'Biodiversidad y Ecosistemas';
      } else if (p.title.includes('Tecnología') || p.title.includes('Minería')) {
        area = 'Tecnología Ambiental';
      } else if (p.title.includes('Medicina') || p.title.includes('Plantas')) {
        area = 'Medicina y Salud';
      } else if (p.title.includes('Desarrollo')) {
        area = 'Desarrollo Rural y Agrícola';
      } else if (p.title.includes('Clima')) {
        area = 'Cambio Climático';
      }
      
      if (!areaGroups[area]) areaGroups[area] = 0;
      areaGroups[area]++;
    });

    const byResearchArea = Object.entries(areaGroups).map(([research_area, count]) => ({
      research_area,
      count
    })).sort((a, b) => b.count - a.count);

    // Categorize by institution based on responsible person
    const institutionGroups = {};
    projects.forEach(p => {
      let institution = 'CODECTI Chocó';
      if (p.responsible_person && p.responsible_person.includes('María')) {
        institution = 'Universidad Tecnológica del Chocó';
      } else if (p.responsible_person && p.responsible_person.includes('Carlos')) {
        institution = 'CODECTI Chocó';
      } else if (p.responsible_person && p.responsible_person.includes('Ana')) {
        institution = 'SINCHI';
      }
      
      if (!institutionGroups[institution]) institutionGroups[institution] = 0;
      institutionGroups[institution]++;
    });

    const byInstitution = Object.entries(institutionGroups).map(([institution, count]) => ({
      institution,
      count
    })).sort((a, b) => b.count - a.count);

    return c.json({
      success: true,
      stats: {
        overview: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalResearchers,
          totalBudget
        },
        breakdown: {
          byResearchArea,
          byInstitution
        }
      }
    });
  } catch (error) {
    console.error('Error loading stats:', error);
    return c.json({
      success: false,
      message: 'Error loading statistics',
      stats: {
        overview: {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalResearchers: 0,
          totalBudget: 0
        },
        breakdown: {
          byResearchArea: [],
          byInstitution: []
        }
      }
    }, 500);
  }
});

app.get('/public-api/test', async (c) => {
  return c.json({
    success: true,
    message: 'Public API working!',
    timestamp: new Date().toISOString()
  });
});

// Public News API
app.get('/public-api/news', async (c) => {
  try {
    const news = await c.env?.DB?.prepare('SELECT id, title, content, summary, category, published_at, created_at FROM news WHERE status = ? ORDER BY published_at DESC LIMIT 10').bind('published').all() || { results: [] };
    return c.json({
      success: true,
      data: news.results,
      total: news.results.length
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading news',
      data: []
    }, 500);
  }
});

// Public Events API
app.get('/public-api/events', async (c) => {
  try {
    const events = await c.env?.DB?.prepare('SELECT id, title, description, event_type, start_datetime, end_datetime, location, max_participants, status FROM events WHERE status = ? ORDER BY start_datetime ASC LIMIT 10').bind('upcoming').all() || { results: [] };
    return c.json({
      success: true,
      data: events.results,
      total: events.results.length
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading events',
      data: []
    }, 500);
  }
});

// Simple test endpoint
app.get('/api/test-simple', async (c) => {
  return c.json({ success: true, message: 'Test endpoint working' });
});

// Admin - Roles Management API (MOVED TO TOP - this is a duplicate)
// app.get('/api/admin/roles', async (c) => {
//   try {
//     const roles = await c.env?.DB?.prepare('SELECT * FROM roles ORDER BY is_system_role DESC, name ASC').all() || { results: [] };
//     return c.json({
//       success: true,
//       roles: roles.results || []
//     });
//   } catch (error) {
//     return c.json({
//       success: false,
//       message: 'Error loading roles',
//       roles: []
//     }, 500);
//   }
// });

// MOVED TO TOP
// app.post('/api/admin/roles', async (c) => {
//   try {
//     const { name, display_name, description } = await c.req.json();
//     
//     const result = await c.env?.DB?.prepare(`
//       INSERT INTO roles (name, display_name, description, is_system_role) 
//       VALUES (?, ?, ?, FALSE)
//     `).bind(name, display_name, description || null).run();
//     
//     return c.json({
//       success: true,
//       role_id: result?.meta?.last_row_id,
//       message: 'Rol creado correctamente'
//     });
//   } catch (error) {
//     return c.json({
//       success: false,
//       message: 'Error creating role: ' + error.message
//     }, 500);
//   }
// });

// Admin - Permissions Management API (MOVED TO TOP)
// app.get('/api/admin/permissions', async (c) => {
//   try {
//     const permissions = await c.env?.DB?.prepare('SELECT * FROM permissions ORDER BY module, action, name').all() || { results: [] };
//     return c.json({
//       success: true,
//       permissions: permissions.results || []
//     });
//   } catch (error) {
//     return c.json({
//       success: false,
//       message: 'Error loading permissions',
//       permissions: []
//     }, 500);
//   }
// });

// Admin - Role Permissions Management API
app.get('/api/admin/roles/:roleId/permissions', async (c) => {
  try {
    const roleId = c.req.param('roleId');
    const permissions = await c.env?.DB?.prepare(`
      SELECT p.* FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ? AND rp.granted = TRUE
      ORDER BY p.module, p.action, p.name
    `).bind(roleId).all() || { results: [] };
    
    return c.json({
      success: true,
      permissions: permissions.results || []
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading role permissions',
      permissions: []
    }, 500);
  }
});

app.post('/api/admin/role-permissions', async (c) => {
  try {
    const { role_id, permission_id, granted } = await c.req.json();
    
    if (granted) {
      // Grant permission
      await c.env?.DB?.prepare(`
        INSERT OR REPLACE INTO role_permissions (role_id, permission_id, granted) 
        VALUES (?, ?, TRUE)
      `).bind(role_id, permission_id).run();
    } else {
      // Revoke permission
      await c.env?.DB?.prepare(`
        DELETE FROM role_permissions 
        WHERE role_id = ? AND permission_id = ?
      `).bind(role_id, permission_id).run();
    }
    
    return c.json({
      success: true,
      message: granted ? 'Permiso otorgado' : 'Permiso revocado'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error updating role permission: ' + error.message
    }, 500);
  }
});

// Admin - User Roles Management API (MOVED TO TOP)
// app.get('/api/admin/user-roles', async (c) => {
//   try {
//     const userRoles = await c.env?.DB?.prepare(`
//       SELECT ur.*, 
//              u.name as user_name, u.email as user_email,
//              r.name as role_name, r.display_name as role_display_name,
//              ab.name as assigned_by_name
//       FROM user_roles ur
//       INNER JOIN users u ON ur.user_id = u.id
//       INNER JOIN roles r ON ur.role_id = r.id
//       LEFT JOIN users ab ON ur.assigned_by = ab.id
//       ORDER BY ur.assigned_at DESC
//     `).all() || { results: [] };
//     
//     return c.json({
//       success: true,
//       userRoles: userRoles.results || []
//     });
//   } catch (error) {
//     return c.json({
//       success: false,
//       message: 'Error loading user roles',
//       userRoles: []
//     }, 500);
//   }
// });

// Admin - System Logs Management API (MOVED TO TOP)
// app.get('/api/admin/logs', async (c) => {
//   try {
//     const logs = await c.env?.DB?.prepare(`
//       SELECT sl.*, u.email as user_email, u.name as user_name
//       FROM system_logs sl
//       LEFT JOIN users u ON sl.user_id = u.id
//       ORDER BY sl.created_at DESC
//       LIMIT 1000
//     `).all() || { results: [] };
//     
//     return c.json({
//       success: true,
//       logs: logs.results || []
//     });
//   } catch (error) {
//     return c.json({
//       success: false,
//       message: 'Error loading system logs',
//       logs: []
//     }, 500);
//   }
// });

app.delete('/api/admin/logs', async (c) => {
  try {
    await c.env?.DB?.prepare('DELETE FROM system_logs').run();
    
    // Log this administrative action
    await c.env?.DB?.prepare(`
      INSERT INTO system_logs (level, module, action, message, user_id, ip_address)
      VALUES ('INFO', 'admin', 'clear_logs', 'System logs cleared by administrator', ?, ?)
    `).bind(1, c.req.header('CF-Connecting-IP') || 'unknown').run(); // Assuming user ID 1 for admin
    
    return c.json({
      success: true,
      message: 'System logs cleared successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error clearing system logs: ' + error.message
    }, 500);
  }
});

// Public Resources API
app.get('/public-api/resources', async (c) => {
  try {
    const resources = await c.env?.DB?.prepare('SELECT id, title, description, resource_type, external_url, category, download_count FROM resources WHERE is_public = ? AND status = ? ORDER BY created_at DESC LIMIT 10').bind(1, 'active').all() || { results: [] };
    return c.json({
      success: true,
      data: resources.results,
      total: resources.results.length
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading resources',
      data: []
    }, 500);
  }
});

// Public Portal Routes - HU-08: Portal Público de Proyectos
app.get('/portal', (c) => {
  return c.render(
    <div>
      {/* Navigation */}
      <nav className="navbar bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="navbar-logo flex items-center">
              <a href="/" className="flex items-center">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-10 mr-3" />
                <div>
                  <div className="font-bold text-xl text-primary">Choco Inventa</div>
                  <div className="text-xs text-gray-600">Portal Público CTeI</div>
                </div>
              </a>
            </div>
            <div className="nav-actions">
              <a href="/dashboard" className="btn btn-outline mr-3">Dashboard Privado</a>
              <a href="/" className="btn btn-primary">Inicio</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Portal Público de Proyectos CTeI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Descubre los proyectos de investigación, ciencia, tecnología e innovación 
            que están transformando el departamento del Chocó
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#projects" className="btn btn-primary btn-lg">
              <i className="fas fa-search mr-2"></i>
              Explorar Proyectos
            </a>
            <a href="#stats" className="btn btn-outline btn-lg">
              <i className="fas fa-chart-bar mr-2"></i>
              Ver Estadísticas
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Impacto del Ecosistema CTeI Chocó
            </h2>
            <p className="text-lg text-gray-600">
              Conoce los números que reflejan el desarrollo científico y tecnológico del Chocó
            </p>
          </div>
          <div id="publicStatsContainer">
            {/* Stats will be loaded here */}
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
              <p className="text-gray-500 mt-2">Cargando estadísticas...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Catálogo de Proyectos CTeI
            </h2>
            <p className="text-lg text-gray-600">
              Explora los proyectos de investigación que están impulsando el desarrollo del Chocó
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar proyectos
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="publicSearch"
                    className="form-input pl-10"
                    placeholder="Título, palabras clave, institución..."
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select id="statusFilter" className="form-input">
                  <option value="">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="completed">Completados</option>
                  <option value="planning">En Planificación</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select id="sortSelect" className="form-input">
                  <option value="created_at-desc">Más recientes</option>
                  <option value="created_at-asc">Más antiguos</option>
                  <option value="title-asc">Título A-Z</option>
                  <option value="title-desc">Título Z-A</option>
                  <option value="start_date-desc">Fecha inicio (desc)</option>
                  <option value="start_date-asc">Fecha inicio (asc)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Research Area Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área de Investigación
                </label>
                <select id="areaFilter" className="form-input">
                  <option value="">Todas las áreas</option>
                  <option value="Biodiversidad">Biodiversidad y Ecosistemas</option>
                  <option value="Tecnología">Tecnología Ambiental</option>
                  <option value="Desarrollo">Desarrollo Rural y Agrícola</option>
                  <option value="Medicina">Medicina y Salud</option>
                  <option value="Clima">Cambio Climático</option>
                  <option value="Acuicultura">Acuicultura y Pesca</option>
                  <option value="Cultural">Patrimonio Cultural</option>
                </select>
              </div>

              {/* Institution Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institución
                </label>
                <select id="institutionFilter" className="form-input">
                  <option value="">Todas las instituciones</option>
                  <option value="CODECTI">CODECTI Chocó</option>
                  <option value="Universidad">Universidad Tecnológica del Chocó</option>
                  <option value="SINCHI">SINCHI</option>
                  <option value="IIAP">IIAP</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div id="resultsInfo" className="text-sm text-gray-600">
                {/* Results info will be loaded here */}
              </div>
              <button id="clearFilters" className="btn btn-secondary btn-sm">
                <i className="fas fa-times mr-2"></i>
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          <div id="publicProjectsGrid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Projects will be loaded here */}
            <div className="col-span-full text-center py-12">
              <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">Cargando proyectos...</p>
            </div>
          </div>

          {/* Pagination */}
          <div id="publicPagination">
            {/* Pagination will be loaded here */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-8 mr-3" />
                <div className="font-bold text-lg">Choco Inventa</div>
              </div>
              <p className="text-gray-300">
                Portal público de proyectos de Ciencia, Tecnología e Innovación del Chocó
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/" className="hover:text-white">Inicio</a></li>
                <li><a href="/portal" className="hover:text-white">Portal Público</a></li>
                <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">CODECTI Chocó</h4>
              <p className="text-gray-300 text-sm">
                Corporación para el Desarrollo de la Ciencia, la Tecnología y la Innovación del Chocó
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CODECTI Chocó. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Scripts */}
      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="/static/public-portal.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            if (typeof PublicPortal !== 'undefined') {
              PublicPortal.init();
            }
          });
        `
      }}></script>
    </div>
  );
});

// Public News Routes - HU-09: Sistema de Noticias/Blog
app.get('/noticias', (c) => {
  return c.render(
    <div>
      {/* Navigation */}
      <nav className="navbar bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="navbar-logo flex items-center">
              <a href="/" className="flex items-center">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-10 mr-3" />
                <div>
                  <div className="font-bold text-xl text-primary">Choco Inventa</div>
                  <div className="text-xs text-gray-600">Noticias CTeI</div>
                </div>
              </a>
            </div>
            <div className="nav-actions">
              <a href="/portal" className="btn btn-outline mr-3">Portal de Proyectos</a>
              <a href="/dashboard" className="btn btn-outline mr-3">Dashboard Privado</a>
              <a href="/" className="btn btn-primary">Inicio</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section - Featured News */}
        <section className="hero-section bg-gradient-to-br from-codecti-primary via-codecti-secondary to-codecti-accent py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                <i className="fas fa-newspaper mr-4"></i>
                Noticias CTeI
              </h1>
              <p className="text-xl text-white opacity-90 max-w-3xl mx-auto leading-relaxed">
                Mantente informado sobre los últimos avances científicos y tecnológicos del Chocó
              </p>
            </div>

            {/* Featured News Container */}
            <div id="featuredNewsContainer" className="mb-8">
              <div className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-white text-2xl"></i>
                <span className="ml-3 text-white">Cargando noticias destacadas...</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Search Form */}
                <form id="newsSearchForm" className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      id="newsSearchInput"
                      placeholder="Buscar noticias..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-codecti-primary focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <button
                      type="submit"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <i className="fas fa-arrow-right text-codecti-primary hover:text-codecti-secondary"></i>
                    </button>
                  </div>
                </form>

                {/* Filters */}
                <div className="flex flex-wrap items-center space-x-4">
                  <select id="newsCategoryFilter" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-codecti-primary">
                    <option value="">Todas las categorías</option>
                  </select>
                  
                  <select id="newsTagFilter" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-codecti-primary">
                    <option value="">Todas las etiquetas</option>
                  </select>
                  
                  <select id="newsSortFilter" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-codecti-primary">
                    <option value="published_at_desc">Más recientes</option>
                    <option value="published_at_asc">Más antiguas</option>
                    <option value="title_asc">A-Z</option>
                    <option value="title_desc">Z-A</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4">
                <p id="newsResultsCount" className="text-sm text-gray-600">Cargando noticias...</p>
              </div>
            </div>
          </div>
        </section>

        {/* News Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main News Grid */}
                <div className="lg:col-span-3">
                  <div id="newsContent">
                    <div id="newsArticlesContainer" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                      <div className="col-span-full text-center py-12">
                        <i className="fas fa-spinner fa-spin text-codecti-primary text-4xl mb-4"></i>
                        <p className="text-gray-600">Cargando noticias...</p>
                      </div>
                    </div>

                    {/* Pagination */}
                    <div id="newsPagination"></div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="space-y-6">
                    {/* Recent News */}
                    <div id="recentNewsContainer">
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          <i className="fas fa-clock mr-2 text-codecti-primary"></i>
                          Cargando noticias recientes...
                        </h3>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        <i className="fas fa-external-link-alt mr-2 text-codecti-primary"></i>
                        Enlaces Rápidos
                      </h3>
                      <ul className="space-y-3">
                        <li>
                          <a href="/portal" className="flex items-center text-codecti-primary hover:text-codecti-secondary transition-colors">
                            <i className="fas fa-flask mr-2"></i>
                            Portal de Proyectos
                          </a>
                        </li>
                        <li>
                          <a href="/dashboard" className="flex items-center text-codecti-primary hover:text-codecti-secondary transition-colors">
                            <i className="fas fa-chart-line mr-2"></i>
                            Dashboard Privado
                          </a>
                        </li>
                        <li>
                          <a href="/" className="flex items-center text-codecti-primary hover:text-codecti-secondary transition-colors">
                            <i className="fas fa-home mr-2"></i>
                            Página de Inicio
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Article Modal */}
      <div id="articleModal" className="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div id="articleModalContent">
          {/* Content will be dynamically inserted */}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-8 mr-3" />
                <div className="font-bold text-lg">Choco Inventa</div>
              </div>
              <p className="text-gray-300">
                Portal de noticias de Ciencia, Tecnología e Innovación del Chocó
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/" className="hover:text-white">Inicio</a></li>
                <li><a href="/noticias" className="hover:text-white">Noticias CTeI</a></li>
                <li><a href="/portal" className="hover:text-white">Portal de Proyectos</a></li>
                <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">CODECTI Chocó</h4>
              <p className="text-gray-300 text-sm">
                Corporación para el Desarrollo de la Ciencia, la Tecnología y la Innovación del Chocó
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CODECTI Chocó. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Scripts */}
      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="/static/public-news.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            if (typeof PublicNews !== 'undefined') {
              PublicNews.init();
            }
          });
        `
      }}></script>
    </div>
  );
});

// Public Events Routes - HU-10: Sistema de Eventos y Convocatorias
app.get('/eventos', (c) => {
  return c.render(
    <div>
      {/* Navigation */}
      <nav className="navbar bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="navbar-logo flex items-center">
              <a href="/" className="flex items-center">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-10 mr-3" />
                <div>
                  <div className="font-bold text-xl text-primary">Choco Inventa</div>
                  <div className="text-xs text-gray-600">Eventos CTeI</div>
                </div>
              </a>
            </div>
            <div className="nav-actions">
              <a href="/portal" className="btn btn-outline mr-3">Portal de Proyectos</a>
              <a href="/noticias" className="btn btn-outline mr-3">Noticias CTeI</a>
              <a href="/dashboard" className="btn btn-outline mr-3">Dashboard Privado</a>
              <a href="/" className="btn btn-primary">Inicio</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section - Featured Events */}
        <section className="hero-section bg-gradient-to-br from-codecti-primary via-codecti-secondary to-codecti-accent py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                <i className="fas fa-calendar-alt mr-4"></i>
                Eventos CTeI
              </h1>
              <p className="text-xl text-white opacity-90 max-w-3xl mx-auto leading-relaxed">
                Descubre conferencias, talleres, convocatorias y seminarios que impulsan la ciencia y tecnología en el Chocó
              </p>
            </div>

            {/* Featured Events Container */}
            <div id="featuredEventsContainer" className="mb-8">
              <div className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-white text-2xl"></i>
                <span className="ml-3 text-white">Cargando eventos destacados...</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div id="eventsStatsContainer" className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
              <div className="stat-item">
                <div className="text-2xl font-bold text-codecti-primary">
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
                <div className="text-sm text-gray-600">Eventos Totales</div>
              </div>
              <div className="stat-item">
                <div className="text-2xl font-bold text-codecti-secondary">
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
                <div className="text-sm text-gray-600">Próximos</div>
              </div>
              <div className="stat-item">
                <div className="text-2xl font-bold text-codecti-accent">
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
                <div className="text-sm text-gray-600">Registrados</div>
              </div>
              <div className="stat-item">
                <div className="text-2xl font-bold text-green-600">
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
                <div className="text-sm text-gray-600">Categorías</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Search Form */}
                <form id="eventsSearchForm" className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      id="eventsSearchInput"
                      placeholder="Buscar eventos..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-codecti-primary focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <button
                      type="submit"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <i className="fas fa-arrow-right text-codecti-primary hover:text-codecti-secondary"></i>
                    </button>
                  </div>
                </form>

                {/* Filters */}
                <div className="flex flex-wrap items-center space-x-4">
                  <select id="eventsCategoryFilter" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-codecti-primary">
                    <option value="">Todas las categorías</option>
                  </select>
                  
                  <select id="eventsTypeFilter" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-codecti-primary">
                    <option value="">Todos los tipos</option>
                    <option value="conference">Conferencias</option>
                    <option value="workshop">Talleres</option>
                    <option value="convocatoria">Convocatorias</option>
                    <option value="seminar">Seminarios</option>
                    <option value="feria">Ferias</option>
                  </select>
                  
                  <select id="eventsTimeFilter" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-codecti-primary">
                    <option value="">Todos los tiempos</option>
                    <option value="upcoming">Próximos</option>
                    <option value="this_month">Este mes</option>
                    <option value="past">Pasados</option>
                  </select>
                  
                  <select id="eventsSortFilter" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-codecti-primary">
                    <option value="start_date_asc">Fecha (próximos primero)</option>
                    <option value="start_date_desc">Fecha (recientes primero)</option>
                    <option value="title_asc">Título A-Z</option>
                    <option value="title_desc">Título Z-A</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4">
                <p id="eventsResultsCount" className="text-sm text-gray-600">Cargando eventos...</p>
              </div>
            </div>
          </div>
        </section>

        {/* Events Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Events Grid */}
                <div className="lg:col-span-3">
                  <div id="eventsContent">
                    <div id="eventsContainer" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
                      <div className="col-span-full text-center py-12">
                        <i className="fas fa-spinner fa-spin text-codecti-primary text-4xl mb-4"></i>
                        <p className="text-gray-600">Cargando eventos...</p>
                      </div>
                    </div>

                    {/* Pagination */}
                    <div id="eventsPagination"></div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="space-y-6">
                    {/* Upcoming Events */}
                    <div id="upcomingEventsContainer">
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          <i className="fas fa-clock mr-2 text-codecti-primary"></i>
                          Cargando eventos próximos...
                        </h3>
                      </div>
                    </div>

                    {/* Categories */}
                    <div id="eventsCategoriesContainer">
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          <i className="fas fa-tags mr-2 text-codecti-primary"></i>
                          Categorías
                        </h3>
                        <div className="space-y-2">
                          <div className="text-center py-4">
                            <i className="fas fa-spinner fa-spin text-codecti-primary"></i>
                            <p className="text-sm text-gray-600 mt-2">Cargando...</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        <i className="fas fa-external-link-alt mr-2 text-codecti-primary"></i>
                        Enlaces Rápidos
                      </h3>
                      <ul className="space-y-3">
                        <li>
                          <a href="/portal" className="flex items-center text-codecti-primary hover:text-codecti-secondary transition-colors">
                            <i className="fas fa-flask mr-2"></i>
                            Portal de Proyectos
                          </a>
                        </li>
                        <li>
                          <a href="/noticias" className="flex items-center text-codecti-primary hover:text-codecti-secondary transition-colors">
                            <i className="fas fa-newspaper mr-2"></i>
                            Noticias CTeI
                          </a>
                        </li>
                        <li>
                          <a href="/dashboard" className="flex items-center text-codecti-primary hover:text-codecti-secondary transition-colors">
                            <i className="fas fa-chart-line mr-2"></i>
                            Dashboard Privado
                          </a>
                        </li>
                        <li>
                          <a href="/" className="flex items-center text-codecti-primary hover:text-codecti-secondary transition-colors">
                            <i className="fas fa-home mr-2"></i>
                            Página de Inicio
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Event Modal */}
      <div id="eventModal" className="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div id="eventModalContent">
          {/* Content will be dynamically inserted */}
        </div>
      </div>

      {/* Registration Modal */}
      <div id="registrationModal" className="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div id="registrationModalContent">
          {/* Content will be dynamically inserted */}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-8 mr-3" />
                <div className="font-bold text-lg">Choco Inventa</div>
              </div>
              <p className="text-gray-300">
                Portal de eventos de Ciencia, Tecnología e Innovación del Chocó
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/" className="hover:text-white">Inicio</a></li>
                <li><a href="/eventos" className="hover:text-white">Eventos CTeI</a></li>
                <li><a href="/noticias" className="hover:text-white">Noticias CTeI</a></li>
                <li><a href="/portal" className="hover:text-white">Portal de Proyectos</a></li>
                <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">CODECTI Chocó</h4>
              <p className="text-gray-300 text-sm">
                Corporación para el Desarrollo de la Ciencia, la Tecnología y la Innovación del Chocó
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CODECTI Chocó. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Scripts */}
      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="/static/public-events.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            if (typeof PublicEvents !== 'undefined') {
              PublicEvents.init();
            }
          });
        `
      }}></script>
    </div>
  );
});

// Public Resources Routes - HU-11: Sistema de Recursos y Documentos Científicos
app.get('/recursos', (c) => {
  return c.render(
    <div>
      {/* Navigation */}
      <nav className="navbar bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="navbar-logo flex items-center">
              <a href="/" className="flex items-center">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-10 mr-3" />
                <div>
                  <div className="font-bold text-xl text-primary">Choco Inventa</div>
                  <div className="text-xs text-gray-600">Recursos Científicos</div>
                </div>
              </a>
            </div>
            
            <div className="nav-actions">
              <a href="/" className="btn btn-outline mr-3">
                <i className="fas fa-home mr-2"></i>
                Inicio
              </a>
              <a href="/portal" className="btn btn-outline mr-3">
                <i className="fas fa-flask mr-2"></i>
                Proyectos
              </a>
              <a href="/noticias" className="btn btn-outline mr-3">
                <i className="fas fa-newspaper mr-2"></i>
                Noticias
              </a>
              <a href="/eventos" className="btn btn-outline mr-3">
                <i className="fas fa-calendar mr-2"></i>
                Eventos
              </a>
              <button id="showLoginModal" className="btn btn-outline">
                <i className="fas fa-sign-in-alt mr-2"></i>
                Acceder
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              <i className="fas fa-book-open text-primary mr-4"></i>
              Recursos Científicos del Chocó
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Accede a documentos, manuales, datasets y recursos científicos de la región del Chocó Biogeográfico. 
              Conocimiento libre y abierto para el desarrollo científico y tecnológico.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Portal Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Categorías de Recursos</h2>
            <div id="resourceCategories" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {/* Categories will be loaded here */}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <i className="fas fa-search mr-2"></i>
              Buscar Recursos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda</label>
                <input type="text" id="searchInput" className="form-input w-full" placeholder="Título, autor, palabras clave..." />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Recurso</label>
                <select id="typeFilter" className="form-select w-full">
                  <option value="">Todos los tipos</option>
                  <option value="document">Documentos</option>
                  <option value="manual">Manuales</option>
                  <option value="dataset">Datasets</option>
                  <option value="presentation">Presentaciones</option>
                  <option value="software">Software</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select id="categoryFilter" className="form-select w-full">
                  <option value="">Todas las categorías</option>
                  {/* Categories options will be loaded here */}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                <select id="sortFilter" className="form-select w-full">
                  <option value="publication_date-desc">Más recientes</option>
                  <option value="publication_date-asc">Más antiguos</option>
                  <option value="title-asc">Título A-Z</option>
                  <option value="title-desc">Título Z-A</option>
                  <option value="downloads_count-desc">Más descargados</option>
                  <option value="views_count-desc">Más vistos</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div id="resultsInfo" className="text-sm text-gray-600">
                {/* Results info will be loaded here */}
              </div>
              <button id="clearFilters" className="btn btn-secondary btn-sm">
                <i className="fas fa-times mr-2"></i>
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Resources Grid */}
          <div id="publicResourcesGrid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Resources will be loaded here */}
          </div>

          {/* Pagination */}
          <div id="resourcesPagination" className="flex justify-center">
            {/* Pagination will be loaded here */}
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <div id="loginModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Acceder al Sistema</h3>
            <button className="modal-close" id="closeLoginModal">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <form id="loginForm">
              <div className="form-group">
                <label htmlFor="loginEmail">Correo Electrónico</label>
                <input type="email" id="loginEmail" className="form-input" placeholder="tu@email.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">Contraseña</label>
                <input type="password" id="loginPassword" className="form-input" placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn btn-primary w-full">Iniciar Sesión</button>
            </form>
            <div className="modal-footer">
              <p>¿No tienes cuenta? <a href="/portal" className="text-primary">Explora nuestros recursos públicos</a></p>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Details Modal */}
      <div id="resourceModal" className="modal">
        <div className="modal-content modal-lg">
          <div className="modal-header">
            <h3 id="resourceModalTitle">Detalles del Recurso</h3>
            <button className="modal-close" id="closeResourceModal">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body" id="resourceModalContent">
            {/* Resource details will be loaded here */}
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="/static/public-resources.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            // Initialize the public resources portal
            if (typeof PublicResourcesPortal !== 'undefined') {
              new PublicResourcesPortal();
            }
          });
        `
      }}></script>
    </div>
  );
});

// Public Publications Routes - HU-14: Sistema de Publicaciones Científicas y DOI
app.get('/publicaciones', (c) => {
  return c.render(
    <div>
      {/* Navigation */}
      <nav className="navbar bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="navbar-logo flex items-center">
              <a href="/" className="flex items-center">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-10 mr-3" />
                <div>
                  <div className="font-bold text-xl text-primary">Choco Inventa</div>
                  <div className="text-xs text-gray-600">Repositorio Científico</div>
                </div>
              </a>
            </div>
            
            <div className="nav-actions">
              <a href="/" className="btn btn-outline mr-3">
                <i className="fas fa-home mr-2"></i>
                Inicio
              </a>
              <a href="/portal" className="btn btn-outline mr-3">
                <i className="fas fa-flask mr-2"></i>
                Proyectos
              </a>
              <a href="/noticias" className="btn btn-outline mr-3">
                <i className="fas fa-newspaper mr-2"></i>
                Noticias
              </a>
              <a href="/eventos" className="btn btn-outline mr-3">
                <i className="fas fa-calendar mr-2"></i>
                Eventos
              </a>
              <a href="/recursos" className="btn btn-outline mr-3">
                <i className="fas fa-book-open mr-2"></i>
                Recursos
              </a>
              <button id="showLoginModal" className="btn btn-outline">
                <i className="fas fa-sign-in-alt mr-2"></i>
                Acceder
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Publications Portal Container */}
      <div id="publications-container">
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Inicializando Repositorio Científico</h2>
            <p className="text-gray-500">Cargando sistema de publicaciones avanzado...</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-10 mr-3" />
                <div>
                  <div className="font-bold text-xl">Choco Inventa</div>
                  <div className="text-sm text-gray-400">Repositorio Científico CODECTI</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Repositorio científico del CODECTI Chocó que preserva, organiza y disemina el conocimiento científico 
                generado en la región del Chocó Biogeográfico, contribuyendo al desarrollo científico y tecnológico.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Portal Científico</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/publicaciones" className="hover:text-white">Publicaciones Científicas</a></li>
                <li><a href="/portal" className="hover:text-white">Proyectos CTeI</a></li>
                <li><a href="/recursos" className="hover:text-white">Recursos Científicos</a></li>
                <li><a href="/eventos" className="hover:text-white">Eventos CTeI</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Información</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/noticias" className="hover:text-white">Noticias CTeI</a></li>
                <li><a href="/" className="hover:text-white">Acerca de CODECTI</a></li>
                <li><a href="/" className="hover:text-white">Contacto</a></li>
                <li><a href="/" className="hover:text-white">Política de Acceso Abierto</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CODECTI Chocó - Corporación para el Desarrollo de la Ciencia, la Tecnología y la Innovación del Chocó. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Scripts */}
      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="/static/logo-manager.js"></script>
      <script src="/static/app.js"></script>
      <script src="/static/public-publications.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            // Initialize logo manager first
            if (typeof LogoManager !== 'undefined') {
              window.logoManager = new LogoManager();
            }
            
            // Initialize login/register modals
            if (typeof App !== 'undefined' && App.initializeAuth) {
              App.initializeAuth();
            }
            
            // Initialize the public publications portal
            if (typeof PublicationsPortal !== 'undefined') {
              window.publicationsPortal = new PublicationsPortal();
            }
          });
        `
      }}></script>
    </div>
  );
});

// Main application routes - Landing Page
app.get('/', (c) => {
  return c.render(
    <div>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="navbar-logo flex items-center">
              {/* Logo will be loaded dynamically by LogoManager */}
            </div>
            <div className="nav-actions" id="landingNavActions">
              {/* Dynamic content will be inserted by JavaScript */}
              <a href="/portal" className="btn btn-outline mr-3">
                Portal de Proyectos
              </a>
              <a href="/noticias" className="btn btn-outline mr-3">
                Noticias CTeI
              </a>
              <a href="/eventos" className="btn btn-outline mr-3">
                Eventos
              </a>
              <a href="/recursos" className="btn btn-outline mr-3">
                Recursos
              </a>
              <a href="/publicaciones" className="btn btn-outline mr-3">
                Publicaciones
              </a>
              <button id="showLoginModal" className="btn btn-outline">
                Iniciar Sesión
              </button>
              <button id="showRegisterModal" className="btn btn-primary">
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div id="app">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container mx-auto px-4">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">
                  <span className="text-gradient">Choco Inventa</span>: Innovación y Conocimiento para el Chocó
                </h1>
                <p className="hero-description">
                  CODECTI Chocó impulsa la investigación científica con Choco Inventa, una plataforma integral de gestión de proyectos CTeI, 
                  diseñada específicamente para el desarrollo de capacidades investigativas e innovación en la región del Chocó.
                </p>
                <div className="hero-actions">
                  <button id="ctaRegister" className="btn btn-primary btn-lg">
                    <i className="fas fa-microscope mr-2"></i>
                    Comenzar Investigación
                  </button>
                  <a href="/portal" className="btn btn-secondary btn-lg">
                    <i className="fas fa-eye mr-2"></i>
                    Ver Proyectos Públicos
                  </a>
                  <button id="learnMore" className="btn btn-outline btn-lg">
                    <i className="fas fa-chart-line mr-2"></i>
                    Conocer Más
                  </button>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero-cards">
                  <div className="floating-card card-1">
                    <i className="fas fa-flask text-primary"></i>
                    <span>Gestión de Proyectos</span>
                  </div>
                  <div className="floating-card card-2">
                    <i className="fas fa-chart-line text-accent"></i>
                    <span>Analytics Avanzado</span>
                  </div>
                  <div className="floating-card card-3">
                    <i className="fas fa-users text-secondary"></i>
                    <span>Colaboración</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container mx-auto px-4">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Proyectos Activos</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">1,200+</div>
                <div className="stat-label">Investigadores</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Instituciones</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Satisfacción</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="section-title">Un Nuevo Estándar en Gestión de Investigación</h2>
              <p className="section-description">
                Tres pilares fundamentales que transforman la investigación científica en el Chocó
              </p>
            </div>
            
            <div className="features-grid-opus">
              <div className="feature-card-opus">
                <div className="feature-number">01</div>
                <div className="feature-icon-opus">
                  <i className="fas fa-dna"></i>
                </div>
                <h3>Gestión Científica Avanzada</h3>
                <p>Metodologías probadas para la planificación, ejecución y monitoreo de proyectos de investigación con estándares internacionales de calidad.</p>
                <div className="feature-highlight">
                  Mayor eficiencia en gestión de proyectos investigativos
                </div>
              </div>
              
              <div className="feature-card-opus">
                <div className="feature-number">02</div>
                <div className="feature-icon-opus">
                  <i className="fas fa-network-wired"></i>
                </div>
                <h3>Colaboración Interinstitucional</h3>
                <p>Plataforma unificada que conecta investigadores, instituciones y organizaciones del Chocó para fortalecer el ecosistema científico regional.</p>
                <div className="feature-highlight">
                  Red integrada de conocimiento científico del Chocó
                </div>
              </div>
              
              <div className="feature-card-opus">
                <div className="feature-number">03</div>
                <div className="feature-icon-opus">
                  <i className="fas fa-chart-network"></i>
                </div>
                <h3>Analítica de Impacto</h3>
                <p>Herramientas de análisis que permiten medir y visualizar el impacto real de los proyectos de investigación en el desarrollo regional.</p>
                <div className="feature-highlight">
                  Medición del impacto científico y social
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section-opus">
          <div className="container mx-auto px-4">
            <div className="cta-content-opus">
              <div className="cta-badge">
                <i className="fas fa-flask mr-2"></i>
                Únete al Ecosistema de Investigación del Chocó
              </div>
              <h2 className="cta-title-opus">
                Impulsa tu Investigación con CODECTI
              </h2>
              <p className="cta-description-opus">
                Accede a herramientas avanzadas de gestión de proyectos CTeI y forma parte de la comunidad científica 
                más importante del Pacífico colombiano
              </p>
              <div className="cta-actions-opus">
                <button id="ctaRegisterMain" className="btn-cta-primary">
                  <i className="fas fa-microscope mr-2"></i>
                  Comenzar Investigación
                  <span className="btn-shine"></span>
                </button>
                <div className="cta-note-opus">
                  <div className="cta-benefits">
                    <div className="benefit-item">
                      <i className="fas fa-check-circle"></i>
                      <span>Acceso gratuito para investigadores del Chocó</span>
                    </div>
                    <div className="benefit-item">
                      <i className="fas fa-users"></i>
                      <span>Red colaborativa de instituciones</span>
                    </div>
                    <div className="benefit-item">
                      <i className="fas fa-chart-line"></i>
                      <span>Analíticas y métricas de impacto</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container mx-auto px-4">
            <div className="footer-content">
              <div className="footer-brand">
                <div className="footer-logo flex items-center mb-2">
                  {/* Logo will be loaded dynamically by LogoManager */}
                </div>
                <p>CODECTI Chocó: Transformando la investigación científica con innovación y conocimiento</p>
              </div>
              <div className="footer-links">
                <div className="footer-column">
                  <h4>Plataforma</h4>
                  <a href="#features">Características</a>
                </div>
                <div className="footer-column">
                  <h4>Recursos</h4>
                  <a href="/docs">Documentación</a>
                </div>
                <div className="footer-column">
                  <h4>Contacto</h4>
                  <a href="/soporte">Soporte</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 CODECTI. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>

        {/* Login Modal */}
        <div id="loginModal" className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Iniciar Sesión</h3>
              <button className="modal-close" id="closeLoginModal">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form id="loginForm">
                <div className="form-group">
                  <label for="loginEmail">Correo Electrónico</label>
                  <input type="email" id="loginEmail" className="form-input" placeholder="tu@email.com" autocomplete="email" required />
                </div>
                <div className="form-group">
                  <label for="loginPassword">Contraseña</label>
                  <input type="password" id="loginPassword" className="form-input" placeholder="••••••••" autocomplete="current-password" required />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Iniciar Sesión
                </button>
              </form>
              <div className="modal-footer">
                <p>¿No tienes cuenta? <a href="#" id="switchToRegister">Regístrate aquí</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Register Modal */}
        <div id="registerModal" className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Crear Cuenta</h3>
              <button className="modal-close" id="closeRegisterModal">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form id="registerForm">
                <div className="form-group">
                  <label for="registerName">Nombre Completo</label>
                  <input type="text" id="registerName" className="form-input" placeholder="Tu nombre" autocomplete="name" required />
                </div>
                <div className="form-group">
                  <label for="registerEmail">Correo Electrónico</label>
                  <input type="email" id="registerEmail" className="form-input" placeholder="tu@email.com" autocomplete="email" required />
                </div>
                <div className="form-group">
                  <label for="registerInstitution">Institución</label>
                  <input type="text" id="registerInstitution" className="form-input" placeholder="Universidad o empresa" autocomplete="organization" required />
                </div>
                <div className="form-group">
                  <label for="registerPassword">Contraseña</label>
                  <input type="password" id="registerPassword" className="form-input" placeholder="••••••••" autocomplete="new-password" required />
                </div>
                <div className="form-group">
                  <label for="registerConfirmPassword">Confirmar Contraseña</label>
                  <input type="password" id="registerConfirmPassword" className="form-input" placeholder="••••••••" autocomplete="new-password" required />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" id="agreeTerms" required />
                    <span className="checkbox-text">
                      Acepto los <a href="#terms">términos y condiciones</a> y la 
                      <a href="#privacy">política de privacidad</a>
                    </span>
                  </label>
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  <i className="fas fa-user-plus mr-2"></i>
                  Crear Cuenta
                </button>
              </form>
              <div className="modal-footer">
                <p>¿Ya tienes cuenta? <a href="#" id="switchToLogin">Inicia sesión aquí</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

app.get('/dashboard', (c) => {
  return c.render(
    <div>
      <head>
        <title>Panel de Control - CODECTI Chocó</title>
        <meta name="description" content="Panel de control centralizado del sistema CODECTI Chocó" />
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      </head>
      
      <body class="bg-gray-50">
        <div id="app" data-page="dashboard-control">
          <nav id="navbar"></nav>
          
          {/* Main Dashboard Content */}
          <div class="min-h-screen pt-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              
              {/* Header */}
              <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="p-3 bg-blue-100 rounded-full">
                      <i class="fas fa-tachometer-alt text-blue-600 text-xl"></i>
                    </div>
                    <div>
                      <h1 class="text-2xl font-bold text-gray-900">Panel de Control</h1>
                      <p class="text-gray-600">Sistema de gestión CODECTI Chocó</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-500">Rol actual</div>
                    <div id="user-role-display" class="font-semibold text-gray-900">Cargando...</div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              <div id="dashboard-loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span class="ml-3 text-gray-600">Verificando permisos...</span>
              </div>

              {/* Access Denied State */}
              <div id="dashboard-access-denied" class="hidden">
                <div class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                  <div class="text-red-400 mb-4">
                    <i class="fas fa-lock text-4xl"></i>
                  </div>
                  <h2 class="text-xl font-semibold text-red-800 mb-2">Acceso Denegado</h2>
                  <p class="text-red-600 mb-4">No tienes permisos para acceder al panel de control.</p>
                  <a href="/" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <i class="fas fa-home mr-2"></i>
                    Volver al Inicio
                  </a>
                </div>
              </div>

              {/* Dashboard Sections Grid */}
              <div id="dashboard-sections" class="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Administrative Section */}
                <div id="admin-section" class="dashboard-section" data-permission="dashboard_admin_view">
                  <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="p-6">
                      <div class="flex items-center mb-4">
                        <div class="p-3 bg-red-100 rounded-full">
                          <i class="fas fa-cogs text-red-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                          <h3 class="font-semibold text-gray-900">Administración</h3>
                          <p class="text-sm text-gray-600">Gestión del sistema</p>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <a href="/admin" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-chart-line text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Panel Principal</span>
                          </div>
                        </a>
                        <a href="/admin/roles" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-users-cog text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Roles y Permisos</span>
                          </div>
                        </a>
                        <a href="/admin/users" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-users text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Gestión de Usuarios</span>
                          </div>
                        </a>
                        <a href="/admin/logs" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-list-alt text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Logs del Sistema</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projects Section */}
                <div id="projects-section" class="dashboard-section" data-permission="dashboard_projects_view">
                  <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="p-6">
                      <div class="flex items-center mb-4">
                        <div class="p-3 bg-blue-100 rounded-full">
                          <i class="fas fa-project-diagram text-blue-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                          <h3 class="font-semibold text-gray-900">Proyectos</h3>
                          <p class="text-sm text-gray-600">Gestión de proyectos</p>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <a href="/projects" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-list text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Ver Proyectos</span>
                          </div>
                        </a>
                        <a href="/portal" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-plus-circle text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Portal de Proyectos</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* News Section */}
                <div id="news-section" class="dashboard-section" data-permission="dashboard_news_view">
                  <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="p-6">
                      <div class="flex items-center mb-4">
                        <div class="p-3 bg-green-100 rounded-full">
                          <i class="fas fa-newspaper text-green-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                          <h3 class="font-semibold text-gray-900">Noticias</h3>
                          <p class="text-sm text-gray-600">Gestión de contenidos</p>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <a href="/noticias" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-newspaper text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Ver Noticias</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Events Section */}
                <div id="events-section" class="dashboard-section" data-permission="dashboard_events_view">
                  <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="p-6">
                      <div class="flex items-center mb-4">
                        <div class="p-3 bg-purple-100 rounded-full">
                          <i class="fas fa-calendar-alt text-purple-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                          <h3 class="font-semibold text-gray-900">Eventos</h3>
                          <p class="text-sm text-gray-600">Gestión de eventos</p>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <a href="/eventos" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-calendar text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Ver Eventos</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources Section */}
                <div id="resources-section" class="dashboard-section" data-permission="dashboard_resources_view">
                  <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="p-6">
                      <div class="flex items-center mb-4">
                        <div class="p-3 bg-yellow-100 rounded-full">
                          <i class="fas fa-book text-yellow-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                          <h3 class="font-semibold text-gray-900">Recursos</h3>
                          <p class="text-sm text-gray-600">Gestión de recursos</p>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <a href="/recursos" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-books text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Ver Recursos</span>
                          </div>
                        </a>
                        <a href="/publicaciones" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-file-alt text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Publicaciones</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Section */}
                <div id="analytics-section" class="dashboard-section" data-permission="dashboard_analytics_view">
                  <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="p-6">
                      <div class="flex items-center mb-4">
                        <div class="p-3 bg-indigo-100 rounded-full">
                          <i class="fas fa-chart-bar text-indigo-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                          <h3 class="font-semibold text-gray-900">Analíticas</h3>
                          <p class="text-sm text-gray-600">Métricas y reportes</p>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <a href="/analytics" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-analytics text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Ver Analíticas</span>
                          </div>
                        </a>
                        <a href="/indicadores" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-chart-line text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Indicadores</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Utilities Section */}
                <div id="utilities-section" class="dashboard-section" data-permission="dashboard_access">
                  <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="p-6">
                      <div class="flex items-center mb-4">
                        <div class="p-3 bg-gray-100 rounded-full">
                          <i class="fas fa-tools text-gray-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                          <h3 class="font-semibold text-gray-900">Utilidades</h3>
                          <p class="text-sm text-gray-600">Herramientas adicionales</p>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <a href="/files" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-folder text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Gestión de Archivos</span>
                          </div>
                        </a>
                        <a href="/docs" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-book-open text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Documentación</span>
                          </div>
                        </a>
                        <a href="/soporte" class="dashboard-link block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div class="flex items-center">
                            <i class="fas fa-life-ring text-gray-600 mr-3"></i>
                            <span class="text-sm font-medium">Soporte</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Dashboard JavaScript */}
        <script src="/static/dashboard-control.js"></script>
      </body>
    </div>
  );
});

app.get('/admin', (c) => {
  return c.render(
    <div>
      <h1>Panel de Administración - Choco Inventa</h1>
      <div id="app" data-page="admin">
        <nav id="navbar"></nav>
        <main id="main-content">
          <div id="admin-dashboard-container">
            <div class="max-w-7xl mx-auto p-6 space-y-6">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Panel de Administración</h2>
                <div class="flex space-x-2">
                  <button id="backToDashboard" class="btn btn-secondary">
                    <i class="fas fa-arrow-left mr-1"></i> Volver al Dashboard
                  </button>
                  <button id="toggleAutoRefresh" class="btn btn-danger">
                    <i class="fas fa-pause mr-1"></i> Pausar Auto-refresh
                  </button>
                  <button id="forceHealthCheck" class="btn btn-primary">
                    <i class="fas fa-heartbeat mr-1"></i> Health Check
                  </button>
                </div>
              </div>
              
              <div id="systemStatus"></div>
              <div id="metricsOverview"></div>
              
              {/* User Management Section */}
              <div id="usersContainer"></div>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Access Control Management */}
                <div class="card p-6">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Gestión de Acceso</h3>
                    <a href="/admin/roles" class="btn btn-primary btn-sm">
                      <i class="fas fa-external-link-alt mr-2"></i>Gestionar
                    </a>
                  </div>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div class="flex items-center">
                        <i class="fas fa-users-cog text-blue-600 mr-3"></i>
                        <div>
                          <div class="text-sm font-medium text-gray-900">Roles y Permisos</div>
                          <div class="text-xs text-gray-500">Sistema completo de control de acceso</div>
                        </div>
                      </div>
                      <a href="/admin/roles" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-arrow-right"></i>
                      </a>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div class="flex items-center">
                        <i class="fas fa-key text-green-600 mr-3"></i>
                        <div>
                          <div class="text-sm font-medium text-gray-900">Matriz de Permisos</div>
                          <div class="text-xs text-gray-500">Asignación granular de permisos por rol</div>
                        </div>
                      </div>
                      <a href="/admin/roles#permissions" class="text-green-600 hover:text-green-800">
                        <i class="fas fa-arrow-right"></i>
                      </a>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div class="flex items-center">
                        <i class="fas fa-user-friends text-purple-600 mr-3"></i>
                        <div>
                          <div class="text-sm font-medium text-gray-900">Asignación de Usuarios</div>
                          <div class="text-xs text-gray-500">Gestión de roles por usuario</div>
                        </div>
                      </div>
                      <a href="/admin/roles#userRoles" class="text-purple-600 hover:text-purple-800">
                        <i class="fas fa-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* System Monitoring */}
                <div class="card p-6">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Monitoreo del Sistema</h3>
                    <a href="/admin/logs" class="btn btn-primary btn-sm">
                      <i class="fas fa-external-link-alt mr-2"></i>Ver Todos
                    </a>
                  </div>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div class="flex items-center">
                        <i class="fas fa-file-alt text-yellow-600 mr-3"></i>
                        <div>
                          <div class="text-sm font-medium text-gray-900">Logs del Sistema</div>
                          <div class="text-xs text-gray-500">Registros completos de actividad</div>
                        </div>
                      </div>
                      <a href="/admin/logs" class="text-yellow-600 hover:text-yellow-800">
                        <i class="fas fa-arrow-right"></i>
                      </a>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div class="flex items-center">
                        <i class="fas fa-exclamation-triangle text-red-600 mr-3"></i>
                        <div>
                          <div class="text-sm font-medium text-gray-900">Errores del Sistema</div>
                          <div class="text-xs text-gray-500">Monitoreo y análisis de errores</div>
                        </div>
                      </div>
                      <a href="/admin/logs?level=ERROR" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-arrow-right"></i>
                      </a>
                    </div>
                    
                    <div class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div class="flex items-center">
                        <i class="fas fa-download text-gray-600 mr-3"></i>
                        <div>
                          <div class="text-sm font-medium text-gray-900">Exportar Logs</div>
                          <div class="text-xs text-gray-500">Descargar en JSON/CSV</div>
                        </div>
                      </div>
                      <a href="/admin/logs#export" class="text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card p-6">
                <h3 class="text-lg font-semibold mb-4">Herramientas de Administración</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  <a href="/analytics" class="btn btn-gradient-primary">
                    <i class="fas fa-chart-pie mr-2"></i>
                    Dashboard Analítico
                  </a>
                  <a href="/indicadores" class="btn btn-gradient-purple">
                    <i class="fas fa-chart-area mr-2"></i>
                    Indicadores CTeI
                  </a>
                  <a href="/files" class="btn btn-gradient-secondary">
                    <i class="fas fa-folder-open mr-2"></i>
                    Gestor de Archivos
                  </a>
                  <a href="/admin/roles" class="btn btn-gradient-success">
                    <i class="fas fa-users-cog mr-2"></i>
                    Roles y Permisos
                  </a>
                  <a href="/admin/logs" class="btn btn-gradient-warning">
                    <i class="fas fa-file-alt mr-2"></i>
                    Logs del Sistema
                  </a>
                  <button id="configureLogoButton" class="btn btn-primary">
                    <i class="fas fa-image mr-2"></i>
                    Configurar Logo
                  </button>
                  <button id="generateTestLoad" class="btn btn-secondary">
                    <i class="fas fa-vial mr-2"></i>
                    Generar Datos de Prueba
                  </button>
                  <a href="/api/monitoring/health" target="_blank" class="btn btn-secondary text-center">
                    <i class="fas fa-external-link-alt mr-2"></i>
                    Health Check Público
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
});

// Admin - Roles and Permissions Management
app.get('/admin/roles', (c) => {
  return c.render(
    <div>
      <head>
        <title>Gestión de Roles y Permisos - CODECTI Chocó</title>
        <meta name="description" content="Administración de roles y permisos del sistema CODECTI" />
      </head>
      
      <div id="app" data-page="admin-roles">
        <nav id="navbar"></nav>
        <main id="main-content">
          <div class="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div class="flex justify-between items-center">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Gestión de Roles y Permisos</h1>
                <p class="text-gray-600 mt-2">Administra roles de usuario y asigna permisos específicos</p>
              </div>
              <div class="flex space-x-3">
                <button id="refreshRoles" class="btn btn-secondary">
                  <i class="fas fa-sync mr-2"></i>Actualizar
                </button>
                <button id="createRole" class="btn btn-primary">
                  <i class="fas fa-plus mr-2"></i>Crear Rol
                </button>
                <a href="/admin" class="btn btn-outline">
                  <i class="fas fa-arrow-left mr-2"></i>Volver al Admin
                </a>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8">
                <button 
                  id="rolesTab" 
                  class="tab-button active border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
                  onclick="switchTab('roles')"
                >
                  <i class="fas fa-users-cog mr-2"></i>Roles del Sistema
                </button>
                <button 
                  id="permissionsTab" 
                  class="tab-button border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  onclick="switchTab('permissions')"
                >
                  <i class="fas fa-key mr-2"></i>Matriz de Permisos
                </button>

              </nav>
            </div>

            {/* Roles Management Tab */}
            <div id="rolesTabContent" class="tab-content">
              <div class="bg-white shadow rounded-lg">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-medium text-gray-900">Roles del Sistema</h2>
                  <p class="text-sm text-gray-500">Sistema unificado de 3 roles consistentes: Administrador, Colaborador e Investigador</p>
                  
                  {/* Quick Overview */}
                  <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gray-50 rounded-lg p-3">
                      <h3 class="text-sm font-medium text-gray-900">Roles de Sistema</h3>
                      <p class="text-xs text-gray-600 mt-1">3 roles unificados con permisos específicos</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <h3 class="text-sm font-medium text-gray-900">Permisos Granulares</h3>
                      <p class="text-xs text-gray-600 mt-1">28 permisos organizados por módulos</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <h3 class="text-sm font-medium text-gray-900">Gestión Centralizada</h3>
                      <p class="text-xs text-gray-600 mt-1">Control completo desde una interfaz</p>
                    </div>
                  </div>
                </div>
                <div id="rolesTableContainer" class="p-6">
                  <div class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                    <p class="text-gray-500">Cargando roles...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions Matrix Tab */}
            <div id="permissionsTabContent" class="tab-content hidden">
              <div class="bg-white shadow rounded-lg">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-medium text-gray-900">Matriz de Permisos</h2>
                  <p class="text-sm text-gray-500">Asigna permisos específicos a cada rol del sistema</p>
                  
                  {/* Info Section */}
                  <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-start">
                      <i class="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
                      <div class="text-sm">
                        <p class="font-medium text-blue-900">Instrucciones:</p>
                        <ul class="mt-2 text-blue-800 space-y-1">
                          <li>• Marca/desmarca los permisos para cada rol usando los checkboxes</li>
                          <li>• Los cambios se guardan automáticamente</li>
                          <li>• Usa los enlaces "Verificar" para probar cada funcionalidad</li>
                          <li>• La gestión de usuarios se realiza desde el panel principal</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="permissionsMatrix" class="p-6">
                  <div class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                    <p class="text-gray-500">Cargando matriz de permisos...</p>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </main>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
        // Combined script for roles management
        
        // Tab switching functionality
        function switchTab(tabName) {
          document.querySelectorAll('.tab-content').forEach(function(content) {
            content.classList.add('hidden');
          });
          
          document.querySelectorAll('.tab-button').forEach(function(button) {
            button.classList.remove('border-blue-500', 'text-blue-600');
            button.classList.add('border-transparent', 'text-gray-500');
          });
          
          document.getElementById(tabName + 'TabContent').classList.remove('hidden');
          
          const activeButton = document.getElementById(tabName + 'Tab');
          activeButton.classList.remove('border-transparent', 'text-gray-500');
          activeButton.classList.add('border-blue-500', 'text-blue-600');
          
          // Load appropriate data based on tab
          if (tabName === 'roles') {
            SimpleRolesManager.loadRoles();
          } else if (tabName === 'permissions') {
            SimpleRolesManager.loadPermissionsMatrix();
          }
        }
        
        // Simple roles manager implementation
        const SimpleRolesManager = {
          init: function() {
            console.log('Initializing Simple Roles Manager...');
            this.loadRoles();
          },
          
          loadRoles: function() {
            const self = this;
            axios.get('/api/admin/roles')
              .then(function(response) {
                if (response.data && response.data.success) {
                  self.renderRoles(response.data.roles || []);
                } else {
                  self.showError('Error loading roles');
                }
              })
              .catch(function(error) {
                console.error('Error:', error);
                self.showError('Connection error');
              });
          },
          
          renderRoles: function(roles) {
            const container = document.getElementById('rolesTableContainer');
            if (!container) return;
            
            let html = '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr>';
            html += '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>';
            html += '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>';
            html += '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>';
            html += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';
            
            roles.forEach(function(role) {
              html += '<tr>';
              html += '<td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900">' + role.display_name + '</div></td>';
              html += '<td class="px-6 py-4"><div class="text-sm text-gray-500">' + (role.description || '') + '</div></td>';
              html += '<td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' + (role.is_system_role ? 'bg-red-100 text-red-800">Sistema' : 'bg-green-100 text-green-800">Personalizado') + '</span></td>';
              html += '</tr>';
            });
            
            html += '</tbody></table></div>';
            container.innerHTML = html;
          },
          
          showError: function(message, containerId) {
            const container = document.getElementById(containerId || 'rolesTableContainer');
            if (container) {
              container.innerHTML = '<div class="text-center py-12"><div class="text-red-500"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>' + message + '</p></div></div>';
            }
          },
          
          // Load permissions matrix
          loadPermissionsMatrix: function() {
            const self = this;
            console.log('Loading permissions matrix...');
            
            Promise.all([
              axios.get('/api/admin/roles'),
              axios.get('/api/admin/permissions'),
              axios.get('/api/admin/role-permissions')
            ]).then(function(responses) {
              console.log('All API responses received:', responses);
              
              const rolesResponse = responses[0];
              const permissionsResponse = responses[1];
              const rolePermissionsResponse = responses[2];
              
              console.log('Roles success:', rolesResponse.data.success);
              console.log('Permissions success:', permissionsResponse.data.success);  
              console.log('Role-permissions success:', rolePermissionsResponse.data.success);
              
              if (rolesResponse.data.success && permissionsResponse.data.success && rolePermissionsResponse.data.success) {
                console.log('All APIs successful, rendering matrix...');
                self.renderPermissionsMatrix(
                  rolesResponse.data.roles || [], 
                  permissionsResponse.data.permissions || [],
                  rolePermissionsResponse.data.rolePermissions || []
                );
              } else {
                console.log('One or more APIs failed');
                self.showError('Error loading permissions matrix', 'permissionsMatrix');
              }
            }).catch(function(error) {
              console.error('Promise.all failed:', error);
              console.error('Error details:', error.message);
              console.error('Error stack:', error.stack);
              self.showError('Connection error: ' + error.message, 'permissionsMatrix');
            });
          },
          
          renderPermissionsMatrix: function(roles, permissions, rolePermissions) {
            const container = document.getElementById('permissionsMatrix');
            if (!container) return;
            
            const self = this; // Define self at the beginning of the function
            
            // Create a map of role-permission assignments for quick lookup
            const permissionMap = {};
            rolePermissions.forEach(function(rp) {
              const key = rp.role_id + '_' + rp.permission_id;
              permissionMap[key] = rp.granted;
            });
            
            // Group permissions by module
            const moduleGroups = {};
            permissions.forEach(function(permission) {
              if (!moduleGroups[permission.module]) {
                moduleGroups[permission.module] = [];
              }
              moduleGroups[permission.module].push(permission);
            });
            
            let html = '<div class="space-y-6">';
            
            Object.keys(moduleGroups).forEach(function(module) {
              html += '<div class="bg-white shadow rounded-lg p-6">';
              html += '<h3 class="text-lg font-semibold mb-4 text-gray-900 capitalize">' + module + '</h3>';
              html += '<div class="overflow-x-auto">';
              html += '<table class="min-w-full">';
              html += '<thead><tr>';
              html += '<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Permiso</th>';
              
              roles.forEach(function(role) {
                html += '<th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">' + role.display_name + '</th>';
              });
              
              html += '</tr></thead><tbody>';
              
              moduleGroups[module].forEach(function(permission) {
                html += '<tr class="border-t">';
                html += '<td class="px-3 py-2">';
                html += '<div class="flex items-center justify-between">';
                html += '<div>';
                html += '<div class="text-sm font-medium text-gray-900">' + permission.display_name + '</div>';
                html += '<div class="text-xs text-gray-500">' + (permission.description || '') + '</div>';
                html += '</div>';
                
                // Add verification link based on permission
                const verificationUrl = self.getVerificationUrl(permission);
                if (verificationUrl) {
                  html += '<a href="' + verificationUrl + '" target="_blank" class="text-blue-600 hover:text-blue-800 text-xs">';
                  html += '<i class="fas fa-external-link-alt mr-1"></i>Verificar';
                  html += '</a>';
                }
                
                html += '</div>';
                html += '</td>';
                
                roles.forEach(function(role) {
                  const key = role.id + '_' + permission.id;
                  const isChecked = permissionMap[key] ? 'checked' : '';
                  
                  html += '<td class="px-3 py-2 text-center">';
                  html += '<input type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" ';
                  html += 'data-role-id="' + role.id + '" data-permission-id="' + permission.id + '" ' + isChecked + '>';
                  html += '</td>';
                });
                
                html += '</tr>';
              });
              
              html += '</tbody></table></div></div>';
            });
            
            html += '</div>';
            container.innerHTML = html;
            
            // Add event listeners for permission checkboxes
            this.setupPermissionCheckboxes();
          },
          
          setupPermissionCheckboxes: function() {
            const self = this;
            const checkboxes = document.querySelectorAll('#permissionsMatrix input[type="checkbox"]');
            checkboxes.forEach(function(checkbox) {
              checkbox.addEventListener('change', function() {
                const roleId = this.getAttribute('data-role-id');
                const permissionId = this.getAttribute('data-permission-id');
                const granted = this.checked;
                
                self.updateRolePermission(roleId, permissionId, granted);
              });
            });
          },
          
          updateRolePermission: function(roleId, permissionId, granted) {
            const self = this;
            axios.post('/api/admin/role-permissions', {
              role_id: parseInt(roleId),
              permission_id: parseInt(permissionId),
              granted: granted
            }).then(function(response) {
              if (response.data.success) {
                self.showSuccessMessage('Permiso actualizado correctamente');
              } else {
                self.showErrorMessage('Error al actualizar permiso');
              }
            }).catch(function(error) {
              console.error('Error:', error);
              self.showErrorMessage('Error de conexión');
            });
          },
          
          showSuccessMessage: function(message) {
            // Simple success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(function() {
              document.body.removeChild(notification);
            }, 3000);
          },
          
          showErrorMessage: function(message) {
            // Simple error notification  
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(function() {
              document.body.removeChild(notification);
            }, 3000);
          },
          
          getVerificationUrl: function(permission) {
            // Map permissions to their corresponding verification pages
            const permissionUrls = {
              // Admin module
              'admin_full_access': '/admin',
              'admin_users_manage': '/admin',
              'admin_system_config': '/admin/settings',
              'admin_logs_view': '/admin/logs',
              
              // Projects module
              'projects_create': '/admin/projects',
              'projects_edit': '/admin/projects',
              'projects_delete': '/admin/projects',
              'projects_publish': '/admin/projects',
              
              // News module
              'news_create': '/admin/news',
              'news_edit': '/admin/news',
              'news_delete': '/admin/news',
              'news_publish': '/admin/news',
              
              // Events module
              'events_create': '/admin/events',
              'events_edit': '/admin/events',
              'events_delete': '/admin/events',
              'events_publish': '/admin/events',
              
              // Resources module
              'resources_create': '/admin/resources',
              'resources_edit': '/admin/resources',
              'resources_delete': '/admin/resources',
              'resources_publish': '/admin/resources',
              
              // Research module
              'research_projects_access': '/admin/projects',
              'research_data_manage': '/files',
              'research_publications_create': '/publications',
              'analytics_view': '/analytics',
              
              // Public module
              'public_view_projects': '/projects',
              'public_view_news': '/news',
              'public_view_events': '/events',
              'public_view_resources': '/resources'
            };
            
            return permissionUrls[permission.name] || null;
          },

        };
        
        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
          SimpleRolesManager.init();
        });
        
        // Expose switchTab globally for onclick handlers
        window.switchTab = switchTab;
        `
      }}></script>
      

    </div>
  );
});

// Admin - Users Management
app.get('/admin/users', (c) => {
  return c.render(
    <div>
      <head>
        <title>Gestión de Usuarios - CODECTI Chocó</title>
        <meta name="description" content="Administración de usuarios y asignación de roles del sistema CODECTI" />
      </head>
      
      <div id="app" data-page="admin-users">
        <nav id="navbar"></nav>
        <main id="main-content">
          <div class="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div class="flex justify-between items-center">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p class="text-gray-600 mt-2">Administra usuarios del sistema y asigna roles específicos</p>
              </div>
              <div class="flex space-x-3">
                <button id="refreshUsers" class="btn btn-secondary">
                  <i class="fas fa-sync mr-2"></i>Actualizar
                </button>
                <button id="createUser" class="btn btn-primary">
                  <i class="fas fa-plus mr-2"></i>Crear Usuario
                </button>
                <a href="/admin" class="btn btn-outline">
                  <i class="fas fa-arrow-left mr-2"></i>Volver al Admin
                </a>
              </div>
            </div>

            {/* Info Section */}
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start">
                <i class="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
                <div class="text-sm">
                  <p class="font-medium text-blue-900">Sistema de Roles Unificado:</p>
                  <ul class="mt-2 text-blue-800 space-y-1">
                    <li>• <strong>Administrador:</strong> Control completo del sistema y gestión de usuarios</li>
                    <li>• <strong>Colaborador:</strong> Gestión de contenido (proyectos, noticias, eventos, recursos)</li>
                    <li>• <strong>Investigador:</strong> Herramientas de investigación y gestión de proyectos científicos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Users Management */}
            <div class="bg-white shadow rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Usuarios del Sistema</h2>
                <p class="text-sm text-gray-500">Gestiona usuarios y sus roles asignados</p>
              </div>
              <div id="usersTableContainer" class="p-6">
                <div class="text-center py-12">
                  <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                  <p class="text-gray-500">Cargando usuarios...</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="/static/admin-dashboard.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
        // Users management initialization
        document.addEventListener('DOMContentLoaded', function() {
          if (typeof AdminDashboard !== 'undefined') {
            AdminDashboard.loadUsers();
          }
        });
        `
      }}></script>
      
    </div>
  );
});

// Admin - System Logs Management
app.get('/admin/logs', (c) => {
  return c.render(
    <div>
      <head>
        <title>Logs del Sistema - CODECTI Chocó</title>
        <meta name="description" content="Administración y monitoreo de logs del sistema CODECTI" />
      </head>
      
      <div id="app" data-page="admin-logs">
        <nav id="navbar"></nav>
        <main id="main-content">
          <div class="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div class="flex justify-between items-center">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Logs del Sistema</h1>
                <p class="text-gray-600 mt-2">Monitorea y analiza los registros de actividad del sistema</p>
              </div>
              <div class="flex space-x-3">
                <button id="toggleAutoRefresh" class="btn btn-success">
                  <i class="fas fa-play mr-2"></i>Activar Auto-refresh
                </button>
                <button id="refreshLogs" class="btn btn-secondary">
                  <i class="fas fa-sync mr-2"></i>Actualizar
                </button>
                <a href="/admin" class="btn btn-outline">
                  <i class="fas fa-arrow-left mr-2"></i>Volver al Admin
                </a>
              </div>
            </div>

            {/* Statistics */}
            <div id="logsStatistics">
              <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                <p class="text-gray-500 mt-2">Calculando estadísticas...</p>
              </div>
            </div>

            {/* Filters */}
            <div class="bg-white shadow rounded-lg p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Filtros y Búsqueda</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label for="logLevelFilter" class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                  <select id="logLevelFilter" class="form-input">
                    <option value="">Todos los niveles</option>
                    <option value="ERROR">Error</option>
                    <option value="WARN">Warning</option>
                    <option value="INFO">Info</option>
                    <option value="DEBUG">Debug</option>
                    <option value="FATAL">Fatal</option>
                  </select>
                </div>
                
                <div>
                  <label for="logModuleFilter" class="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
                  <select id="logModuleFilter" class="form-input">
                    <option value="">Todos los módulos</option>
                    <option value="auth">Autenticación</option>
                    <option value="projects">Proyectos</option>
                    <option value="users">Usuarios</option>
                    <option value="admin">Administración</option>
                    <option value="api">API</option>
                    <option value="system">Sistema</option>
                  </select>
                </div>
                
                <div>
                  <label for="logActionFilter" class="block text-sm font-medium text-gray-700 mb-1">Acción</label>
                  <select id="logActionFilter" class="form-input">
                    <option value="">Todas las acciones</option>
                    <option value="login">Inicio de sesión</option>
                    <option value="logout">Cierre de sesión</option>
                    <option value="create">Crear</option>
                    <option value="update">Actualizar</option>
                    <option value="delete">Eliminar</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                
                <div>
                  <label for="itemsPerPage" class="block text-sm font-medium text-gray-700 mb-1">Por página</label>
                  <select id="itemsPerPage" class="form-input">
                    <option value="25">25 elementos</option>
                    <option value="50" selected>50 elementos</option>
                    <option value="100">100 elementos</option>
                    <option value="200">200 elementos</option>
                  </select>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label for="logSearch" class="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
                  <input 
                    type="text" 
                    id="logSearch" 
                    class="form-input" 
                    placeholder="Buscar en mensaje, usuario, IP..."
                  />
                </div>
                
                <div>
                  <label for="logDateFrom" class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
                  <input type="date" id="logDateFrom" class="form-input" />
                </div>
                
                <div>
                  <label for="logDateTo" class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
                  <input type="date" id="logDateTo" class="form-input" />
                </div>
              </div>
              
              <div class="flex justify-between items-center">
                <div id="filterStats" class="text-sm text-gray-600"></div>
                
                <div class="flex space-x-2">
                  <button id="clearLogFilters" class="btn btn-secondary btn-sm">
                    <i class="fas fa-times mr-2"></i>Limpiar Filtros
                  </button>
                  <button id="exportLogsJson" class="btn btn-info btn-sm">
                    <i class="fas fa-download mr-2"></i>JSON
                  </button>
                  <button id="exportLogsCsv" class="btn btn-info btn-sm">
                    <i class="fas fa-file-csv mr-2"></i>CSV
                  </button>
                  <button id="clearSystemLogs" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash mr-2"></i>Limpiar Logs
                  </button>
                </div>
              </div>
            </div>

            {/* Logs Table */}
            <div class="bg-white shadow rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Registros del Sistema</h2>
              </div>
              
              <div id="logsTableContainer" class="min-h-96">
                <div class="text-center py-12">
                  <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                  <p class="text-gray-500">Cargando logs del sistema...</p>
                </div>
              </div>
              
              <div id="logsPagination" class="px-6 py-4 border-t border-gray-200"></div>
            </div>
          </div>
        </main>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="/static/logo-manager.js"></script>
      <script src="/static/notifications.js"></script>
      <script src="/static/app.js"></script>
      <script src="/static/logs-manager.js"></script>
      
      <script>
        {`
        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
          if (typeof LogsManager !== 'undefined') {
            LogsManager.init();
          }
        });
        `}
      </script>
    </div>
  );
});

// HU-12: Analytics Dashboard Route
app.get('/analytics', (c) => {
  return c.render(
    <div>
      <head>
        <title>Dashboard Analítico - CODECTI Chocó</title>
        <meta name="description" content="Dashboard analítico completo con métricas y reportes de la plataforma CODECTI" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
      </head>
      
      <div id="analytics-container">
        {/* Content will be loaded by analytics-dashboard.js */}
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Inicializando Dashboard Analítico</h2>
            <p className="text-gray-500">Cargando sistema de métricas y gráficos...</p>
          </div>
        </div>
      </div>

      {/* Load Analytics Dashboard JavaScript */}
      <script src="/static/analytics-dashboard.js"></script>
    </div>
  );
});

// HU-13: File Manager Route
app.get('/files', (c) => {
  return c.render(
    <div>
      <head>
        <title>Gestor de Archivos - CODECTI Chocó</title>
        <meta name="description" content="Sistema avanzado de gestión de archivos y documentos de la plataforma CODECTI" />
      </head>
      
      <div id="file-manager-container">
        {/* Content will be loaded by file-manager.js */}
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Inicializando Gestor de Archivos</h2>
            <p className="text-gray-500">Cargando sistema de documentos avanzado...</p>
          </div>
        </div>
      </div>

      {/* Load File Manager JavaScript */}
      <script src="/static/file-manager.js"></script>
    </div>
  );
});

app.get('/project/:id', (c) => {
  const projectId = c.req.param('id');
  return c.render(
    <div>
      <h1>Detalle del Proyecto - Choco Inventa</h1>
      <div id="app" data-project-id={projectId}>
        <nav id="navbar"></nav>
        <main id="main-content">
          <div id="project-detail-container"></div>
        </main>
      </div>
    </div>
  );
});

// Documentation page
app.get('/docs', staticRenderer, (c) => {
  return c.render(
    <div>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="navbar bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-10 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">CODECTI Chocó</h1>
                  <p className="text-xs text-muted-foreground">Choco Inventa</p>
                </div>
              </div>
              <a href="/" className="btn btn-secondary">
                <i className="fas fa-home mr-2"></i>
                Volver al Inicio
              </a>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                <i className="fas fa-book text-primary mr-3"></i>
                Documentación de Choco Inventa
              </h1>
              
              <div className="prose max-w-none">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">¿Qué es Choco Inventa?</h2>
                <p className="text-gray-600 mb-6">
                  Choco Inventa es la plataforma de innovación y conocimiento de CODECTI Chocó, un sistema integral 
                  para la gestión de proyectos de Ciencia, Tecnología e Innovación en el departamento del Chocó, Colombia.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Funcionalidades Principales</h3>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li><strong>Gestión de Proyectos:</strong> Crear, editar y consultar proyectos de investigación</li>
                  <li><strong>Sistema de Usuarios:</strong> Registro y autenticación segura con roles diferenciados</li>
                  <li><strong>Búsqueda Avanzada:</strong> Filtros por título, responsable, estado y fechas</li>
                  <li><strong>Gestión de Documentos:</strong> Carga y descarga de archivos asociados a proyectos</li>
                  <li><strong>Dashboard Administrativo:</strong> Monitoreo del sistema y métricas en tiempo real</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Roles de Usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-primary mb-2">Investigador</h4>
                    <p className="text-sm text-gray-600">Puede crear y gestionar sus propios proyectos de investigación.</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-primary mb-2">Colaborador</h4>
                    <p className="text-sm text-gray-600">Puede colaborar en proyectos y acceder a funcionalidades extendidas.</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-primary mb-2">Administrador</h4>
                    <p className="text-sm text-gray-600">Acceso completo al sistema, incluyendo panel administrativo.</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Cómo Empezar</h3>
                <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
                  <li>Regístrate en la plataforma con tus datos institucionales</li>
                  <li>Verifica tu cuenta a través del email de confirmación</li>
                  <li>Inicia sesión con tus credenciales</li>
                  <li>Crea tu primer proyecto de investigación</li>
                  <li>Invita a colaboradores y gestiona documentos</li>
                </ol>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Soporte Técnico</h3>
                <p className="text-gray-600">
                  Para soporte técnico, reportar errores o solicitar nuevas funcionalidades, 
                  visita nuestra <a href="/soporte" className="text-primary hover:underline">página de soporte</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Support page  
app.get('/soporte', staticRenderer, (c) => {
  return c.render(
    <div>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="navbar bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" className="h-10 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">CODECTI Chocó</h1>
                  <p className="text-xs text-muted-foreground">Choco Inventa</p>
                </div>
              </div>
              <a href="/" className="btn btn-secondary">
                <i className="fas fa-home mr-2"></i>
                Volver al Inicio
              </a>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                <i className="fas fa-headset text-primary mr-3"></i>
                Centro de Soporte Choco Inventa
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    <i className="fas fa-question-circle mr-2"></i>
                    Preguntas Frecuentes
                  </h3>
                  <div className="space-y-3 text-blue-700">
                    <div>
                      <p className="font-medium">¿Cómo creo mi primer proyecto?</p>
                      <p className="text-sm">Después de iniciar sesión, haz clic en "Nuevo Proyecto" y completa el formulario.</p>
                    </div>
                    <div>
                      <p className="font-medium">¿Puedo colaborar con otros investigadores?</p>
                      <p className="text-sm">Sí, puedes invitar colaboradores a través del panel de gestión de proyectos.</p>
                    </div>
                    <div>
                      <p className="font-medium">¿Qué formatos de documentos acepta?</p>
                      <p className="text-sm">La plataforma acepta PDF, DOC, DOCX y otros formatos de documentos académicos.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">
                    <i className="fas fa-envelope mr-2"></i>
                    Contacto Directo
                  </h3>
                  <div className="space-y-3 text-green-700">
                    <div className="flex items-center">
                      <i className="fas fa-envelope text-green-600 mr-3"></i>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm">soporte@codecti.choco.gov.co</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-phone text-green-600 mr-3"></i>
                      <div>
                        <p className="font-medium">Teléfono</p>
                        <p className="text-sm">+57 (4) 671-2345</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-clock text-green-600 mr-3"></i>
                      <div>
                        <p className="font-medium">Horario de Atención</p>
                        <p className="text-sm">Lun - Vie: 8:00 AM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  <i className="fas fa-bug mr-2"></i>
                  Reportar un Problema
                </h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input type="text" className="form-input w-full" placeholder="Tu nombre completo" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" className="form-input w-full" placeholder="tu@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Problema</label>
                    <select className="form-input w-full">
                      <option>Selecciona el tipo de problema</option>
                      <option>Error técnico</option>
                      <option>Problema con cuenta</option>
                      <option>Dificultad para cargar documentos</option>
                      <option>Problema de navegación</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Problema</label>
                    <textarea rows={4} className="form-input w-full" placeholder="Describe detalladamente el problema que estás experimentando..."></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-paper-plane mr-2"></i>
                    Enviar Reporte
                  </button>
                </form>
              </div>

              <div className="text-center text-gray-600">
                <p>¿Necesitas ayuda con algo específico? No dudes en contactarnos.</p>
                <p className="mt-2">
                  <a href="/docs" className="text-primary hover:underline">Consulta nuestra documentación</a> 
                  para más información sobre el uso de la plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Public Portal Route - HU-08: Portal Público de Proyectos
app.get('/projects', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Proyectos CTeI - Choco Inventa | CODECTI</title>
        <meta name="description" content="Catálogo público de proyectos de investigación científica, tecnológica e innovación del Chocó. Explora las iniciativas que transforman nuestra región.">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  codecti: {
                    primary: '#2563eb',
                    secondary: '#1e40af',
                    accent: '#3b82f6',
                    success: '#059669',
                    warning: '#d97706',
                    danger: '#dc2626'
                  }
                }
              }
            }
          }
        </script>
    </head>
    <body class="bg-gray-50 font-sans">
        <div id="app">
            <!-- Public Navigation -->
            <nav class="navbar bg-white shadow-md border-b border-gray-200">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center py-4">
                        <div class="navbar-logo flex items-center">
                            <a href="/" class="flex items-center">
                                <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" class="h-12 mr-3">
                                <div>
                                    <div class="text-xl font-bold text-codecti-primary">Choco Inventa</div>
                                    <div class="text-sm text-gray-600">Portal Público CTeI</div>
                                </div>
                            </a>
                        </div>
                        <div class="nav-actions flex space-x-4">
                            <a href="/" class="btn btn-outline">
                                <i class="fas fa-home mr-1"></i>
                                Inicio
                            </a>
                            <a href="/projects" class="btn btn-primary">
                                <i class="fas fa-microscope mr-1"></i>
                                Proyectos CTeI
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <section class="bg-gradient-to-r from-codecti-primary to-codecti-secondary text-white py-16">
                <div class="container mx-auto px-4">
                    <div class="max-w-4xl mx-auto text-center">
                        <h1 class="text-4xl md:text-5xl font-bold mb-6">
                            <i class="fas fa-flask mr-3"></i>
                            Proyectos CTeI del Chocó
                        </h1>
                        <p class="text-xl md:text-2xl mb-8 opacity-90">
                            Explora las investigaciones y proyectos de innovación que transforman nuestra región
                        </p>
                        <div id="statsSection" class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                            <!-- Stats will be loaded dynamically -->
                        </div>
                    </div>
                </div>
            </section>

            <!-- Filters and Search Section -->
            <section class="bg-white shadow-sm py-8">
                <div class="container mx-auto px-4">
                    <div class="max-w-6xl mx-auto">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <!-- Search -->
                            <div class="md:col-span-2">
                                <div class="relative">
                                    <input 
                                        type="text" 
                                        id="searchInput" 
                                        placeholder="Buscar proyectos por título, responsable, institución..." 
                                        class="form-input w-full pl-10"
                                    >
                                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                            
                            <!-- Area Filter -->
                            <div>
                                <select id="areaFilter" class="form-input w-full">
                                    <option value="">Todas las áreas</option>
                                    <option value="Ciencias Naturales">Ciencias Naturales</option>
                                    <option value="Ingeniería y Tecnología">Ingeniería y Tecnología</option>
                                    <option value="Ciencias Médicas y de la Salud">Ciencias Médicas</option>
                                    <option value="Ciencias Agrícolas">Ciencias Agrícolas</option>
                                    <option value="Ciencias Sociales">Ciencias Sociales</option>
                                    <option value="Humanidades">Humanidades</option>
                                    <option value="Biotecnología">Biotecnología</option>
                                    <option value="Medio Ambiente">Medio Ambiente</option>
                                    <option value="Desarrollo Sostenible">Desarrollo Sostenible</option>
                                    <option value="Innovación Social">Innovación Social</option>
                                </select>
                            </div>
                            
                            <!-- Status Filter -->
                            <div>
                                <select id="statusFilter" class="form-input w-full">
                                    <option value="">Todos los estados</option>
                                    <option value="active">En Curso</option>
                                    <option value="completed">Completados</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Sort Options -->
                        <div class="flex justify-between items-center mb-6">
                            <div class="text-sm text-gray-600">
                                <span id="resultsCount">Cargando proyectos...</span>
                            </div>
                            <div class="flex items-center space-x-4">
                                <label class="text-sm text-gray-600">Ordenar por:</label>
                                <select id="sortSelect" class="form-input text-sm">
                                    <option value="created_at">Fecha (más recientes)</option>
                                    <option value="title">Título (A-Z)</option>
                                    <option value="budget">Presupuesto</option>
                                    <option value="start_date">Fecha inicio</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Projects Grid -->
            <section class="py-12">
                <div class="container mx-auto px-4">
                    <div class="max-w-6xl mx-auto">
                        <div id="loadingSpinner" class="text-center py-12">
                            <i class="fas fa-spinner fa-spin text-4xl text-codecti-primary mb-4"></i>
                            <p class="text-gray-600">Cargando proyectos...</p>
                        </div>
                        
                        <div id="projectsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
                            <!-- Projects will be loaded dynamically -->
                        </div>
                        
                        <div id="noResults" class="text-center py-12 hidden">
                            <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                            <h3 class="text-xl font-semibold text-gray-700 mb-2">No se encontraron proyectos</h3>
                            <p class="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                        
                        <!-- Pagination -->
                        <div id="pagination" class="flex justify-center mt-8 hidden">
                            <!-- Pagination buttons will be generated dynamically -->
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- Footer -->
        <footer class="footer bg-gray-800 text-white py-12 mt-16">
            <div class="container mx-auto px-4">
                <div class="footer-content grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="footer-brand">
                        <div class="footer-logo flex items-center mb-4">
                            <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" class="h-10 mr-3">
                            <div class="text-xl font-bold">Choco Inventa</div>
                        </div>
                        <p>CODECTI Chocó: Transformando la investigación científica con innovación y conocimiento</p>
                    </div>
                    <div class="footer-links">
                        <h4 class="font-semibold mb-4">Enlaces</h4>
                        <div class="space-y-2">
                            <a href="/" class="hover:text-codecti-accent">Inicio</a>
                            <a href="/projects" class="hover:text-codecti-accent">Proyectos CTeI</a>
                            <a href="/docs" class="hover:text-codecti-accent">Documentación</a>
                        </div>
                    </div>
                    <div class="footer-contact">
                        <h4 class="font-semibold mb-4">CODECTI Chocó</h4>
                        <p class="text-gray-300">Corporación para el Desarrollo de la Ciencia, la Tecnología y la Innovación del Chocó</p>
                    </div>
                </div>
                <div class="footer-bottom border-t border-gray-700 mt-8 pt-8 text-center">
                    <p>© 2025 CODECTI Chocó. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/logo-manager.js"></script>
        <script src="/static/public-projects.js"></script>
    </body>
    </html>
  `);
});

// HU-15: CTeI Indicators Dashboard Route
app.get('/indicadores', (c) => {
  return c.render(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Indicadores CTeI - Dashboard Ejecutivo - CODECTI Chocó</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        
        <!-- Chart.js for advanced visualizations -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js"></script>
        
        <!-- Tailwind Config -->
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            'codecti-primary': '#2563eb',
                            'codecti-secondary': '#10b981', 
                            'codecti-accent': '#f59e0b'
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="bg-gray-50 font-sans">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b sticky top-0 z-40">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center">
                        <a href="/" class="flex items-center">
                            <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" class="h-10 mr-3" />
                            <div>
                                <div class="font-bold text-xl text-codecti-primary">Dashboard CTeI</div>
                                <div class="text-xs text-gray-600">Indicadores Ejecutivos</div>
                            </div>
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="/portal" class="text-gray-600 hover:text-codecti-primary transition-colors">Portal de Proyectos</a>
                        <a href="/publicaciones" class="text-gray-600 hover:text-codecti-primary transition-colors">Repositorio</a>
                        <a href="/noticias" class="text-gray-600 hover:text-codecti-primary transition-colors">Noticias</a>
                        <a href="/eventos" class="text-gray-600 hover:text-codecti-primary transition-colors">Eventos</a>
                        <a href="/recursos" class="text-gray-600 hover:text-codecti-primary transition-colors">Recursos</a>
                        <div class="border-l border-gray-200 pl-4 ml-4">
                            <a href="/admin" class="bg-codecti-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-cog mr-2"></i>Admin
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Dashboard Container -->
        <div class="min-h-screen bg-gray-50">
            <div class="container mx-auto px-4 py-8">
                <!-- Dashboard Content -->
                <div id="ctei-dashboard-container">
                    <!-- Loading State -->
                    <div class="flex items-center justify-center py-20">
                        <div class="text-center">
                            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-codecti-primary mx-auto mb-4"></div>
                            <h2 class="text-xl font-semibold text-gray-700 mb-2">Cargando Dashboard de Indicadores CTeI</h2>
                            <p class="text-gray-500">Generando métricas y visualizaciones ejecutivas...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-12">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div class="flex items-center mb-4">
                            <img src="/static/logo-choco-inventa.png" alt="Choco Inventa" class="h-10 mr-3">
                            <div class="text-xl font-bold">Choco Inventa</div>
                        </div>
                        <p class="text-gray-300">Sistema de Indicadores de Ciencia, Tecnología e Innovación para el desarrollo sostenible del Chocó</p>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-4">Plataforma CTeI</h4>
                        <div class="space-y-2">
                            <a href="/portal" class="block text-gray-300 hover:text-codecti-accent transition-colors">Portal de Proyectos</a>
                            <a href="/publicaciones" class="block text-gray-300 hover:text-codecti-accent transition-colors">Repositorio Científico</a>
                            <a href="/indicadores" class="block text-gray-300 hover:text-codecti-accent transition-colors">Dashboard Ejecutivo</a>
                            <a href="/admin" class="block text-gray-300 hover:text-codecti-accent transition-colors">Panel de Administración</a>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-4">CODECTI Chocó</h4>
                        <p class="text-gray-300">Corporación para el Desarrollo de la Ciencia, la Tecnología y la Innovación del Chocó</p>
                        <div class="mt-4 flex space-x-4">
                            <a href="#" class="text-gray-300 hover:text-codecti-accent transition-colors">
                                <i class="fab fa-twitter text-xl"></i>
                            </a>
                            <a href="#" class="text-gray-300 hover:text-codecti-accent transition-colors">
                                <i class="fab fa-linkedin text-xl"></i>
                            </a>
                            <a href="#" class="text-gray-300 hover:text-codecti-accent transition-colors">
                                <i class="fab fa-facebook text-xl"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p class="text-gray-300">© 2024 CODECTI Chocó. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/ctei-dashboard.js"></script>
    </body>
    </html>
  `);
});

export default app;
