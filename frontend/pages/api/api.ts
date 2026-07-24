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

// ถ้า backend ปฏิเสธ token (ไม่มี token / token หมดอายุ / token ปลอม) จะตอบ
// กลับมาเป็น 401 หรือ 403 เสมอ (ดู authMiddleware.js) — ดักตรงนี้จุดเดียว
// เพื่อล้าง session ที่ค้างอยู่แล้วเด้งกลับไปหน้า login ให้อัตโนมัติ แทนที่
// จะปล่อยให้หน้าเว็บค้างเป็นหน้าเปล่าๆ โหลดข้อมูลไม่ขึ้นแบบเงียบๆ
Api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (typeof window !== "undefined" && (status === 401 || status === 403)) {
            localStorage.removeItem("token");
            localStorage.removeItem("Logged");
            localStorage.removeItem("rid");
            if (window.location.pathname !== "/") {
                // window.location.href does a full page reload, so any toast
                // shown right here would be wiped out before it's ever seen.
                // Stash the reason in sessionStorage and let the login page
                // read + show it once the reload lands there.
                sessionStorage.setItem("sessionExpiredMessage", "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);