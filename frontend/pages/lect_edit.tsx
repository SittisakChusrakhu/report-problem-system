import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    Divider,
    Avatar,
    CircularProgress,
} from "@mui/material";
import { Edit, Close, Save } from "@mui/icons-material";
import React from "react";
import NavbarLect from "../components/NavbarLect";
import axios from "axios";
import { Api } from "./api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LecturerFormData {
    user_name: string;
    user_email: string;
    lect_roomnum: string;
    avatar: string;
}

const EMPTY_FORM_DATA: LecturerFormData = {
    user_name: "",
    user_email: "",
    lect_roomnum: "",
    avatar: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildFormData(data: any): LecturerFormData {
    return {
        user_name: data?.user_name ?? "",
        user_email: data?.user_email ?? "",
        lect_roomnum: data?.lect_roomnum ?? "",
        avatar: data?.avatar ?? "",
    };
}

function validateForm(data: LecturerFormData): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!data.user_name.trim()) errors.user_name = "กรุณากรอกชื่อ-นามสกุล";
    if (!data.user_email.trim()) {
        errors.user_email = "กรุณากรอกอีเมล";
    } else if (!EMAIL_REGEX.test(data.user_email)) {
        errors.user_email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (!data.lect_roomnum.trim()) errors.lect_roomnum = "กรุณากรอกเลขห้อง";
    return errors;
}

export default function LecturerComponent() {

    const [rid, setRid] = React.useState<number>(0);
    const [datalecturer, setdataLecturer] = React.useState<any>(null);
    const [uid, setuid] = React.useState("");
    const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
    const [isEdit, setIsEdit] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
    const [formData, setFormData] = React.useState<LecturerFormData>(EMPTY_FORM_DATA);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    React.useEffect(() => {
        setRid(Number(localStorage.getItem("rid")));
    }, []);

    React.useEffect(() => {
        // rid starts at 0 until the effect above loads it from
        // localStorage. Without this guard, this effect fires once with
        // id=0 first (no lecturer matches, response.data[0] is undefined,
        // .username throws inside .then and gets silently swallowed by
        // .catch) before firing again correctly once rid updates.
        if (!rid) return;
        setIsLoadingProfile(true);

        Api
            .get<any[]>(`/lecturer?id=${rid}`)
            .then(function (response) {
                // Backend's lecturer shape returns "username" (no
                // underscore), unlike "user_email" which does have one.
                const data = response.data[0];
                setuid(data.uid);
                setdataLecturer(data);
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
        (field: keyof LecturerFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData(buildFormData(datalecturer));
        setErrors({});
        setIsEdit(true);
    };

    const cancelEdit = () => {
        setFormData(buildFormData(datalecturer));
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
            lect_roomnum: formData.lect_roomnum,
            avatar: formData.avatar,
            uid: {
                user_name: formData.user_name,
                user_email: formData.user_email,
            },
        };

        try {
            await Api.put(`/lecturer/${rid}`, newData);
            toast.success("บันทึกข้อมูลสำเร็จ", {
                position: "top-center",
                autoClose: 2000,
                theme: "colored",
            });
            // อัปเดตข้อมูลที่แสดงในหัวการ์ดทันทีโดยไม่ต้องรีเฟรช และปิดโหมดแก้ไข
            setdataLecturer((prev: any) => ({ ...prev, ...formData }));
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
    }
    return (
        <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={(e) => e.preventDefault()}
        >
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
                    แก้ไขข้อมูลส่วนตัว
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    จัดการข้อมูลโปรไฟล์อาจารย์ของคุณ
                </Typography>

                <Card sx={{ maxWidth: 760 }}>
                    {isLoadingProfile ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : datalecturer ? (
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
                                        {datalecturer.user_name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                        {datalecturer.user_email}
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
                                            label="ชื่อ - นามสกุล"
                                            fullWidth
                                            disabled={!isEdit}
                                            value={formData.user_name}
                                            onChange={handleFieldChange("user_name")}
                                            error={!!errors.user_name}
                                            helperText={errors.user_name}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="อีเมล"
                                            fullWidth
                                            disabled={!isEdit}
                                            value={formData.user_email}
                                            onChange={handleFieldChange("user_email")}
                                            error={!!errors.user_email}
                                            helperText={errors.user_email}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="เลขห้อง"
                                            fullWidth
                                            disabled={!isEdit}
                                            value={formData.lect_roomnum}
                                            onChange={handleFieldChange("lect_roomnum")}
                                            error={!!errors.lect_roomnum}
                                            helperText={errors.lect_roomnum}
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