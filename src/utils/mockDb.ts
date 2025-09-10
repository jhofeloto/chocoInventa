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
    responsible_person: 'investigador1@codecti.choco.gov.co',
    summary: 'Estudio comprehensive de la biodiversidad acuática en las principales cuencas hidrográficas del departamento del Chocó, con enfoque en especies endémicas y en peligro de extinción.',
    description: 'Este proyecto busca realizar un inventario completo de la biodiversidad acuática presente en las principales cuencas del Chocó, incluyendo el Atrato, San Juan y Baudó. Se utilizarán técnicas de muestreo tradicionales y tecnologías de vanguardia como el análisis de ADN ambiental.',
    objectives: 'Catalogar especies acuáticas endémicas, identificar especies en peligro, desarrollar estrategias de conservación',
    methodology: 'Muestreo sistemático, análisis de ADN ambiental, caracterización fisicoquímica de aguas',
    expected_results: 'Catálogo de biodiversidad acuática, mapas de distribución, estrategias de conservación',
    status: 'active',
    start_date: '2024-03-01',
    end_date: '2025-02-28',
    budget: 450000000,
    institution: 'Universidad Tecnológica del Chocó',
    research_area: 'Biodiversidad y Ecosistemas',
    keywords: 'biodiversidad, ecosistemas acuáticos, especies endémicas, conservación, Chocó',
    created_by: 2,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
    creator_name: 'María Elena Rodríguez'
  },
  {
    id: 2,
    title: 'Desarrollo de Tecnologías Verdes para Minería Sostenible',
    responsible_person: 'investigador2@codecti.choco.gov.co',
    summary: 'Investigación aplicada para el desarrollo de tecnologías limpias que permitan la explotación minera responsable y sostenible en el Chocó, reduciendo el impacto ambiental.',
    description: 'El proyecto desarrolla tecnologías innovadoras para la minería artesanal de oro, incluyendo sistemas de procesamiento sin mercurio, técnicas de biorremediación y métodos de monitoreo ambiental en tiempo real.',
    objectives: 'Desarrollar tecnologías limpias, capacitar comunidades mineras, reducir contaminación por mercurio',
    methodology: 'Investigación participativa, desarrollo tecnológico, transferencia de conocimiento',
    expected_results: 'Tecnologías verdes implementadas, comunidades capacitadas, reducción de contaminación',
    status: 'active',
    start_date: '2024-06-01',
    end_date: '2025-12-31',
    budget: 680000000,
    institution: 'SINCHI - Instituto Amazónico de Investigaciones Científicas',
    research_area: 'Tecnología Ambiental',
    keywords: 'minería sostenible, tecnologías limpias, mercurio, biorremediación, comunidades',
    created_by: 3,
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
    creator_name: 'Carlos Alberto Mosquera'
  },
  {
    id: 3,
    title: 'Fortalecimiento de Cadenas Productivas Agrícolas del Pacífico',
    responsible_person: 'investigador1@codecti.choco.gov.co',
    summary: 'Proyecto de innovación para el fortalecimiento de las cadenas productivas del cacao, plátano y frutas tropicales en comunidades rurales del Chocó.',
    description: 'Iniciativa integral que busca mejorar la productividad y competitividad de las cadenas agrícolas tradicionales del Chocó mediante la implementación de tecnologías apropiadas, fortalecimiento organizacional y acceso a mercados especializados.',
    objectives: 'Mejorar productividad agrícola, fortalecer organizaciones, facilitar acceso a mercados',
    methodology: 'Investigación acción participativa, transferencia tecnológica, desarrollo organizacional',
    expected_results: 'Aumento en productividad del 30%, organizaciones fortalecidas, nuevos mercados',
    status: 'completed',
    start_date: '2023-01-01',
    end_date: '2024-12-31',
    budget: 320000000,
    institution: 'Universidad Tecnológica del Chocó',
    research_area: 'Desarrollo Rural y Agrícola',
    keywords: 'cacao, plátano, frutas tropicales, cadenas productivas, desarrollo rural',
    created_by: 2,
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2024-12-31T10:00:00Z',
    creator_name: 'María Elena Rodríguez'
  },
  {
    id: 4,
    title: 'Medicina Tradicional y Plantas del Chocó Biogeográfico',
    responsible_person: 'investigador2@codecti.choco.gov.co',
    summary: 'Investigación etnobotánica sobre el conocimiento tradicional de plantas medicinales utilizadas por comunidades afrodescendientes e indígenas del Chocó.',
    description: 'Estudio sistemático del conocimiento ancestral sobre plantas medicinales, documentación de usos tradicionales, análisis fitoquímico de especies promisorias y validación científica de propiedades terapéuticas.',
    objectives: 'Documentar conocimiento ancestral, validar propiedades medicinales, conservar biodiversidad',
    methodology: 'Etnobotánica, análisis fitoquímico, estudios farmacológicos, documentación participativa',
    expected_results: 'Catálogo de plantas medicinales, productos naturales, protocolos de conservación',
    status: 'active',
    start_date: '2024-08-01',
    end_date: '2026-07-31',
    budget: 520000000,
    institution: 'SINCHI - Instituto Amazónico de Investigaciones Científicas',
    research_area: 'Etnobotánica y Farmacología',
    keywords: 'medicina tradicional, etnobotánica, plantas medicinales, conocimiento ancestral, fitoquímica',
    created_by: 3,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
    creator_name: 'Carlos Alberto Mosquera'
  },
  {
    id: 5,
    title: 'Cambio Climático y Vulnerabilidad Costera en el Pacífico Chocoano',
    responsible_person: 'investigador1@codecti.choco.gov.co',
    summary: 'Análisis de los efectos del cambio climático en las comunidades costeras del Pacífico chocoano y desarrollo de estrategias de adaptación.',
    description: 'Evaluación integral de la vulnerabilidad climática en municipios costeros, modelado de escenarios futuros, y diseño participativo de medidas de adaptación con comunidades locales.',
    objectives: 'Evaluar vulnerabilidad climática, desarrollar estrategias de adaptación, fortalecer resiliencia',
    methodology: 'Modelado climático, análisis de vulnerabilidad, planificación participativa',
    expected_results: 'Mapas de vulnerabilidad, estrategias de adaptación, comunidades resilientes',
    status: 'active',
    start_date: '2024-09-01',
    end_date: '2025-08-31',
    budget: 390000000,
    institution: 'Universidad Tecnológica del Chocó',
    research_area: 'Cambio Climático',
    keywords: 'cambio climático, vulnerabilidad, adaptación, comunidades costeras, resiliencia',
    created_by: 2,
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2025-01-08T10:00:00Z',
    creator_name: 'María Elena Rodríguez'
  },
  {
    id: 6,
    title: 'Innovación en Acuicultura Sostenible para el Pacífico',
    responsible_person: 'investigador2@codecti.choco.gov.co',
    summary: 'Desarrollo de sistemas de acuicultura sostenible adaptados a las condiciones del Pacífico chocoano, con enfoque en especies nativas.',
    description: 'Investigación aplicada para el desarrollo de tecnologías de acuicultura que aprovechen especies ícticas nativas, con sistemas de bajo impacto ambiental y alto potencial económico para las comunidades.',
    objectives: 'Desarrollar sistemas acuícolas sostenibles, capacitar productores, generar ingresos',
    methodology: 'Investigación aplicada, transferencia tecnológica, acompañamiento técnico',
    expected_results: 'Sistemas acuícolas funcionando, productores capacitados, ingresos generados',
    status: 'planning',
    start_date: '2025-03-01',
    end_date: '2027-02-28',
    budget: 720000000,
    institution: 'SINCHI - Instituto Amazónico de Investigaciones Científicas',
    research_area: 'Acuicultura y Pesca',
    keywords: 'acuicultura, especies nativas, sostenibilidad, desarrollo comunitario, Pacífico',
    created_by: 3,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
    creator_name: 'Carlos Alberto Mosquera'
  },
  {
    id: 7,
    title: 'Patrimonio Cultural Digital del Chocó',
    responsible_person: 'investigador1@codecti.choco.gov.co',
    summary: 'Digitalización y preservación del patrimonio cultural inmaterial del Chocó mediante tecnologías digitales avanzadas.',
    description: 'Proyecto de documentación digital del patrimonio cultural chocoano incluyendo música, danzas, tradiciones orales y artesanías, utilizando realidad virtual, inteligencia artificial y plataformas interactivas.',
    objectives: 'Preservar patrimonio cultural, crear archivos digitales, facilitar acceso educativo',
    methodology: 'Documentación digital, realidad virtual, inteligencia artificial, plataformas interactivas',
    expected_results: 'Archivo digital, museo virtual, plataforma educativa, patrimonio preservado',
    status: 'draft',
    start_date: '2025-06-01',
    end_date: '2026-12-31',
    budget: 280000000,
    institution: 'Universidad Tecnológica del Chocó',
    research_area: 'Patrimonio Cultural y TIC',
    keywords: 'patrimonio cultural, digitalización, realidad virtual, tradiciones, Chocó',
    created_by: 2,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
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

  // Public API methods (no authentication required)
  async getPublicProjects(
    search: string = '', 
    status: string = '', 
    area: string = '', 
    institution: string = '', 
    sort: string = 'created_at', 
    order: string = 'desc',
    limit: number = 12, 
    offset: number = 0
  ) {
    let filtered = [...this.projects].filter(project => {
      // Only show non-draft projects publicly
      if (project.status === 'draft') return false;
      
      if (search) {
        const searchLower = search.toLowerCase();
        const matches = 
          project.title.toLowerCase().includes(searchLower) ||
          project.summary.toLowerCase().includes(searchLower) ||
          (project.research_area && project.research_area.toLowerCase().includes(searchLower)) ||
          (project.institution && project.institution.toLowerCase().includes(searchLower)) ||
          (project.keywords && project.keywords.toLowerCase().includes(searchLower));
        if (!matches) return false;
      }
      
      if (status && project.status !== status) return false;
      if (area && (!project.research_area || !project.research_area.toLowerCase().includes(area.toLowerCase()))) return false;
      if (institution && (!project.institution || !project.institution.toLowerCase().includes(institution.toLowerCase()))) return false;
      
      return true;
    });

    // Sorting
    if (sort === 'title') {
      filtered.sort((a, b) => order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
    } else if (sort === 'start_date') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.start_date || a.created_at).getTime();
        const dateB = new Date(b.start_date || b.created_at).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else {
      // Default: created_at
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    const total = filtered.length;
    const projects = filtered.slice(offset, offset + limit).map(project => ({
      ...project,
      responsible_name: this.users.find(u => u.email === project.responsible_person)?.name || 'Usuario no encontrado'
    }));

    return { projects, total };
  }

  async getPublicProjectById(id: number) {
    const project = this.projects.find(p => p.id === id);
    if (!project || project.status === 'draft') return null;
    
    const responsible = this.users.find(u => u.email === project.responsible_person);
    
    return {
      ...project,
      responsible_name: responsible?.name || 'Usuario no encontrado',
      responsible_institution: responsible?.institution || 'Institución no encontrada'
    };
  }

  async getPublicStats() {
    const publicProjects = this.projects.filter(p => p.status !== 'draft');
    
    // Research areas count
    const researchAreas = new Map<string, number>();
    publicProjects.forEach(project => {
      if (project.research_area) {
        researchAreas.set(project.research_area, (researchAreas.get(project.research_area) || 0) + 1);
      }
    });

    // Institutions count
    const institutions = new Map<string, number>();
    publicProjects.forEach(project => {
      if (project.institution) {
        institutions.set(project.institution, (institutions.get(project.institution) || 0) + 1);
      }
    });

    return {
      totalProjects: publicProjects.length,
      activeProjects: publicProjects.filter(p => p.status === 'active').length,
      completedProjects: publicProjects.filter(p => p.status === 'completed').length,
      totalResearchers: this.users.filter(u => u.is_active).length,
      totalBudget: publicProjects.reduce((sum, p) => sum + (p.budget || 0), 0),
      researchAreas: Array.from(researchAreas.entries()).map(([area, count]) => ({
        research_area: area,
        count
      })).sort((a, b) => b.count - a.count).slice(0, 10),
      topInstitutions: Array.from(institutions.entries()).map(([institution, count]) => ({
        institution,
        count
      })).sort((a, b) => b.count - a.count).slice(0, 10)
    };
  }
}

// Singleton instance
export const mockDb = new MockDatabase();

// Initialize password hashes for existing mock users
mockDb.passwordHashes.set('admin@codecti.choco.gov.co', mockPasswordHash);
mockDb.passwordHashes.set('investigador1@codecti.choco.gov.co', mockPasswordHash);
mockDb.passwordHashes.set('investigador2@codecti.choco.gov.co', mockPasswordHash);