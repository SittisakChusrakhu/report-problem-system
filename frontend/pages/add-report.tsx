import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AddRounded, DeleteOutline, LocalOfferOutlined, ErrorOutlineRounded } from "@mui/icons-material";
import NavbarLayout from "../components/NavbarLayout";
import { Api } from "./api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ---------------------------------------------------------------------------
// เดิมหน้านี้เป็นฟอร์มที่ไม่ได้เชื่อมกับ backend เลย (ไม่มี state/submit
// handler) และฟิลด์ (อัปโหลดรูป, รายละเอียด) ก็ไม่ตรงกับสิ่งที่ backend
// รองรับจริง — สิ่งที่ backend มีจริงคือ "แท็ก" (model Tag: แค่ id+name)
// ที่นักศึกษาเลือกติดปัญหาตอนแจ้ง (ดู stu_report.tsx) และมี endpoint
// /tags (POST/DELETE ล็อกไว้ให้แอดมินเท่านั้นอยู่แล้วที่ backend) หน้านี้
// เลยถูกเขียนใหม่ให้เป็นหน้าจัดการแท็กที่เชื่อมกับ backend จริง
// ---------------------------------------------------------------------------
const INK = "#1E2A28";
const SUB = "#5B6B68";
const PAPER = "#E3EEEA";
const HAIRLINE = "rgba(31,79,73,0.10)";
const BRAND = "#2F7268";
const BRAND_DARK = "#1F4F49";

interface TagRow {
  id: number;
  name: string;
}

export default function ManageTags() {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadTags = () => {
    setLoading(true);
    setError(null);
    Api.get<TagRow[]>("/tags")
      .then((res) => setTags(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("โหลดรายการหัวข้อไม่สำเร็จ ลองรีเฟรชหน้านี้อีกครั้ง"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTags();
  }, []);

  const trimmedName = newTagName.trim();
  const isDuplicate = useMemo(
    () => tags.some((t) => t.name.toLowerCase() === trimmedName.toLowerCase()),
    [tags, trimmedName]
  );

  const handleAdd = async () => {
    if (!trimmedName || isDuplicate) return;
    setSubmitting(true);
    try {
      const res = await Api.post<TagRow>("/tags", { name: trimmedName });
      setTags((prev) => [...prev, res.data]);
      setNewTagName("");
      toast.success(`เพิ่มหัวข้อ "${trimmedName}" แล้ว`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
    } catch (error) {
      console.error(error);
      toast.error("เพิ่มหัวข้อไม่สำเร็จ ลองใหม่อีกครั้ง", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tag: TagRow) => {
    setDeletingId(tag.id);
    try {
      await Api.delete(`/tags/${tag.id}`);
      setTags((prev) => prev.filter((t) => t.id !== tag.id));
      toast.success(`ลบหัวข้อ "${tag.name}" แล้ว`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
    } catch (error) {
      console.error(error);
      toast.error("ลบหัวข้อไม่สำเร็จ ลองใหม่อีกครั้ง", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: PAPER }}>
      <ToastContainer />
      <NavbarLayout />
      <Box component="main" sx={{ ml: { sm: "260px" }, mt: "64px", p: { xs: 2, sm: 4 } }}>
        <Typography sx={{ fontWeight: 700, fontSize: 22, color: INK }}>
          จัดการหัวข้อปัญหา (Topic)
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: SUB, mt: 0.5, mb: 3 }}>
          หัวข้อที่เพิ่มไว้ที่นี่จะไปปรากฏเป็นตัวเลือกแท็กให้นักศึกษาเลือกตอนแจ้งปัญหา
        </Typography>

        {error && (
          <Box
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              borderRadius: 3,
              backgroundColor: "#fff",
              border: `1px solid ${HAIRLINE}`,
            }}
          >
            <ErrorOutlineRounded sx={{ color: "#C0553F" }} />
            <Typography sx={{ fontSize: 13.5, color: INK }}>{error}</Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 4, p: { xs: 2.5, sm: 3 } }}>
              <Typography sx={{ fontWeight: 600, fontSize: 15, color: INK, mb: 2 }}>
                เพิ่มหัวข้อใหม่
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="ชื่อหัวข้อ"
                placeholder="เช่น ปัญหาการลงทะเบียนเรียน"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
                error={isDuplicate}
                helperText={isDuplicate ? "มีหัวข้อนี้อยู่แล้วในระบบ" : " "}
              />
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddRounded />}
                disabled={!trimmedName || isDuplicate || submitting}
                onClick={handleAdd}
                sx={{
                  mt: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 999,
                  py: 1,
                  backgroundColor: BRAND,
                  "&:hover": { backgroundColor: BRAND_DARK },
                }}
              >
                {submitting ? "กำลังเพิ่ม..." : "เพิ่มหัวข้อ"}
              </Button>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 4, p: { xs: 2.5, sm: 3 }, minHeight: 220 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 15, color: INK, mb: 2 }}>
                หัวข้อทั้งหมด ({tags.length})
              </Typography>

              {loading ? (
                <Stack direction="row" flexWrap="wrap" gap={1.5}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="rounded" width={110} height={34} sx={{ borderRadius: 999 }} />
                  ))}
                </Stack>
              ) : tags.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography sx={{ fontSize: 13.5, color: SUB }}>
                    ยังไม่มีหัวข้อในระบบ เพิ่มหัวข้อแรกจากฟอร์มด้านซ้ายได้เลย
                  </Typography>
                </Box>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={1.5}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag.id}
                      icon={<LocalOfferOutlined sx={{ fontSize: 16, color: `${BRAND} !important` }} />}
                      label={tag.name}
                      onDelete={() => handleDelete(tag)}
                      deleteIcon={
                        deletingId === tag.id ? (
                          <DeleteOutline sx={{ fontSize: 17, opacity: 0.4 }} />
                        ) : (
                          <DeleteOutline sx={{ fontSize: 17 }} />
                        )
                      }
                      disabled={deletingId === tag.id}
                      sx={{
                        fontWeight: 600,
                        fontSize: 13,
                        py: 2,
                        backgroundColor: `${BRAND}14`,
                        color: INK,
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}