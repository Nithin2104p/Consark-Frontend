import axios from "axios";

export const API_BASE_URL = "http://localhost:3000/api";
export const TOKEN_KEY = "consark_token";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
    onUnauthorized = handler;
}

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem("consark_user");
            onUnauthorized?.();
        }
        return Promise.reject(error);
    }
);

