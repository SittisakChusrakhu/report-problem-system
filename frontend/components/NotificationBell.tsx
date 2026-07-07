import React, { useEffect, useRef, useState } from "react";
import {
  IconButton,
  Tooltip,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { NotificationsActive } from "@mui/icons-material";
import { useRouter } from "next/router";
import { Api } from "../pages/api/api";
import { NotificationItem, formatRelativeTimeTh } from "../lib/notifications";

// โปรเจกต์นี้เก็บแค่ id เฉพาะ role (Student.id หรือ Lecturer.id) ไว้ใน
// localStorage คีย์ "rid" ตอน login ไม่ได้เก็บ User.id ตรงๆ — ใช้ prop
// `role` เพื่อรู้ว่าจะยิง query ด้วยพารามิเตอร์ sid (นักศึกษา) หรือ lid
// (อาจารย์) ไปที่ endpoint เดียวกัน /notification (backend รองรับทั้งสอง
// แบบแล้ว ดู notification.controller.js)
const POLL_INTERVAL_MS = 30000;

interface Props {
  role: "student" | "lecturer";
}

export default function NotificationBell({ role }: Props) {
  const router = useRouter();
  const paramKey = role === "lecturer" ? "lid" : "sid";
  // หน้ารายละเอียดปัญหาของแต่ละ role เป็นคนละหน้ากัน — กด item แล้วต้องเด้ง
  // ไปหน้าที่ถูกต้องตาม role ของคนที่กำลังดูอยู่
  const detailPath = role === "lecturer" ? "/lect_read" : "/stu_listreport";

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const idRef = useRef<string | null>(null);

  const getOwnerId = () => {
    if (!idRef.current) {
      idRef.current =
        typeof window !== "undefined" ? localStorage.getItem("rid") : null;
    }
    return idRef.current;
  };

  const fetchUnreadCount = () => {
    const ownerId = getOwnerId();
    if (!ownerId) return;

    Api.get(`/notification/unread-count?${paramKey}=${ownerId}`)
      .then((res) => setUnreadCount(res.data.count || 0))
      .catch((error) => console.log(error));
  };

  const fetchNotifications = () => {
    const ownerId = getOwnerId();
    if (!ownerId) return;

    setLoading(true);
    Api.get(`/notification?${paramKey}=${ownerId}`)
      .then((res) => setNotifications(res.data))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUnreadCount();

    // โพลตัวเลข unread เป็นระยะ เพราะโปรเจกต์นี้ยังไม่มี websocket/SSE
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);

    // หน้ารายการปัญหา (lect_read / stu_listreport) โพลถี่กว่านี้อยู่แล้ว
    // (ทุก 15 วิ) — ให้มันยิง event นี้ทุกครั้งที่ fetch สำเร็จ เพื่อ "ปลุก"
    // ให้กระดิ่งเช็ค unread count ทันที แทนที่จะรอรอบ poll 30 วิของตัวเอง
    // (ก่อนหน้านี้สองรอบ poll ไม่ sync กัน ทำให้ badge ขึ้นช้ากว่าที่ควร)
    window.addEventListener("notif:refresh-count", fetchUnreadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notif:refresh-count", fetchUnreadCount);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => setAnchorEl(null);

  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read) {
      Api.put(`/notification/${item.id}/read`)
        .then(() => {
          setUnreadCount((c) => Math.max(0, c - 1));
          setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
          );
        })
        .catch((error) => console.log(error));
    }

    handleClose();

    if (item.pro_id) {
      router.push(`${detailPath}?open=${item.pro_id}`);
    }
  };

  const handleMarkAllRead = () => {
    const ownerId = getOwnerId();
    if (!ownerId) return;

    Api.put(`/notification/read-all?${paramKey}=${ownerId}`)
      .then(() => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      })
      .catch((error) => console.log(error));
  };

  // ปุ่ม "ล้างทั้งหมด" — ลบประวัติแจ้งเตือนทิ้งจริง (ต่างจาก "อ่านทั้งหมด"
  // ที่แค่มาร์คว่าอ่านแล้วแต่ยังค้างอยู่ในรายการ) ไว้ใช้ตอนแจ้งเตือนเยอะจนรก
  const handleClearAll = () => {
    const ownerId = getOwnerId();
    if (!ownerId) return;

    if (
      !window.confirm("ล้างการแจ้งเตือนทั้งหมด? การกระทำนี้ย้อนกลับไม่ได้")
    ) {
      return;
    }

    Api.delete(`/notification/clear-all?${paramKey}=${ownerId}`)
      .then(() => {
        setNotifications([]);
        setUnreadCount(0);
      })
      .catch((error) => console.log(error));
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="การแจ้งเตือน">
        <IconButton onClick={handleOpen} sx={{ color: "text.secondary" }}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsActive />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: { sx: { width: 360, maxHeight: 440, borderRadius: 2 } },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            การแจ้งเตือน
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllRead}>
                อ่านทั้งหมด
              </Button>
            )}
            {notifications.length > 0 && (
              <Button size="small" color="error" onClick={handleClearAll}>
                ล้างทั้งหมด
              </Button>
            )}
          </Box>
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={22} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              ยังไม่มีการแจ้งเตือน
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0, maxHeight: 340, overflowY: "auto" }}>
            {notifications.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleItemClick(item)}
                sx={{
                  alignItems: "flex-start",
                  bgcolor: item.is_read
                    ? "transparent"
                    : "rgba(25,118,210,0.06)",
                  borderBottom: "1px solid #f0f0f0",
                  py: 1.25,
                }}
              >
                <ListItemText
                  primary={item.message}
                  primaryTypographyProps={{
                    fontSize: 13.5,
                    fontWeight: item.is_read ? 400 : 600,
                  }}
                  secondary={formatRelativeTimeTh(item.created_at)}
                  secondaryTypographyProps={{ fontSize: 11.5, sx: { mt: 0.5 } }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}