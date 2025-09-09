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

// Main application routes - Landing Page
app.get('/', (c) => {
  return c.render(
    <div>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="logo-container">
              <h1 className="text-xl font-bold">CODECTI</h1>
              <span className="text-sm text-muted">Plataforma CTeI</span>
            </div>
            <div className="nav-actions">
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
                  Transformando la <span className="text-gradient">Investigación Científica</span> con Tecnología
                </h1>
                <p className="hero-description">
                  CODECTI es la plataforma líder para gestionar proyectos de Ciencia, Tecnología e Innovación (CTeI). 
                  Potencia tu investigación con herramientas avanzadas de gestión, colaboración y análisis de datos.
                </p>
                <div className="hero-actions">
                  <button id="ctaRegister" className="btn btn-primary btn-lg">
                    <i className="fas fa-rocket mr-2"></i>
                    Comenzar Ahora
                  </button>
                  <button id="learnMore" className="btn btn-outline btn-lg">
                    <i className="fas fa-play-circle mr-2"></i>
                    Ver Demo
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
        <section className="features-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="section-title">Herramientas Poderosas para la Investigación</h2>
              <p className="section-description">
                Descubre cómo CODECTI revoluciona la gestión de proyectos científicos
              </p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-project-diagram"></i>
                </div>
                <h3>Gestión Integral de Proyectos</h3>
                <p>Planifica, ejecuta y monitorea tus proyectos CTeI con metodologías probadas y herramientas colaborativas.</p>
                <ul className="feature-list">
                  <li>Timeline interactivo</li>
                  <li>Asignación de recursos</li>
                  <li>Seguimiento de hitos</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-analytics"></i>
                </div>
                <h3>Analytics y Reportes</h3>
                <p>Visualiza el progreso de tus proyectos con dashboards intuitivos y reportes automatizados en tiempo real.</p>
                <ul className="feature-list">
                  <li>Métricas personalizadas</li>
                  <li>Reportes automáticos</li>
                  <li>Análisis predictivo</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>Seguridad Avanzada</h3>
                <p>Protege tu investigación con encriptación de nivel empresarial y controles de acceso granulares.</p>
                <ul className="feature-list">
                  <li>Encriptación end-to-end</li>
                  <li>Control de acceso por roles</li>
                  <li>Auditoría completa</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-cloud-sync-alt"></i>
                </div>
                <h3>Integración en la Nube</h3>
                <p>Accede a tus proyectos desde cualquier lugar con sincronización en tiempo real y backups automáticos.</p>
                <ul className="feature-list">
                  <li>Acceso global 24/7</li>
                  <li>Sync automático</li>
                  <li>Backup redundante</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container mx-auto px-4">
            <div className="cta-content">
              <h2 className="cta-title">
                ¿Listo para Revolucionar tu Investigación?
              </h2>
              <p className="cta-description">
                Únete a miles de investigadores que ya confían en CODECTI para gestionar sus proyectos CTeI
              </p>
              <div className="cta-actions">
                <button id="ctaRegisterMain" className="btn btn-primary btn-xl">
                  <i className="fas fa-user-plus mr-2"></i>
                  Crear Cuenta Gratis
                </button>
                <p className="cta-note">
                  <i className="fas fa-check-circle mr-1"></i>
                  Sin tarjeta de crédito • 30 días gratis • Soporte incluido
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container mx-auto px-4">
            <div className="footer-content">
              <div className="footer-brand">
                <h3>CODECTI</h3>
                <p>Transformando la investigación científica con tecnología de vanguardia</p>
              </div>
              <div className="footer-links">
                <div className="footer-column">
                  <h4>Plataforma</h4>
                  <a href="#features">Características</a>
                  <a href="#pricing">Precios</a>
                  <a href="#demo">Demo</a>
                </div>
                <div className="footer-column">
                  <h4>Recursos</h4>
                  <a href="#help">Centro de Ayuda</a>
                  <a href="#docs">Documentación</a>
                  <a href="#api">API</a>
                </div>
                <div className="footer-column">
                  <h4>Contacto</h4>
                  <a href="#support">Soporte</a>
                  <a href="#contact">Contactanos</a>
                  <a href="#about">Acerca de</a>
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
                  <input type="email" id="loginEmail" className="form-input" placeholder="tu@email.com" required />
                </div>
                <div className="form-group">
                  <label for="loginPassword">Contraseña</label>
                  <input type="password" id="loginPassword" className="form-input" placeholder="••••••••" required />
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
                  <input type="text" id="registerName" className="form-input" placeholder="Tu nombre" required />
                </div>
                <div className="form-group">
                  <label for="registerEmail">Correo Electrónico</label>
                  <input type="email" id="registerEmail" className="form-input" placeholder="tu@email.com" required />
                </div>
                <div className="form-group">
                  <label for="registerInstitution">Institución</label>
                  <input type="text" id="registerInstitution" className="form-input" placeholder="Universidad o empresa" required />
                </div>
                <div className="form-group">
                  <label for="registerPassword">Contraseña</label>
                  <input type="password" id="registerPassword" className="form-input" placeholder="••••••••" required />
                </div>
                <div className="form-group">
                  <label for="registerConfirmPassword">Confirmar Contraseña</label>
                  <input type="password" id="registerConfirmPassword" className="form-input" placeholder="••••••••" required />
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
