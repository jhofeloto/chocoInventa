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

// HU-10: Sistema de Eventos y Convocatorias - Type Definitions
export interface EventCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  type: 'conference' | 'workshop' | 'seminar' | 'convocatoria' | 'curso' | 'feria';
  category_id: number;
  category_name?: string;
  category_slug?: string;
  organizer_id: number;
  organizer_name?: string;
  organizer_email?: string;
  organizer_institution?: string;
  
  // Event details
  start_date: string;
  end_date: string;
  registration_start?: string;
  registration_end?: string;
  location: string;
  venue?: string;
  address?: string;
  virtual_link?: string;
  is_virtual: boolean;
  is_hybrid: boolean;
  
  // Capacity and registration
  max_participants?: number;
  current_participants: number;
  registration_required: boolean;
  registration_fee?: number;
  is_free: boolean;
  
  // Content and media
  featured_image?: string;
  agenda?: string;
  requirements?: string;
  target_audience?: string;
  learning_objectives?: string;
  
  // Status and visibility
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  is_featured: boolean;
  is_public: boolean;
  
  // SEO and engagement
  tags: string[];
  views_count: number;
  registrations_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id?: number;
  participant_name: string;
  participant_email: string;
  participant_phone?: string;
  participant_institution?: string;
  participant_position?: string;
  
  // Registration details
  registration_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  confirmation_code: string;
  payment_status?: 'pending' | 'paid' | 'refunded';
  payment_reference?: string;
  
  // Additional info
  dietary_requirements?: string;
  accessibility_needs?: string;
  comments?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  short_description: string;
  type: 'conference' | 'workshop' | 'seminar' | 'convocatoria' | 'curso' | 'feria';
  category_id: number;
  
  start_date: string;
  end_date: string;
  registration_start?: string;
  registration_end?: string;
  location: string;
  venue?: string;
  address?: string;
  virtual_link?: string;
  is_virtual: boolean;
  is_hybrid: boolean;
  
  max_participants?: number;
  registration_required: boolean;
  registration_fee?: number;
  is_free: boolean;
  
  featured_image?: string;
  agenda?: string;
  requirements?: string;
  target_audience?: string;
  learning_objectives?: string;
  
  status: 'draft' | 'published';
  is_featured: boolean;
  is_public: boolean;
  tags: string[];
}

export interface UpdateEventRequest {
  title: string;
  description: string;
  short_description: string;
  type: 'conference' | 'workshop' | 'seminar' | 'convocatoria' | 'curso' | 'feria';
  category_id: number;
  
  start_date: string;
  end_date: string;
  registration_start?: string;
  registration_end?: string;
  location: string;
  venue?: string;
  address?: string;
  virtual_link?: string;
  is_virtual: boolean;
  is_hybrid: boolean;
  
  max_participants?: number;
  registration_required: boolean;
  registration_fee?: number;
  is_free: boolean;
  
  featured_image?: string;
  agenda?: string;
  requirements?: string;
  target_audience?: string;
  learning_objectives?: string;
  
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  is_featured: boolean;
  is_public: boolean;
  tags: string[];
}

export interface EventRegistrationRequest {
  participant_name: string;
  participant_email: string;
  participant_phone?: string;
  participant_institution?: string;
  participant_position?: string;
  dietary_requirements?: string;
  accessibility_needs?: string;
  comments?: string;
}

export interface EventsListResponse {
  success: boolean;
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  message?: string;
}

export interface EventResponse {
  success: boolean;
  event?: Event;
  message?: string;
}

export interface EventRegistrationResponse {
  success: boolean;
  registration?: EventRegistration;
  message?: string;
}

