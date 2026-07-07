import axios from "axios";

export const Api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
});

// The backend's verifyToken middleware requires an Authorization header on
// every protected route. Nothing was attaching it anywhere before, so every
// call past login was silently guaranteed to 401. Attach it here once,
// centrally, instead of repeating it in every page.
Api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

