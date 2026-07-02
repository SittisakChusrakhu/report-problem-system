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
    SelectChangeEvent,
    FormControl,
    Typography,
} from "@mui/material";
import { AddPhotoAlternate } from "@mui/icons-material";
import React from "react";
import NavbarLayout from "../components/NavbarLayout";

export default function MultilineTextFields() {
    const [value, setValue] = React.useState('');

    const [age, setAge] = React.useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setAge(event.target.value as string);
    };

    return (
        <Box component="form" noValidate autoComplete="off">
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
                    เพิ่ม Topic เรื่องปัญหาการเรียน
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    กรอกรายละเอียดหัวข้อปัญหาใหม่ที่ต้องการเพิ่มเข้าระบบ
                </Typography>

                <Card sx={{ maxWidth: 820 }}>
                    <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} sm={4}>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<AddPhotoAlternate />}
                                    sx={{
                                        height: 140,
                                        width: "100%",
                                        borderStyle: "dashed",
                                        borderWidth: 2,
                                    }}
                                >
                                    เพิ่มรูปภาพ
                                    <input hidden accept="image/*" multiple type="file" />
                                </Button>
                                <FormControl fullWidth sx={{ mt: 3 }}>
                                    <InputLabel id="demo-simple-select-autowidth-label">หัวข้อปัญหา</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-autowidth-label"
                                        id="demo-simple-select-autowidth"
                                        label="หัวข้อปัญหา"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value={10}>ปัญหาการเรียน</MenuItem>
                                        <MenuItem value={21}>ปัญหาอุปกรณ์การเรียน</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={8}>
                                <TextField
                                    label="หัวข้อ"
                                    id="outlined-multiline-static"
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 3 }}
                                />
                                <TextField
                                    label="รายละเอียด"
                                    id="outlined-multiline-static2"
                                    multiline
                                    fullWidth
                                    rows={6}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                            <Button variant="contained" color="success" size="large">
                                เพิ่มหัวข้อ
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>

    );
}
