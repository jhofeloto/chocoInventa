// CODECTI Platform - System Logs Manager
// Independent logs management page with advanced filtering and export capabilities

const LogsManager = {
  logs: [],
  filteredLogs: [],
  currentPage: 1,
  itemsPerPage: 50,
  totalPages: 1,
  filters: {
    level: '',
    module: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  },
  autoRefresh: false,
  refreshInterval: null,

  // Initialize logs manager
  init() {
    console.log('Initializing Logs Manager...');
    this.setupEventListeners();
    this.loadSystemLogs();
    this.setupAutoRefresh();
  },

  // Setup event listeners
  setupEventListeners() {
    // Filter controls
    const levelFilter = document.getElementById('logLevelFilter');
    if (levelFilter) {
      levelFilter.addEventListener('change', (e) => {
        this.filters.level = e.target.value;
        this.applyFilters();
      });
    }

    const moduleFilter = document.getElementById('logModuleFilter');
    if (moduleFilter) {
      moduleFilter.addEventListener('change', (e) => {
        this.filters.module = e.target.value;
        this.applyFilters();
      });
    }

    const actionFilter = document.getElementById('logActionFilter');
    if (actionFilter) {
      actionFilter.addEventListener('change', (e) => {
        this.filters.action = e.target.value;
        this.applyFilters();
      });
    }

    const searchInput = document.getElementById('logSearch');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.filters.search = e.target.value;
          this.applyFilters();
        }, 500);
      });
    }

    const dateFromInput = document.getElementById('logDateFrom');
    if (dateFromInput) {
      dateFromInput.addEventListener('change', (e) => {
        this.filters.dateFrom = e.target.value;
        this.applyFilters();
      });
    }

    const dateToInput = document.getElementById('logDateTo');
    if (dateToInput) {
      dateToInput.addEventListener('change', (e) => {
        this.filters.dateTo = e.target.value;
        this.applyFilters();
      });
    }

    // Action buttons
    const refreshBtn = document.getElementById('refreshLogs');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadSystemLogs());
    }

    const clearFiltersBtn = document.getElementById('clearLogFilters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => this.clearFilters());
    }

    const exportJsonBtn = document.getElementById('exportLogsJson');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.exportLogs('json'));
    }

    const exportCsvBtn = document.getElementById('exportLogsCsv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this.exportLogs('csv'));
    }

    const clearLogsBtn = document.getElementById('clearSystemLogs');
    if (clearLogsBtn) {
      clearLogsBtn.addEventListener('click', () => this.confirmClearLogs());
    }

    const toggleAutoRefreshBtn = document.getElementById('toggleAutoRefresh');
    if (toggleAutoRefreshBtn) {
      toggleAutoRefreshBtn.addEventListener('click', () => this.toggleAutoRefresh());
    }

    // Items per page selector
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
      itemsPerPageSelect.addEventListener('change', (e) => {
        this.itemsPerPage = parseInt(e.target.value);
        this.currentPage = 1;
        this.renderLogs();
      });
    }
  },

  // Load system logs from API
  async loadSystemLogs() {
    try {
      this.showLoading();
      const response = await axios.get('/api/admin/logs');
      
      if (response.data.success) {
        this.logs = response.data.logs || [];
        this.applyFilters();
        this.updateStatistics();
        this.showSuccess(`Logs cargados: ${this.logs.length} entradas`);
      } else {
        this.showError('Error al cargar logs del sistema');
      }
    } catch (error) {
      console.error('Error loading system logs:', error);
      this.showError('Error de conexión al cargar logs');
    }
  },

  // Apply current filters
  applyFilters() {
    this.filteredLogs = this.logs.filter(log => {
      // Level filter
      if (this.filters.level && log.level !== this.filters.level) return false;
      
      // Module filter
      if (this.filters.module && log.module !== this.filters.module) return false;
      
      // Action filter
      if (this.filters.action && log.action !== this.filters.action) return false;
      
      // Date range filter
      if (this.filters.dateFrom) {
        const logDate = new Date(log.created_at);
        const fromDate = new Date(this.filters.dateFrom);
        if (logDate < fromDate) return false;
      }
      
      if (this.filters.dateTo) {
        const logDate = new Date(log.created_at);
        const toDate = new Date(this.filters.dateTo + 'T23:59:59');
        if (logDate > toDate) return false;
      }
      
      // Search filter (message, user, ip)
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        const searchableText = [
          log.message,
          log.user_email || '',
          log.ip_address || '',
          log.additional_data || ''
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });

    this.totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage);
    this.currentPage = 1;
    this.renderLogs();
    this.renderPagination();
    this.updateFilterStats();
  },

  // Render logs table
  renderLogs() {
    const container = document.getElementById('logsTableContainer');
    if (!container) return;

    if (this.filteredLogs.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No se encontraron logs</h3>
          <p class="text-gray-500">No hay logs que coincidan con los filtros seleccionados.</p>
          <button onclick="LogsManager.clearFilters()" class="mt-4 btn btn-primary">
            Limpiar filtros
          </button>
        </div>
      `;
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageData = this.filteredLogs.slice(startIndex, endIndex);

    const tableHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${pageData.map(log => `
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">
                  ${this.formatDateTime(log.created_at)}
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getLevelBadgeClass(log.level)}">
                    ${log.level}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">${log.module}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${log.action}</td>
                <td class="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title="${this.escapeHtml(log.message)}">
                  ${this.escapeHtml(log.message)}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">${log.user_email || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${log.ip_address || '-'}</td>
                <td class="px-4 py-3 text-sm">
                  <button 
                    onclick="LogsManager.viewLogDetails(${log.id})"
                    class="text-blue-600 hover:text-blue-800"
                    title="Ver detalles"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHTML;
  },

  // Render pagination
  renderPagination() {
    const container = document.getElementById('logsPagination');
    if (!container || this.totalPages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }

    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    const paginationHTML = `
      <div class="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
        <div class="flex justify-between flex-1 sm:hidden">
          ${this.currentPage > 1 ? `
            <button onclick="LogsManager.goToPage(${this.currentPage - 1})" class="btn btn-secondary btn-sm">
              Anterior
            </button>
          ` : `
            <span class="btn btn-secondary btn-sm opacity-50 cursor-not-allowed">Anterior</span>
          `}
          ${this.currentPage < this.totalPages ? `
            <button onclick="LogsManager.goToPage(${this.currentPage + 1})" class="btn btn-secondary btn-sm ml-3">
              Siguiente
            </button>
          ` : `
            <span class="btn btn-secondary btn-sm ml-3 opacity-50 cursor-not-allowed">Siguiente</span>
          `}
        </div>
        
        <div class="hidden sm:flex sm:items-center sm:justify-between w-full">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando 
              <span class="font-medium">${((this.currentPage - 1) * this.itemsPerPage) + 1}</span>
              a 
              <span class="font-medium">${Math.min(this.currentPage * this.itemsPerPage, this.filteredLogs.length)}</span>
              de 
              <span class="font-medium">${this.filteredLogs.length}</span>
              resultados
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
              ${this.currentPage > 1 ? `
                <button onclick="LogsManager.goToPage(${this.currentPage - 1})" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  <i class="fas fa-chevron-left"></i>
                </button>
              ` : ''}
              
              ${Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const page = startPage + i;
                return `
                  <button 
                    onclick="LogsManager.goToPage(${page})"
                    class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      page === this.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                    }"
                  >
                    ${page}
                  </button>
                `;
              }).join('')}
              
              ${this.currentPage < this.totalPages ? `
                <button onclick="LogsManager.goToPage(${this.currentPage + 1})" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  <i class="fas fa-chevron-right"></i>
                </button>
              ` : ''}
            </nav>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = paginationHTML;
  },

  // Go to specific page
  goToPage(page) {
    this.currentPage = page;
    this.renderLogs();
    this.renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Clear all filters
  clearFilters() {
    this.filters = {
      level: '',
      module: '',
      action: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    };

    // Reset form inputs
    const inputs = [
      'logLevelFilter', 'logModuleFilter', 'logActionFilter',
      'logSearch', 'logDateFrom', 'logDateTo'
    ];
    
    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.value = '';
    });

    this.applyFilters();
  },

  // Export logs
  async exportLogs(format) {
    try {
      const data = this.filteredLogs;
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, `system_logs_${timestamp}.json`);
      } else if (format === 'csv') {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadFile(blob, `system_logs_${timestamp}.csv`);
      }
      
      this.showSuccess(`Logs exportados en formato ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting logs:', error);
      this.showError('Error al exportar logs');
    }
  },

  // Convert logs to CSV
  convertToCSV(logs) {
    if (logs.length === 0) return '';

    const headers = ['Fecha/Hora', 'Nivel', 'Módulo', 'Acción', 'Mensaje', 'Usuario', 'IP', 'Datos Adicionales'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        `"${this.formatDateTime(log.created_at)}"`,
        `"${log.level}"`,
        `"${log.module}"`,
        `"${log.action}"`,
        `"${(log.message || '').replace(/"/g, '""')}"`,
        `"${log.user_email || ''}"`,
        `"${log.ip_address || ''}"`,
        `"${(log.additional_data || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\\n');

    return csvContent;
  },

  // Download file
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Toggle auto refresh
  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    const btn = document.getElementById('toggleAutoRefresh');
    
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.loadSystemLogs();
      }, 30000); // Refresh every 30 seconds
      
      if (btn) {
        btn.innerHTML = '<i class="fas fa-pause mr-2"></i>Pausar Auto-refresh';
        btn.className = 'btn btn-warning';
      }
      this.showSuccess('Auto-refresh activado (cada 30s)');
    } else {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
      
      if (btn) {
        btn.innerHTML = '<i class="fas fa-play mr-2"></i>Activar Auto-refresh';
        btn.className = 'btn btn-success';
      }
      this.showSuccess('Auto-refresh desactivado');
    }
  },

  // Setup auto refresh
  setupAutoRefresh() {
    // Auto refresh is disabled by default
    const btn = document.getElementById('toggleAutoRefresh');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-play mr-2"></i>Activar Auto-refresh';
      btn.className = 'btn btn-success';
    }
  },

  // View log details
  viewLogDetails(logId) {
    const log = this.logs.find(l => l.id === logId);
    if (!log) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Detalles del Log</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha/Hora</label>
              <p class="mt-1 text-sm text-gray-900">${this.formatDateTime(log.created_at)}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nivel</label>
              <span class="mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getLevelBadgeClass(log.level)}">
                ${log.level}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Módulo</label>
              <p class="mt-1 text-sm text-gray-900">${log.module}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Acción</label>
              <p class="mt-1 text-sm text-gray-900">${log.action}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Usuario</label>
              <p class="mt-1 text-sm text-gray-900">${log.user_email || 'No especificado'}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Dirección IP</label>
              <p class="mt-1 text-sm text-gray-900">${log.ip_address || 'No especificada'}</p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Mensaje</label>
            <p class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">${this.escapeHtml(log.message)}</p>
          </div>
          
          ${log.user_agent ? `
            <div>
              <label class="block text-sm font-medium text-gray-700">User Agent</label>
              <p class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md break-all">${this.escapeHtml(log.user_agent)}</p>
            </div>
          ` : ''}
          
          ${log.additional_data ? `
            <div>
              <label class="block text-sm font-medium text-gray-700">Datos Adicionales</label>
              <pre class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-x-auto">${this.escapeHtml(log.additional_data)}</pre>
            </div>
          ` : ''}
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

  // Confirm clear logs
  confirmClearLogs() {
    if (confirm('¿Está seguro de que desea eliminar todos los logs del sistema? Esta acción no se puede deshacer.')) {
      this.clearSystemLogs();
    }
  },

  // Clear system logs
  async clearSystemLogs() {
    try {
      const response = await axios.delete('/api/admin/logs');
      
      if (response.data.success) {
        this.logs = [];
        this.applyFilters();
        this.showSuccess('Logs del sistema eliminados correctamente');
      } else {
        this.showError('Error al eliminar logs del sistema');
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      this.showError('Error de conexión al eliminar logs');
    }
  },

  // Update statistics
  updateStatistics() {
    const statsContainer = document.getElementById('logsStatistics');
    if (!statsContainer) return;

    const stats = this.calculateStatistics();
    
    statsContainer.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-blue-600">${stats.total}</div>
          <div class="text-sm text-blue-800">Total Logs</div>
        </div>
        <div class="bg-red-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-red-600">${stats.error}</div>
          <div class="text-sm text-red-800">Errores</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-yellow-600">${stats.warn}</div>
          <div class="text-sm text-yellow-800">Warnings</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-green-600">${stats.info}</div>
          <div class="text-sm text-green-800">Info</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-gray-600">${stats.debug}</div>
          <div class="text-sm text-gray-800">Debug</div>
        </div>
      </div>
    `;
  },

  // Calculate statistics
  calculateStatistics() {
    return {
      total: this.logs.length,
      error: this.logs.filter(log => log.level === 'ERROR').length,
      warn: this.logs.filter(log => log.level === 'WARN').length,
      info: this.logs.filter(log => log.level === 'INFO').length,
      debug: this.logs.filter(log => log.level === 'DEBUG').length
    };
  },

  // Update filter statistics
  updateFilterStats() {
    const container = document.getElementById('filterStats');
    if (!container) return;

    container.innerHTML = `
      <div class="text-sm text-gray-600">
        ${this.filteredLogs.length} de ${this.logs.length} logs mostrados
      </div>
    `;
  },

  // Utility functions
  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  getLevelBadgeClass(level) {
    const classes = {
      'ERROR': 'bg-red-100 text-red-800',
      'WARN': 'bg-yellow-100 text-yellow-800',
      'INFO': 'bg-blue-100 text-blue-800',
      'DEBUG': 'bg-gray-100 text-gray-800',
      'FATAL': 'bg-purple-100 text-purple-800'
    };
    return classes[level] || 'bg-gray-100 text-gray-800';
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  showLoading() {
    const container = document.getElementById('logsTableContainer');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">Cargando logs del sistema...</p>
        </div>
      `;
    }
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
window.LogsManager = LogsManager;