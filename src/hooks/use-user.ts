import { useMutation } from '@tanstack/react-query';
import type { ImagePickerAsset } from 'expo-image-picker';

import { usersApi } from '@/api/users';
import { useAuth } from '@/hooks/use-auth';
import type { DeleteAccountPayload } from '@/types/auth';
import { getAssetFileSize, resolveContentType, uploadAssetToPresignedUrl } from '@/utils/upload';

/** Full presign → upload → confirm flow for the current user's avatar. */
export function useUpdateAvatar() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: async (asset: ImagePickerAsset) => {
      const contentType = resolveContentType(asset);
      const fileSizeBytes = getAssetFileSize(asset);
      const { uploadUrl, objectKey } = await usersApi.getAvatarUploadUrl({ contentType, fileSizeBytes });
      await uploadAssetToPresignedUrl(asset, uploadUrl, contentType);
      return usersApi.confirmAvatar(objectKey);
    },
    onSuccess: (user) => setUser(user),
  });
}

export function useRemoveAvatar() {
  const { user, setUser } = useAuth();
  return useMutation({
    mutationFn: () => usersApi.removeAvatar(),
    onSuccess: () => {
      if (user) {
        setUser({ ...user, avatarUrl: null });
      }
    },
  });
}

/** Only sends the request — the caller (profile screen) clears the local session on success. */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: (payload: DeleteAccountPayload) => usersApi.deleteAccount(payload),
  });
}
