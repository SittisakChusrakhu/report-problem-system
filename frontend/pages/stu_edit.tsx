import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Edit, Close, Save } from "@mui/icons-material";
import React from "react";
import NavbarStu from "../components/NavbarStu";
import axios from "axios";
import { Api } from "./api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "dayjs/locale/th"
import Avatar from '@mui/material/Avatar';

interface StudentFormData {
  username: string;
  stu_id: string;
  stu_email: string;
  stu_grade: string;
  stu_faculty: string;
  stu_major: string;
  avatar: string;
}

const fieldLabels: Record<string, string> = {
  stu_id: "รหัสนักศึกษา",
  username: "ชื่อ - นามสกุล",
  stu_email: "อีเมล",
  stu_grade: "ชั้นปี",
  stu_faculty: "คณะ",
  stu_major: "สาขา",
};

const EMPTY_FORM_DATA: StudentFormData = {
  username: "",
  stu_id: "",
  stu_email: "",
  stu_grade: "",
  stu_faculty: "",
  stu_major: "",
  avatar: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildFormData(data: any): StudentFormData {
  return {
    username: data?.username ?? "",
    stu_id: data?.stu_id ?? "",
    stu_email: data?.stu_email ?? "",
    stu_grade: data?.stu_grade ?? "",
    stu_faculty: data?.stu_faculty ?? "",
    stu_major: data?.stu_major ?? "",
    avatar: data?.avatar ?? "",
  };
}

function validateForm(data: StudentFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.username.trim()) errors.username = "กรุณากรอกชื่อ-นามสกุล";
  if (!data.stu_id.trim()) errors.stu_id = "กรุณากรอกรหัสนักศึกษา";
  if (!data.stu_email.trim()) {
    errors.stu_email = "กรุณากรอกอีเมล";
  } else if (!EMAIL_REGEX.test(data.stu_email)) {
    errors.stu_email = "รูปแบบอีเมลไม่ถูกต้อง";
  }
  if (!data.stu_grade.trim()) errors.stu_grade = "กรุณากรอกชั้นปี";
  if (!data.stu_faculty.trim()) errors.stu_faculty = "กรุณากรอกคณะ";
  if (!data.stu_major.trim()) errors.stu_major = "กรุณากรอกสาขา";
  return errors;
}

