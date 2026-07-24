import {
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Email, Lock, School, Visibility, VisibilityOff } from "@mui/icons-material";
import router from "next/router";
import React from "react";
import { Api } from "./api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BasicCard() {
  const [data, setData] = React.useState({
    user_email: "",
    user_password: "",
  });
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [failedAttempts, setFailedAttempts] = React.useState(0);

  const onLogin = async () => {
    if (isLoggingIn) return; // กันกดซ้ำระหว่างรอ API ตอบกลับ

    if (!data.user_email.trim() || !data.user_password) {
      toast.warning("กรุณากรอกอีเมลและรหัสผ่านให้ครบ", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
      return;
    }

    if (!data.user_email.includes("@")) {
      toast.warning("รูปแบบอีเมลไม่ถูกต้อง", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await Api.post("/login", data);
      // Backend now returns { token, user: profile } instead of the
      // profile object directly, and every protected endpoint requires
      // that token in an Authorization header — so it has to be saved.
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("Logged", JSON.stringify(user));
      localStorage.setItem("rid", user.id);
      setFailedAttempts(0);

      if (user.stu_id || (user.lect_roomnum !== undefined) || user.role_id === 3) {
        toast.success("เข้าสู่ระบบสำเร็จ", {
          position: "top-center",
          autoClose: 1200,
          theme: "colored",
        });
      }

      if (user.stu_id) {
        setTimeout(() => router.push("/stu_home"), 800);
      } else if (user.lect_roomnum !== undefined) {
        setTimeout(() => router.push("/lect_home"), 800);
      } else if (user.role_id === 3) {
        setTimeout(() => router.push("/admin"), 800);
      } else {
        toast.error("ไม่พบข้อมูลที่เหมาะสม", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        setIsLoggingIn(false);
      }
    } catch (error: any) {
      const nextAttemptCount = failedAttempts + 1;
      setFailedAttempts(nextAttemptCount);

      const baseMessage =
        error?.response?.data?.message ||
        "เกิดข้อผิดพลาดในการส่งข้อมูล อีเมลหรือรหัสผ่านไม่ถูกต้อง";

      // express-rate-limit ใส่ header บอกโควต้าที่เหลือมาให้ (ต้องเปิด
      // exposedHeaders ที่ backend ไว้แล้วถึงจะอ่านได้ตรงนี้) ใช้ค่านี้
      // เป็นความจริงจากฝั่ง server แทนการนับเองล้วนๆ ฝั่ง frontend
      const remainingHeader = error?.response?.headers?.["ratelimit-remaining"];
      const limitHeader = error?.response?.headers?.["ratelimit-limit"];
      const remaining = remainingHeader !== undefined ? Number(remainingHeader) : null;
      const limit = limitHeader !== undefined ? Number(limitHeader) : null;

      let detail = `ผิดไปแล้ว ${nextAttemptCount} ครั้ง`;
      if (remaining !== null && limit !== null) {
        detail += ` (เหลืออีก ${remaining} จาก ${limit} ครั้ง ก่อนถูกระงับชั่วคราว)`;
      }

      toast.error(
        error?.response?.status === 429 ? baseMessage : `${baseMessage} — ${detail}`,
        {
          position: "top-center",
          autoClose: 3500,
          theme: "colored",
        }
      );
      setIsLoggingIn(false);
    }
  };

  React.useEffect(() => {
    if (localStorage.getItem("Logged")) {
      router.push("/");
    }
  }, []);

  const handleData = (event: any) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
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
      <ToastContainer />
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
        {/* Left brand panel */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            width: 360,
            p: 5,
            color: "#fff",
            background:
              "linear-gradient(160deg, #2F7268 0%, #1F4F49 100%)",
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
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, lineHeight: 1.3 }}>
              แจ้งปัญหาการเรียน ง่าย รวดเร็ว ติดตามได้ทุกขั้นตอน
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              ระบบสำหรับนักศึกษาและอาจารย์ ใช้ติดตามและจัดการปัญหาด้านการเรียนการสอนในที่เดียว
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} Students Report Problems
          </Typography>
        </Box>

        {/* Right form panel */}
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
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            เข้าสู่ระบบ
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานบัญชีของคุณ
          </Typography>

          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              onLogin();
            }}
          >
            <TextField
              label="E-mail address"
              name="user_email"
              size="medium"
              onChange={handleData}
              disabled={isLoggingIn}
              fullWidth
              autoComplete="email"
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              name="user_password"
              size="medium"
              onChange={handleData}
              type={showPassword ? "text" : "password"}
              disabled={isLoggingIn}
              fullWidth
              autoComplete="current-password"
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="body2" sx={{ mb: 3.5, textAlign: "right" }}>
              <Box
                component="a"
                href="/forgot-password"
                sx={{ color: "primary.main", fontWeight: 600 }}
              >
                ลืมรหัสผ่าน?
              </Box>
            </Typography>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isLoggingIn}
              sx={{ fontWeight: 600, py: 1.4 }}
            >
              {isLoggingIn ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
            ยังไม่มีบัญชี?{" "}
            <Box
              component="a"
              href="/register"
              sx={{ color: "primary.main", fontWeight: 600 }}
            >
              สมัครสมาชิก
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}