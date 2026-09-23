export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  authMethods: AuthMethod[];
}

export type AuthMethod = 'PASSWORD' | 'APPLE';
export type SocialProvider = Exclude<AuthMethod, 'PASSWORD'>;

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SocialAuthPayload {
  provider: SocialProvider;
  idToken: string;
  displayName?: string;
  authorizationCode?: string;
}

export type DeleteAccountPayload =
  | { method: 'PASSWORD'; password: string }
  | {
      method: SocialProvider;
      idToken: string;
      authorizationCode?: string;
    };