export interface PublicEventsResponse {
  success: boolean;
  events: {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    type: string;
    category_name: string;
    category_slug: string;
    organizer_name: string;
    start_date: string;
    end_date: string;
    location: string;
    is_virtual: boolean;
    is_hybrid: boolean;
    is_free: boolean;
    registration_fee?: number;
    current_participants: number;
    max_participants?: number;
    registration_required: boolean;
    featured_image?: string;
    tags: string[];
    views_count: number;
  }[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  message?: string;
}

export interface PublicEventResponse {
  success: boolean;
  event?: {
    id: number;
    title: string;
    slug: string;
    description: string;
    short_description: string;
    type: string;
    category_name: string;
    organizer_name: string;
    organizer_institution: string;
    start_date: string;
    end_date: string;
    registration_start?: string;
    registration_end?: string;
    location: string;
    venue?: string;
    address?: string;
    virtual_link?: string;
    is_virtual: boolean;
    is_hybrid: boolean;
    max_participants?: number;
    current_participants: number;
    registration_required: boolean;
    registration_fee?: number;
    is_free: boolean;
    featured_image?: string;
    agenda?: string;
    requirements?: string;
    target_audience?: string;
    learning_objectives?: string;
    tags: string[];
    views_count: number;
    registrations_count: number;
    can_register: boolean;
    registration_status: 'not_started' | 'open' | 'closed' | 'full';
  };
  message?: string;
}

// HU-11: Resources and Scientific Documents System Types

export interface ResourceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Resource {
  id: number;
  title: string;
  slug: string;
  description: string;
  summary: string;
  type: 'document' | 'video' | 'presentation' | 'dataset' | 'software' | 'manual' | 'guide';
  category_id: number;
  category_name: string;
  category_slug: string;
  
  author: string;
  author_institution: string;
  created_by: number;
  creator_name: string;
  
  file_url?: string;
  file_size?: number;
  file_type?: string;
  download_url?: string;
  external_url?: string;
  
  language: string;
  publication_date: string;
  keywords: string[];
  tags: string[];
  
  is_featured: boolean;
  is_public: boolean;
  status: 'draft' | 'published' | 'archived';
  
  downloads_count: number;
  views_count: number;
  
  created_at: string;
  updated_at: string;
}

export interface CreateResourceRequest {
  title: string;
  description: string;
  summary: string;
  type: 'document' | 'video' | 'presentation' | 'dataset' | 'software' | 'manual' | 'guide';
  category_id: number;
  
  author: string;
  author_institution: string;
  
  file_url?: string;
  external_url?: string;
  
  language: string;
  publication_date: string;
  keywords: string[];
  tags: string[];
  
  is_featured: boolean;
  is_public: boolean;
  status: 'draft' | 'published' | 'archived';
}

export interface UpdateResourceRequest {
  title: string;
  description: string;
  summary: string;
  type: 'document' | 'video' | 'presentation' | 'dataset' | 'software' | 'manual' | 'guide';
  category_id: number;
  
  author: string;
  author_institution: string;
  
  file_url?: string;
  external_url?: string;
  
  language: string;
  publication_date: string;
  keywords: string[];
  tags: string[];
  
  is_featured: boolean;
  is_public: boolean;
  status: 'draft' | 'published' | 'archived';
}

export interface ResourcesListResponse {
  success: boolean;
  data: {
    resources: Resource[];
    total: number;
  };
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface ResourceResponse {
  success: boolean;
  data?: Resource;
  message?: string;
}

export interface PublicResourcesResponse {
  success: boolean;
  data: {
    resources: {
      id: number;
      title: string;
      slug: string;
      summary: string;
      type: string;
      category_name: string;
      category_slug: string;
      author: string;
      author_institution: string;
      publication_date: string;
      language: string;
      file_type?: string;
      file_size?: number;
      external_url?: string;
      keywords: string[];
      tags: string[];
      downloads_count: number;
      views_count: number;
    }[];
    total: number;
  };
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface PublicResourceResponse {
  success: boolean;
  data?: {
    id: number;
    title: string;
    slug: string;
    description: string;
    summary: string;
    type: string;
    category_name: string;
    author: string;
    author_institution: string;
    publication_date: string;
    language: string;
    file_url?: string;
    file_type?: string;
    file_size?: number;
    download_url?: string;
    external_url?: string;
    keywords: string[];
    tags: string[];
    downloads_count: number;
    views_count: number;
  };
  message?: string;
}

// HU-12: Analytics and Reports System Types

export interface AnalyticsMetrics {
  // Platform overview
  overview: {
    total_projects: number;
    total_users: number;
    total_news: number;
    total_events: number;
    total_resources: number;
    active_projects: number;
    published_news: number;
    upcoming_events: number;
    public_resources: number;
  };
  
