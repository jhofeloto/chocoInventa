// CODECTI Platform - Admin Dashboard

const AdminDashboard = {
  refreshInterval: null,
  refreshRate: 30000, // 30 seconds
  
  init() {
    this.loadSystemStatus();
    this.loadMetrics();
    this.loadRecentLogs();
    this.loadRecentErrors();
    this.startAutoRefresh();
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Refresh buttons
    document.getElementById('refreshStatus')?.addEventListener('click', () => {
      this.loadSystemStatus();
      App.showNotification('Estado del sistema actualizado', 'info');
    });

    document.getElementById('refreshMetrics')?.addEventListener('click', () => {
      this.loadMetrics();
      App.showNotification('Métricas actualizadas', 'info');
    });

    // Export logs
    document.getElementById('exportLogsJson')?.addEventListener('click', () => {
      this.exportLogs('json');
    });

    document.getElementById('exportLogsCsv')?.addEventListener('click', () => {
      this.exportLogs('csv');
    });

    // Cleanup actions
    document.getElementById('cleanupLogs')?.addEventListener('click', () => {
      this.showCleanupModal('logs');
    });

    document.getElementById('cleanupErrors')?.addEventListener('click', () => {
      this.showCleanupModal('errors');
    });

    // Test load
    document.getElementById('generateTestLoad')?.addEventListener('click', () => {
      this.generateTestLoad();
    });

    // Force health check
    document.getElementById('forceHealthCheck')?.addEventListener('click', () => {
      this.forceHealthCheck();
    });

    // Auto-refresh toggle
    document.getElementById('toggleAutoRefresh')?.addEventListener('click', () => {
      this.toggleAutoRefresh();
    });

    // Filter controls
    document.getElementById('logLevelFilter')?.addEventListener('change', () => {
      this.loadRecentLogs();
    });

    document.getElementById('errorSeverityFilter')?.addEventListener('change', () => {
      this.loadRecentErrors();
    });

    // Search functionality
    document.getElementById('logSearch')?.addEventListener('input', 
      this.debounce(() => this.loadRecentLogs(), 500)
    );

    document.getElementById('errorSearch')?.addEventListener('input', 
      this.debounce(() => this.loadRecentErrors(), 500)
    );
  },

  async loadSystemStatus() {
    try {
      const response = await axios.get('/api/monitoring/admin/status');
      if (response.data.success) {
        this.renderSystemStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error loading system status:', error);
      App.showNotification('Error al cargar estado del sistema', 'error');
    }
  },

  async loadMetrics() {
    try {
      const response = await axios.get('/api/monitoring/admin/metrics');
      if (response.data.success) {
        this.renderMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      App.showNotification('Error al cargar métricas', 'error');
    }
  },

  async loadRecentLogs() {
    try {
      const level = document.getElementById('logLevelFilter')?.value || '';
      const search = document.getElementById('logSearch')?.value || '';
      
      const params = new URLSearchParams();
      if (level) params.append('level', level);
      if (search) params.append('search', search);
      params.append('limit', '20');
      
      const response = await axios.get(`/api/monitoring/admin/logs?${params}`);
      if (response.data.success) {
        this.renderLogs(response.data.data.logs);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      App.showNotification('Error al cargar logs', 'error');
    }
  },

  async loadRecentErrors() {
    try {
      const severity = document.getElementById('errorSeverityFilter')?.value || '';
      const search = document.getElementById('errorSearch')?.value || '';
      
      const params = new URLSearchParams();
      if (severity) params.append('severity', severity);
      if (search) params.append('search', search);
      params.append('limit', '20');
      
      const response = await axios.get(`/api/monitoring/admin/errors?${params}`);
      if (response.data.success) {
        this.renderErrors(response.data.data.errors, response.data.data.stats);
      }
    } catch (error) {
      console.error('Error loading errors:', error);
      App.showNotification('Error al cargar errores', 'error');
    }
  },

  renderSystemStatus(status) {
    const statusContainer = document.getElementById('systemStatus');
    if (!statusContainer) return;

    const statusColor = {
      'healthy': 'text-green-600 bg-green-100',
      'warning': 'text-yellow-600 bg-yellow-100',
      'critical': 'text-red-600 bg-red-100'
    }[status.status] || 'text-gray-600 bg-gray-100';

    const statusIcon = {
      'healthy': 'fa-check-circle',
      'warning': 'fa-exclamation-triangle',
      'critical': 'fa-times-circle'
    }[status.status] || 'fa-question-circle';

    statusContainer.innerHTML = `
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Estado del Sistema</h2>
          <button id="refreshStatus" class="btn btn-secondary btn-sm">
            <i class="fas fa-refresh mr-1"></i> Actualizar
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="text-center">
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}">
              <i class="fas ${statusIcon} mr-2"></i>
              ${status.status.toUpperCase()}
            </div>
            <p class="text-sm text-gray-600 mt-1">Estado General</p>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">
              ${Math.floor(status.uptime / 1000 / 60)} min
            </div>
            <p class="text-sm text-gray-600">Tiempo Activo</p>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">v${status.version}</div>
            <p class="text-sm text-gray-600">Versión</p>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">${status.environment}</div>
            <p class="text-sm text-gray-600">Entorno</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${status.checks.map(check => `
            <div class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium capitalize">${check.name}</h3>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  check.status === 'healthy' ? 'text-green-700 bg-green-100' :
                  check.status === 'warning' ? 'text-yellow-700 bg-yellow-100' :
                  'text-red-700 bg-red-100'
                }">
                  ${check.status}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2">${check.message}</p>
              <p class="text-xs text-gray-500">
                Tiempo de respuesta: ${check.responseTime}ms
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderMetrics(data) {
    const metricsContainer = document.getElementById('metricsOverview');
    if (!metricsContainer) return;

    metricsContainer.innerHTML = `
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Métricas del Sistema</h2>
          <button id="refreshMetrics" class="btn btn-secondary btn-sm">
            <i class="fas fa-refresh mr-1"></i> Actualizar
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">${data.logs.totalLogs}</div>
            <p class="text-sm text-gray-600">Total Logs</p>
          </div>
          
          <div class="text-center">
            <div class="text-3xl font-bold ${data.errors.last24h > 10 ? 'text-red-600' : 'text-green-600'}">
              ${data.errors.last24h}
            </div>
            <p class="text-sm text-gray-600">Errores (24h)</p>
          </div>
          
          <div class="text-center">
            <div class="text-3xl font-bold ${data.logs.averageResponseTime > 1000 ? 'text-red-600' : 'text-green-600'}">
              ${data.logs.averageResponseTime}ms
            </div>
            <p class="text-sm text-gray-600">Tiempo Respuesta</p>
          </div>
          
          <div class="text-center">
            <div class="text-3xl font-bold ${data.logs.slowRequests > 5 ? 'text-yellow-600' : 'text-green-600'}">
              ${data.logs.slowRequests}
            </div>
            <p class="text-sm text-gray-600">Requests Lentos</p>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-medium mb-3">Errores por Tipo</h3>
            <div class="space-y-2">
              ${Object.entries(data.errors.byType).map(([type, count]) => `
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">${type}</span>
                  <span class="font-medium">${count}</span>
                </div>
              `).join('') || '<p class="text-gray-500 text-sm">Sin errores registrados</p>'}
            </div>
          </div>
          
          <div>
            <h3 class="font-medium mb-3">Errores por Severidad</h3>
            <div class="space-y-2">
              ${Object.entries(data.errors.bySeverity).map(([severity, count]) => `
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 capitalize">${severity}</span>
                  <span class="font-medium ${severity === 'critical' ? 'text-red-600' : ''}">${count}</span>
                </div>
              `).join('') || '<p class="text-gray-500 text-sm">Sin errores registrados</p>'}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderLogs(logs) {
    const logsContainer = document.getElementById('recentLogs');
    if (!logsContainer) return;

    const levelColors = {
      'ERROR': 'text-red-700 bg-red-50',
      'WARN': 'text-yellow-700 bg-yellow-50',
      'INFO': 'text-blue-700 bg-blue-50',
      'DEBUG': 'text-gray-700 bg-gray-50'
    };

    logsContainer.innerHTML = `
      <div class="space-y-2">
        ${logs.length === 0 ? `
          <p class="text-gray-500 text-center py-8">No hay logs disponibles</p>
        ` : logs.map(log => `
          <div class="border rounded-lg p-3 hover:bg-gray-50">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${levelColors[log.level] || 'text-gray-700 bg-gray-50'}">
                  ${log.level}
                </span>
                ${log.context ? `<span class="text-xs text-gray-500">${log.context}</span>` : ''}
              </div>
              <span class="text-xs text-gray-500">
                ${new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            <p class="text-sm text-gray-800 mb-1">${log.message}</p>
            ${log.path ? `<p class="text-xs text-gray-500">${log.method} ${log.path} - ${log.statusCode} (${log.responseTime}ms)</p>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  renderErrors(errors, stats) {
    const errorsContainer = document.getElementById('recentErrors');
    if (!errorsContainer) return;

    const severityColors = {
      'critical': 'text-red-700 bg-red-50',
      'high': 'text-red-600 bg-red-50',
      'medium': 'text-yellow-600 bg-yellow-50',
      'low': 'text-gray-600 bg-gray-50'
    };

    errorsContainer.innerHTML = `
      <div class="space-y-2">
        ${errors.length === 0 ? `
          <p class="text-gray-500 text-center py-8">No hay errores registrados</p>
        ` : errors.map(error => `
          <div class="border rounded-lg p-3 hover:bg-gray-50">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${severityColors[error.severity]}">
                  ${error.severity.toUpperCase()}
                </span>
                <span class="text-xs font-medium text-gray-600">${error.error.name}</span>
                ${error.resolved ? '<span class="text-xs text-green-600">✓ Resuelto</span>' : ''}
              </div>
              <span class="text-xs text-gray-500">
                ${new Date(error.timestamp).toLocaleString()}
              </span>
            </div>
            <p class="text-sm text-gray-800 mb-1">${error.error.message}</p>
            <p class="text-xs text-gray-500">${error.context.method} ${error.context.path}</p>
            ${!error.resolved ? `
              <button 
                onclick="AdminDashboard.resolveError('${error.id}')" 
                class="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Marcar como resuelto
              </button>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  async resolveError(errorId) {
    try {
      const response = await axios.patch(`/api/monitoring/admin/errors/${errorId}/resolve`);
      if (response.data.success) {
        App.showNotification('Error marcado como resuelto', 'success');
        this.loadRecentErrors();
      }
    } catch (error) {
      console.error('Error resolving error:', error);
      App.showNotification('Error al resolver error', 'error');
    }
  },

  async exportLogs(format) {
    try {
      const response = await axios.get(`/api/monitoring/admin/logs/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `codecti-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      App.showNotification('Logs exportados exitosamente', 'success');
    } catch (error) {
      console.error('Error exporting logs:', error);
      App.showNotification('Error al exportar logs', 'error');
    }
  },

  showCleanupModal(type) {
    const isLogs = type === 'logs';
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-bold mb-4">Limpiar ${isLogs ? 'Logs' : 'Errores'}</h2>
        <p class="text-gray-600 mb-4">
          Esta acción eliminará ${isLogs ? 'logs' : 'errores'} antiguos permanentemente.
        </p>
        <div class="mb-4">
          <label class="form-label">
            ${isLogs ? 'Eliminar logs más antiguos de (horas):' : 'Eliminar errores más antiguos de (días):'}
          </label>
          <input 
            type="number" 
            id="cleanupValue" 
            class="form-input" 
            value="${isLogs ? '168' : '30'}"
            min="1"
          >
        </div>
        <div class="flex justify-end space-x-3">
          <button onclick="this.closest('.fixed').remove()" class="btn btn-secondary">
            Cancelar
          </button>
          <button onclick="AdminDashboard.executeCleanup('${type}'); this.closest('.fixed').remove()" class="btn btn-danger">
            Confirmar Limpieza
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async executeCleanup(type) {
    try {
      const value = document.getElementById('cleanupValue')?.value;
      const param = type === 'logs' ? 'hours' : 'days';
      
      const response = await axios.delete(`/api/monitoring/admin/${type}/cleanup?${param}=${value}`);
      if (response.data.success) {
        App.showNotification(response.data.message, 'success');
        if (type === 'logs') {
          this.loadRecentLogs();
        } else {
          this.loadRecentErrors();
        }
      }
    } catch (error) {
      console.error(`Error cleaning up ${type}:`, error);
      App.showNotification(`Error al limpiar ${type}`, 'error');
    }
  },

  async generateTestLoad() {
    try {
      const response = await axios.post('/api/monitoring/admin/test-load');
      if (response.data.success) {
        App.showNotification('Datos de prueba generados exitosamente', 'success');
        setTimeout(() => {
          this.loadMetrics();
          this.loadRecentLogs();
          this.loadRecentErrors();
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating test load:', error);
      App.showNotification('Error al generar datos de prueba', 'error');
    }
  },

  async forceHealthCheck() {
    try {
      const response = await axios.post('/api/monitoring/admin/health-check');
      if (response.data.success) {
        App.showNotification('Health check ejecutado exitosamente', 'success');
        this.loadSystemStatus();
      }
    } catch (error) {
      console.error('Error forcing health check:', error);
      App.showNotification('Error al ejecutar health check', 'error');
    }
  },

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.loadSystemStatus();
      this.loadMetrics();
      this.loadRecentLogs();
      this.loadRecentErrors();
    }, this.refreshRate);
  },

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  },

  toggleAutoRefresh() {
    const button = document.getElementById('toggleAutoRefresh');
    if (this.refreshInterval) {
      this.stopAutoRefresh();
      button.innerHTML = '<i class="fas fa-play mr-1"></i> Iniciar Auto-refresh';
      button.classList.remove('btn-danger');
      button.classList.add('btn-success');
      App.showNotification('Auto-refresh desactivado', 'info');
    } else {
      this.startAutoRefresh();
      button.innerHTML = '<i class="fas fa-pause mr-1"></i> Pausar Auto-refresh';
      button.classList.remove('btn-success');
      button.classList.add('btn-danger');
      App.showNotification('Auto-refresh activado', 'info');
    }
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};