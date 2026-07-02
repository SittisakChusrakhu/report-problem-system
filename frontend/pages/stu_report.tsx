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
} from "@mui/material";
import React, { useEffect, useState } from "react";
import NavbarStu from "../components/NavbarStu";
import axios from "axios";
import { Api } from "./api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CloudUpload, Delete, Send } from "@mui/icons-material";
import "dayjs/locale/th";
import dayjs, { Dayjs } from "dayjs";

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

  interface Problem {
    id: number;
    pro_title: string;
    pro_type: string;
    pro_desc: string;
    pro_image: string;
    lect_id: Lecturer[];
    stu: number;
    datetime: dayjs.Dayjs;
    status: string;
    tags: Tag[];
  }

  const [problem, setproblem] = useState<Problem>({
    id: 0,
    pro_title: "",
    pro_type: "",
    pro_desc: "",
    pro_image: "",
    lect_id: [],
    stu: 0,
    datetime: dayjs(),
    status: "กำลังส่งเรื่อง",
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
  const [selectLecturer, setSelectLecturer] = useState<string[]>([]);
  useEffect(() => {
    dayjs.locale("th");
    setproblem({ ...problem, stu: Number(localStorage.getItem("rid")) });

    axios({
      method: "get",
      url: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api') + "/lecturer/all",
      headers: {},
    })
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

  const handleChangeLecturerId = (
    event: SelectChangeEvent<typeof selectLecturer>
  ) => {
    const {
      target: { value },
    } = event;
    console.log(value);
    setSelectLecturer(typeof value === "string" ? value.split(",") : value);
  };

  const handleSubmitstu = async () => {
    setproblem({ ...problem, datetime: dayjs() });
    problem.pro_image = imageUrls.join(",");
    problem.tags = selectedTags;
    problem.lect_id = selectLecturer.map((lect_id) => {
      return { id: Number(lect_id) };
    });
    console.log(problem);
    const res = await Api.post("/problem", problem);
    if (res.data) {
      toast.success("คุณส่งรายงานปัญหาแล้ว", {
        position: "top-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      //setTimeout(location.reload.bind(location), 3000);
    }
  };

  const upload_multiple_image = async (e: any) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      const data = new FormData();
      data.append("file", files[i]);
      data.append("upload_preset", "student");
      axios
        .post("https://api.cloudinary.com/v1_1/drynd8ioj/image/upload", data)
        .then((res) => {
          setImageUrls((prevImageUrls) => [
            ...prevImageUrls,
            res.data.secure_url,
          ]);
        });
    }
  };

  const deleteImage = (index: any) => {
    const updatedImageUrls = [...imageUrls];
    updatedImageUrls.splice(index, 1);
    setImageUrls(updatedImageUrls);
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

  return (
    <Box component="form">
      <ToastContainer />
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
              onChange={handleChangeproblem}
              fullWidth
              sx={{ mt: 1.5, mb: 3 }}
            />

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="tag-select-label">หัวข้อปัญหา</InputLabel>
                  <Select
                    labelId="tag-select-label"
                    id="pro_type"
                    multiple
                    name="pro_type"
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
                  <InputLabel id="lecturer-select-label">อาจารย์</InputLabel>
                  <Select
                    labelId="lecturer-select-label"
                    id="lect_id"
                    multiple
                    name="lect_id"
                    value={selectLecturer}
                    onChange={handleChangeLecturerId}
                    input={<OutlinedInput label="อาจารย์" />}
                    renderValue={(selected) => {
                      const lecturers = selected as string[];
                      return (
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {lecturers.map((lecturer: any) => (
                            <Chip
                              key={lecturer}
                              label={
                                AllLectures.find(
                                  (lect: any) => lect.id === Number(lecturer)
                                )?.username
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
                    {AllLectures.map((lecturer, index) => (
                      <MenuItem key={index} value={String(lecturer.id)}>
                        <Checkbox
                          checked={
                            selectLecturer.indexOf(String(lecturer.id)) > -1
                          }
                        />
                        <ListItemText primary={lecturer.username} />
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
                startIcon={<CloudUpload />}
                sx={{
                  borderStyle: "dashed",
                  borderWidth: 2,
                  px: 2.5,
                  py: 1.4,
                  color: "text.secondary",
                  borderColor: "rgba(0,0,0,0.2)",
                }}
              >
                อัปโหลดรูปภาพ
                <input
                  hidden
                  accept=".jpg,.jpeg,.png*"
                  id="fileInput"
                  onChange={upload_multiple_image}
                  multiple
                  type="file"
                />
              </Button>

              {imageUrls.map((imageUrl, index) => (
                <Box key={index} sx={{ position: "relative" }}>
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={`Image ${index}`}
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 2,
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
              >
                แจ้งปัญหา
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
