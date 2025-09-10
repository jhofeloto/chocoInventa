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
import { loggingMiddleware, logger } from './monitoring/logger';
import { systemLoggingMiddleware, systemLogger } from './monitoring/systemLogger';
import systemLogs from './routes/systemLogs';
import { errorHandlerMiddleware } from './monitoring/errorHandler';
import { performanceMiddleware, performanceMonitor } from './monitoring/performance';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for frontend-backend communication
app.use('/api/*', cors());

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
app.route('/api/monitoring', monitoring);
app.route('/api/system-logs', systemLogs); // Nueva ruta para logs del sistema
app.route('/api/settings', settings);

// Public API Routes (No authentication required) - HU-08: Portal Público
app.route('/api/public', publicRoutes);

// Public API Routes (No authentication required) - HU-08: Portal Público
import publicRoutes from './routes/public';
app.route('/api/public', publicRoutes);

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
                Portal Público
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
      <h1>Dashboard - Choco Inventa CODECTI</h1>
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
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <button id="configureLogoButton" class="btn btn-primary">
                    <i class="fas fa-image mr-2"></i>
                    Configurar Logo
                  </button>
                  <button id="openSystemLogs" class="btn btn-info">
                    <i class="fas fa-chart-line mr-2"></i>
                    Sistema de Logs
                  </button>
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

export default app;
