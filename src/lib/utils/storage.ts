/**
 * Utility for Supabase Storage operations.
 * Handles file naming, validation, and directory structure.
 */

import { v4 as uuidv4 } from 'uuid';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadOptions {
  bucket: 'avatars' | 'post-images';
  folder?: string; // e.g., userId or postId
  fileName?: string;
}

/**
 * Validates file type and size.
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مدعوم. يرجى اختيار JPG أو PNG أو WEBP.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت.' };
  }
  return { valid: true };
}

/**
 * Generates a secure, unique file path.
 * Format: [folder]/[uuid]-[timestamp].[ext]
 */
export function generateStoragePath(file: File, options: UploadOptions): string {
  const ext = file.name.split('.').pop();
  const uniqueName = `${uuidv4()}-${Date.now()}.${ext}`;
  
  if (options.folder) {
    return `${options.folder}/${uniqueName}`;
  }
  
  return uniqueName;
}

/**
 * Extracts the file name from a public URL or path.
 */
export function getFileNameFromPath(path: string): string {
  return path.split('/').pop() || '';
}