  // Projects analytics
  projects: {
    by_status: {
      active: number;
      completed: number;
    };
    by_area: Record<string, number>;
    by_institution: Record<string, number>;
    by_month: Array<{
      month: string;
      count: number;
    }>;
    recent_activity: Array<{
      id: number;
      title: string;
      created_at: string;
      status: string;
    }>;
  };
  
  // Users analytics
  users: {
    by_role: {
      admin: number;
      collaborator: number;
      researcher: number;
    };
    by_institution: Record<string, number>;
    active_users: number;
    inactive_users: number;
    recent_registrations: Array<{
      id: number;
      name: string;
      email: string;
      role: string;
      created_at: string;
    }>;
  };
  
  // News analytics
  news: {
    by_status: {
      draft: number;
      published: number;
      archived: number;
    };
    by_category: Record<string, number>;
    total_views: number;
    most_viewed: Array<{
      id: number;
      title: string;
      views_count: number;
      category_name: string;
    }>;
    recent_articles: Array<{
      id: number;
      title: string;
      status: string;
      views_count: number;
      created_at: string;
    }>;
  };
  
  // Events analytics
  events: {
    by_status: {
      draft: number;
      published: number;
      cancelled: number;
      completed: number;
    };
    by_type: Record<string, number>;
    by_category: Record<string, number>;
    total_registrations: number;
    upcoming_count: number;
    most_popular: Array<{
      id: number;
      title: string;
      registrations_count: number;
      views_count: number;
      start_date: string;
    }>;
  };
  
  // Resources analytics
  resources: {
    by_status: {
      draft: number;
      published: number;
      archived: number;
    };
    by_type: Record<string, number>;
    by_category: Record<string, number>;
    total_downloads: number;
    total_views: number;
    most_downloaded: Array<{
      id: number;
      title: string;
      downloads_count: number;
      views_count: number;
      type: string;
    }>;
  };
  
  // Engagement metrics
  engagement: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    bounce_rate: number;
    avg_session_duration: number;
    page_views: Record<string, number>;
  };
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsMetrics;
  generated_at: string;
  message?: string;
}

export interface ReportFilter {
  date_from?: string;
  date_to?: string;
  category?: string;
  status?: string;
  type?: string;
  institution?: string;
  author?: string;
}

export interface GenerateReportRequest {
  report_type: 'projects' | 'users' | 'news' | 'events' | 'resources' | 'comprehensive';
  format: 'json' | 'csv' | 'pdf';
  filters?: ReportFilter;
  include_charts?: boolean;
  include_details?: boolean;
}

export interface ReportResponse {
  success: boolean;
  data?: {
    report_id: string;
    report_type: string;
    format: string;
    generated_at: string;
    download_url?: string;
    file_size?: number;
    expires_at?: string;
  };
  message?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'pie' | 'radar' | 'polarArea';
  data: ChartData;
  options?: {
    responsive?: boolean;
    plugins?: {
      title?: {
        display: boolean;
        text: string;
      };
      legend?: {
        display: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
      };
    };
    scales?: {
      y?: {
        beginAtZero: boolean;
        title?: {
          display: boolean;
          text: string;
        };
      };
      x?: {
        title?: {
          display: boolean;
          text: string;
        };
      };
    };
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  size: 'small' | 'medium' | 'large' | 'full';
  data: any;
  config?: any;
  order: number;
  visible: boolean;
}

// HU-13: Advanced File Management System Types

export interface FileDocument {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_extension: string;
  
  // File metadata
  title?: string;
  description?: string;
  tags: string[];
  category: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  
  // File organization
  folder_path: string;
  is_public: boolean;
  access_level: 'public' | 'internal' | 'private' | 'restricted';
  
  // Relationships
  entity_type: 'project' | 'event' | 'resource' | 'news' | 'user' | 'general';
  entity_id?: number;
  parent_folder_id?: string;
  
  // Version control
  version: number;
  is_current_version: boolean;
  previous_version_id?: string;
  
  // User tracking
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_by_email: string;
  
  // Usage metrics
  download_count: number;
  view_count: number;
  last_accessed_at?: string;
  
  // File status
  status: 'active' | 'archived' | 'deleted';
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Additional metadata
  checksum?: string;
  thumbnail_url?: string;
  preview_url?: string;
  external_url?: string;
  
