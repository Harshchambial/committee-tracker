const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v)(?:$|[?#])/i;

export const WORK_MEDIA_BUCKET = 'public-work-media';
export const MAX_WORK_VIDEO_BYTES = 50 * 1024 * 1024;
export const ALLOWED_WORK_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v'
] as const;

const VIDEO_TYPE_BY_EXTENSION: Record<string, (typeof ALLOWED_WORK_VIDEO_TYPES)[number]> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v'
};

export function getWorkVideoContentType(contentType: string, fileName: string): string | null {
  const normalizedType = contentType.toLowerCase();
  if (ALLOWED_WORK_VIDEO_TYPES.includes(normalizedType as (typeof ALLOWED_WORK_VIDEO_TYPES)[number])) {
    return normalizedType;
  }
  const extension = fileName.toLowerCase().split('.').pop() || '';
  return VIDEO_TYPE_BY_EXTENSION[extension] || null;
}

export function isVideoMedia(source: string): boolean {
  return source.startsWith('data:video/') || VIDEO_EXTENSIONS.test(source);
}
