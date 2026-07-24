import {
  Box,
  MenuItem,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  InputLabel,
  Select,
  FormControl,
  ListItemText,
  Checkbox,
  Chip,
  SelectChangeEvent,
  OutlinedInput,
  Typography,
  Divider,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import NavbarStu from "../components/NavbarStu";
import axios from "axios";
import { Api } from "./api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CloudUpload, Delete, Send, Close } from "@mui/icons-material";
import "dayjs/locale/th";
import dayjs, { Dayjs } from "dayjs";
import { PROBLEM_TYPE_LABELS } from "../lib/problemStatus";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function CreateProblemPage() {
  interface Tag {
    id: number;
    name: string;
  }

  interface Lecturer {
    id: number;
  }

  // Backend Problem.lecturerId is a single optional Int now (previously a
  // many-to-many lect_id array) — a problem can be assigned to at most one
  // lecturer.
  interface Problem {
    id: number;
    pro_title: string;
    pro_type: string;
    pro_desc: string;
    pro_image: string;
    lecturerId?: number;
    stu: number;
    tags: Tag[];
  }

  const [problem, setproblem] = useState<Problem>({
    id: 0,
    pro_title: "",
    pro_type: "",
    pro_desc: "",
    pro_image: "",
    lecturerId: undefined,
    stu: 0,
    tags: [],
  });

  const handleChangeproblem = (event: any) => {
    if (event && event.target) {
      setproblem({ ...problem, [event.target.name]: event.target.value });
    }
  };

  const [AllLectures, setAllLectures] = useState<
    { id: number; username: string }[]
  >([]);
  const [GetAllLectures, setGetAllLectures] = useState<Lecturer[]>([]);
  const [selectLecturer, setSelectLecturer] = useState<string>("");
  useEffect(() => {
    dayjs.locale("th");
    setproblem({ ...problem, stu: Number(localStorage.getItem("rid")) });

    Api.get("/lecturer/all")
      .then(function (response: any) {
        console.log(response.data);
        setAllLectures(response.data);
        setGetAllLectures(
          response.data.map((lect_id: any) => ({ id: lect_id.id }))
        );
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  const handleChangeLecturerId = (event: SelectChangeEvent<string>) => {
    setSelectLecturer(event.target.value);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitstu = async () => {
    if (isSubmitting) return; // กันกดส่งซ้ำระหว่างรอ API ตอบกลับ
    problem.pro_image = imageUrls.join(",");
    problem.tags = selectedTags;
    problem.pro_type = selectProblemType;
    problem.lecturerId = selectLecturer ? Number(selectLecturer) : undefined;
    console.log(problem);
    setIsSubmitting(true);
    try {
      const res = await Api.post("/problem", problem);
      if (res.data) {
        toast.success("คุณส่งรายงานปัญหาแล้ว", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        // Reset the form back to its empty state right away instead of
        // navigating off the page — no reload needed, and the person can
        // report another problem immediately if they need to.
        resetForm();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "ส่งรายงานปัญหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setproblem({
      id: 0,
      pro_title: "",
      pro_type: "",
      pro_desc: "",
      pro_image: "",
      lecturerId: undefined,
      stu: Number(localStorage.getItem("rid")),
      tags: [],
    });
    setSelectLecturer("");
    setSelectProblemType("");
    setSelectedTags([]);
    setSelectTagIds([]);
    setImageUrls([]);
  };

  // จำกัดชนิดไฟล์และขนาด — ก่อนหน้านี้ accept=".jpg,.jpeg,.png*" ที่ input
  // เป็นแค่ตัวกรอง dialog เลือกไฟล์ของเบราว์เซอร์เท่านั้น ไม่ได้บังคับจริง
  // ถ้าผู้ใช้เลือก "All Files" หรือลากไฟล์อื่นเข้ามาจะหลุดผ่านไปอัปโหลด
  // Cloudinary ทันที เลยเพิ่มเช็คจาก file.type/file.size ตรงนี้แทน
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const MAX_IMAGE_COUNT = 8;

  const upload_multiple_image = async (e: any) => {
    const files = e.target.files;

    if (imageUrls.length >= MAX_IMAGE_COUNT) {
      toast.error(`อัปโหลดได้สูงสุด ${MAX_IMAGE_COUNT} รูปต่อการแจ้งปัญหา`, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      e.target.value = ""; // เคลียร์ input เผื่อเลือกไฟล์เดิมซ้ำอีกครั้งในอนาคต
      return;
    }

    // ถ้าเลือกมาแล้วรวมกับที่มีอยู่เกิน limit ก็ตัดส่วนเกินทิ้ง (อัปโหลดเท่าที่พอดี)
    const remainingSlots = MAX_IMAGE_COUNT - imageUrls.length;
    if (files.length > remainingSlots) {
      toast.error(
        `เหลือโควต้าอัปโหลดได้อีก ${remainingSlots} รูป (สูงสุด ${MAX_IMAGE_COUNT} รูป) — จะอัปโหลดให้ ${remainingSlots} รูปแรกเท่านั้น`,
        {
          position: "top-center",
          autoClose: 4000,
          theme: "colored",
        }
      );
    }

    setIsUploadingImages(true);
    try {
      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        if (!ALLOWED_IMAGE_TYPES.includes(files[i].type)) {
          toast.error(`"${files[i].name}" ไม่ใช่ไฟล์รูปภาพที่รองรับ (รองรับเฉพาะ JPG, PNG)`, {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
          continue;
        }
        if (files[i].size > MAX_FILE_SIZE_BYTES) {
          toast.error(`"${files[i].name}" มีขนาดเกิน ${MAX_FILE_SIZE_MB}MB กรุณาลดขนาดไฟล์แล้วลองใหม่`, {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
          continue;
        }

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
    } finally {
      setIsUploadingImages(false);
      e.target.value = ""; // เคลียร์ input ให้เลือกไฟล์เดิมซ้ำได้ในอนาคต
    }
  };

  const deleteImage = (index: any) => {
    const updatedImageUrls = [...imageUrls];
    updatedImageUrls.splice(index, 1);
    setImageUrls(updatedImageUrls);
  };

  // pro_type is a required enum on the backend (ProblemType). The old form
  // never actually collected it — the "pro_type" labeled dropdown was really
  // bound to tag selection, so every submitted problem silently had an empty
  // pro_type. Added a real selector for it here.
  const [selectProblemType, setSelectProblemType] = useState<string>("");
  const handleChangeProblemType = (event: SelectChangeEvent<string>) => {
    setSelectProblemType(event.target.value);
  };

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectTagIds, setSelectTagIds] = useState<string[]>([]);
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await Api.get("/tags");
        setAllTags(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTags();
  }, []);

  const handleChangeTag = (event: SelectChangeEvent<typeof selectTagIds>) => {
    const {
      target: { value },
    } = event;
    const ids = typeof value === "string" ? value.split(",") : value;
    setSelectTagIds(ids);
    setSelectedTags(allTags.filter((tag) => ids.includes(String(tag.id))));
  };

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  return (
    <Box component="form">
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
          แจ้งปัญหาการเรียน
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          กรอกรายละเอียดปัญหาที่พบเพื่อส่งให้อาจารย์ผู้เกี่ยวข้อง
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          วันที่แจ้ง: {dayjs().format("D MMMM YYYY")}
        </Typography>

        <Card sx={{ maxWidth: 840 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 5 } }}>
            <Typography
              variant="overline"
              sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1.2 }}
            >
              รายละเอียดปัญหา
            </Typography>

            <TextField
              label="หัวข้อ"
              id="pro_title"
              name="pro_title"
              value={problem.pro_title}
              onChange={handleChangeproblem}
              fullWidth
              inputProps={{ maxLength: 255 }}
              helperText={`${problem.pro_title.length}/255`}
              sx={{ mt: 1.5, mb: 3 }}
            />

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="pro-type-select-label">ประเภทปัญหา</InputLabel>
                  <Select
                    labelId="pro-type-select-label"
                    id="pro_type"
                    name="pro_type"
                    value={selectProblemType}
                    onChange={handleChangeProblemType}
                    input={<OutlinedInput label="ประเภทปัญหา" />}
                  >
                    {Object.entries(PROBLEM_TYPE_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="tag-select-label">หัวข้อปัญหา</InputLabel>
                  <Select
                    labelId="tag-select-label"
                    id="tags"
                    multiple
                    name="tags"
                    value={selectTagIds}
                    onChange={handleChangeTag}
                    input={<OutlinedInput label="หัวข้อปัญหา" />}
                    renderValue={(selected) => {
                      const ids = selected as string[];
                      return (
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {ids.map((id) => (
                            <Chip
                              key={id}
                              label={
                                allTags.find((tag) => String(tag.id) === id)
                                  ?.name
                              }
                              sx={{ m: 0.5 }}
                              size="small"
                            />
                          ))}
                        </div>
                      );
                    }}
                    MenuProps={MenuProps}
                  >
                    {allTags.map((tag) => (
                      <MenuItem key={tag.id} value={String(tag.id)}>
                        <Checkbox
                          checked={selectTagIds.indexOf(String(tag.id)) > -1}
                        />
                        <ListItemText primary={tag.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  {/* Single-select: backend Problem.lecturerId only accepts
                      one lecturer now (was a multi-select array before). */}
                  <InputLabel id="lecturer-select-label">อาจารย์ (ไม่บังคับ)</InputLabel>
                  <Select
                    labelId="lecturer-select-label"
                    id="lecturerId"
                    name="lecturerId"
                    value={selectLecturer}
                    onChange={handleChangeLecturerId}
                    input={<OutlinedInput label="อาจารย์ (ไม่บังคับ)" />}
                  >
                    <MenuItem value="">
                      <em>ไม่ระบุ (ให้ระบบมอบหมายภายหลัง)</em>
                    </MenuItem>
                    {AllLectures.map((lecturer, index) => (
                      <MenuItem key={index} value={String(lecturer.id)}>
                        {lecturer.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="รายละเอียด"
              id="pro_desc"
              name="pro_desc"
              value={problem.pro_desc}
              onChange={handleChangeproblem}
              multiline
              fullWidth
              rows={6}
              sx={{ mb: 4 }}
            />

            <Divider sx={{ mb: 3 }} />

            <Typography
              variant="overline"
              sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1.2 }}
            >
              รูปภาพประกอบ
            </Typography>

            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Button
                variant="outlined"
                component="label"
                disabled={isUploadingImages || imageUrls.length >= MAX_IMAGE_COUNT}
                startIcon={
                  isUploadingImages ? (
                    <CircularProgress size={16} />
                  ) : (
                    <CloudUpload />
                  )
                }
                sx={{
                  borderStyle: "dashed",
                  borderWidth: 2,
                  px: 2.5,
                  py: 1.4,
                  color: "text.secondary",
                  borderColor: "rgba(0,0,0,0.2)",
                }}
              >
                {isUploadingImages
                  ? "กำลังอัปโหลด..."
                  : imageUrls.length >= MAX_IMAGE_COUNT
                  ? `ครบ ${MAX_IMAGE_COUNT} รูปแล้ว`
                  : "อัปโหลดรูปภาพ"}
                <input
                  hidden
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  id="fileInput"
                  onChange={upload_multiple_image}
                  multiple
                  type="file"
                  disabled={isUploadingImages || imageUrls.length >= MAX_IMAGE_COUNT}
                />
              </Button>
              {imageUrls.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {imageUrls.length}/{MAX_IMAGE_COUNT} รูป
                </Typography>
              )}

              {imageUrls.map((imageUrl, index) => (
                <Box key={index} sx={{ position: "relative" }}>
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={`Image ${index}`}
                    onClick={() => setPreviewImageUrl(imageUrl)}
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 2,
                      cursor: "pointer",
                    }}
                  />
                  <Button
                    size="small"
                    onClick={() => deleteImage(index)}
                    sx={{
                      minWidth: 0,
                      position: "absolute",
                      top: -8,
                      right: -8,
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                      boxShadow: 1,
                      p: 0.3,
                    }}
                  >
                    <Delete fontSize="small" color="error" />
                  </Button>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<Send />}
                onClick={handleSubmitstu}
                disabled={isSubmitting}
              >
                {isSubmitting ? "กำลังส่ง..." : "แจ้งปัญหา"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={!!previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
        maxWidth="md"
      >
        <DialogContent sx={{ p: 1, position: "relative" }}>
          <IconButton
            onClick={() => setPreviewImageUrl(null)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255,255,255,0.8)",
            }}
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
          {previewImageUrl && (
            <Box
              component="img"
              src={previewImageUrl}
              alt="Preview"
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                display: "block",
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}