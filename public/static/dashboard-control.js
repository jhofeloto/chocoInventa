/**
 * Dashboard Control Panel JavaScript
 * Manages role-based access control and section visibility
 */

class DashboardControl {
  constructor() {
    this.userRole = null;
    this.userPermissions = [];
    this.isAuthenticated = false;
    
    this.init();
  }

  async init() {
    console.log('Initializing Dashboard Control Panel');
    
    // Check authentication first
    await this.checkAuthentication();
    
    if (!this.isAuthenticated) {
      this.redirectToLogin();
      return;
    }

    // Load user role and permissions
    await this.loadUserRole();
    await this.loadDashboardPermissions();
    
    // Setup the dashboard
    this.setupDashboard();
  }

  async checkAuthentication() {
    try {
      // This would typically check for JWT token or session
      // For now, simulate authentication check
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        console.log('No authentication token found');
        this.isAuthenticated = false;
        return;
      }

      // Verify token with server (placeholder for now)
      // In real implementation, validate with /api/auth/verify
      this.isAuthenticated = true;
      console.log('User is authenticated');
    } catch (error) {
      console.error('Authentication check failed:', error);
      this.isAuthenticated = false;
    }
  }

  async loadUserRole() {
    try {
      // For now, simulate getting user role from localStorage
      // In real implementation, this would come from JWT or API call
      const storedRole = localStorage.getItem('user_role') || 'admin'; // Default to admin for testing
      
      this.userRole = storedRole;
      console.log('User role loaded:', this.userRole);
      
      // Update display
      const roleDisplay = document.getElementById('user-role-display');
      if (roleDisplay) {
        const roleNames = {
          'admin': 'Administrador',
          'collaborator': 'Colaborador', 
          'researcher': 'Investigador'
        };
        roleDisplay.textContent = roleNames[this.userRole] || this.userRole;
      }
      
    } catch (error) {
      console.error('Error loading user role:', error);
      this.userRole = null;
    }
  }

  async loadDashboardPermissions() {
    try {
      if (!this.userRole) {
        throw new Error('No user role available');
      }

      // Map role names to role IDs (from database)
      const roleMap = {
        'admin': 1,
        'collaborator': 2,
        'researcher': 3
      };

      const roleId = roleMap[this.userRole];
      if (!roleId) {
        throw new Error('Invalid role: ' + this.userRole);
      }

      console.log('Loading permissions for role ID:', roleId);

      const response = await axios.get(`/api/dashboard/permissions/${roleId}`);
      
      if (response.data.success) {
        this.userPermissions = response.data.permissions.map(p => p.name);
        console.log('Dashboard permissions loaded:', this.userPermissions);
      } else {
        throw new Error(response.data.message || 'Failed to load permissions');
      }

    } catch (error) {
      console.error('Error loading dashboard permissions:', error);
      this.userPermissions = [];
    }
  }

  setupDashboard() {
    console.log('Setting up dashboard with permissions:', this.userPermissions);
    
    // Hide loading state
    const loadingElement = document.getElementById('dashboard-loading');
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }

    // Check if user has any dashboard permissions
    const hasDashboardAccess = this.userPermissions.some(p => p.startsWith('dashboard_'));
    
    if (!hasDashboardAccess) {
      console.log('User has no dashboard permissions');
      this.showAccessDenied();
      return;
    }

    // Show dashboard sections
    const dashboardSections = document.getElementById('dashboard-sections');
    if (dashboardSections) {
      dashboardSections.classList.remove('hidden');
    }

    // Show/hide sections based on permissions
    this.configureSectionVisibility();
  }

  configureSectionVisibility() {
    const sections = document.querySelectorAll('.dashboard-section');
    
    sections.forEach(section => {
      const requiredPermission = section.dataset.permission;
      
      if (requiredPermission) {
        const hasPermission = this.userPermissions.includes(requiredPermission);
        
        if (hasPermission) {
          section.classList.remove('hidden');
          console.log(`Showing section: ${section.id} (permission: ${requiredPermission})`);
        } else {
          section.classList.add('hidden');
          console.log(`Hiding section: ${section.id} (missing permission: ${requiredPermission})`);
        }
      } else {
        // Show sections without specific permission requirements
        section.classList.remove('hidden');
      }
    });

    // Special handling for admin section - only show if user has admin permissions
    const adminSection = document.getElementById('admin-section');
    if (adminSection) {
      const hasAdminAccess = this.userPermissions.includes('dashboard_admin_view');
      if (hasAdminAccess) {
        adminSection.classList.remove('hidden');
      } else {
        adminSection.classList.add('hidden');
      }
    }
  }

  showAccessDenied() {
    const accessDeniedElement = document.getElementById('dashboard-access-denied');
    if (accessDeniedElement) {
      accessDeniedElement.classList.remove('hidden');
    }
  }

  redirectToLogin() {
    console.log('Redirecting to login page');
    // Store current URL for redirect after login
    sessionStorage.setItem('redirect_after_login', window.location.pathname);
    window.location.href = '/';
  }

  // Method to refresh permissions (useful after role changes)
  async refreshPermissions() {
    console.log('Refreshing dashboard permissions');
    
    const loadingElement = document.getElementById('dashboard-loading');
    const dashboardSections = document.getElementById('dashboard-sections');
    const accessDeniedElement = document.getElementById('dashboard-access-denied');
    
    // Show loading
    if (loadingElement) loadingElement.classList.remove('hidden');
    if (dashboardSections) dashboardSections.classList.add('hidden');
    if (accessDeniedElement) accessDeniedElement.classList.add('hidden');
    
    // Reload permissions
    await this.loadUserRole();
    await this.loadDashboardPermissions();
    
    // Setup dashboard again
    this.setupDashboard();
  }
}

// Global dashboard instance
let dashboard;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  dashboard = new DashboardControl();
});

// For debugging and manual testing
window.DashboardControl = DashboardControl;
window.refreshDashboard = () => {
  if (dashboard) {
    dashboard.refreshPermissions();
  }
};

console.log('Dashboard Control Panel script loaded');