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
  status: 'active' | 'completed';
  document_filename?: string;
  document_url?: string;
  document_size?: number;
  document_type?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator_name?: string;
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