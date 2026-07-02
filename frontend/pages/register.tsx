import {
    Paper,
    Typography,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Avatar,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";

import router from "next/router";
import React from "react";
import { Api } from "./api/api"
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function register() {
    const inputStyle = { mb: 2.5 };
    const [data, setData] = React.useState<any>({
        user_name: "",
        user_email: "",
        user_password: "",
        role_id: 0,
    });
    const [student, setstudent] = React.useState<any>({
        stu_id: "",
        stu_major: "",
        stu_grade: "",
        stu_faculty: "",
        avatar: "",
        user_id: "",
    });

    const [lecturer, setlecturer] = React.useState<any>({
        lect_roomnum: "",
        avatar: "",
        user_id: "",
    });

    const goToLogin = () => router.push("/")
    const handleSubmitstu = async () => {
        console.log(student)
        if (Object.values(student).includes("")) {
            alert("กรุณากรอกข้อมูลให้ครบ");
        } else {
            console.log(student);
            const res = await Api.post("/student", student);
            if (res.status == 200) {
                toast.success("คุณลงทะเบียนเรียบร้อยแล้ว", {
                    position: "top-center",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                  });
                  setTimeout(goToLogin, 3000)
                ;
            }
        }
    }

    const handleSubmitlect = async () => {
        console.log(lecturer)
        if (Object.values(lecturer).includes("")) {
            alert("กรุณากรอกข้อมูลให้ครบ");
        } else {
            const res = await Api.post("/lecturer", lecturer);
            if (res.status == 200) {
                toast.success("คุณลงทะเบียนเรียบร้อยแล้ว", {
                    position: "top-center",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                  });
                  setTimeout(goToLogin, 3000)
                ;
            }
        }
    }



    const [mailValid, setMailValid] = React.useState(false);
    const [file, setFile] = React.useState<any>();

    const [studentOpen, setStudentOpen] = React.useState(false);
    const [lecturerOpen, setlecturerOpen] = React.useState(false);

    const handleMail = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.match(/.+@ubu.ac.th/g)) {
            setMailValid(false);
            setData({ ...data, user_email: event.target.value });
        } else {
            setMailValid(true);
        }
    }

    const handleChangestu = (event: React.ChangeEvent<HTMLInputElement>) => {
        setstudent({ ...student, [event.target.name]: event.target.value });
    }

    const handleChangelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        setlecturer({ ...lecturer, [event.target.name]: event.target.value });
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, [event.target.name]: event.target.value });
    }

    const handleRole = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, role_id: Number(event.target.value) });
    }

    const handleSubmit = async () => {
        if (Object.values(data).includes("")) {
            alert("กรุณากรอกข้อมูลให้ครบ");
        } else {
            console.log(data);
            const res = await Api.post("/register", data);
            console.log(res);
            if (data.role_id === 1) {
                setstudent({ ...student, user_id: res.data.id });
                setStudentOpen(true);
            } else if (data.role_id === 2) {
                setlecturer({ ...lecturer, user_id: res.data.id });
                setlecturerOpen(true);
            }
        }
    }

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const img = event.target.files![0];
        const reader = new FileReader();
        reader.onload = (e) => {
            setFile(e.target!.result)
            setstudent({ ...student, avatar: e.target!.result });
        };
        reader.readAsDataURL(img);
    }

    const handleUploadlect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const img = event.target.files![0];
        const reader = new FileReader();
        reader.onload = (e) => {
            setFile(e.target!.result)
            setlecturer({ ...lecturer, avatar: e.target!.result });
        };
        reader.readAsDataURL(img);
    }

    return (<>
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
                    maxWidth: 460,
                    borderRadius: 5,
                    p: { xs: 4, sm: 5 },
                    boxShadow: "0 30px 70px rgba(15,40,37,0.35)",
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52, mb: 1.5 }}>
                        <PersonAdd />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        สมัครสมาชิก
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        รายละเอียดพื้นฐาน
                    </Typography>
                </Box>

                <TextField label="Username" name="user_name" onChange={handleChange} size="small" fullWidth sx={inputStyle} />
                <TextField label="Email" error={mailValid} onChange={handleMail} helperText={mailValid ? 'email must be @ubu.ac.th' : ' '} size="small" fullWidth sx={inputStyle} />
                <TextField label="Password" onChange={handleChange} name="user_password" type="password" size="small" fullWidth sx={inputStyle} />
                <TextField label="Password Matching" size="small" type="password" fullWidth sx={inputStyle} />

                <FormControl sx={{ mb: 2.5 }}>
                    <FormLabel id="demo-row-radio-buttons-group-label">Role</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="role"
                        onChange={handleRole}
                    >
                        <FormControlLabel value="1" control={<Radio />} label="Student" />
                        <FormControlLabel value="2" control={<Radio />} label="Teacher" />
                    </RadioGroup>
                </FormControl>

                <Button variant="contained" fullWidth size="large" sx={{ fontWeight: 600 }} onClick={handleSubmit}>ลงทะเบียน</Button>
                <Button variant="text" fullWidth sx={{ mt: 1 }} href="/">มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Button>
            </Paper>
        </Box>

        <Dialog open={studentOpen} PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ fontWeight: 600 }}>รายละเอียด นักเรียน</DialogTitle>
            <DialogContent sx={{ textAlign: "center" }}>
                {file && <Box component="img" src={file} sx={{ height: 160, borderRadius: 2, mb: 1 }} />}
                <TextField
                    margin="dense"
                    id="name"
                    name="stu_id"
                    label=" รหัสนักศึกษา"
                    fullWidth
                    variant="standard"
                    onChange={handleChangestu}
                />
                <TextField
                    margin="dense"
                    id="name"
                    name="stu_major"
                    label="สาขา"
                    fullWidth
                    variant="standard"
                    onChange={handleChangestu}
                />
                <TextField
                    margin="dense"
                    id="name"
                    label="คณะ"
                    name="stu_faculty"

                    fullWidth
                    variant="standard"
                    onChange={handleChangestu}
                />
                <FormControl sx={{ mt: 2 }}>
                    <FormLabel id="demo-row-radio-buttons-group-label">ชั้นปี</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="stu_grade" onChange={handleChangestu}
                    >
                        <FormControlLabel value="1" control={<Radio />} label="1" />
                        <FormControlLabel value="2" control={<Radio />} label="2" />
                        <FormControlLabel value="3" control={<Radio />} label="3" />
                        <FormControlLabel value="4" control={<Radio />} label="4" />
                    </RadioGroup>
                </FormControl><br />
                <Button variant="contained" component="label" sx={{ mt: 1 }}>
                    Upload
                    <input hidden accept="image/*" name="avatar" onChange={handleUpload} multiple type="file" />
                </Button>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button variant="contained" onClick={handleSubmitstu}>ยืนยัน</Button>
            </DialogActions>
        </Dialog>



        <Dialog open={lecturerOpen} PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ fontWeight: 600 }}>รายละเอียด อาจารย์</DialogTitle>
            <DialogContent sx={{ textAlign: "center" }}>
                {file && <Box component="img" src={file} sx={{ height: 160, borderRadius: 2, mb: 1 }} />}
                <TextField
                    margin="dense"
                    id="name"
                    name="lect_roomnum"
                    label="เลขห้อง"
                    fullWidth
                    variant="standard"
                    onChange={handleChangelect}
                />
                <Button variant="contained" component="label" sx={{ mt: 1 }}>
                    Upload
                    <input hidden accept="image/*" name="avatar" onChange={handleUploadlect} multiple type="file" />
                </Button>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button variant="contained" onClick={handleSubmitlect}>ยืนยัน</Button>
            </DialogActions>
        </Dialog></>
    );
}
