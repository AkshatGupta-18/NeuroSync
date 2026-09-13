import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// Shared promise prevents multiple API requests from refreshing
// the token at the same time.
let refreshPromise = null;

async function refreshAccessToken() {
  // If another request is already refreshing the token,
  // wait for that same refresh operation.
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (!response.ok) {
        clearTokens();
        return null;
      }

      const data = await response.json();

      saveTokens(data.access, data.refresh || refreshToken);

      return data.access;
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearTokens();
      return null;
    } finally {
      // Allow a future refresh after this operation finishes.
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function apiRequest(endpoint, options = {}, retry = true) {
  const accessToken = getAccessToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      return apiRequest(endpoint, options, false);
    }

    clearTokens();
  }

  return response;
}

export {
  API_BASE_URL,
  apiRequest,
  refreshAccessToken,
};