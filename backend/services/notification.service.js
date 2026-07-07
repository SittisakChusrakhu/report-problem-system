const notificationRepository = require("../repositories/notification.repository");

// ประกอบข้อความแจ้งเตือนภาษาไทยจาก relation ที่ join มา (Notification เอง
// ไม่มีฟิลด์ message/type เก็บไว้ — ดู schema.prisma) ทำเป็นฟังก์ชันแยกไว้
// เพื่อให้ getForStudent ใช้ซ้ำได้ และแก้ข้อความในที่เดียวถ้าต้องเปลี่ยน
const buildMessage = (notification) => {
  const title = notification.problem?.pro_title ?? "ปัญหาของคุณ";

  if (notification.feedback) {
    const raw = notification.feedback.feed_massage ?? "";
    const preview = raw.length > 60 ? raw.slice(0, 60) + "..." : raw;
    return `อาจารย์ตอบกลับปัญหา "${title}" แล้ว: ${preview}`;
  }

  if (notification.problem) {
    return `สถานะปัญหา "${title}" เปลี่ยนเป็น ${notification.problem.status}`;
  }

  return "คุณมีการแจ้งเตือนใหม่";
};

exports.getForStudent = async (studentId) => {
  const notifications = await notificationRepository.findByStudentId(
    studentId
  );

  return notifications.map((n) => ({
    id: n.id,
    is_read: n.is_read,
    created_at: n.created_at,
    pro_id: n.pro_id,
    feed_id: n.feed_id,
    message: buildMessage(n),
  }));
};

exports.getUnreadCount = async (studentId) => {
  const count = await notificationRepository.countUnreadByStudentId(
    studentId
  );

  return { count };
};

exports.markAsRead = async (id) => {
  return await notificationRepository.markAsRead(id);
};

exports.markAllAsRead = async (studentId) => {
  return await notificationRepository.markAllAsReadByStudentId(studentId);
};

// เรียกจาก service อื่น (feedback.service.js / problem.service.js) ตอนเกิด
// อีเวนต์ที่นักศึกษาเจ้าของปัญหาควรได้รับแจ้งเตือน รับ studentId (sid) แทน
// user_id ตรงๆ เพราะ service ต้นทางมีแค่ sid ในมือ แล้วไป resolve เป็น
// User.id ให้เองผ่าน repository
exports.notifyStudentByStudentId = async ({ studentId, pro_id, feed_id }) => {
  if (!studentId) return null;

  const userId = await notificationRepository.findUserIdByStudentId(
    studentId
  );

  if (!userId) return null;

  return await notificationRepository.create({
    user: { connect: { id: userId } },
    problem: pro_id ? { connect: { id: Number(pro_id) } } : undefined,
    feedback: feed_id ? { connect: { id: Number(feed_id) } } : undefined,
  });
};

// ---------- ฝั่งอาจารย์ ----------

// ข้อความแจ้งเตือนฝั่งอาจารย์แยกจากฝั่งนักศึกษา เพราะ pro_id เพียวๆ
// (ไม่มี feed_id) มีความหมายคนละอย่างกันตามมุมมองผู้รับ: นักศึกษาเห็นว่า
// "สถานะเปลี่ยน" แต่อาจารย์เห็นว่า "มีปัญหาใหม่เข้ามา"
const buildLecturerMessage = (notification) => {
  const title = notification.problem?.pro_title ?? "ปัญหาใหม่";
  return `มีนักศึกษาแจ้งปัญหาใหม่: "${title}"`;
};

exports.getForLecturer = async (lecturerId) => {
  const notifications = await notificationRepository.findByLecturerId(
    lecturerId
  );

  return notifications.map((n) => ({
    id: n.id,
    is_read: n.is_read,
    created_at: n.created_at,
    pro_id: n.pro_id,
    feed_id: n.feed_id,
    message: buildLecturerMessage(n),
  }));
};

exports.getUnreadCountLecturer = async (lecturerId) => {
  const count = await notificationRepository.countUnreadByLecturerId(
    lecturerId
  );

  return { count };
};

exports.markAllAsReadLecturer = async (lecturerId) => {
  return await notificationRepository.markAllAsReadByLecturerId(lecturerId);
};

// เรียกจาก problem.service.js ตอนนักศึกษาแจ้งปัญหาใหม่แล้วมีการมอบหมาย
// อาจารย์ทันที (lecturerId ถูกส่งมาตอนสร้างปัญหา)
exports.notifyLecturerByLecturerId = async ({ lecturerId, pro_id }) => {
  if (!lecturerId) return null;

  const userId = await notificationRepository.findUserIdByLecturerId(
    lecturerId
  );

  if (!userId) return null;

  return await notificationRepository.create({
    user: { connect: { id: userId } },
    problem: pro_id ? { connect: { id: Number(pro_id) } } : undefined,
  });
};

// ---------- ปุ่ม "ล้างทั้งหมด" ----------

exports.clearAllStudent = async (studentId) => {
  return await notificationRepository.deleteAllByStudentId(studentId);
};

exports.clearAllLecturer = async (lecturerId) => {
  return await notificationRepository.deleteAllByLecturerId(lecturerId);
};