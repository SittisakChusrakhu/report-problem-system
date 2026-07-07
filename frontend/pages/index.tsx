import {
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Email, Lock, School } from "@mui/icons-material";
import router from "next/router";
import React from "react";
import { Api } from "./api/api";

export default function BasicCard() {
  const [data, setData] = React.useState({
    user_email: "",
    user_password: "",
  });

  const onLogin = () => {
    Api.post("/login", data)
      .then((res) => {
        // Backend now returns { token, user: profile } instead of the
        // profile object directly, and every protected endpoint requires
        // that token in an Authorization header — so it has to be saved.
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("Logged", JSON.stringify(user));
        localStorage.setItem("rid", user.id);
        if (user.stu_id) {
          router.push("/stu_home");
        } else if (user.lect_roomnum !== undefined) {
          router.push("/lect_home");
        } else if (user.role_id === 3) {
          router.push("/admin");
        } else {
          alert("ไม่พบข้อมูลที่เหมาะสม");
        }
      })
      .catch((error) => {
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
      });
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

          <TextField
            label="E-mail address"
            name="user_email"
            size="medium"
            onChange={handleData}
            fullWidth
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
            type="password"
            fullWidth
            sx={{ mb: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock fontSize="small" color="action" />
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
            variant="contained"
            size="large"
            onClick={onLogin}
            sx={{ fontWeight: 600, py: 1.4 }}
          >
            เข้าสู่ระบบ
          </Button>

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
