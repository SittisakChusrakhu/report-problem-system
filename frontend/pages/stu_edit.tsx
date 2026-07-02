import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { Edit, Close, Save } from "@mui/icons-material";
import React, { useState } from "react";
import NavbarStu from "../components/NavbarStu";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import "dayjs/locale/th"
import Avatar from '@mui/material/Avatar';

interface StudentData {
  stu_id: String;
  stu_grade: string;
  stu_faculty: string;
  stu_major: string;
  avatar: string;
  uid: any;
}

const fieldLabels: Record<string, string> = {
  stu_id: "รหัสนักศึกษา",
  username: "ชื่อ - นามสกุล",
  stu_email: "อีเมล",
  stu_grade: "ชั้นปี",
  stu_faculty: "คณะ",
  stu_major: "สาขา",
};

export default function StudentComponent() {
  const [rid, setRid] = React.useState<number>(0);
  const [datastudent, setdatastudent] = React.useState<any>(null);
  const [isEdit, setIsEdit] = React.useState(false);
  const [editData, setEditData] = React.useState<StudentData>({
    stu_id: "",
    stu_grade: "",
    stu_faculty: "",
    stu_major: "",
    avatar: "",
    uid: "",
  });
  const [username, setUsername] = React.useState("");
  const [stuId, setStuId] = React.useState("");
  const [stuEmail, setStuEmail] = React.useState("");
  const [stuGrade, setStuGrade] = React.useState("");
  const [stuFaculty, setStuFaculty] = React.useState("");
  const [stuMajor, setStuMajor] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
  const [uid, setuid] = React.useState("");

  React.useEffect(() => {
    setRid(Number(localStorage.getItem("rid")));
  }, []);

  React.useEffect(() => {
    axios
      .get<any[]>(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/student?id=${rid}`)
      .then(function (response) {
        setUsername(response.data[0].username);
        setStuEmail(response.data[0].stuEmail);
        setStuId(response.data[0].stuId);
        setStuGrade(response.data[0].stuGrade);
        setStuFaculty(response.data[0].stuGrade);
        setStuMajor(response.data[0].stuMajor);
        setAvatar(response.data[0].avatar);
        setuid(response.data[0].uid);
        setdatastudent(response.data[0]);
        console.log(response.data[0]);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [rid]);


  const handleUpdate = () => {
    const newData: StudentData = {
      stu_id: stuId,
      stu_grade: stuGrade,
      stu_faculty: stuFaculty,
      stu_major: stuMajor,
      avatar: avatar,
      uid: {
        username: username,
        stu_email: stuEmail,
      }
    };

    axios
      .put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/student/${rid}`, newData)
      .then(function (response) {
        console.log(response.data);
        //window.location.reload();

      })
      .catch(function (error) {
        console.log(error);
      }); console.log(newData);
  }


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
  };



  return (
    <Box component="form" noValidate autoComplete="off">
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
            {datastudent && (
              <>
                <Avatar
                  sx={{ width: 88, height: 88, border: "3px solid rgba(255,255,255,0.4)" }}
                  src={`${imageUrls.length > 0 ? imageUrls[0] : datastudent.avatar}`}
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
            {datastudent && (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={fieldLabels.stu_id}
                    fullWidth
                    disabled={!isEdit}
                    onChange={(e) => setStuId((e.target.value))}
                    defaultValue={datastudent.stu_id}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={fieldLabels.username}
                    fullWidth
                    disabled={!isEdit}
                    onChange={(e) => setUsername((e.target.value))}
                    defaultValue={datastudent.username}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={fieldLabels.stu_email}
                    fullWidth
                    disabled={!isEdit}
                    onChange={(e) => setStuEmail((e.target.value))}
                    defaultValue={datastudent.stu_email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={fieldLabels.stu_grade}
                    fullWidth
                    disabled={!isEdit}
                    onChange={(e) => setStuGrade((e.target.value))}
                    defaultValue={datastudent.stu_grade}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={fieldLabels.stu_faculty}
                    fullWidth
                    disabled={!isEdit}
                    onChange={(e) => setStuFaculty((e.target.value))}
                    defaultValue={datastudent.stu_faculty}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={fieldLabels.stu_major}
                    fullWidth
                    disabled={!isEdit}
                    onChange={(e) => setStuMajor((e.target.value))}
                    defaultValue={datastudent.stu_major}
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
