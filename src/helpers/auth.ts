let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens({ newAccessToken, newRefreshToken }: { newAccessToken: string; newRefreshToken: string }) {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
}

export function setAccessToken(newAccessToken: string) {
    accessToken = newAccessToken;
}

export function getAccessToken(): string | null {
    return accessToken;
}

export function getRefreshToken(): string | null {
    return refreshToken;
}

export function clearTokens() {
    accessToken = null;
    refreshToken = null;
}
