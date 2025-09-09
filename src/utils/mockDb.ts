// CODECTI Platform - Mock Database for Development

import type { User, Project } from '../types';

// Mock data for development
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@codecti.choco.gov.co',
    name: 'Administrador CODECTI',
    role: 'admin',
    institution: 'CODECTI Chocó',
    created_at: '2025-01-01T00:00:00Z',
    is_active: true
  },
  {
    id: 2,
    email: 'investigador1@codecti.choco.gov.co',
    name: 'María Elena Rodríguez',
    role: 'collaborator',
    institution: 'Universidad Tecnológica del Chocó',
    created_at: '2025-01-01T00:00:00Z',
    is_active: true
  },
  {
    id: 3,
    email: 'investigador2@codecti.choco.gov.co',
    name: 'Carlos Alberto Mosquera',
    role: 'researcher',
    institution: 'SINCHI - Instituto Amazónico de Investigaciones Científicas',
    created_at: '2025-01-01T00:00:00Z',
    is_active: true
  }
];

const mockProjects: Project[] = [
  {
    id: 1,
    title: 'Biodiversidad Acuática del Chocó',
    responsible_person: 'María Elena Rodríguez',
    summary: 'Estudio comprehensive de la biodiversidad acuática en las principales cuencas hidrográficas del departamento del Chocó, con enfoque en especies endémicas y en peligro de extinción.',
    status: 'active',
    created_by: 2,
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
    creator_name: 'María Elena Rodríguez'
  },
  {
    id: 2,
    title: 'Desarrollo de Tecnologías Verdes para Minería Sostenible',
    responsible_person: 'Carlos Alberto Mosquera',
    summary: 'Investigación aplicada para el desarrollo de tecnologías limpias que permitan la explotación minera responsable y sostenible en el Chocó, reduciendo el impacto ambiental.',
    status: 'active',
    created_by: 3,
    created_at: '2025-01-02T10:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
    creator_name: 'Carlos Alberto Mosquera'
  },
  {
    id: 3,
    title: 'Fortalecimiento de Cadenas Productivas Agrícolas',
    responsible_person: 'Ana Lucía Palacios',
    summary: 'Proyecto de innovación para el fortalecimiento de las cadenas productivas del cacao, plátano y frutas tropicales en comunidades rurales del Chocó.',
    status: 'completed',
    created_by: 2,
    created_at: '2025-01-03T10:00:00Z',
    updated_at: '2025-01-03T10:00:00Z',
    creator_name: 'María Elena Rodríguez'
  }
];

// Mock password hash for "password123"
const mockPasswordHash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';

// Mock database interface
export class MockDatabase {
  users: User[] = [...mockUsers];
  projects: Project[] = [...mockProjects];
  // Store password hashes separately for dynamic users
  passwordHashes: Map<string, string> = new Map();
  nextUserId = 4;
  nextProjectId = 4;

  async getUserByEmail(email: string): Promise<any> {
    const user = this.users.find(u => u.email === email && u.is_active);
    if (!user) return null;
    
    // Check if we have a stored password hash for this email
    const storedPasswordHash = this.passwordHashes.get(email);
    
    return {
      ...user,
      password_hash: storedPasswordHash || mockPasswordHash // Use stored hash or fallback to mock
    };
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id && u.is_active) || null;
  }

  async createUser(data: {
    name: string;
    email: string;
    institution: string;
    password_hash: string;
    role: 'admin' | 'collaborator' | 'researcher';
  }): Promise<User> {
    const now = new Date().toISOString();
    
    const user: User = {
      id: this.nextUserId++,
      email: data.email,
      name: data.name,
      institution: data.institution,
      role: data.role,
      created_at: now,
      is_active: true
    };
    
    // Store the password hash for this email
    this.passwordHashes.set(data.email, data.password_hash);
    
    this.users.push(user);
    return user;
  }

  async getProjects(search: string = '', status: string = '', sort: string = 'created_at', limit: number = 10, offset: number = 0): Promise<{ results: Project[], total: number }> {
    let filtered = [...this.projects];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.responsible_person.toLowerCase().includes(searchLower) ||
        p.summary.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (status && ['active', 'completed'].includes(status)) {
      filtered = filtered.filter(p => p.status === status);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'responsible_person':
          return a.responsible_person.localeCompare(b.responsible_person);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    const total = filtered.length;
    const results = filtered.slice(offset, offset + limit);
    
    return { results, total };
  }

  async getProjectById(id: number): Promise<Project | null> {
    return this.projects.find(p => p.id === id) || null;
  }

  async createProject(data: {
    title: string;
    responsible_person: string;
    summary: string;
    status: 'active' | 'completed';
    created_by: number;
  }): Promise<Project> {
    const now = new Date().toISOString();
    const creator = this.users.find(u => u.id === data.created_by);
    
    const project: Project = {
      id: this.nextProjectId++,
      title: data.title,
      responsible_person: data.responsible_person,
      summary: data.summary,
      status: data.status,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
      creator_name: creator?.name || 'Usuario'
    };
    
    this.projects.push(project);
    return project;
  }

  async updateProject(id: number, updates: any): Promise<boolean> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return true;
  }

  // User management methods
  async getUsers(search: string = '', role: string = '', status: string = '', limit: number = 20, offset: number = 0): Promise<{ results: User[], total: number }> {
    let filtered = [...this.users];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        (u.institution && u.institution.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply role filter
    if (role && ['admin', 'collaborator', 'researcher'].includes(role)) {
      filtered = filtered.filter(u => u.role === role);
    }
    
    // Apply status filter
    if (status) {
      if (status === 'active') {
        filtered = filtered.filter(u => u.is_active);
      } else if (status === 'inactive') {
        filtered = filtered.filter(u => !u.is_active);
      }
    }
    
    const total = filtered.length;
    const results = filtered
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);
    
    return { results, total };
  }

  async updateUser(id: number, updates: any): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users[index] = {
      ...this.users[index],
      ...updates
    };
    
    // Update password hash if provided
    if (updates.password_hash) {
      this.passwordHashes.set(this.users[index].email, updates.password_hash);
    }
    
    return true;
  }

  async resetUserPassword(id: number, passwordHash: string): Promise<boolean> {
    const user = this.users.find(u => u.id === id);
    if (!user) return false;
    
    this.passwordHashes.set(user.email, passwordHash);
    return true;
  }

  async deactivateUser(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users[index].is_active = false;
    return true;
  }
}

// Singleton instance
export const mockDb = new MockDatabase();

// Initialize password hashes for existing mock users
mockDb.passwordHashes.set('admin@codecti.choco.gov.co', mockPasswordHash);
mockDb.passwordHashes.set('investigador1@codecti.choco.gov.co', mockPasswordHash);
mockDb.passwordHashes.set('investigador2@codecti.choco.gov.co', mockPasswordHash);