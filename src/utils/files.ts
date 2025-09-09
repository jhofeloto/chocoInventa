// CODECTI Platform - File Utilities

export const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc'
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileType(contentType: string): boolean {
  return Object.keys(ALLOWED_FILE_TYPES).includes(contentType);
}

export function getFileExtension(contentType: string): string {
  return ALLOWED_FILE_TYPES[contentType as keyof typeof ALLOWED_FILE_TYPES] || '';
}

export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

export function generateFileName(originalName: string, projectId: number): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || '';
  return `project_${projectId}_${timestamp}.${extension}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}