import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSession, isAdminSession } from '@/lib/session';
import {
  ALLOWED_WORK_VIDEO_TYPES,
  getWorkVideoContentType,
  MAX_WORK_VIDEO_BYTES,
  WORK_MEDIA_BUCKET
} from '@/lib/workMedia';

export const dynamic = 'force-dynamic';

const EXTENSION_BY_TYPE: Record<(typeof ALLOWED_WORK_VIDEO_TYPES)[number], string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-m4v': 'm4v'
};

async function ensurePublicMediaBucket() {
  if (!supabase) throw new Error('Media storage is not configured.');

  const { data: bucket, error: bucketError } = await supabase.storage.getBucket(WORK_MEDIA_BUCKET);
  if (!bucket && bucketError) {
    const { error: createError } = await supabase.storage.createBucket(WORK_MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: MAX_WORK_VIDEO_BYTES,
      allowedMimeTypes: [...ALLOWED_WORK_VIDEO_TYPES]
    });
    if (createError && !createError.message.toLowerCase().includes('already exists')) {
      throw createError;
    }
    return;
  }

  if (bucket && !bucket.public) {
    const { error: updateError } = await supabase.storage.updateBucket(WORK_MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: MAX_WORK_VIDEO_BYTES,
      allowedMimeTypes: [...ALLOWED_WORK_VIDEO_TYPES]
    });
    if (updateError) throw updateError;
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminSession(getSession(request))) {
      return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
    }
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ error: 'Media storage is not configured.' }, { status: 503 });
    }

    const body = await request.json();
    const contentType = getWorkVideoContentType(String(body.contentType || ''), String(body.fileName || ''));
    const size = Number(body.size);

    if (!contentType) {
      return NextResponse.json({ error: 'Only MP4, MOV, M4V, and WebM videos are supported.' }, { status: 400 });
    }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_WORK_VIDEO_BYTES) {
      return NextResponse.json({ error: 'Video must be 50 MB or smaller.' }, { status: 400 });
    }

    await ensurePublicMediaBucket();

    const extension = EXTENSION_BY_TYPE[contentType as keyof typeof EXTENSION_BY_TYPE];
    const now = new Date();
    const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.${extension}`;
    const { data, error } = await supabase.storage
      .from(WORK_MEDIA_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) throw error || new Error('Could not create upload URL.');

    const { data: publicData } = supabase.storage.from(WORK_MEDIA_BUCKET).getPublicUrl(path);
    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path,
      publicUrl: publicData.publicUrl
    });
  } catch (error) {
    console.error('Work video upload initialization failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not prepare video upload.' },
      { status: 500 }
    );
  }
}
