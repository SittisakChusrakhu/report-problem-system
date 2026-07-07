// Helpers for the student notification bell. The backend doesn't store a
// separate "type"/"message" field on Notification (see schema.prisma) — it
// only stores which problem/feedback the notification points to. The
// human-readable Thai message is built server-side in
// backend/services/notification.service.js and sent down as `message`, so
// this file just covers the small presentational bits (types + relative
// time) that are annoying to repeat inline, same spirit as problemStatus.ts.

export interface NotificationItem {
  id: number;
  is_read: boolean;
  created_at: string;
  pro_id: number | null;
  feed_id: number | null;
  message: string;
}

// เวลาแบบสัมพัทธ์ภาษาไทยง่ายๆ (ไม่ดึง lib เพิ่มเพราะใช้จุดเดียว)
export const formatRelativeTimeTh = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`;

  return new Date(isoDate).toLocaleDateString("th-TH");
};