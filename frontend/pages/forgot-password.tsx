import {
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Email, School } from "@mui/icons-material";
import router from "next/router";
import React from "react";
import { Api } from "./api/api";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = () => {
    if (!email) {
      alert("กรุณากรอกอีเมล");
      return;
    }
    setLoading(true);
    Api.post("/forgot-password", { user_email: email })
      .then(() => {
        // Backend always returns success here regardless of whether the
        // email exists, to avoid leaking which emails are registered.
        setSent(true);
      })
      .catch(() => {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 15% 20%, rgba(63,182,164,0.25), transparent 45%), radial-gradient(circle at 85% 80%, rgba(31,79,73,0.3), transparent 45%), linear-gradient(135deg, #1F4F49 0%, #2F7268 55%, #3FB6A4 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 920,
          borderRadius: 5,
          overflow: "hidden",
          display: "flex",
          boxShadow: "0 30px 70px rgba(15,40,37,0.35)",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            width: 360,
            p: 5,
            color: "#fff",
            background: "linear-gradient(160deg, #2F7268 0%, #1F4F49 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                backgroundColor: "rgba(255,255,255,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <School />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Report Hub
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, mb: 2, lineHeight: 1.3 }}
            >
              ลืมรหัสผ่าน ไม่ใช่เรื่องใหญ่
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              กรอกอีเมลที่ใช้สมัคร แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} Students Report Problems
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            backgroundColor: "#fff",
            p: { xs: 4, sm: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {sent ? (
            <>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                ตรวจสอบอีเมลของคุณ
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                หากอีเมล <strong>{email}</strong> มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับ
                รีเซ็ตรหัสผ่านไปให้แล้ว (ลิงก์มีอายุ 15 นาที) ลองเช็คโฟลเดอร์สแปม
                ด้วยถ้าไม่เจอในกล่องขาเข้า
              </Typography>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/")}
                sx={{ fontWeight: 600, py: 1.4 }}
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                ลืมรหัสผ่าน
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้
              </Typography>

              <TextField
                label="E-mail address"
                size="medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                sx={{ mb: 3.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                size="large"
                onClick={onSubmit}
                disabled={loading}
                sx={{ fontWeight: 600, py: 1.4 }}
              >
                {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
              </Button>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 3, textAlign: "center" }}
              >
                <Box
                  component="a"
                  href="/"
                  sx={{ color: "primary.main", fontWeight: 600 }}
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Box>
              </Typography>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
