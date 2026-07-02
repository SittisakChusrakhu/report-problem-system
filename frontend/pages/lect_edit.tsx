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
} from "@mui/material";
import { Edit, Close, Save } from "@mui/icons-material";
import React, { useState } from "react";
import NavbarLect from "../components/NavbarLect";
import axios from "axios";

interface LecturerData {
    lect_roomnum: String;
    avatar: String;
    uid: any;
}

export default function LecturerComponent() {

    const [rid, setRid] = React.useState<number>(0);
    const [datalecturer, setdataLecturer] = React.useState<any>(null);
    const [isEdit, setIsEdit] = React.useState(false);
    const [editData, setEditData] = React.useState<LecturerData>({
        lect_roomnum: "",
        avatar: "",
        uid: "",
    });
    const [user_name, setUsername] = React.useState("");
    const [user_email, setUserEmail] = React.useState("");
    const [lect_roomnum, setLectRoomum] = React.useState("");
    const [avatar, setAvatar] = React.useState("");
    const [uid, setuid] = React.useState("");
    React.useEffect(() => {
        setRid(Number(localStorage.getItem("rid")));
    }, []);

    React.useEffect(() => {
        axios
            .get<any[]>(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/lecturer?id=${rid}`)
            .then(function (response) {
                setUsername(response.data[0].user_name);
                setUserEmail(response.data[0].user_email);
                setLectRoomum(response.data[0].lect_roomnum);
                setAvatar(response.data[0].avatar);
                setuid(response.data[0].uid);
                setdataLecturer(response.data[0]);
                console.log(response.data[0]);
            })
            .catch(function (error) {
                console.log(error);
            });
    }, [rid]);

    const handleUpdate = () => {
        const newData = {
            lect_roomnum: lect_roomnum,
            avatar: avatar,
            uid: {
                user_name: user_name,
                user_email: user_email,
            },
        };
        axios
            .put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/lecturer/${rid}`, newData)
            .then(function (response) {
                console.log(response.data);
                //window.location.reload();
            })
            .catch(function (error) {
                console.log(error);
            });
        console.log(newData);
    };

    const [files, setFiles] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const upload_single_image = async (e: any) => {
        const file = e.target.files[0];
        const validImageTypes = ["image/jpeg", "image/png", "image/gif"]; // ประเภทไฟล์รูปภาพที่ยอมรับ
        if (validImageTypes.includes(file.type)) { // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
            const data = new FormData();
            data.append("file", file);
            data.append("upload_preset", "student");
            axios.post("https://api.cloudinary.com/v1_1/drynd8ioj/image/upload", data)
                .then((res) => {
                    setImageUrls([res.data.secure_url]);
                    setAvatar(res.data.secure_url);
                });
        } else {
            alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        }
    }
    return (
        <Box component="form" noValidate autoComplete="off">
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
                        {datalecturer && (
                            <>
                                <Avatar
                                    sx={{ width: 88, height: 88, border: "3px solid rgba(255,255,255,0.4)" }}
                                    src={`${imageUrls.length > 0 ? imageUrls[0] : datalecturer.avatar}`}
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
                                        disabled={!isEdit}
                                        sx={{ mt: 1.5, color: "#fff", borderColor: "rgba(255,255,255,0.6)" }}
                                    >
                                        เปลี่ยนรูปโปรไฟล์
                                        <input
                                            hidden
                                            accept=".jpg,.jpeg,.png*"
                                            id="fileInput"
                                            onChange={upload_single_image}
                                            multiple
                                            type="file"
                                        />
                                    </Button>
                                </Box>
                                <Button
                                    variant="contained"
                                    color={isEdit ? "secondary" : "inherit"}
                                    startIcon={isEdit ? <Close /> : <Edit />}
                                    onClick={() => setIsEdit(!isEdit)}
                                    sx={!isEdit ? { color: "primary.main", backgroundColor: "#fff" } : {}}
                                >
                                    {isEdit ? "ยกเลิก" : "แก้ไข"}
                                </Button>
                            </>
                        )}
                    </Box>

                    <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                        {datalecturer && (
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="ชื่อ - นามสกุล"
                                        fullWidth
                                        disabled={!isEdit}
                                        onChange={(e) => setUsername((e.target.value))}
                                        defaultValue={datalecturer.user_name}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="อีเมล"
                                        fullWidth
                                        disabled={!isEdit}
                                        onChange={(e) => setUserEmail((e.target.value))}
                                        defaultValue={datalecturer.user_email}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="เลขห้อง"
                                        fullWidth
                                        disabled={!isEdit}
                                        onChange={(e) => setLectRoomum((e.target.value))}
                                        value={lect_roomnum}
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {isEdit && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                    <Button variant="contained" startIcon={<Save />} onClick={() => handleUpdate()}>
                                        บันทึกการแก้ไข
                                    </Button>
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
