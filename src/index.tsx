import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { renderer } from './renderer';
import type { Bindings } from './types';
import { auth } from './routes/auth';
import projects from './routes/projects';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for frontend-backend communication
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// Use the renderer middleware
app.use(renderer);

// API Routes
app.route('/api/auth', auth);
app.route('/api/projects', projects);

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
