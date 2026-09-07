/** Mirrors the backend's storage.dto.UploadUrlRequest/UploadUrlResponse shapes. */
export interface UploadUrlRequest {
  contentType: string;
  fileSizeBytes: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}
