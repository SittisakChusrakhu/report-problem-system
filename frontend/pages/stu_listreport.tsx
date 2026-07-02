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
  Grid,
  Chip,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import NavbarStu from "../components/NavbarStu";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Api } from "./api/api";
import { CloudUpload, Add, DoNotDisturbOn, Delete } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";

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

export default function StudentComponent() {
  const [modelproblem, setmodelproblem] = useState<Problem[]>([]);
  const [filteredData, setFilteredData] = useState<Problem[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dialogData, setDialogData] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const lid = localStorage.getItem("rid");
    console.log(lid);

    var config = {
      method: "get",
      url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/user/problem/?sid=${lid}`,
      headers: {},
    };

    axios(config)
      .then(function (response) {
        setmodelproblem(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  const upload_multiple_image = async (e: any) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      const data = new FormData();
      data.append("file", files[i]);
      data.append("upload_preset", "student");
      await axios
        .post("https://api.cloudinary.com/v1_1/drynd8ioj/image/upload", data)
        .then((res) => {
          setImageUrls((prevImageUrls) => [
            ...prevImageUrls,
            res.data.secure_url,
          ]);
        });
    }
  };

  const updateDialogDataImages = (updatedProImages: string) => {
    setDialogData((prevDialogData: { pro_images: string }) => ({
      ...prevDialogData,
      pro_images: updatedProImages,
    }));
  };
  
  const deleteImage = (index: number) => {
    const updatedImageUrls = [...imageUrls];
    updatedImageUrls.splice(index, 1);
    setImageUrls(updatedImageUrls);
  
    // อัปเดตข้อมูล pro_images ใน dialogData
    if (dialogData) {
      const updatedProImages = dialogData.pro_images
        .split(",")
        .filter((_: any, i: number) => i !== index)
        .join(",");
      updateDialogDataImages(updatedProImages);
    }
  };
  

  const onConfirmUpdate = () => {
    if (editData) {
      const updatedData = {
        pro_title: title,
        pro_type: type,
        pro_desc: details,
        pro_images: editData.pro_images,
        datetime: new Date().toISOString(), // กำหนดค่า datetime เป็นปัจจุบัน
      };
  
      // ตรวจสอบว่ามีอัปเดตรูปภาพหรือไม่
      if (imageUrls.length > 0) {
        updatedData.pro_images = imageUrls.join(",");
      }
  
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
  
          // ตรวจสอบตัวแปร openEdit และล้างค่า
          if (openEdit) {
            setOpenEdit(false);
            setTitle("");
            setType("");
            setDetails("");
            setImageUrls([]);
          }
  
          const lid = localStorage.getItem("rid");
          var config = {
            method: "get",
            url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/user/problem/?sid=${lid}`,
            headers: {},
          };
  
          axios(config)
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
    } else {
      console.log("editData is null");
    }
  };
  

  const deleteproblem = (pid: string) => {
    axios
      .delete(`/problem/${pid}`)
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
        var config = {
          method: "get",
          url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/user/problem/?sid=${lid}`,
          headers: {},
        };

        axios(config)
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

  const handleOpenDialog = (problem: any) => {
    setEditData(problem); // ตรงนี้ควรตรวจสอบว่าคุณตั้งค่า editData ให้ถูกต้อง

    // ตั้งค่าข้อมูลอื่น ๆ ที่ต้องการให้ใน Dialog
    setTitle(problem.pro_title);
    setType(problem.pro_type);
    setDetails(problem.pro_desc);
    setImageUrls(problem.pro_images.split(","));
    setCurrentImageIndex(0);

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogData(null);
  };


  return (
    <>
      <NavbarStu />
      <ToastContainer />
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
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((problem) => (
                    <TableRow key={problem.id} hover>
                      <TableCell>{problem.pro_title}</TableCell>
                      <TableCell>{problem.pro_type}</TableCell>
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
                  ))}
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
          <Box mt={2}>
            <TextField
              label="Title"
              variant="outlined"
              size="small"
              value={title || (dialogData && dialogData.pro_title)}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Box>
          <Box mt={2}>
            <TextField
              label="Type"
              variant="outlined"
              size="small"
              value={type || (dialogData && dialogData.pro_type)}
              onChange={(e) => setType(e.target.value)}
            />
          </Box>
          <Box mt={2}>
            <TextField
              label="Description"
              variant="outlined"
              size="small"
              multiline
              rows={4}
              value={details || (dialogData && dialogData.pro_desc)}
              onChange={(e) => setDetails(e.target.value)}
            />
          </Box>
          <Box mt={2}>
            <Typography variant="body1" mb={2}>
              Images:
            </Typography>
            <Box mx={2}>
              {dialogData && dialogData.pro_images && (
                <>
                  <img
                    src={dialogData.pro_images
                      .split(",")
                      [currentImageIndex]?.trim()}
                    alt={`Problem Image ${currentImageIndex + 1}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                  <Button onClick={() => deleteImage(currentImageIndex)}>
                    <Delete />
                  </Button>
                </>
              )}
            </Box>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {imageUrls.map((imageUrl, index) => (
                    <div key={index}>
                      <Button
                        style={{ marginTop: 10, marginLeft: 30 }}
                        onClick={() => deleteImage(index)}
                      >
                        <Delete />
                      </Button>
                      <Grid item>
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={`Image ${index}`}
                            width={50}
                          />
                        )}
                      </Grid>
                    </div>
                  ))}
                </Grid>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  component="label"
                  style={{ marginLeft: 10, marginTop: 10 }}
                >
                  <CloudUpload />
                  Upload
                  <input
                    hidden
                    accept=".jpg,.jpeg,.png*"
                    id="fileInput"
                    onChange={upload_multiple_image}
                    multiple
                    type="file"
                    style={{ marginTop: "10px" }}
                  />
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={onConfirmUpdate}
            >
              Update
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
