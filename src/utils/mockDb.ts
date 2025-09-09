// CODECTI Platform - Mock Database for Development

import type { User, Project } from '../types';

// Mock data for development
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@codecti.choco.gov.co',
    name: 'Administrador CODECTI',
    role: 'admin',
    created_at: '2025-01-01T00:00:00Z',
    is_active: true
  },
  {
    id: 2,
    email: 'investigador1@codecti.choco.gov.co',
    name: 'María Elena Rodríguez',
    role: 'collaborator',
    created_at: '2025-01-01T00:00:00Z',
    is_active: true
  },
  {
    id: 3,
    email: 'investigador2@codecti.choco.gov.co',
    name: 'Carlos Alberto Mosquera',
    role: 'collaborator',
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
  nextUserId = 4;
  nextProjectId = 4;

  async getUserByEmail(email: string): Promise<any> {
    const user = this.users.find(u => u.email === email && u.is_active);
    if (!user) return null;
    
    return {
      ...user,
      password_hash: mockPasswordHash
    };
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id && u.is_active) || null;
  }

  async getProjects(search: string = '', limit: number = 10, offset: number = 0): Promise<{ results: Project[], total: number }> {
    let filtered = [...this.projects];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.responsible_person.toLowerCase().includes(searchLower) ||
        p.summary.toLowerCase().includes(searchLower)
      );
    }
    
    const total = filtered.length;
    const results = filtered
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);
    
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
}

// Singleton instance
export const mockDb = new MockDatabase();