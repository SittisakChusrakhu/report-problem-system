import { AssignmentLate, PeopleAlt, School } from "@mui/icons-material";
import { Box, Typography, Grid, Paper } from "@mui/material";
import React, { useState, useEffect } from "react";
import { Api } from "./api/api";
import NavbarLayout from "../components/NavbarLayout";

const statCards = [
  { key: "studentCount", label: "Student", suffix: "คน", icon: <PeopleAlt sx={{ fontSize: 56 }} />, gradient: "linear-gradient(135deg, #3FB6A4 0%, #2F7268 100%)" },
  { key: "lecturerCount", label: "Lecturer", suffix: "คน", icon: <School sx={{ fontSize: 56 }} />, gradient: "linear-gradient(135deg, #5CA89F 0%, #1F4F49 100%)" },
  { key: "problemCount", label: "Report", suffix: "รายงาน", icon: <AssignmentLate sx={{ fontSize: 56 }} />, gradient: "linear-gradient(135deg, #E8A33D 0%, #C97B1F 100%)" },
];

export default function BasicCard() {
  const [problemCount, setProblemCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [lecturerCount, setLecturerCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // These are protected endpoints — using raw axios here (as before)
      // never attached the JWT and silently failed with 401. Api attaches
      // it automatically.
      const response1 = await Api.get("/user/problem");
      const response2 = await Api.get("/student/all");
      const response3 = await Api.get("/lecturer/all");

      setProblemCount(response1.data.length);
      setStudentCount(response2.data.length);
      setLecturerCount(response3.data.length);
    } catch (error) {
      console.error(error);
    }
  };


  const counts: Record<string, number> = { studentCount, lecturerCount, problemCount };

  return (
    <Box>
      <NavbarLayout />
      <Box
        component="main"
        sx={{
          ml: { sm: "260px" },
          mt: "64px",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          ภาพรวมระบบ
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          จำนวนผู้ใช้และรายงานทั้งหมดในระบบ
        </Typography>

        <Grid container spacing={3}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.key}>
              <Paper
                sx={{
                  background: card.gradient,
                  borderRadius: 4,
                  color: "#FFF",
                  p: 3,
                  height: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 14px 30px rgba(31,79,73,0.22)",
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>
                    {card.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {counts[card.key]} <Typography component="span" variant="body2" sx={{ opacity: 0.8 }}>{card.suffix}</Typography>
                  </Typography>
                </Box>
                <Box sx={{ opacity: 0.85 }}>{card.icon}</Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