export default function StudentComponent() {
  const [rid, setRid] = React.useState<number>(0);
  const [datastudent, setdatastudent] = React.useState<any>(null);
  const [uid, setuid] = React.useState("");
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [isEdit, setIsEdit] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [formData, setFormData] = React.useState<StudentFormData>(EMPTY_FORM_DATA);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setRid(Number(localStorage.getItem("rid")));
  }, []);

  React.useEffect(() => {
    if (!rid) return;
    setIsLoadingProfile(true);
    Api
      .get<any[]>(`/student?id=${rid}`)
      .then(function (response) {
        // Backend returns snake_case fields (username, stu_id, stu_email,
        // stu_grade, stu_faculty, stu_major).
        const data = response.data[0];
        setuid(data.uid);
        setdatastudent(data);
        setFormData(buildFormData(data));
        console.log(data);
      })
      .catch(function (error) {
        console.log(error);
        toast.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      })
      .finally(function () {
        setIsLoadingProfile(false);
      });
  }, [rid]);

  const handleFieldChange =
    (field: keyof StudentFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    };

  const startEdit = () => {
    setFormData(buildFormData(datastudent));
    setErrors({});
    setIsEdit(true);
  };

  const cancelEdit = () => {
    setFormData(buildFormData(datastudent));
    setErrors({});
    setIsEdit(false);
  };

  const handleUpdate = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warning("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้องก่อนบันทึก", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    setIsSaving(true);
    const newData = {
      stu_id: formData.stu_id,
      stu_grade: formData.stu_grade,
      stu_faculty: formData.stu_faculty,
      stu_major: formData.stu_major,
      avatar: formData.avatar,
      uid: {
        username: formData.username,
        stu_email: formData.stu_email,
      },
    };

    try {
      await Api.put(`/student/${rid}`, newData);
      toast.success("บันทึกข้อมูลสำเร็จ", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
      // อัปเดตข้อมูลที่แสดงในหัวการ์ดทันทีโดยไม่ต้องรีเฟรช และปิดโหมดแก้ไข
      setdatastudent((prev: any) => ({ ...prev, ...formData }));
      setIsEdit(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const upload_single_image = async (e: any) => {
    const file = e.target.files[0];
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"]; // ประเภทไฟล์รูปภาพที่ยอมรับ
    if (!file) return;
    if (!validImageTypes.includes(file.type)) {
      toast.warning("กรุณาเลือกไฟล์รูปภาพเท่านั้น (jpg, png, gif)", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    setIsUploadingAvatar(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "student");
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/drynd8ioj/image/upload",
        data
      );
      setFormData((prev) => ({ ...prev, avatar: res.data.secure_url }));
    } catch (error) {
      toast.error("อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={(e) => e.preventDefault()}
    >
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
          แก้ไขข้อมูลส่วนตัว
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          จัดการข้อมูลโปรไฟล์นักศึกษาของคุณ
        </Typography>

        <Card sx={{ maxWidth: 760 }}>
          {isLoadingProfile ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : datastudent ? (
            <>
              <Box
                sx={{
                  background: "linear-gradient(135deg, #3A8E81 0%, #1F4F49 100%)",
                  p: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  color: "#fff",
                }}
              >
                <Avatar
                  sx={{ width: 88, height: 88, border: "3px solid rgba(255,255,255,0.4)" }}
                  src={formData.avatar}
                  alt="avatar"
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {datastudent.username}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {datastudent.stu_email}
                  </Typography>
                  <Button
                    component="label"
                    size="small"
                    variant="outlined"
                    disabled={!isEdit || isUploadingAvatar}
                    sx={{ mt: 1.5, color: "#fff", borderColor: "rgba(255,255,255,0.6)" }}
                  >
                    {isUploadingAvatar ? "กำลังอัปโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
                    <input
                      hidden
                      accept=".jpg,.jpeg,.png,.gif"
                      id="fileInput"
                      onChange={upload_single_image}
                      type="file"
                    />
                  </Button>
                </Box>
                <Button
                  variant="contained"
                  color={isEdit ? "secondary" : "inherit"}
                  startIcon={isEdit ? <Close /> : <Edit />}
                  disabled={isSaving}
                  onClick={() => (isEdit ? cancelEdit() : startEdit())}
                  sx={!isEdit ? { color: "primary.main", backgroundColor: "#fff" } : {}}
                >
                  {isEdit ? "ยกเลิก" : "แก้ไข"}
                </Button>
              </Box>

              <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={fieldLabels.stu_id}
                      fullWidth
                      disabled={!isEdit}
                      value={formData.stu_id}
                      onChange={handleFieldChange("stu_id")}
                      error={!!errors.stu_id}
                      helperText={errors.stu_id}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={fieldLabels.username}
                      fullWidth
                      disabled={!isEdit}
                      value={formData.username}
                      onChange={handleFieldChange("username")}
                      error={!!errors.username}
                      helperText={errors.username}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={fieldLabels.stu_email}
                      fullWidth
                      disabled={!isEdit}
                      value={formData.stu_email}
                      onChange={handleFieldChange("stu_email")}
                      error={!!errors.stu_email}
                      helperText={errors.stu_email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={fieldLabels.stu_grade}
                      fullWidth
                      disabled={!isEdit}
                      value={formData.stu_grade}
                      onChange={handleFieldChange("stu_grade")}
                      error={!!errors.stu_grade}
                      helperText={errors.stu_grade}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={fieldLabels.stu_faculty}
                      fullWidth
                      disabled={!isEdit}
                      value={formData.stu_faculty}
                      onChange={handleFieldChange("stu_faculty")}
                      error={!!errors.stu_faculty}
                      helperText={errors.stu_faculty}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={fieldLabels.stu_major}
                      fullWidth
                      disabled={!isEdit}
                      value={formData.stu_major}
                      onChange={handleFieldChange("stu_major")}
                      error={!!errors.stu_major}
                      helperText={errors.stu_major}
                    />
                  </Grid>
                </Grid>

                {isEdit && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                      <Button variant="outlined" disabled={isSaving} onClick={cancelEdit}>
                        ยกเลิก
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={
                          isSaving ? <CircularProgress size={16} color="inherit" /> : <Save />
                        }
                        disabled={isSaving}
                        onClick={handleUpdate}
                      >
                        {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </>
          ) : (
            <Box sx={{ p: 4 }}>
              <Typography color="text.secondary">ไม่พบข้อมูลโปรไฟล์</Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}