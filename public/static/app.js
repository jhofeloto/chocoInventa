// CODECTI Platform - Frontend Application

// Global application state
const App = {
  user: null,
  token: localStorage.getItem('codecti_token'),
  currentPath: window.location.pathname,
  projects: [],
  
  // Initialize the application
  init() {
    this.setupAxiosDefaults();
    this.checkAuthentication();
    this.setupEventListeners();
    this.routeHandler();
  },

  // Setup Axios defaults
  setupAxiosDefaults() {
    axios.defaults.baseURL = '/api';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }

    // Add response interceptor for error handling
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  },

  // Check if user is authenticated
  async checkAuthentication() {
    if (!this.token) {
      if (this.currentPath !== '/') {
        window.location.href = '/';
      }
      return;
    }

    try {
      const response = await axios.post('/auth/verify');
      if (response.data.success) {
        this.user = response.data.user;
        if (this.currentPath === '/') {
          window.location.href = '/dashboard';
        }
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.logout();
    }
  },

  // Handle routing based on current path
  routeHandler() {
    switch (this.currentPath) {
      case '/':
        this.renderLandingPage();
        break;
      case '/dashboard':
        this.renderDashboard();
        break;
      case '/admin':
        this.renderAdminDashboard();
        break;
      default:
        if (this.currentPath.startsWith('/project/')) {
          const projectId = this.currentPath.split('/')[2];
          this.renderProjectDetail(projectId);
        }
    }
  },

  // Setup global event listeners
  setupEventListeners() {
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.currentPath = window.location.pathname;
      this.routeHandler();
    });

    // Global error handling
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.showNotification('Ha ocurrido un error inesperado', 'error');
    });

    // Handle escape key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAllModals();
      }
    });
  },

  // Authentication methods
  async login(email, password) {
    try {
      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data.success) {
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('codecti_token', this.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        
        this.showNotification('Inicio de sesión exitoso', 'success');
        window.location.href = '/dashboard';
      } else {
        this.showNotification(response.data.message || 'Error de autenticación', 'error');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error de conexión';
      this.showNotification(message, 'error');
    }
  },

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('codecti_token');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/';
  },

  // Projects methods
  async loadProjects(search = '') {
    try {
      const response = await axios.get(`/projects?search=${encodeURIComponent(search)}`);
      if (response.data.success) {
        this.projects = response.data.projects;
        return this.projects;
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this.showNotification('Error al cargar proyectos', 'error');
    }
    return [];
  },

  async loadProject(id) {
    try {
      const response = await axios.get(`/projects/${id}`);
      if (response.data.success) {
        return response.data.project;
      }
    } catch (error) {
      console.error('Error loading project:', error);
      this.showNotification('Error al cargar el proyecto', 'error');
    }
    return null;
  },

  async createProject(projectData) {
    try {
      const response = await axios.post('/projects', projectData);
      if (response.data.success) {
        this.showNotification('Proyecto creado exitosamente', 'success');
        return response.data.project;
      } else {
        this.showNotification(response.data.message || 'Error al crear proyecto', 'error');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear proyecto';
      this.showNotification(message, 'error');
    }
    return null;
  },

  async uploadDocument(projectId, file) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await axios.post(`/projects/${projectId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        this.showNotification('Documento subido exitosamente', 'success');
        return response.data;
      } else {
        this.showNotification(response.data.message || 'Error al subir documento', 'error');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al subir documento';
      this.showNotification(message, 'error');
    }
    return null;
  },

  // UI Rendering methods
  renderLandingPage() {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      this.setupLandingPageEventListeners();
      this.setupModalHandlers();
      this.setupFloatingAnimations();
    }, 100);
  },

  setupLandingPageEventListeners() {
    // Use event delegation for better reliability
    document.body.addEventListener('click', (e) => {
      // CTA Buttons
      if (e.target.matches('#ctaRegister, #ctaRegisterMain')) {
        e.preventDefault();
        this.showRegisterModal();
        return;
      }

      // Learn More button
      if (e.target.matches('#learnMore')) {
        e.preventDefault();
        const featuresSection = document.querySelector('.features-section');
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      // Navigation buttons
      if (e.target.matches('#showLoginModal')) {
        e.preventDefault();
        this.showLoginModal();
        return;
      }

      if (e.target.matches('#showRegisterModal')) {
        e.preventDefault();
        this.showRegisterModal();
        return;
      }

      // Modal close buttons
      if (e.target.matches('#closeLoginModal')) {
        e.preventDefault();
        this.hideModal('loginModal');
        return;
      }

      if (e.target.matches('#closeRegisterModal')) {
        e.preventDefault();
        this.hideModal('registerModal');
        return;
      }

      // Switch between modals
      if (e.target.matches('#switchToRegister')) {
        e.preventDefault();
        this.hideModal('loginModal');
        setTimeout(() => this.showRegisterModal(), 150);
        return;
      }

      if (e.target.matches('#switchToLogin')) {
        e.preventDefault();
        this.hideModal('registerModal');
        setTimeout(() => this.showLoginModal(), 150);
        return;
      }

      // Close modals when clicking outside
      if (e.target.matches('#loginModal, #registerModal')) {
        this.hideModal(e.target.id);
        return;
      }
    });
  },

  setupModalHandlers() {
    // Use event delegation for form submissions
    document.body.addEventListener('submit', async (e) => {
      // Login form handler
      if (e.target.matches('#loginForm')) {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;
        
        if (email && password) {
          await this.login(email, password);
        } else {
          this.showNotification('Por favor completa todos los campos', 'error');
        }
        return;
      }

      // Register form handler
      if (e.target.matches('#registerForm')) {
        e.preventDefault();
        const formData = {
          name: document.getElementById('registerName')?.value,
          email: document.getElementById('registerEmail')?.value,
          institution: document.getElementById('registerInstitution')?.value,
          password: document.getElementById('registerPassword')?.value,
          confirmPassword: document.getElementById('registerConfirmPassword')?.value
        };
        
        if (this.validateRegisterForm(formData)) {
          await this.register(formData);
        }
        return;
      }
    });
  },

  setupFloatingAnimations() {
    // Add floating animation to hero cards using CSS animations instead of JS
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
      // The floating animations are now handled by CSS
      // Just add a small random delay for variety
      card.style.animationDelay = `${index * 0.5}s`;
    });
  },

  showLoginModal() {
    this.hideAllModals();
    setTimeout(() => {
      const modal = document.getElementById('loginModal');
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus on first input
        const firstInput = modal.querySelector('input[type="email"]');
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 100);
        }
      }
    }, 50);
  },

  showRegisterModal() {
    this.hideAllModals();
    setTimeout(() => {
      const modal = document.getElementById('registerModal');
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus on first input
        const firstInput = modal.querySelector('input[type="text"]');
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 100);
        }
      }
    }, 50);
  },

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      // Clear form data
      const form = modal.querySelector('form');
      if (form) {
        form.reset();
      }
    }
  },

  hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  },

  validateRegisterForm(data) {
    // Check for missing fields
    if (!data.name || !data.email || !data.institution || !data.password || !data.confirmPassword) {
      this.showNotification('Por favor completa todos los campos', 'error');
      return false;
    }

    // Validate name length
    if (data.name.length < 2) {
      this.showNotification('El nombre debe tener al menos 2 caracteres', 'error');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      this.showNotification('Por favor ingresa un email válido', 'error');
      return false;
    }

    // Validate institution length
    if (data.institution.length < 2) {
      this.showNotification('El nombre de la institución debe tener al menos 2 caracteres', 'error');
      return false;
    }

    // Validate password strength
    if (data.password.length < 6) {
      this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }

    // Check password confirmation
    if (data.password !== data.confirmPassword) {
      this.showNotification('Las contraseñas no coinciden', 'error');
      return false;
    }

    // Check terms acceptance
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    if (!agreeTermsCheckbox || !agreeTermsCheckbox.checked) {
      this.showNotification('Debes aceptar los términos y condiciones', 'error');
      return false;
    }

    return true;
  },

  async register(userData) {
    try {
      const response = await axios.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        institution: userData.institution,
        password: userData.password
      });

      if (response.data.success) {
        this.showNotification('Cuenta creada exitosamente', 'success');
        this.hideModal('registerModal');
        
        // Auto-login after successful registration
        await this.login(userData.email, userData.password);
      } else {
        this.showNotification(response.data.message || 'Error al crear la cuenta', 'error');
      }
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Error al crear la cuenta';
      this.showNotification(message, 'error');
    }
  },

  renderDashboard() {
    this.renderNavbar();
    this.renderProjectsList();
  },

  renderNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    navbar.innerHTML = `
      <nav class="navbar">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-white">
                <i class="fas fa-microscope mr-2"></i>
                CODECTI Platform
              </h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-white text-sm">
                <i class="fas fa-user mr-1"></i>
                ${this.user?.name || 'Usuario'}
              </span>
              ${this.user?.role === 'admin' ? `
                <a 
                  href="/admin" 
                  onclick="App.navigateToAdmin(); return false;"
                  class="text-white hover:text-gray-200 text-sm"
                >
                  <i class="fas fa-cogs mr-1"></i>
                  Admin
                </a>
              ` : ''}
              <button 
                onclick="App.logout()" 
                class="text-white hover:text-gray-200 text-sm"
              >
                <i class="fas fa-sign-out-alt mr-1"></i>
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>
    `;
  },

  async renderProjectsList() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">
            <i class="fas fa-folder-open mr-2 text-codecti-primary"></i>
            Proyectos CTeI
          </h2>
          <button 
            onclick="App.showCreateProjectModal()" 
            class="btn btn-primary"
          >
            <i class="fas fa-plus mr-2"></i>
            Nuevo Proyecto
          </button>
        </div>
        
        <div class="search-container mb-6">
          <div class="relative">
            <input 
              type="text" 
              id="searchInput" 
              class="search-input" 
              placeholder="Buscar proyectos..."
            >
            <i class="fas fa-search search-icon"></i>
          </div>
        </div>
        
        <div id="projectsList" class="loading">
          <div class="space-y-4">
            ${Array(3).fill(0).map(() => `
              <div class="card p-6 animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div class="h-3 bg-gray-200 rounded mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Load projects
    await this.loadProjects();
    this.displayProjects();

    // Setup search
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        await this.loadProjects(e.target.value);
        this.displayProjects();
      }, 300);
    });
  },

  displayProjects() {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

    if (this.projects.length === 0) {
      projectsList.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-xl font-medium text-gray-900 mb-2">No hay proyectos</h3>
          <p class="text-gray-500">Crea tu primer proyecto para comenzar</p>
        </div>
      `;
      return;
    }

    const projectsHTML = this.projects.map(project => `
      <div class="project-item fade-in" onclick="App.navigateToProject(${project.id})">
        <div class="flex justify-between items-start mb-2">
          <h3 class="project-title">${this.escapeHtml(project.title)}</h3>
          <span class="status-badge ${project.status === 'active' ? 'status-active' : 'status-completed'}">
            <i class="fas fa-circle text-xs mr-1"></i>
            ${project.status === 'active' ? 'Activo' : 'Finalizado'}
          </span>
        </div>
        <p class="project-responsible">
          <i class="fas fa-user text-gray-400 mr-1"></i>
          <strong>Responsable:</strong> ${this.escapeHtml(project.responsible_person)}
        </p>
        <p class="project-summary">${this.escapeHtml(project.summary)}</p>
        <div class="project-meta">
          <span>
            <i class="fas fa-calendar text-gray-400 mr-1"></i>
            ${this.formatDate(project.created_at)}
          </span>
          <span>
            <i class="fas fa-user text-gray-400 mr-1"></i>
            ${this.escapeHtml(project.creator_name || 'Usuario')}
          </span>
          ${project.document_filename ? `
            <span class="text-codecti-primary">
              <i class="fas fa-file-alt mr-1"></i>
              Documento disponible
            </span>
          ` : ''}
        </div>
      </div>
    `).join('');

    projectsList.innerHTML = `<div class="project-list">${projectsHTML}</div>`;
  },

  async renderProjectDetail(projectId) {
    this.renderNavbar();
    
    const container = document.getElementById('project-detail-container');
    if (!container) return;

    // Show loading
    container.innerHTML = `
      <div class="max-w-4xl mx-auto p-6">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div class="card p-6">
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    `;

    const project = await this.loadProject(projectId);
    if (!project) {
      container.innerHTML = `
        <div class="max-w-4xl mx-auto p-6 text-center">
          <i class="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Proyecto no encontrado</h2>
          <p class="text-gray-500 mb-4">El proyecto solicitado no existe o no tienes permisos para verlo.</p>
          <button onclick="window.history.back()" class="btn btn-primary">
            <i class="fas fa-arrow-left mr-2"></i>
            Volver
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="max-w-4xl mx-auto p-6">
        <div class="mb-6">
          <button onclick="App.navigateToDashboard()" class="text-codecti-primary hover:text-codecti-secondary mb-4">
            <i class="fas fa-arrow-left mr-2"></i>
            Volver a proyectos
          </button>
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">${this.escapeHtml(project.title)}</h1>
              <div class="flex items-center space-x-4 text-gray-600">
                <span class="status-badge ${project.status === 'active' ? 'status-active' : 'status-completed'}">
                  <i class="fas fa-circle text-xs mr-1"></i>
                  ${project.status === 'active' ? 'Activo' : 'Finalizado'}
                </span>
                <span>
                  <i class="fas fa-calendar mr-1"></i>
                  ${this.formatDate(project.created_at)}
                </span>
              </div>
            </div>
            ${(this.user.role === 'admin' || project.created_by === this.user.id) ? `
              <button onclick="App.showUploadDocumentModal(${project.id})" class="btn btn-primary">
                <i class="fas fa-upload mr-2"></i>
                Subir Documento
              </button>
            ` : ''}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <div class="card p-6 mb-6">
              <h2 class="text-xl font-semibold mb-4">
                <i class="fas fa-info-circle text-codecti-primary mr-2"></i>
                Información del Proyecto
              </h2>
              <div class="space-y-4">
                <div>
                  <label class="form-label">Responsable</label>
                  <p class="text-gray-900">${this.escapeHtml(project.responsible_person)}</p>
                </div>
                <div>
                  <label class="form-label">Resumen</label>
                  <p class="text-gray-700 whitespace-pre-wrap">${this.escapeHtml(project.summary)}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="card p-6">
              <h3 class="text-lg font-semibold mb-4">
                <i class="fas fa-file-alt text-codecti-primary mr-2"></i>
                Documentos
              </h3>
              ${project.document_filename ? `
                <div class="border rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-900 text-sm">${this.escapeHtml(project.document_filename)}</p>
                      <p class="text-gray-500 text-xs">
                        ${this.formatFileSize(project.document_size || 0)}
                      </p>
                    </div>
                    <a 
                      href="/api/projects/${project.id}/download" 
                      class="btn btn-primary btn-sm"
                      download
                    >
                      <i class="fas fa-download mr-1"></i>
                      Descargar
                    </a>
                  </div>
                </div>
              ` : `
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-file-plus text-3xl mb-2"></i>
                  <p>No hay documentos adjuntos</p>
                </div>
              `}
            </div>

            <div class="card p-6 mt-6">
              <h3 class="text-lg font-semibold mb-4">
                <i class="fas fa-users text-codecti-primary mr-2"></i>
                Colaboradores
              </h3>
              <div class="space-y-2">
                <div class="flex items-center">
                  <i class="fas fa-user-circle text-gray-400 mr-2"></i>
                  <span class="text-sm">${this.escapeHtml(project.creator_name || 'Usuario')}</span>
                  <span class="ml-2 text-xs text-gray-500">(Creador)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Modal methods
  showCreateProjectModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Crear Nuevo Proyecto</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form id="createProjectForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="form-label">Título del Proyecto *</label>
              <input type="text" name="title" class="form-input" required>
            </div>
            <div>
              <label class="form-label">Responsable *</label>
              <input type="text" name="responsible_person" class="form-input" required>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="form-label">Estado *</label>
            <select name="status" class="form-select" required>
              <option value="">Seleccionar estado</option>
              <option value="active">Activo</option>
              <option value="completed">Finalizado</option>
            </select>
          </div>
          
          <div class="mb-6">
            <label class="form-label">Resumen *</label>
            <textarea name="summary" rows="4" class="form-textarea" required placeholder="Describe brevemente el proyecto..."></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" onclick="this.closest('.fixed').remove()" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save mr-2"></i>
              Crear Proyecto
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('createProjectForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const projectData = Object.fromEntries(formData);
      
      const project = await this.createProject(projectData);
      if (project) {
        modal.remove();
        this.navigateToProject(project.id);
      }
    });
  },

  showUploadDocumentModal(projectId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Subir Documento</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form id="uploadForm">
          <div class="mb-4">
            <label class="form-label">Seleccionar archivo</label>
            <div class="file-upload-area" id="dropZone">
              <input type="file" id="fileInput" name="document" accept=".pdf,.docx,.doc" class="hidden">
              <div class="text-center">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                <p class="text-gray-600">Arrastra un archivo aquí o <span class="text-codecti-primary cursor-pointer">haz clic para seleccionar</span></p>
                <p class="text-xs text-gray-500 mt-2">PDF, DOCX (máx. 10MB)</p>
              </div>
            </div>
            <div id="fileInfo" class="mt-2 hidden">
              <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span id="fileName" class="text-sm text-gray-700"></span>
                <button type="button" onclick="App.clearFile()" class="text-red-500 hover:text-red-700">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" onclick="this.closest('.fixed').remove()" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" disabled id="uploadBtn">
              <i class="fas fa-upload mr-2"></i>
              Subir Archivo
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup file upload functionality
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const uploadBtn = document.getElementById('uploadBtn');

    // Click to select file
    dropZone.addEventListener('click', () => fileInput.click());

    // File selection
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFileSelect(file, fileInfo, fileName, uploadBtn);
      }
    });

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        this.handleFileSelect(file, fileInfo, fileName, uploadBtn);
      }
    });

    // Form submission
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = fileInput.files[0];
      if (file) {
        const result = await this.uploadDocument(projectId, file);
        if (result) {
          modal.remove();
          // Reload current page to show updated document
          window.location.reload();
        }
      }
    });
  },

  handleFileSelect(file, fileInfo, fileName, uploadBtn) {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      this.showNotification('Tipo de archivo no permitido. Solo PDF y DOCX.', 'error');
      return;
    }

    if (file.size > maxSize) {
      this.showNotification('El archivo es demasiado grande. Máximo 10MB.', 'error');
      return;
    }

    fileName.textContent = file.name;
    fileInfo.classList.remove('hidden');
    uploadBtn.disabled = false;
  },

  clearFile() {
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const uploadBtn = document.getElementById('uploadBtn');
    
    fileInput.value = '';
    fileInfo.classList.add('hidden');
    uploadBtn.disabled = true;
  },

  // Navigation methods
  navigateToProject(projectId) {
    window.history.pushState({}, '', `/project/${projectId}`);
    this.currentPath = `/project/${projectId}`;
    this.renderProjectDetail(projectId);
  },

  navigateToDashboard() {
    window.history.pushState({}, '', '/dashboard');
    this.currentPath = '/dashboard';
    this.renderDashboard();
  },

  navigateToAdmin() {
    if (this.user?.role !== 'admin') {
      this.showNotification('Acceso denegado. Se requieren privilegios de administrador.', 'error');
      return;
    }
    window.history.pushState({}, '', '/admin');
    this.currentPath = '/admin';
    this.renderAdminDashboard();
  },

  renderAdminDashboard() {
    this.renderNavbar();
    
    // Load and initialize admin dashboard
    if (typeof AdminDashboard !== 'undefined') {
      AdminDashboard.init();
    } else {
      // Load admin dashboard script if not already loaded
      const script = document.createElement('script');
      script.src = '/static/admin-dashboard.js';
      script.onload = () => {
        if (typeof AdminDashboard !== 'undefined') {
          AdminDashboard.init();
        }
      };
      document.head.appendChild(script);
    }
  },

  // Utility methods
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 fade-in ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${
          type === 'success' ? 'fa-check-circle' :
          type === 'error' ? 'fa-exclamation-circle' :
          type === 'warning' ? 'fa-exclamation-triangle' :
          'fa-info-circle'
        } mr-2"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-current opacity-70 hover:opacity-100">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  },

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  App.init();
  
  // Debug: Check if buttons exist after DOM is loaded
  setTimeout(() => {
    const buttons = [
      'showLoginModal',
      'showRegisterModal', 
      'ctaRegister',
      'ctaRegisterMain',
      'learnMore'
    ];
    
    buttons.forEach(id => {
      const element = document.getElementById(id);
      console.log(`Button ${id}:`, element ? 'Found' : 'Not found');
    });
  }, 500);
});

// Global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
  App.showNotification('Ha ocurrido un error inesperado', 'error');
  return false;
};