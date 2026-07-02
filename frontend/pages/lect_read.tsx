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
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import NavbarLect from "../components/NavbarLect";
import axios from "axios";

interface Problem {
  id: string;
  pro_title: string;
  pro_type: string;
  pro_desc: string;
  pro_images: string;
  lect_id: string;
  sid: string;
  datetime: string;
  status: string;
}

export default function ListReport() {
  const [modelproblem, setModelProblem] = useState<Problem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogData, setDialogData] = useState<Problem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userData, setUserData] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any[]>([]);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [filteredData, setFilteredData] = useState<Problem[]>([]);

  useEffect(() => {
    const lid = localStorage.getItem("rid");
    console.log(lid);
    const config = {
      method: "get",
      url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/user/problem/?lid=${lid}`,
      headers: {},
    };
    axios(config)
      .then(function (response: any) {
        const sortedData = response.data.sort((a: Problem, b: Problem) => {
          const dateA = new Date(a.datetime);
          const dateB = new Date(b.datetime);
          return dateB.getTime() - dateA.getTime();
        });
        setModelProblem(sortedData);
      })
      .catch(function (error) {
        console.log(error);
      });

    axios
      .get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api') + "/user/all")
      .then((response: any) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api') + "/student/all")
      .then((response: any) => {
        setStudentData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const studentUidMap: { [key: string]: string } = {};

    studentData.forEach((student: any) => {
      studentUidMap[student.sid] = student.uid;
    });

    const userNamesMap: { [key: string]: string } = {};

    userData.forEach((user) => {
      if (studentUidMap[user.uid]) {
        userNamesMap[studentUidMap[user.uid]] = user.user_name;
      }
    });

    setUserNames(userNamesMap);
  }, [studentData, userData]);

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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogData(null);
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
                    const user = userData.find(
                      (user) => user.id === student?.uid
                    );
                    const userName = user?.user_name || "-";

                    return (
                      <TableRow key={problem.id} hover>
                        <TableCell>{problem.pro_title}</TableCell>
                        <TableCell>{problem.pro_type}</TableCell>
                        <TableCell>{userName}</TableCell>
                        <TableCell>
                          <Chip
                            label={problem.status}
                            size="small"
                            color={
                              problem.status === "ได้รับการแก้ปัญหาแล้ว"
                                ? "success"
                                : problem.status === "การแจ้งปัญหาถูกปฏิเสธ"
                                ? "error"
                                : "warning"
                            }
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
      <Dialog open={openDialog} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogContent sx={{ p: 3.5, minWidth: { sm: 420 } }}>
          {dialogData && (
            <Box>
              <Typography variant="h5" mb={2}>
                {dialogData.pro_title}
              </Typography>
              <Typography variant="body1" mb={2}>
                Type: {dialogData.pro_type}
              </Typography>
              <Typography variant="body1" mb={2}>
                Description: {dialogData.pro_desc}
              </Typography>
              <Typography variant="body1" mb={2}>
                datetime:{" "}
                {new Date(dialogData.datetime).toLocaleDateString("th-TH")}
              </Typography>
              <Typography variant="body1" mb={2}>
                Status: {dialogData.status}
              </Typography>
              <Typography variant="body1" mb={2}>
                Images:
              </Typography>
              <Box display="flex" alignItems="center">
                <Button
                  disabled={currentImageIndex === 0}
                  onClick={() => handleImageChange(currentImageIndex - 1)}
                >
                  Previous
                </Button>
                <Box mx={2}>
                  <img
                    src={dialogData.pro_images
                      .split(",")
                      [currentImageIndex]?.trim()}
                    alt={`Problem Image ${currentImageIndex + 1}`}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                    }}
                  />
                </Box>
                <Button
                  disabled={
                    currentImageIndex ===
                    dialogData.pro_images.split(",").length - 1
                  }
                  onClick={() => handleImageChange(currentImageIndex + 1)}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
