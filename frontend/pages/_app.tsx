import "../styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState, type ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// หน้าที่ไม่ต้อง login ก็เข้าได้ (login, สมัครสมาชิก, ลืมรหัสผ่าน)
const PUBLIC_PATHS = ["/", "/register", "/forgot-password", "/reset-password"];

const THEME = createTheme({
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "'Kanit', sans-serif",
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 500, textTransform: "none" },
  },
  palette: {
    mode: "light",
    primary: {
      light: "#5CA89F",
      main: "#2F7268",
      dark: "#1F4F49",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff8a65",
      main: "#E85D4F",
      dark: "#c0392b",
      contrastText: "#fff",
    },
    info: {
      light: "#E9F5F3",
      main: "#368980",
      dark: "#1F4F49",
      contrastText: "#fff",
    },
    success: {
      main: "#3FA66B",
    },
    warning: {
      main: "#E8A33D",
    },
    error: {
      main: "#E0524A",
    },
    background: {
      default: "#E3EEEA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E2A28",
      secondary: "#5F716E",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#E3EEEA",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0 6px 24px rgba(31, 79, 73, 0.08)",
          border: "1px solid rgba(47, 114, 104, 0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 4px 16px rgba(31, 79, 73, 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 8,
          paddingBottom: 8,
        },
        contained: {
          boxShadow: "0 4px 12px rgba(47, 114, 104, 0.25)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(47, 114, 104, 0.32)",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#fff",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: "#EFF5F3",
          color: "#1F4F49",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

// เดิมไม่มีการเช็คฝั่ง frontend เลยว่า login อยู่ไหมก่อนโหลดหน้า — ถ้าเปิด
// URL ของหน้าที่ต้อง login (เช่น copy ไปวางเบราว์เซอร์อื่น) จะเห็นแค่หน้า
// เปล่าๆ โหลดข้อมูลไม่ขึ้นแบบเงียบๆ (เพราะ API เรียกไปโดน 401 แต่ไม่มีอะไร
// จัดการต่อ) เช็คตรงนี้ทำให้เด้งกลับไปหน้า login ทันทีแทน พร้อมข้อความชัดเจน
function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.includes(router.pathname);
    const hasToken =
      typeof window !== "undefined" && !!localStorage.getItem("token");

    if (!isPublic && !hasToken) {
      router.replace("/");
      return;
    }

    setReady(true);
  }, [router.pathname]);

  // กันไม่ให้หน้า protected เรนเดอร์แวบเดียวก่อนจะรู้ตัวว่าไม่มี token
  if (!ready && !PUBLIC_PATHS.includes(router.pathname)) {
    return null;
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={THEME}>
      <CssBaseline />
      {/* คอนเทนเนอร์เดียวสำหรับ toast ทั้งแอป — ต้องอยู่นอก AuthGuard เพราะ
          AuthGuard คืนค่า null ชั่วคราวตอนเช็ค token ยังไม่เสร็จ ถ้าใส่ไว้
          ข้างในจะโดน unmount ไปด้วยตอนนั้น แล้ว toast ที่ยิงมาก่อนหน้าจะ
          หายไปเงียบๆ — แต่ละหน้าไม่ควรมี <ToastContainer /> ของตัวเองซ้ำอีก */}
      <ToastContainer />
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </ThemeProvider>
  );
}