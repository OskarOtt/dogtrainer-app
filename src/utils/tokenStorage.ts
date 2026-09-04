import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure, persistent storage for auth tokens. Wraps expo-secure-store (native
 * keychain/keystore) so the rest of the app never talks to the platform storage
 * directly. Web has no native keychain equivalent, so it falls back to
 * AsyncStorage (localStorage-backed) there.
 */
const ACCESS_TOKEN_KEY = 'dogtrainer.accessToken';
const REFRESH_TOKEN_KEY = 'dogtrainer.refreshToken';

const isWeb = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  return isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  await (isWeb ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value));
}

async function removeItem(key: string): Promise<void> {
  await (isWeb ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key));
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const tokenStorage = {
  async getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      getItem(ACCESS_TOKEN_KEY),
      getItem(REFRESH_TOKEN_KEY),
    ]);
    if (!accessToken || !refreshToken) {
      return null;
    }
    return { accessToken, refreshToken };
  },

  async getAccessToken(): Promise<string | null> {
    return getItem(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return getItem(REFRESH_TOKEN_KEY);
  },

  async setTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
      setItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([removeItem(ACCESS_TOKEN_KEY), removeItem(REFRESH_TOKEN_KEY)]);
  },
};
