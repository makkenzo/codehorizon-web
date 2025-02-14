export type AuthState = {
    accessToken: string | null;
    refreshToken: string | null;
};

export type AuthActions = {
    setAccessToken: (accessToken: string | null) => void;
    setRefreshToken: (refreshToken: string | null) => void;
    clearTokens: () => void;
};

export type AuthStore = AuthState & AuthActions;

