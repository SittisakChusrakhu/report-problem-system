import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Stack,
} from "@mui/material";
import { DeleteOutline, SearchRounded, ErrorOutlineRounded } from "@mui/icons-material";
import NavbarLayout from "../components/NavbarLayout";
import { Api } from "./api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ---------------------------------------------------------------------------
// Design tokens — same identity used across admin_graph.tsx / HomeOverview.tsx
// so this page reads as part of the same product instead of a leftover.
// ---------------------------------------------------------------------------
const INK = "#1E2A28";
const SUB = "#5B6B68";
const PAPER = "#E3EEEA";
const HAIRLINE = "rgba(31,79,73,0.10)";
const BRAND = "#2F7268";

interface StudentRow {
  id: number;
  uid: number;
  username: string;
  stu_id: string;
  stu_email: string;
  stu_grade: number;
  stu_faculty: string;
  stu_major: string;
}

interface LecturerRow {
  id: number;
  uid: number;
  username: string;
  user_email: string;
  lect_roomnum: string;
  lect_faculty: string | null;
}

type TabKey = "student" | "lecturer";

export default function ManageUsers() {
  const [tab, setTab] = useState<TabKey>("student");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [lecturers, setLecturers] = useState<LecturerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // เก็บว่ากำลังจะลบแถวไหน — ใช้ dialog ยืนยันแทนการลบทันทีตอนกดปุ่ม
  // (ของเดิมลบทันทีไม่มีขั้นตอนยืนยัน กดพลาดแล้วกู้คืนไม่ได้เลย)
  const [pendingDelete, setPendingDelete] = useState<
    | { type: "student"; id: number; uid: number; label: string }
    | { type: "lecturer"; id: number; uid: number; label: string }
    | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([Api.get<StudentRow[]>("/student/all"), Api.get<LecturerRow[]>("/lecturer/all")])
      .then(([studentRes, lecturerRes]) => {
        setStudents(Array.isArray(studentRes.data) ? studentRes.data : []);
        setLecturers(Array.isArray(lecturerRes.data) ? lecturerRes.data : []);
      })
      .catch(() => {
        setError("โหลดข้อมูลผู้ใช้งานไม่สำเร็จ ลองรีเฟรชหน้านี้อีกครั้ง");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.username?.toLowerCase().includes(q) ||
        s.stu_email?.toLowerCase().includes(q) ||
        s.stu_id?.toLowerCase().includes(q) ||
        s.stu_faculty?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const filteredLecturers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lecturers;
    return lecturers.filter(
      (l) =>
        l.username?.toLowerCase().includes(q) ||
        l.user_email?.toLowerCase().includes(q) ||
        l.lect_faculty?.toLowerCase().includes(q)
    );
  }, [lecturers, search]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      if (pendingDelete.type === "student") {
        await Api.delete(`/student/${pendingDelete.id}/${pendingDelete.uid}`);
        setStudents((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      } else {
        await Api.delete(`/lecturer/${pendingDelete.id}/${pendingDelete.uid}`);
        setLecturers((prev) => prev.filter((l) => l.id !== pendingDelete.id));
      }
      toast.success(`ลบผู้ใช้งาน "${pendingDelete.label}" แล้ว`, {
        position: "top-center",
        autoClose: 2500,
        theme: "colored",
      });
    } catch (error) {
      console.error(error);
      toast.error("ลบผู้ใช้งานไม่สำเร็จ ลองใหม่อีกครั้ง", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAPER }}>
      <ToastContainer />
      <NavbarLayout />
      <Box component="main" sx={{ ml: { sm: "260px" }, mt: "64px", p: { xs: 2, sm: 4 } }}>
        <Typography sx={{ fontWeight: 700, fontSize: 22, color: INK }}>
          จัดการผู้ใช้งาน
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: SUB, mt: 0.5, mb: 3 }}>
          รายชื่อนักศึกษาและอาจารย์ทั้งหมดในระบบ
        </Typography>

        {error && (
          <Box
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              borderRadius: 3,
              backgroundColor: "#fff",
              border: `1px solid ${HAIRLINE}`,
            }}
          >
            <ErrorOutlineRounded sx={{ color: "#C0553F" }} />
            <Typography sx={{ fontSize: 13.5, color: INK }}>{error}</Typography>
          </Box>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              minHeight: 40,
              "& .MuiTabs-indicator": { backgroundColor: BRAND },
            }}
          >
            <Tab
              value="student"
              label={`นักศึกษา (${students.length})`}
              sx={{ minHeight: 40, textTransform: "none", fontWeight: 600, "&.Mui-selected": { color: BRAND } }}
            />
            <Tab
              value="lecturer"
              label={`อาจารย์ (${lecturers.length})`}
              sx={{ minHeight: 40, textTransform: "none", fontWeight: 600, "&.Mui-selected": { color: BRAND } }}
            />
          </Tabs>

          <TextField
            size="small"
            placeholder="ค้นหาชื่อ, อีเมล, สาขา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260, backgroundColor: "#fff", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ fontSize: 20, color: SUB }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {loading ? (
          <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
        ) : tab === "student" ? (
          <TableContainer component={Paper} sx={{ borderRadius: 4, maxHeight: 560 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>รหัสนักศึกษา</TableCell>
                  <TableCell>ชื่อ - นามสกุล</TableCell>
                  <TableCell>อีเมล</TableCell>
                  <TableCell>ชั้นปี</TableCell>
                  <TableCell>สาขา</TableCell>
                  <TableCell>คณะ</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: SUB }}>
                      {search ? "ไม่พบผู้ใช้งานที่ค้นหา" : "ยังไม่มีนักศึกษาในระบบ"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.stu_id}</TableCell>
                      <TableCell>{row.username}</TableCell>
                      <TableCell>{row.stu_email}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`ปี ${row.stu_grade}`}
                          sx={{ fontSize: 12, backgroundColor: `${BRAND}14`, color: BRAND, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{row.stu_major}</TableCell>
                      <TableCell>{row.stu_faculty}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteOutline />}
                          onClick={() =>
                            setPendingDelete({
                              type: "student",
                              id: row.id,
                              uid: row.uid,
                              label: row.username,
                            })
                          }
                        >
                          ลบ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 4, maxHeight: 560 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อ - นามสกุล</TableCell>
                  <TableCell>อีเมล</TableCell>
                  <TableCell>ห้องพัก/ห้องทำงาน</TableCell>
                  <TableCell>คณะ</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLecturers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: SUB }}>
                      {search ? "ไม่พบผู้ใช้งานที่ค้นหา" : "ยังไม่มีอาจารย์ในระบบ"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLecturers.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.username}</TableCell>
                      <TableCell>{row.user_email}</TableCell>
                      <TableCell>{row.lect_roomnum}</TableCell>
                      <TableCell>{row.lect_faculty || "—"}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteOutline />}
                          onClick={() =>
                            setPendingDelete({
                              type: "lecturer",
                              id: row.id,
                              uid: row.uid,
                              label: row.username,
                            })
                          }
                        >
                          ลบ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={!!pendingDelete} onClose={() => !deleting && setPendingDelete(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>ยืนยันการลบผู้ใช้งาน</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ต้องการลบ "{pendingDelete?.label}" ออกจากระบบใช่ไหม? การลบนี้ย้อนกลับไม่ได้
            บัญชีและข้อมูลที่เกี่ยวข้องจะถูกลบถาวร
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingDelete(null)} disabled={deleting} sx={{ textTransform: "none" }}>
            ยกเลิก
          </Button>
          <Button
            onClick={confirmDelete}
            disabled={deleting}
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            {deleting ? "กำลังลบ..." : "ลบผู้ใช้งาน"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}