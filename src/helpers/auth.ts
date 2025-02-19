let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens({ newAccessToken, newRefreshToken }: { newAccessToken: string; newRefreshToken: string }) {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
}

export function setAccessToken(newAccessToken: string) {
    accessToken = newAccessToken;
    localStorage.setItem('accessToken', newAccessToken);
}

export function setRefreshToken(newRefreshToken: string) {
    refreshToken = newRefreshToken;
    localStorage.setItem('refreshToken', newRefreshToken);
}

export function getAccessToken(): string | null {
    return accessToken || localStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
    return refreshToken || localStorage.getItem('refreshToken');
}

export function clearTokens() {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