  // Permissions
  can_edit: boolean;
  can_delete: boolean;
  can_share: boolean;
}

export interface FileFolder {
  id: string;
  name: string;
  path: string;
  parent_id?: string;
  
  // Folder metadata
  description?: string;
  color?: string;
  icon?: string;
  
  // Relationships
  entity_type: 'project' | 'event' | 'resource' | 'news' | 'user' | 'general';
  entity_id?: number;
  
  // Permissions
  is_public: boolean;
  access_level: 'public' | 'internal' | 'private' | 'restricted';
  
  // User tracking
  created_by: number;
  created_by_name: string;
  
  // Statistics
  file_count: number;
  folder_count: number;
  total_size: number;
  
  // Status
  status: 'active' | 'archived' | 'deleted';
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface FileUploadRequest {
  file: File | ArrayBuffer;
  filename: string;
  title?: string;
  description?: string;
  tags?: string[];
  category: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  folder_path?: string;
  entity_type: 'project' | 'event' | 'resource' | 'news' | 'user' | 'general';
  entity_id?: number;
  is_public?: boolean;
  access_level?: 'public' | 'internal' | 'private' | 'restricted';
}

export interface FileUploadResponse {
  success: boolean;
  data?: FileDocument;
  message?: string;
  upload_progress?: number;
}

export interface FileListRequest {
  entity_type?: 'project' | 'event' | 'resource' | 'news' | 'user' | 'general';
  entity_id?: number;
  folder_path?: string;
  category?: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  access_level?: 'public' | 'internal' | 'private' | 'restricted';
  status?: 'active' | 'archived' | 'deleted';
  search?: string;
  tags?: string[];
  sort_by?: 'created_at' | 'updated_at' | 'filename' | 'file_size' | 'download_count';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface FileListResponse {
  success: boolean;
  data: {
    files: FileDocument[];
    folders: FileFolder[];
    total_files: number;
    total_folders: number;
    total_size: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
    pages: number;
    current_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
  message?: string;
}

export interface FileUpdateRequest {
  title?: string;
  description?: string;
  tags?: string[];
  category?: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  folder_path?: string;
  is_public?: boolean;
  access_level?: 'public' | 'internal' | 'private' | 'restricted';
  status?: 'active' | 'archived' | 'deleted';
}

export interface FileVersionInfo {
  id: string;
  version: number;
  filename: string;
  file_size: number;
  checksum: string;
  uploaded_by: number;
  uploaded_by_name: string;
  created_at: string;
  change_notes?: string;
  is_current: boolean;
}

export interface FileVersionHistory {
  success: boolean;
  data: {
    current_file: FileDocument;
    versions: FileVersionInfo[];
    total_versions: number;
  };
  message?: string;
}

export interface FolderCreateRequest {
  name: string;
  path?: string;
  parent_id?: string;
  description?: string;
  color?: string;
  icon?: string;
  entity_type: 'project' | 'event' | 'resource' | 'news' | 'user' | 'general';
  entity_id?: number;
  is_public?: boolean;
  access_level?: 'public' | 'internal' | 'private' | 'restricted';
}

export interface FileSearchRequest {
  query: string;
  entity_type?: 'project' | 'event' | 'resource' | 'news' | 'user' | 'general';
  entity_id?: number;
  category?: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  file_extension?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
  min_size?: number;
  max_size?: number;
  uploaded_by?: number;
  limit?: number;
  offset?: number;
}

export interface FileSearchResponse {
  success: boolean;
  data: {
    files: FileDocument[];
    total_results: number;
    search_time_ms: number;
    suggestions?: string[];
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface FileStats {
  total_files: number;
  total_folders: number;
  total_size: number;
  total_downloads: number;
  total_views: number;
  files_by_category: Record<string, number>;
  files_by_extension: Record<string, number>;
  files_by_access_level: Record<string, number>;
  storage_usage_by_entity: Record<string, number>;
  top_downloaded: FileDocument[];
  recent_uploads: FileDocument[];
  large_files: FileDocument[];
}

export interface FileStatsResponse {
  success: boolean;
  data: FileStats;
  generated_at: string;
  message?: string;
}