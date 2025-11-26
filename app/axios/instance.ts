import axios from "axios";

// Use environment variable in production/deployment; fallback to `/api` for client
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // localStorage is only available in the browser
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            // Use full baseURL so refresh works in deployed environments
            const { data } = await axios.post(`${baseURL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken: newAccessToken } = data;
            localStorage.setItem("accessToken", newAccessToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          } catch (err) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
