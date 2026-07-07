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
} from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import React from "react";
import NavbarLayout from "../components/NavbarLayout";
import { Api } from "./api/api"
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function BasicCard() {


  const deletestudent = async (sid: any, uid: any) => {
    console.log("yyy")
    Api.delete(`/student/${sid}/${uid}`).then((response) => {
      toast.error('ลบผู้ใช้งานแล้ว', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }).then((response) => {
      setTimeout(location.reload.bind(location), 1000);
    });

  }

  const [datat, setDatat] = React.useState([])
  React.useEffect(() => {
    Api.get("/student/all").then(function (response: any) {
      setDatat(response.data)
    })
      .catch(function (error) {
        console.log(error);
      });
  }, []);



  return (
    <Box>
      <ToastContainer />
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
          จัดการผู้ใช้งาน
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          รายชื่อนักศึกษาทั้งหมดในระบบ
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: 4, maxHeight: 560 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>รหัสนักศึกษา</TableCell>
                <TableCell>ชื่อ - นามสกุล</TableCell>
                <TableCell>อีเมล์</TableCell>
                <TableCell>ชั้นปี</TableCell>
                <TableCell>สาขา</TableCell>
                <TableCell>คณะ</TableCell>
                <TableCell align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datat.map((row: any) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.stu_id}</TableCell>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.stu_email}</TableCell>
                  <TableCell>{row.stu_grade}</TableCell>
                  <TableCell>{row.stu_faculty}</TableCell>
                  <TableCell>{row.stu_major}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutline />}
                      onClick={e => deletestudent(row.id, row.uid)}
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
