import { File, UploadType } from 'expo-file-system';
import type { ImagePickerAsset } from 'expo-image-picker';

/**
 * The backend binds contentType into the presigned URL's signature, so R2 rejects a PUT whose
 * actual Content-Type header doesn't match — mimeType is usually present, but some Android
 * ContentProviders omit it, so fall back to a sane default based on the picked media kind.
 */
export function resolveContentType(asset: ImagePickerAsset): string {
  return asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
}

/**
 * Reads the actual file size from disk rather than trusting `asset.fileSize` (which some
 * pickers/platforms leave undefined) — the backend signs this exact size into the presigned
 * URL, so an inaccurate value causes R2 to reject the upload.
 */
export function getAssetFileSize(asset: ImagePickerAsset): number {
  return new File(asset.uri).size;
}

/** Uploads a picked asset's raw bytes directly to a presigned PUT URL (e.g. Cloudflare R2). */
export async function uploadAssetToPresignedUrl(
  asset: ImagePickerAsset,
  uploadUrl: string,
  contentType: string
): Promise<void> {
  const file = new File(asset.uri);
  const result = await file.upload(uploadUrl, {
    httpMethod: 'PUT',
    uploadType: UploadType.BINARY_CONTENT,
    headers: { 'Content-Type': contentType },
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed with status ${result.status}`);
  }
}
