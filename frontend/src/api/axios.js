import axios from 'axios';

let accessToken = null;
let onTokenRefresh = null;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,
});

export const setAccessToken = (token) => {
    accessToken = token;
};

export const setOnTokenRefresh = (callback) => {
    onTokenRefresh = callback;
};

// Request interceptor
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Call refresh endpoint directly using axios (avoid same interceptor)
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                
                const { access_token, user } = res.data;
                accessToken = access_token;
                
                // Notify AuthContext if callback is provided
                if (onTokenRefresh) {
                    onTokenRefresh(access_token, user);
                }
                
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Completely failed to refresh
                accessToken = null;
                if (onTokenRefresh) {
                    onTokenRefresh(null, null);
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
