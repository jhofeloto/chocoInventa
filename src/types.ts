// CODECTI Platform - Type Definitions

// Cloudflare Bindings
export interface Bindings {
  DB?: D1Database;
  KV?: KVNamespace;
  R2?: R2Bucket;
}

// JWT Payload
export interface JWTPayload {
  userId: number;
  email: string;
  role: 'admin' | 'collaborator' | 'researcher';
  iat: number;
  exp: number;
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'collaborator' | 'researcher';
  institution?: string;
  created_at: string;
  is_active: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  institution: string;
  password: string;
  role: 'admin' | 'collaborator' | 'researcher';
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  institution: string;
  role: 'admin' | 'collaborator' | 'researcher';
  is_active: boolean;
}

export interface UsersListResponse {
  success: boolean;
  users: User[];
  total: number;
  message?: string;
}

export interface UserResponse {
  success: boolean;
  user?: User;
  message?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Project Types
export interface Project {
  id: number;
  title: string;
  responsible_person: string;
  summary: string;
  description?: string;
  status: 'active' | 'completed';
  area?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  institution?: string;
  document_filename?: string;
  document_url?: string;
  document_size?: number;
  document_type?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  creator_institution?: string;
}

export interface CreateProjectRequest {
  title: string;
  responsible_person: string;
  summary: string;
  status: 'active' | 'completed';
}

export interface UpdateProjectRequest {
  title: string;
  responsible_person: string;
  summary: string;
  status: 'active' | 'completed';
}

export interface ProjectsListResponse {
  success: boolean;
  projects: Project[];
  total: number;
  message?: string;
}

export interface ProjectResponse {
  success: boolean;
  project?: Project;
  message?: string;
}

export interface UploadResponse {
  success: boolean;
  filename?: string;
  url?: string;
  size?: number;
  type?: string;
  message?: string;
}

// Monitoring Types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: CheckResult;
    memory: CheckResult;
    connectivity: CheckResult;
  };
}

export interface CheckResult {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  duration: number;
  details?: any;
}

export interface LogEntry {
  id: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
  metadata?: any;
}

export interface ErrorEntry {
  id: string;
  message: string;
  stack?: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  context?: any;
}

export interface SystemMetrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    averageResponseTime: number;
  };
  users: {
    total: number;
    active: number;
    admins: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
}

export interface MonitoringResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// Public Portal Types - HU-08: Portal Público de Proyectos
export interface PublicProject {
  id: number;
  title: string;
  summary: string;
  description?: string;
  status: 'active' | 'completed';
  area?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  institution?: string;
  responsible_person: string;
  created_at: string;
  updated_at?: string;
  creator_name?: string;
  creator_institution?: string;
  has_documents?: boolean;
  // Note: document_url is intentionally excluded for security
}

export interface PublicProjectsResponse {
  success: boolean;
  projects: PublicProject[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  message?: string;
}

export interface PublicProjectResponse {
  success: boolean;
  project?: PublicProject;
  message?: string;
}

export interface PublicStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_budget: number;
  by_area: Record<string, number>;
  by_institution: Record<string, number>;
  recent_projects: {
    id: number;
    title: string;
    institution?: string;
    created_at: string;
  }[];
}

export interface PublicStatsResponse {
  success: boolean;
  stats: PublicStats;
  message?: string;
}

// HU-09: Sistema de Noticias/Blog - Type Definitions
export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
}

export interface NewsTag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image?: string;
  author_id: number;
  author_name?: string;
  author_email?: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  tags: NewsTag[];
  views_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNewsArticleRequest {
  title: string;
  summary: string;
  content: string;
  featured_image?: string;
  category_id: number;
  tag_ids: number[];
  status: 'draft' | 'published';
  is_featured: boolean;
  published_at?: string;
}

export interface UpdateNewsArticleRequest {
  title: string;
  summary: string;
  content: string;
  featured_image?: string;
  category_id: number;
  tag_ids: number[];
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  published_at?: string;
}

export interface NewsListResponse {
  success: boolean;
  articles: NewsArticle[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  message?: string;
}

export interface NewsArticleResponse {
  success: boolean;
  article?: NewsArticle;
  message?: string;
}

export interface NewsPublicResponse {
  success: boolean;
  articles: {
    id: number;
    title: string;
    slug: string;
    summary: string;
    featured_image?: string;
    author_name: string;
    category_name: string;
    category_slug: string;
    views_count: number;
    published_at: string;
    tags: string[];
  }[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  message?: string;
}

export interface PublicNewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image?: string;
  author_name: string;
  category_name: string;
  category_slug: string;
  tags: string[];
  views_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface PublicNewsArticleResponse {
  success: boolean;
  article?: PublicNewsArticle;
  message?: string;
}