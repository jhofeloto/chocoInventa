import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { renderer } from './renderer';
import type { Bindings } from './types';
import { auth } from './routes/auth';
import projects from './routes/projects';
import monitoring from './routes/monitoring';
import { loggingMiddleware, logger } from './monitoring/logger';
import { errorHandlerMiddleware } from './monitoring/errorHandler';
import { performanceMiddleware, performanceMonitor } from './monitoring/performance';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for frontend-backend communication
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// Use the renderer middleware
app.use(renderer);

// Add monitoring middleware
app.use('*', performanceMiddleware(performanceMonitor));
app.use('*', loggingMiddleware(logger));
app.use('*', errorHandlerMiddleware());

// API Routes
app.route('/api/auth', auth);
app.route('/api/projects', projects);
app.route('/api/monitoring', monitoring);

// Main application routes
app.get('/', (c) => {
  return c.render(
    <div>
      <h1>Plataforma CTeI CODECTI</h1>
      <div id="app">
        <div className="login-container">
          <h2>Iniciar Sesión</h2>
          <form id="loginForm">
            <input type="email" id="email" placeholder="Correo electrónico" required />
            <input type="password" id="password" placeholder="Contraseña" required />
            <button type="submit">Iniciar Sesión</button>
          </form>
        </div>
      </div>
    </div>
  );
});

app.get('/dashboard', (c) => {
  return c.render(
    <div>
      <h1>Dashboard - Plataforma CTeI CODECTI</h1>
      <div id="app">
        <nav id="navbar"></nav>
        <main id="main-content">
          <div id="projects-container"></div>
        </main>
      </div>
    </div>
  );
});

app.get('/admin', (c) => {
  return c.render(
    <div>
      <h1>Panel de Administración - CODECTI</h1>
      <div id="app" data-page="admin">
        <nav id="navbar"></nav>
        <main id="main-content">
          <div id="admin-dashboard-container">
            <div class="max-w-7xl mx-auto p-6 space-y-6">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Panel de Administración</h2>
                <div class="flex space-x-2">
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
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="card p-6">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Logs Recientes</h3>
                    <div class="flex space-x-2">
                      <select id="logLevelFilter" class="text-sm border rounded px-2 py-1">
                        <option value="">Todos los niveles</option>
                        <option value="ERROR">Error</option>
                        <option value="WARN">Warning</option>
                        <option value="INFO">Info</option>
                        <option value="DEBUG">Debug</option>
                      </select>
                      <button id="exportLogsJson" class="btn btn-secondary btn-sm">JSON</button>
                      <button id="exportLogsCsv" class="btn btn-secondary btn-sm">CSV</button>
                      <button id="cleanupLogs" class="btn btn-warning btn-sm">Limpiar</button>
                    </div>
                  </div>
                  <div class="mb-3">
                    <input 
                      type="text" 
                      id="logSearch" 
                      placeholder="Buscar en logs..." 
                      class="form-input w-full text-sm"
                    />
                  </div>
                  <div id="recentLogs" class="max-h-96 overflow-y-auto">
                    <div class="text-center py-8 text-gray-500">Cargando logs...</div>
                  </div>
                </div>
                
                <div class="card p-6">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Errores Recientes</h3>
                    <div class="flex space-x-2">
                      <select id="errorSeverityFilter" class="text-sm border rounded px-2 py-1">
                        <option value="">Todas las severidades</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <button id="cleanupErrors" class="btn btn-warning btn-sm">Limpiar</button>
                    </div>
                  </div>
                  <div class="mb-3">
                    <input 
                      type="text" 
                      id="errorSearch" 
                      placeholder="Buscar errores..." 
                      class="form-input w-full text-sm"
                    />
                  </div>
                  <div id="recentErrors" class="max-h-96 overflow-y-auto">
                    <div class="text-center py-8 text-gray-500">Cargando errores...</div>
                  </div>
                </div>
              </div>
              
              <div class="card p-6">
                <h3 class="text-lg font-semibold mb-4">Herramientas de Administración</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button id="generateTestLoad" class="btn btn-secondary">
                    <i class="fas fa-vial mr-2"></i>
                    Generar Datos de Prueba
                  </button>
                  <a href="/api/monitoring/health" target="_blank" class="btn btn-secondary text-center">
                    <i class="fas fa-external-link-alt mr-2"></i>
                    Health Check Público
                  </a>
                  <a href="#" onclick="window.print()" class="btn btn-secondary">
                    <i class="fas fa-print mr-2"></i>
                    Imprimir Reporte
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

app.get('/project/:id', (c) => {
  const projectId = c.req.param('id');
  return c.render(
    <div>
      <h1>Detalle del Proyecto - Plataforma CTeI CODECTI</h1>
      <div id="app" data-project-id={projectId}>
        <nav id="navbar"></nav>
        <main id="main-content">
          <div id="project-detail-container"></div>
        </main>
      </div>
    </div>
  );
});

export default app;
