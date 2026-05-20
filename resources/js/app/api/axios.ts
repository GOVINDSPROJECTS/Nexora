import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Intercept responses for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // Session expired or unauthenticated — redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        if (status === 419) {
            // CSRF token mismatch — reload to get fresh token
            window.location.reload();
        }

        return Promise.reject(error);
    }
);

export default api;
