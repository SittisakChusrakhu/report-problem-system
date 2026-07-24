import React, { useState, useEffect } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import NavbarStu from "../components/NavbarStu";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Api } from "./api/api";
import { CloudUpload, Add, DoNotDisturbOn, Delete } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import {
  getStatusLabel,
  getStatusColor,
  getProblemTypeLabel,
  PROBLEM_TYPE_LABELS,
} from "../lib/problemStatus";

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

export default function StudentComponent() {
  const router = useRouter();
  const [modelproblem, setmodelproblem] = useState<Problem[]>([]);
  const [filteredData, setFilteredData] = useState<Problem[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "unresolved" | "resolved">("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [filterDate, setFilterDate] = useState<Dayjs | null>(null);

  const fetchProblems = () => {
    const lid = localStorage.getItem("rid");

    // Protected endpoint — raw axios never attached the JWT and silently
    // 401'd. Api attaches it automatically.
    Api.get(`/user/problem/?sid=${lid}`)
      .then(function (response) {
        setmodelproblem(response.data);

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
    dayjs.locale("th");
    fetchProblems();

    // โพลรายการปัญหาเป็นระยะ ให้หน้าอัปเดตเองเวลาอาจารย์ตอบกลับ/สถานะเปลี่ยน
    // โดยไม่ต้องกดรีเฟรชหน้าเอง
    const interval = setInterval(fetchProblems, 15000);
    return () => clearInterval(interval);
  }, []);

  const upload_multiple_image = async (e: any) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      const data = new FormData();
      data.append("file", files[i]);
      data.append("upload_preset", "student");
      try {
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/drynd8ioj/image/upload",
          data
        );
        setImageUrls((prevImageUrls) => [
          ...prevImageUrls,
          res.data.secure_url,
        ]);
      } catch (error: any) {
        // เดิมไม่มี .catch() เลย — อัปโหลดล้มเหลวแบบเงียบๆ ไม่มีอะไรบอก
        // ผู้ใช้ว่ารูปไม่ขึ้นเพราะอะไร ตอนนี้ log ไว้ดีบัก + toast บอกชื่อ
        // ไฟล์ที่พังให้ผู้ใช้รู้ตัว
        console.log(error);
        toast.error(
          `อัปโหลดรูป "${files[i].name}" ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง`,
          {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          }
        );
      }
    }
  };

  const deleteImage = (index: number) => {
    const updatedImageUrls = [...imageUrls];
    updatedImageUrls.splice(index, 1);
    setImageUrls(updatedImageUrls);
    setCurrentImageIndex((prev) =>
      Math.min(prev, Math.max(0, updatedImageUrls.length - 1))
    );
  };
  

  const onConfirmUpdate = () => {
    if (editData) {
      // NOTE: no longer sending `datetime` — the backend schema replaced
      // that with an auto-managed `update_at` timestamp, so the field isn't
      // accepted by the update endpoint anymore.
      //
      // pro_images มาจาก imageUrls ตรงๆ เสมอ (ไม่มี fallback ไปใช้
      // editData.pro_images แล้ว) — เดิมมี `if (imageUrls.length > 0)` ที่
      // ตั้งใจกันไม่ให้ล้างรูปตอนไม่ได้แตะรูปเลย แต่ตอนนี้ imageUrls ถูก
      // hydrate จากรูปเดิมของปัญหานั้นตั้งแต่ตอนเปิด dialog อยู่แล้ว (ดู
      // handleOpenDialog) เงื่อนไขเดิมเลยกลายเป็นบั๊ก: พอลบรูปจนเหลือ 0 รูป
      // (imageUrls.length === 0) มันจะย้อนกลับไปส่งรูปชุดเก่าก่อนแก้แทน
      // ทำให้ลบรูปจนหมดไม่ได้จริง
      const updatedData = {
        pro_title: title,
        pro_type: type,
        pro_desc: details,
        pro_images: imageUrls.join(","),
      };

      Api.put(`/problem/${editData.id}`, updatedData)
        .then((res) => {
          toast.success("อัปเดตรายงานปัญหาเรียบร้อยแล้ว", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
  
          // ปิด dialog ที่กำลังแก้ไขอยู่ (ตัวจริงคือ openDialog ไม่ใช่
          // openEdit — openEdit เป็น state ค้างที่ไม่เคยถูกตั้งเป็น true
          // เลยทำให้ dialog ไม่ปิดหลังบันทึกสำเร็จ) พร้อมล้างค่าฟอร์ม
          setOpenDialog(false);
          setFeedbackList([]);
          setTitle("");
          setType("");
          setDetails("");
          setImageUrls([]);
  
          const lid = localStorage.getItem("rid");
          Api.get(`/user/problem/?sid=${lid}`)
            .then(function (response) {
              setmodelproblem(response.data);
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
          toast.error(
            error?.response?.data?.message ||
              "อัปเดตรายงานปัญหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
            {
              position: "top-center",
              autoClose: 3000,
              theme: "colored",
            }
          );
        });
    } else {
      console.log("editData is null");
    }
  };
  

  const deleteproblem = (pid: string) => {
    Api.delete(`/problem/${pid}`)
      .then((response) => {
        toast.error("ลบรายงานปัญหาของคุณแล้ว", {
          position: "top-center",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        const lid = localStorage.getItem("rid");
        Api.get(`/user/problem/?sid=${lid}`)
          .then(function (response) {
            setmodelproblem(response.data);
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    let data = modelproblem.filter((problem: Problem) =>
      problem.pro_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter === "resolved") {
      data = data.filter((problem) => problem.status === "RESOLVED");
    } else if (statusFilter === "unresolved") {
      data = data.filter((problem) => problem.status !== "RESOLVED");
    }

    // กรองตามวันที่ที่เลือก (เทียบเฉพาะ วัน/เดือน/ปี ไม่สนเวลา)
    if (filterDate) {
      data = data.filter((problem) =>
        dayjs(problem.create_at).isSame(filterDate, "day")
      );
    }

    data = [...data].sort((a, b) => {
      const diff =
        new Date(a.create_at).getTime() - new Date(b.create_at).getTime();
      return sortOrder === "latest" ? -diff : diff;
    });

    setFilteredData(data);
    setPage(0);
  }, [searchTerm, modelproblem, statusFilter, sortOrder, filterDate]);

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (problem: any) => {
    setEditData(problem); // ค่าตั้งต้น เดี๋ยวจะถูกแทนที่ด้วยข้อมูลเต็มด้านล่าง

    // ตั้งค่าข้อมูลอื่น ๆ ที่ต้องการให้ใน Dialog
    setTitle(problem.pro_title);
    setType(problem.pro_type);
    setDetails(problem.pro_desc);
    setImageUrls([]);
    setCurrentImageIndex(0);

    // รายการที่ได้จากหน้า list (/user/problem) ไม่มี pro_images ติดมาด้วย
    // เลย — backend ตัดออกโดยตั้งใจเพื่อไม่ให้หน้ารายการที่ poll ถี่ๆ ต้อง
    // โหลดรูปหนักๆ ซ้ำๆ (ดู comment ใน problem.repository.js) ต้องยิง
    // /problem/:id แยกอีกครั้งเพื่อเอาข้อมูลเต็มรวมรูปมาแสดงตอนเปิดดู
    Api.get(`/problem/${problem.id}`)
      .then((response: any) => {
        const fullProblem = response.data;
        setEditData(fullProblem);
        setImageUrls(
          fullProblem.pro_images ? fullProblem.pro_images.split(",") : []
        );
      })
      .catch((error) => {
        console.log(error);
        toast.error("โหลดรายละเอียดปัญหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      });

    Api.get(`/feedback?pro_id=${problem.id}`)
      .then((response: any) => {
        setFeedbackList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFeedbackList([]);
  };

  // กดรายการแจ้งเตือนบนกระดิ่งจะ push มาที่ /stu_listreport?open=<pro_id>
  // พอโหลดรายการปัญหามาแล้ว ให้ auto-open dialog ของปัญหานั้นเลย
  useEffect(() => {
    if (!router.isReady) return;

    const { open } = router.query;
    if (!open || modelproblem.length === 0) return;

    const target = modelproblem.find(
      (problem) => String(problem.id) === String(open)
    );

    if (target) {
      handleOpenDialog(target);
      router.replace("/stu_listreport", undefined, { shallow: true });
    }
  }, [router.isReady, router.query, modelproblem]);

  // สถานะ "แก้ไขแล้ว" ห้ามแก้ไขข้อมูลอีก — ดูอย่างเดียว
  // (เคยมี state "dialogData" แยกอีกตัวที่ไม่เคยถูกเซ็ตค่าจริง — ลบทิ้งแล้ว
  // ใช้ editData ตัวเดียวที่ handleOpenDialog เซ็ตค่าจริงแทน)
  const isResolved = editData?.status === "RESOLVED";
  return (
    <>
      <NavbarStu />
      <Box
        component="main"
        sx={{
          ml: { sm: "260px" },
          mt: "64px",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          รายงานปัญหาของคุณ
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          ติดตามสถานะปัญหาที่คุณได้แจ้งไว้
        </Typography>
        <Card>
          <Box
            px={3}
            py={2.5}
            display="flex"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <TextField
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              label="ค้นหาหัวข้อ"
              variant="outlined"
              size="small"
              sx={{ width: 260 }}
            />

            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              size="small"
              onChange={(e, value: "all" | "unresolved" | "resolved" | null) => {
                if (value) setStatusFilter(value);
              }}
            >
              <ToggleButton value="all">ทั้งหมด</ToggleButton>
              <ToggleButton value="unresolved">ยังไม่แก้ไข</ToggleButton>
              <ToggleButton value="resolved">แก้ไขแล้ว</ToggleButton>
            </ToggleButtonGroup>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                label="เลือกวันที่"
                value={filterDate}
                onChange={(newValue) => setFilterDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ width: 190 }} />
                )}
              />
            </LocalizationProvider>
            {filterDate && (
              <Button size="small" onClick={() => setFilterDate(null)}>
                ล้างวันที่
              </Button>
            )}

            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"))
              }
              startIcon={
                sortOrder === "latest" ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />
              }
            >
              {sortOrder === "latest" ? "ล่าสุด" : "นานสุด"}
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>หัวข้อ</TableCell>
                  <TableCell>ประเภท</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การจัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((problem) => (
                    <TableRow key={problem.id} hover>
                      <TableCell>{problem.pro_title}</TableCell>
                      <TableCell>{getProblemTypeLabel(problem.pro_type)}</TableCell>
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
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredData.length}
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
                  {page + 1} of {Math.ceil(filteredData.length / rowsPerPage)}
                </Typography>
                <Button
                  size="small"
                  onClick={() => setPage((prevPage) => prevPage + 1)}
                  disabled={
                    page === Math.ceil(filteredData.length / rowsPerPage) - 1
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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={isResolved ? 2 : 2.5}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, pr: 2 }}>
              {isResolved ? editData?.pro_title : "แก้ไขรายงานปัญหา"}
            </Typography>
            {editData && (
              <Chip
                label={getStatusLabel(editData.status)}
                color={getStatusColor(editData.status)}
                size="small"
              />
            )}
          </Box>

          {isResolved && editData && (
            <Box display="flex" gap={1} mb={2.5} flexWrap="wrap">
              <Chip label={getProblemTypeLabel(editData.pro_type)} size="small" variant="outlined" />
              <Chip
                label={new Date(editData.create_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                size="small"
                variant="outlined"
              />
            </Box>
          )}

          {isResolved ? (
            <Box sx={{ bgcolor: "#fafafa", borderRadius: 2, p: 2, mb: 2.5 }}>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                รายละเอียด
              </Typography>
              <Typography variant="body1">
                {editData?.pro_desc}
              </Typography>
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                label="หัวข้อ"
                variant="outlined"
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="edit-pro-type-label">ประเภทปัญหา</InputLabel>
                <Select
                  labelId="edit-pro-type-label"
                  label="ประเภทปัญหา"
                  value={type}
                  onChange={(e: SelectChangeEvent) => setType(e.target.value)}
                >
                  {Object.entries(PROBLEM_TYPE_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="รายละเอียด"
                variant="outlined"
                size="small"
                multiline
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                sx={{ mb: 2.5 }}
              />
            </>
          )}

          <Box mb={2.5}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              รูปภาพ:
            </Typography>
            {imageUrls.length > 0 && imageUrls[currentImageIndex] ? (
              <Box>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Button
                    disabled={currentImageIndex === 0}
                    onClick={() =>
                      setCurrentImageIndex((i) => Math.max(0, i - 1))
                    }
                  >
                    <ChevronLeft />
                  </Button>
                  <img
                    src={imageUrls[currentImageIndex]?.trim()}
                    alt={`Problem Image ${currentImageIndex + 1}`}
                    style={{
                      maxWidth: "80%",
                      maxHeight: 260,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                  <Button
                    disabled={currentImageIndex === imageUrls.length - 1}
                    onClick={() =>
                      setCurrentImageIndex((i) =>
                        Math.min(imageUrls.length - 1, i + 1)
                      )
                    }
                  >
                    <ChevronRight />
                  </Button>
                </Box>

                {!isResolved && (
                  <Box display="flex" justifyContent="center" mt={1}>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => deleteImage(currentImageIndex)}
                    >
                      ลบรูปนี้
                    </Button>
                  </Box>
                )}

                {imageUrls.length > 1 && (
                  <Box
                    display="flex"
                    gap={1}
                    mt={1.5}
                    justifyContent="center"
                    flexWrap="wrap"
                  >
                    {imageUrls.map((imageUrl, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={imageUrl}
                        alt={`Thumbnail ${index + 1}`}
                        onClick={() => setCurrentImageIndex(index)}
                        sx={{
                          width: 48,
                          height: 48,
                          objectFit: "cover",
                          borderRadius: 1,
                          cursor: "pointer",
                          border:
                            index === currentImageIndex
                              ? "2px solid #1976d2"
                              : "2px solid transparent",
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                ไม่มีรูปภาพประกอบ
              </Typography>
            )}

            {!isResolved && (
              <Box mt={1.5}>
                <Button variant="outlined" component="label" size="small" startIcon={<CloudUpload />}>
                  อัปโหลด
                  <input
                    hidden
                    accept=".jpg,.jpeg,.png*"
                    id="fileInput"
                    onChange={upload_multiple_image}
                    multiple
                    type="file"
                  />
                </Button>
              </Box>
            )}
          </Box>

          <Box mt={3} pt={2} borderTop="1px solid #e0e0e0">
            <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
              การตอบกลับจากอาจารย์
            </Typography>
            {feedbackList.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีการตอบกลับ
              </Typography>
            ) : (
              feedbackList.map((fb) => (
                <Box
                  key={fb.id}
                  sx={{ bgcolor: "#f5f5f5", borderRadius: 2, p: 1.5, mb: 1 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ display: "block", fontWeight: 600, color: "primary.main", mb: 0.25 }}
                  >
                    {fb.lecturer?.user?.user_name || "อาจารย์"}
                  </Typography>
                  <Typography variant="body2">{fb.feed_massage}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(fb.create_at).toLocaleString("th-TH")}
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={handleCloseDialog}>ปิด</Button>
            {!isResolved && (
              <Button variant="contained" color="primary" onClick={onConfirmUpdate}>
                บันทึก
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}