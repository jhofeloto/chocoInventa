// CODECTI Platform - Roles and Permissions Manager
// Comprehensive role-based access control management system

const RolesManager = {
  roles: [],
  permissions: [],
  userRoles: [],
  currentRole: null,
  editingRole: null,

  // Initialize roles manager
  init() {
    console.log('Initializing Roles Manager...');
    this.setupEventListeners();
    this.loadRoles();
    this.loadPermissions();
    this.loadUserRoles();
  },

  // Setup event listeners
  setupEventListeners() {
    // Role management buttons
    const createRoleBtn = document.getElementById('createRole');
    if (createRoleBtn) {
      createRoleBtn.addEventListener('click', () => this.showCreateRoleModal());
    }

    const refreshRolesBtn = document.getElementById('refreshRoles');
    if (refreshRolesBtn) {
      refreshRolesBtn.addEventListener('click', () => {
        this.loadRoles();
        this.loadPermissions();
        this.loadUserRoles();
      });
    }

    // Permission assignment buttons will be added dynamically
  },

  // Load all roles
  async loadRoles() {
    try {
      const response = await axios.get('/api/admin/roles');
      
      if (response.data.success) {
        this.roles = response.data.roles || [];
        this.renderRolesTable();
      } else {
        this.showError('Error al cargar roles');
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      this.showError('Error de conexión al cargar roles');
    }
  },

  // Load all permissions
  async loadPermissions() {
    try {
      const response = await axios.get('/api/admin/permissions');
      
      if (response.data.success) {
        this.permissions = response.data.permissions || [];
        this.renderPermissionsMatrix();
      } else {
        this.showError('Error al cargar permisos');
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      this.showError('Error de conexión al cargar permisos');
    }
  },

  // Load user role assignments
  async loadUserRoles() {
    try {
      const response = await axios.get('/api/admin/user-roles');
      
      if (response.data.success) {
        this.userRoles = response.data.userRoles || [];
        this.renderUserRolesTable();
      } else {
        this.showError('Error al cargar asignaciones de roles');
      }
    } catch (error) {
      console.error('Error loading user roles:', error);
      this.showError('Error de conexión al cargar asignaciones de roles');
    }
  },

  // Render roles table
  renderRolesTable() {
    const container = document.getElementById('rolesTableContainer');
    if (!container) return;

    if (this.roles.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-users-cog text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No hay roles configurados</h3>
          <p class="text-gray-500">Crea el primer rol para comenzar a gestionar permisos.</p>
          <button onclick="RolesManager.showCreateRoleModal()" class="mt-4 btn btn-primary">
            Crear Primer Rol
          </button>
        </div>
      `;
      return;
    }

    const tableHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sistema</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${this.roles.map(role => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-${this.getRoleColor(role.name)}-100 flex items-center justify-center">
                        <i class="fas fa-${this.getRoleIcon(role.name)} text-${this.getRoleColor(role.name)}-600"></i>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">${role.name}</div>
                      <div class="text-sm text-gray-500">ID: ${role.id}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">${role.display_name}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-xs truncate" title="${this.escapeHtml(role.description || '')}">
                    ${this.escapeHtml(role.description || 'Sin descripción')}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${this.getUserCountForRole(role.id)} usuarios
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ${this.getPermissionCountForRole(role.id)} permisos
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${role.is_system_role ? `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <i class="fas fa-lock mr-1"></i>
                      Sistema
                    </span>
                  ` : `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Personalizado
                    </span>
                  `}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      onclick="RolesManager.viewRolePermissions(${role.id})"
                      class="text-blue-600 hover:text-blue-900"
                      title="Ver permisos"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      onclick="RolesManager.editRolePermissions(${role.id})"
                      class="text-green-600 hover:text-green-900"
                      title="Editar permisos"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    ${!role.is_system_role ? `
                      <button 
                        onclick="RolesManager.deleteRole(${role.id})"
                        class="text-red-600 hover:text-red-900"
                        title="Eliminar rol"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    ` : ''}
                    <button 
                      onclick="RolesManager.manageRoleUsers(${role.id})"
                      class="text-purple-600 hover:text-purple-900"
                      title="Gestionar usuarios"
                    >
                      <i class="fas fa-users"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHTML;
  },

  // Render permissions matrix
  renderPermissionsMatrix() {
    const container = document.getElementById('permissionsMatrix');
    if (!container) return;

    if (this.permissions.length === 0 || this.roles.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-key text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Matriz de permisos no disponible</h3>
          <p class="text-gray-500">Se necesitan roles y permisos configurados para mostrar la matriz.</p>
        </div>
      `;
      return;
    }

    // Group permissions by module
    const permissionsByModule = this.groupPermissionsByModule();
    
    const matrixHTML = `
      <div class="space-y-6">
        ${Object.entries(permissionsByModule).map(([module, modulePermissions]) => `
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900 capitalize">
                <i class="fas fa-${this.getModuleIcon(module)} mr-2"></i>
                ${this.getModuleDisplayName(module)}
              </h3>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                      Permiso
                    </th>
                    ${this.roles.map(role => `
                      <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20">
                        <div class="transform -rotate-45 origin-left">
                          ${role.display_name}
                        </div>
                      </th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  ${modulePermissions.map(permission => `
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">${permission.display_name}</div>
                        <div class="text-sm text-gray-500">${permission.description}</div>
                        <div class="text-xs text-gray-400 mt-1">
                          <code>${permission.name}</code>
                        </div>
                      </td>
                      ${this.roles.map(role => `
                        <td class="px-3 py-4 text-center">
                          <label class="inline-flex items-center">
                            <input 
                              type="checkbox" 
                              class="form-checkbox h-5 w-5 text-blue-600"
                              ${this.hasRolePermission(role.id, permission.id) ? 'checked' : ''}
                              ${role.is_system_role ? 'disabled' : ''}
                              onchange="RolesManager.toggleRolePermission(${role.id}, ${permission.id}, this.checked)"
                            />
                          </label>
                        </td>
                      `).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.innerHTML = matrixHTML;
  },

  // Render user roles table
  renderUserRolesTable() {
    const container = document.getElementById('userRolesTableContainer');
    if (!container) return;

    if (this.userRoles.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-user-friends text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No hay asignaciones de roles</h3>
          <p class="text-gray-500">Los usuarios no tienen roles asignados aún.</p>
        </div>
      `;
      return;
    }

    const tableHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado por</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${this.userRoles.map(userRole => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img class="h-10 w-10 rounded-full bg-gray-200" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E" alt="" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">${userRole.user_name}</div>
                      <div class="text-sm text-gray-500">${userRole.user_email}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${this.getRoleColor(userRole.role_name)}-100 text-${this.getRoleColor(userRole.role_name)}-800">
                    <i class="fas fa-${this.getRoleIcon(userRole.role_name)} mr-1"></i>
                    ${userRole.role_display_name}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${userRole.assigned_by_name || 'Sistema'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${this.formatDateTime(userRole.assigned_at)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${userRole.is_active ? `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo
                    </span>
                  ` : `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactivo
                    </span>
                  `}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      onclick="RolesManager.toggleUserRoleStatus(${userRole.user_id}, ${userRole.role_id})"
                      class="text-${userRole.is_active ? 'yellow' : 'green'}-600 hover:text-${userRole.is_active ? 'yellow' : 'green'}-900"
                      title="${userRole.is_active ? 'Desactivar' : 'Activar'} rol"
                    >
                      <i class="fas fa-${userRole.is_active ? 'pause' : 'play'}"></i>
                    </button>
                    <button 
                      onclick="RolesManager.removeUserRole(${userRole.user_id}, ${userRole.role_id})"
                      class="text-red-600 hover:text-red-900"
                      title="Eliminar asignación"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHTML;
  },

  // Show create role modal
  showCreateRoleModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Crear Nuevo Rol</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <form id="createRoleForm" class="p-6 space-y-4">
          <div>
            <label for="roleName" class="block text-sm font-medium text-gray-700">Nombre del Rol</label>
            <input 
              type="text" 
              id="roleName" 
              name="name" 
              class="mt-1 form-input" 
              placeholder="ej: project_editor"
              required
              pattern="[a-z_]+"
              title="Solo letras minúsculas y guiones bajos"
            />
            <p class="mt-1 text-sm text-gray-500">Solo letras minúsculas y guiones bajos</p>
          </div>
          
          <div>
            <label for="roleDisplayName" class="block text-sm font-medium text-gray-700">Nombre de Visualización</label>
            <input 
              type="text" 
              id="roleDisplayName" 
              name="display_name" 
              class="mt-1 form-input" 
              placeholder="ej: Editor de Proyectos"
              required
            />
          </div>
          
          <div>
            <label for="roleDescription" class="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea 
              id="roleDescription" 
              name="description" 
              rows="3" 
              class="mt-1 form-input" 
              placeholder="Describe las responsabilidades de este rol..."
            ></textarea>
          </div>
        </form>
        
        <div class="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50 space-x-2">
          <button onclick="this.closest('.fixed').remove()" class="btn btn-secondary">
            Cancelar
          </button>
          <button onclick="RolesManager.submitCreateRole()" class="btn btn-primary">
            Crear Rol
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  // Submit create role form
  async submitCreateRole() {
    const form = document.getElementById('createRoleForm');
    if (!form) return;

    const formData = new FormData(form);
    const roleData = {
      name: formData.get('name'),
      display_name: formData.get('display_name'),
      description: formData.get('description')
    };

    try {
      const response = await axios.post('/api/admin/roles', roleData);
      
      if (response.data.success) {
        this.showSuccess('Rol creado correctamente');
        this.loadRoles();
        document.querySelector('.fixed').remove();
      } else {
        this.showError(response.data.message || 'Error al crear rol');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      this.showError('Error de conexión al crear rol');
    }
  },

  // Toggle role permission
  async toggleRolePermission(roleId, permissionId, granted) {
    try {
      const response = await axios.post('/api/admin/role-permissions', {
        role_id: roleId,
        permission_id: permissionId,
        granted: granted
      });
      
      if (response.data.success) {
        this.showSuccess(granted ? 'Permiso otorgado' : 'Permiso revocado');
      } else {
        this.showError('Error al actualizar permiso');
        // Revert checkbox
        event.target.checked = !granted;
      }
    } catch (error) {
      console.error('Error toggling permission:', error);
      this.showError('Error de conexión al actualizar permiso');
      event.target.checked = !granted;
    }
  },

  // View role permissions
  async viewRolePermissions(roleId) {
    const role = this.roles.find(r => r.id === roleId);
    if (!role) return;

    try {
      const response = await axios.get(`/api/admin/roles/${roleId}/permissions`);
      
      if (response.data.success) {
        const permissions = response.data.permissions || [];
        this.showRolePermissionsModal(role, permissions);
      } else {
        this.showError('Error al cargar permisos del rol');
      }
    } catch (error) {
      console.error('Error loading role permissions:', error);
      this.showError('Error de conexión al cargar permisos');
    }
  },

  // Show role permissions modal
  showRolePermissionsModal(role, permissions) {
    const permissionsByModule = {};
    permissions.forEach(p => {
      if (!permissionsByModule[p.module]) {
        permissionsByModule[p.module] = [];
      }
      permissionsByModule[p.module].push(p);
    });

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            Permisos del Rol: ${role.display_name}
          </h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6">
          ${Object.keys(permissionsByModule).length === 0 ? `
            <div class="text-center py-12">
              <i class="fas fa-key text-4xl text-gray-400 mb-4"></i>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Sin permisos asignados</h3>
              <p class="text-gray-500">Este rol no tiene permisos asignados actualmente.</p>
            </div>
          ` : `
            <div class="space-y-6">
              ${Object.entries(permissionsByModule).map(([module, modulePermissions]) => `
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                  <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 class="text-md font-medium text-gray-900 capitalize">
                      <i class="fas fa-${this.getModuleIcon(module)} mr-2"></i>
                      ${this.getModuleDisplayName(module)}
                    </h3>
                  </div>
                  <div class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      ${modulePermissions.map(permission => `
                        <div class="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                          <i class="fas fa-check-circle text-green-600 mr-3"></i>
                          <div>
                            <div class="text-sm font-medium text-gray-900">${permission.display_name}</div>
                            <div class="text-xs text-gray-500">${permission.description}</div>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
        
        <div class="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button onclick="this.closest('.fixed').remove()" class="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  // Helper functions
  groupPermissionsByModule() {
    const grouped = {};
    this.permissions.forEach(permission => {
      if (!grouped[permission.module]) {
        grouped[permission.module] = [];
      }
      grouped[permission.module].push(permission);
    });
    return grouped;
  },

  hasRolePermission(roleId, permissionId) {
    // This would need to be loaded from the API
    // For now, return false as placeholder
    return false;
  },

  getUserCountForRole(roleId) {
    return this.userRoles.filter(ur => ur.role_id === roleId).length;
  },

  getPermissionCountForRole(roleId) {
    // This would need to be calculated from role permissions
    // For now, return 0 as placeholder
    return 0;
  },

  getRoleColor(roleName) {
    const colors = {
      'super_admin': 'purple',
      'admin': 'red',
      'project_manager': 'blue',
      'researcher': 'green',
      'collaborator': 'yellow',
      'guest': 'gray'
    };
    return colors[roleName] || 'blue';
  },

  getRoleIcon(roleName) {
    const icons = {
      'super_admin': 'crown',
      'admin': 'user-shield',
      'project_manager': 'project-diagram',
      'researcher': 'microscope',
      'collaborator': 'users',
      'guest': 'user'
    };
    return icons[roleName] || 'user';
  },

  getModuleIcon(module) {
    const icons = {
      'dashboard': 'tachometer-alt',
      'projects': 'project-diagram',
      'users': 'users',
      'roles': 'user-shield',
      'permissions': 'key',
      'admin': 'cogs',
      'reports': 'chart-bar',
      'news': 'newspaper',
      'events': 'calendar-alt'
    };
    return icons[module] || 'cube';
  },

  getModuleDisplayName(module) {
    const names = {
      'dashboard': 'Dashboard',
      'projects': 'Proyectos',
      'users': 'Usuarios',
      'roles': 'Roles',
      'permissions': 'Permisos',
      'admin': 'Administración',
      'reports': 'Reportes',
      'news': 'Noticias',
      'events': 'Eventos'
    };
    return names[module] || module;
  },

  formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('es-CO');
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  showSuccess(message) {
    this.showNotification(message, 'success');
  },

  showError(message) {
    this.showNotification(message, 'error');
  },

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
};

// Export for global access
window.RolesManager = RolesManager;