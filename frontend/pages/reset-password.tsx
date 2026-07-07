import {
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Lock, School } from "@mui/icons-material";
import router, { useRouter } from "next/router";
import React from "react";
import { Api } from "./api/api";

export default function ResetPassword() {
  const { query, isReady } = useRouter();
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // The reset link from the email looks like:
  // /reset-password?token=<raw token>&email=<account email>
  const token = typeof query.token === "string" ? query.token : "";
  const email = typeof query.email === "string" ? query.email : "";

  const onSubmit = () => {
    if (!newPassword || !confirmPassword) {
      alert("กรุณากรอกรหัสผ่านให้ครบ");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    if (newPassword.length < 8) {
      alert("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setLoading(true);
    Api.post("/reset-password", {
      user_email: email,
      token,
      new_password: newPassword,
    })
      .then(() => {
        setDone(true);
      })
      .catch((error) => {
        alert(
          error?.response?.data?.message ||
            "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว"
        );
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
              ตั้งรหัสผ่านใหม่
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              เลือกรหัสผ่านใหม่ที่คาดเดายากและไม่ซ้ำกับที่อื่น
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
          {!isReady ? null : done ? (
            <>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                ตั้งรหัสผ่านใหม่สำเร็จ
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                ใช้รหัสผ่านใหม่เข้าสู่ระบบได้เลย
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/")}
                sx={{ fontWeight: 600, py: 1.4 }}
              >
                ไปหน้าเข้าสู่ระบบ
              </Button>
            </>
          ) : !token || !email ? (
            <>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                ลิงก์ไม่ถูกต้อง
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                ลิงก์รีเซ็ตรหัสผ่านนี้ไม่สมบูรณ์ ลองขอลิงก์ใหม่อีกครั้ง
              </Typography>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/forgot-password")}
                sx={{ fontWeight: 600, py: 1.4 }}
              >
                ขอลิงก์ใหม่
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                ตั้งรหัสผ่านใหม่
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                สำหรับบัญชี {email}
              </Typography>

              <TextField
                label="รหัสผ่านใหม่"
                type="password"
                size="medium"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="ยืนยันรหัสผ่านใหม่"
                type="password"
                size="medium"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                sx={{ mb: 3.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" color="action" />
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
                {loading ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
