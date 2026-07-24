import React, { useEffect, useRef, useState } from "react";
import {
  IconButton,
  Tooltip,
  Badge,
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { NotificationsActive, Close as CloseIcon } from "@mui/icons-material";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const idRef = useRef<string | null>(null);
  // ไอดีของทุก notification ที่เคย fetch มาแล้วอย่างน้อยหนึ่งครั้งในเซสชัน
  // นี้ — ใช้เทียบว่ารายการที่ fetch มาใหม่ อันไหน "ใหม่จริง" (ควร toast)
  // กับอันที่เคยเห็นแล้ว (ไม่ควร toast ซ้ำทุกรอบ poll)
  const seenIdsRef = useRef<Set<number>>(new Set());
  const hasHydratedRef = useRef(false);

  const getOwnerId = () => {
    if (!idRef.current) {
      idRef.current =
        typeof window !== "undefined" ? localStorage.getItem("rid") : null;
    }
    return idRef.current;
  };

  const openNotification = (item: NotificationItem) => {
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

  const showNewNotificationToast = (item: NotificationItem) => {
    toast.info(
      <Box onClick={() => openNotification(item)} sx={{ cursor: "pointer" }}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25 }}>
          การแจ้งเตือนใหม่
        </Typography>
        <Typography variant="body2">{item.message}</Typography>
      </Box>,
      {
        // ป้องกัน toast เด้งซ้ำถ้า effect ยิงสองรอบ (เช่น React StrictMode
        // ตอน dev) — toastId เดียวกัน react-toastify จะไม่สร้างซ้ำให้
        toastId: `notif-${item.id}`,
        position: "top-right",
        autoClose: 6000,
        closeOnClick: true,
        icon: <NotificationsActive fontSize="small" />,
      }
    );
  };

  // เทียบรายการที่เพิ่ง fetch มากับ seenIdsRef เพื่อหาว่าอันไหน "ใหม่จริง"
  // แล้วค่อย toast เฉพาะอันนั้น — ไม่ toast ทุกตัวตอนโหลดครั้งแรกของเซสชัน
  // (ไม่งั้นเปิดแอปมาจะโดน toast ถล่มด้วยของเก่าที่ยังไม่ได้อ่านทั้งหมด)
  const detectAndToastNew = (data: NotificationItem[]) => {
    if (!hasHydratedRef.current) {
      data.forEach((n) => seenIdsRef.current.add(n.id));
      hasHydratedRef.current = true;
      return;
    }

    const newItems = data.filter((n) => !seenIdsRef.current.has(n.id));
    data.forEach((n) => seenIdsRef.current.add(n.id));

    newItems
      .filter((n) => !n.is_read)
      .sort((a, b) => a.id - b.id)
      .forEach(showNewNotificationToast);
  };

  const fetchNotifications = (opts: { silent?: boolean } = {}) => {
    const ownerId = getOwnerId();
    if (!ownerId) return;

    if (!opts.silent) setLoading(true);
    Api.get(`/notification?${paramKey}=${ownerId}`)
      .then((res) => {
        const data: NotificationItem[] = res.data;
        detectAndToastNew(data);
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      })
      .catch((error) => console.log(error))
      .finally(() => {
        if (!opts.silent) setLoading(false);
      });
  };

  useEffect(() => {
    // fetch เงียบๆ ครั้งแรกเพื่อ hydrate seenIdsRef และตัวเลข badge โดยไม่
    // เปิด popover และไม่โชว์ loading spinner
    fetchNotifications({ silent: true });

    // โพลเป็นระยะเพื่อเช็คแจ้งเตือนใหม่ (silent เพราะเป็น background poll
    // ไม่ได้มาจากการที่ผู้ใช้กดเปิด dropdown เอง — ไม่ต้องมี spinner)
    const interval = setInterval(
      () => fetchNotifications({ silent: true }),
      POLL_INTERVAL_MS
    );

    // หน้ารายการปัญหา (lect_read / stu_listreport) โพลถี่กว่านี้อยู่แล้ว
    // (ทุก 15 วิ) — ให้มันยิง event นี้ทุกครั้งที่ fetch สำเร็จ เพื่อ "ปลุก"
    // ให้กระดิ่งเช็คแจ้งเตือนใหม่ทันที แทนที่จะรอรอบ poll 30 วิของตัวเอง
    const handleExternalRefresh = () => fetchNotifications({ silent: true });
    window.addEventListener("notif:refresh-count", handleExternalRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notif:refresh-count", handleExternalRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleOpen = () => {
    setDrawerOpen(true);
    fetchNotifications();
  };

  const handleClose = () => setDrawerOpen(false);

  const handleItemClick = (item: NotificationItem) => openNotification(item);

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

  // แยกรายการ unread ไว้ก่อนเสมอ (แม้ backend จะไม่ได้ sort มาแบบนั้น) เพื่อ
  // ให้ dropdown เห็นชัดว่าอันไหน "ใหม่" อันไหน "อ่านแล้ว"
  const unreadItems = notifications.filter((n) => !n.is_read);
  const readItems = notifications.filter((n) => n.is_read);

  const renderNotificationItem = (item: NotificationItem) => (
    <ListItemButton
      key={item.id}
      onClick={() => handleItemClick(item)}
      sx={{
        alignItems: "flex-start",
        bgcolor: item.is_read ? "transparent" : "rgba(25,118,210,0.06)",
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
  );

  const renderSectionLabel = (label: string, count?: number) => (
    <Box
      sx={{
        px: 2,
        py: 0.75,
        position: "sticky",
        top: 0,
        zIndex: 1,
        bgcolor: label === "ใหม่" ? "rgba(25,118,210,0.06)" : "#fafafa",
      }}
    >
      <Typography
        variant="caption"
        fontWeight={700}
        color={label === "ใหม่" ? "primary" : "text.secondary"}
        sx={{ letterSpacing: 0.5 }}
      >
        {label}
        {typeof count === "number" ? ` (${count})` : ""}
      </Typography>
    </Box>
  );

  return (
    <>
      <Tooltip title="การแจ้งเตือน">
        <IconButton onClick={handleOpen} sx={{ color: "text.secondary" }}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsActive />
          </Badge>
        </IconButton>
      </Tooltip>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            display: "flex",
            flexDirection: "column",
          },
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
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
          <List sx={{ py: 0, flex: 1, overflowY: "auto" }}>
            {unreadItems.length > 0 && (
              <>
                {renderSectionLabel("ใหม่", unreadItems.length)}
                {unreadItems.map(renderNotificationItem)}
              </>
            )}
            {readItems.length > 0 && (
              <>
                {renderSectionLabel("อ่านแล้ว")}
                {readItems.map(renderNotificationItem)}
              </>
            )}
          </List>
        )}
      </Drawer>
    </>
  );
}