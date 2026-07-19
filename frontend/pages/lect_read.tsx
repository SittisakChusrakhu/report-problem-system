import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogContent,
  Button,
  TextField,
  TablePagination,
  Chip,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Send } from "@mui/icons-material";
import { useRouter } from "next/router";
import NavbarLect from "../components/NavbarLect";
import { Api } from "./api/api";
import { getStatusLabel, getStatusColor, getProblemTypeLabel } from "../lib/problemStatus";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Feedback {
  id: number;
  feed_massage: string;
  create_at: string;
  lect_id: number;
}

interface Problem {
  id: string;
  pro_title: string;
  pro_type: string;
  pro_desc: string;
  pro_images: string;
  lecturerId: number | null;
  sid: string;
  create_at: string;
  status: string;
}

export default function ListReport() {
  const router = useRouter();
  const [modelproblem, setModelProblem] = useState<Problem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogData, setDialogData] = useState<Problem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [studentData, setStudentData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<Problem[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchProblems = () => {
    const lid = localStorage.getItem("rid");
    // Protected endpoints — raw axios never attached the JWT and silently
    // 401'd. Api attaches it automatically.
    Api.get(`/user/problem/?lid=${lid}`)
      .then(function (response: any) {
        const sortedData = response.data.sort((a: Problem, b: Problem) => {
          const dateA = new Date(a.create_at);
          const dateB = new Date(b.create_at);
          return dateB.getTime() - dateA.getTime();
        });
        setModelProblem(sortedData);

        // ปลุกกระดิ่งแจ้งเตือนให้เช็ค unread count ทันที แทนที่จะรอรอบ
        // poll 30 วิของตัวเอง — ให้ badge อัปเดตไวขึ้นตามจังหวะ poll ของ
        // หน้านี้ (15 วิ) แทน
        window.dispatchEvent(new Event("notif:refresh-count"));
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchProblems();

    // โพลรายการปัญหาเป็นระยะ ให้หน้าอัปเดตเองเวลามีนักศึกษาแจ้งปัญหาใหม่
    // โดยไม่ต้องกดรีเฟรชหน้าเอง
    const interval = setInterval(fetchProblems, 15000);

    // NOTE: เดิมมีการเรียก /user/all เพิ่มเพื่อ join หาชื่อนักศึกษา แต่
    // /user/all เป็น endpoint สำหรับแอดมินเท่านั้น (requireRole(3)) —
    // อาจารย์เรียกไม่ได้อยู่แล้วโดยตั้งใจ (คืนอีเมลของทุกคนในระบบมาด้วย)
    // /student/all ด้านล่างมี username แนบมาให้ในตัวอยู่แล้ว ไม่ต้อง join เพิ่ม
    Api.get("/student/all")
      .then((response: any) => {
        setStudentData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    return () => clearInterval(interval);
  }, []);

  const handleDeleteSearch = () => {
    setSearchTerm("");
    setFilteredData(modelproblem); // รีเซ็ตค่า filteredData เพื่อแสดงผลลัพธ์ทั้งหมด

    // เคลียร์ค่า currentImageIndex เพื่อกลับไปที่รูปภาพแรก
    setCurrentImageIndex(0);
  };

  // useEffect ใหม่เพื่ออัปเดต filteredData เมื่อ searchTerm เปลี่ยนแปลง
  useEffect(() => {
    const filteredData = modelproblem.filter((problem: Problem) =>
      problem.pro_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filteredData);
  }, [searchTerm, modelproblem]);
  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (data: Problem) => {
    setDialogData(data);
    setCurrentImageIndex(0); // เพิ่มบรรทัดนี้เพื่อรีเซ็ตค่า currentImageIndex เมื่อกดดู problem ใหม่
    setReplyText("");
    setOpenDialog(true);

    // Opening the detail view means the lecturer has now seen it — move
    // PENDING/UNASSIGNED forward to IN_PROGRESS. The backend only moves it
    // forward, so this is safe to call every time without checking status
    // client-side first.
    Api.put(`/problem/open/${data.id}`)
      .then((response: any) => {
        const updated = response.data;
        setDialogData((prev) => (prev ? { ...prev, status: updated.status } : prev));
        setModelProblem((prev) =>
          prev.map((p) => (p.id === data.id ? { ...p, status: updated.status } : p))
        );
      })
      .catch((error) => {
        console.log(error);
      });

    Api.get(`/feedback?pro_id=${data.id}`)
      .then((response: any) => {
        setFeedbackList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogData(null);
    setFeedbackList([]);
    setReplyText("");
  };

  // กดรายการแจ้งเตือนบนกระดิ่งฝั่งอาจารย์จะ push มาที่
  // /lect_read?open=<pro_id> — พอโหลดรายการปัญหามาแล้ว ให้ auto-open dialog
  // ของปัญหานั้นเลย
  //
  // openedFromQueryRef กันไม่ให้เอฟเฟกต์นี้เรียก handleOpenDialog ซ้ำ:
  // handleOpenDialog เองยิง Api.put(/problem/open/:id) ที่ setModelProblem
  // อีกที ทำให้ modelproblem (dependency ของเอฟเฟกต์นี้) เปลี่ยนซ้ำ ถ้า
  // router.replace ที่เคลียร์ ?open= ยังทำงานไม่เสร็จทัน (แข่งกับ Api.put)
  // เอฟเฟกต์จะเห็น open ค้างอยู่แล้วเปิด dialog ซ้ำวนไม่รู้จบ — เคยเจอเป็น
  // อาการพิมพ์ข้อความตอบกลับไม่ติด/ปิด dialog ไม่ได้ เพราะโดนเปิดซ้ำทับ
  // ตลอดเวลา
  const openedFromQueryRef = useRef<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const { open } = router.query;

    if (!open) {
      openedFromQueryRef.current = null;
      return;
    }

    if (modelproblem.length === 0) return;
    if (openedFromQueryRef.current === String(open)) return;

    const target = modelproblem.find(
      (problem) => String(problem.id) === String(open)
    );

    if (target) {
      openedFromQueryRef.current = String(open);
      handleOpenDialog(target);
      router.replace("/lect_read", undefined, { shallow: true });
    }
  }, [router.isReady, router.query, modelproblem]);

  const handleSubmitReply = () => {
    if (!dialogData || !replyText.trim()) return;

    const lect_id = localStorage.getItem("rid");
    setSubmittingReply(true);

    Api.post("/feedback", {
      pro_id: dialogData.id,
      lect_id,
      stu_id: dialogData.sid,
      feed_massage: replyText.trim(),
    })
      .then((response: any) => {
        setFeedbackList((prev) => [...prev, response.data]);
        setReplyText("");
        // Replying resolves the problem — reflect that immediately.
        setDialogData((prev) => (prev ? { ...prev, status: "RESOLVED" } : prev));
        setModelProblem((prev) =>
          prev.map((p) =>
            p.id === dialogData.id ? { ...p, status: "RESOLVED" } : p
          )
        );
        toast.success("ส่งการตอบกลับแล้ว", {
          position: "top-center",
          autoClose: 2500,
          theme: "colored",
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error("ส่งการตอบกลับไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      })
      .finally(() => setSubmittingReply(false));
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <>
      <NavbarLect />
      <Box
        component="main"
        sx={{
          ml: { sm: "260px" },
          mt: "64px",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          รายงานปัญหาของนักศึกษา
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          ค้นหาและตรวจสอบรายงานปัญหาที่นักศึกษาส่งเข้ามา
        </Typography>
        <Card>
          <Box px={3} py={2.5} display="flex" alignItems="center">
            <TextField
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              label="ค้นหาหัวข้อ"
              variant="outlined"
              size="small"
              sx={{ mr: 2, width: 260 }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>

                  <TableCell>Submitted By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((problem: Problem) => {
                    const student = studentData.find(
                      (student) => student.id === problem.sid
                    );
                    const userName = student?.username || "-";

                    return (
                      <TableRow key={problem.id} hover>
                        <TableCell>{problem.pro_title}</TableCell>
                        <TableCell>{getProblemTypeLabel(problem.pro_type)}</TableCell>
                        <TableCell>{userName}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(problem.status)}
                            size="small"
                            color={getStatusColor(problem.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleOpenDialog(problem)}
                            variant="contained"
                            size="small"
                          >
                            ดูรายละเอียด
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={modelproblem.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            nextIconButtonProps={{
              size: "small",
              "aria-label": "next page",
            }}
            backIconButtonProps={{
              size: "small",
              "aria-label": "previous page",
            }}
            ActionsComponent={() => (
              <Box display="flex" alignItems="center">
                <Button
                  size="small"
                  onClick={() => setPage((prevPage) => prevPage - 1)}
                  disabled={page === 0}
                  aria-label="previous page"
                >
                  <ChevronLeft />
                </Button>
                <Typography variant="body2" mx={1}>
                  {page + 1} of {Math.ceil(modelproblem.length / rowsPerPage)}
                </Typography>
                <Button
                  size="small"
                  onClick={() => setPage((prevPage) => prevPage + 1)}
                  disabled={
                    page === Math.ceil(modelproblem.length / rowsPerPage) - 1
                  }
                  aria-label="next page"
                >
                  <ChevronRight />
                </Button>
              </Box>
            )}
          />
        </Card>
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogContent sx={{ p: 3.5 }}>
          {dialogData && (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={2}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, pr: 2 }}>
                  {dialogData.pro_title}
                </Typography>
                <Chip
                  label={getStatusLabel(dialogData.status)}
                  color={getStatusColor(dialogData.status)}
                  size="small"
                />
              </Box>

              <Box display="flex" gap={1} mb={2.5} flexWrap="wrap">
                <Chip
                  label={getProblemTypeLabel(dialogData.pro_type)}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={new Date(dialogData.create_at).toLocaleDateString(
                    "th-TH",
                    { year: "numeric", month: "short", day: "numeric" }
                  )}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Box
                sx={{ bgcolor: "#fafafa", borderRadius: 2, p: 2, mb: 2.5 }}
              >
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  รายละเอียด
                </Typography>
                <Typography variant="body1">{dialogData.pro_desc}</Typography>
              </Box>

              <Typography variant="body1" mb={2}>
                Images:
              </Typography>
              {(() => {
                const images = dialogData.pro_images
                  ? dialogData.pro_images.split(",").filter((url) => url.trim())
                  : [];

                if (images.length === 0) {
                  return (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      ไม่มีรูปภาพประกอบ
                    </Typography>
                  );
                }

                return (
                  <Box display="flex" alignItems="center">
                    <Button
                      disabled={currentImageIndex === 0}
                      onClick={() => handleImageChange(currentImageIndex - 1)}
                    >
                      Previous
                    </Button>
                    <Box mx={2}>
                      <img
                        src={images[currentImageIndex]?.trim()}
                        alt={`Problem Image ${currentImageIndex + 1}`}
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                        }}
                      />
                    </Box>
                    <Button
                      disabled={currentImageIndex === images.length - 1}
                      onClick={() => handleImageChange(currentImageIndex + 1)}
                    >
                      Next
                    </Button>
                  </Box>
                );
              })()}

              <Box mt={3} pt={2} borderTop="1px solid #e0e0e0">
                <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                  การตอบกลับ
                </Typography>

                {feedbackList.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    ยังไม่มีการตอบกลับ
                  </Typography>
                ) : (
                  <Box mb={2}>
                    {feedbackList.map((fb) => (
                      <Box
                        key={fb.id}
                        sx={{
                          bgcolor: "#f5f5f5",
                          borderRadius: 2,
                          p: 1.5,
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">{fb.feed_massage}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(fb.create_at).toLocaleString("th-TH")}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="พิมพ์คำตอบถึงนักศึกษา..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || submittingReply}
                >
                  {submittingReply ? "กำลังส่ง..." : "ส่งการตอบกลับ"}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </>
  );
}