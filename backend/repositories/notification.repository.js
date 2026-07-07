const prisma = require("../src/connection");

// include ที่ใช้ประกอบข้อความแจ้งเตือนฝั่ง service (ชื่อปัญหา, สถานะปัจจุบัน,
// ข้อความตอบกลับ) — schema Notification เองไม่มีฟิลด์ message/type แยก
// ต่างหาก เลยต้อง join เอาข้อมูลจาก Problem/Feedback มาประกอบทีหลัง
const notificationInclude = {
  problem: {
    select: { id: true, pro_title: true, status: true },
  },
  feedback: {
    select: { id: true, feed_massage: true },
  },
};

exports.create = async (data) => {
  return await prisma.notification.create({
    data,
    include: notificationInclude,
  });
};

// ฝั่ง frontend (localStorage คีย์ "rid") มีแค่ Student.id ไม่มี User.id ตรงๆ
// จึงต้อง join ผ่าน user -> student แทนที่จะ filter ด้วย user_id ตรงๆ
exports.findByStudentId = async (studentId) => {
  return await prisma.notification.findMany({
    where: { user: { student: { id: Number(studentId) } } },
    include: notificationInclude,
    orderBy: { created_at: "desc" },
    take: 30,
  });
};

exports.countUnreadByStudentId = async (studentId) => {
  return await prisma.notification.count({
    where: {
      user: { student: { id: Number(studentId) } },
      is_read: false,
    },
  });
};

exports.markAsRead = async (id) => {
  return await prisma.notification.update({
    where: { id: Number(id) },
    data: { is_read: true },
    include: notificationInclude,
  });
};

// updateMany รองรับ relation filter ใน where เหมือน findMany (ตั้งแต่ Prisma
// v4 ขึ้นไป) ปลอดภัยที่จะใช้แบบนี้
exports.markAllAsReadByStudentId = async (studentId) => {
  return await prisma.notification.updateMany({
    where: {
      user: { student: { id: Number(studentId) } },
      is_read: false,
    },
    data: { is_read: true },
  });
};

// ใช้แปลง Student.id (sid) -> User.id ตอนสร้างการแจ้งเตือนจาก
// feedback.service.js / problem.service.js เพราะทั้งสองไฟล์มีแค่ sid ในมือ
exports.findUserIdByStudentId = async (studentId) => {
  const student = await prisma.student.findUnique({
    where: { id: Number(studentId) },
    select: { user_id: true },
  });

  return student ? student.user_id : null;
};

// ---------- ฝั่งอาจารย์ (แจ้งเตือนตอนมีนักศึกษาแจ้งปัญหามาใหม่) ----------
// เหมือนชุดฟังก์ชันของนักศึกษาด้านบนทุกอย่าง แค่ join ผ่าน user -> lecturer
// แทน user -> student

exports.findByLecturerId = async (lecturerId) => {
  return await prisma.notification.findMany({
    where: { user: { lecturer: { id: Number(lecturerId) } } },
    include: notificationInclude,
    orderBy: { created_at: "desc" },
    take: 30,
  });
};

exports.countUnreadByLecturerId = async (lecturerId) => {
  return await prisma.notification.count({
    where: {
      user: { lecturer: { id: Number(lecturerId) } },
      is_read: false,
    },
  });
};

exports.markAllAsReadByLecturerId = async (lecturerId) => {
  return await prisma.notification.updateMany({
    where: {
      user: { lecturer: { id: Number(lecturerId) } },
      is_read: false,
    },
    data: { is_read: true },
  });
};

exports.findUserIdByLecturerId = async (lecturerId) => {
  const lecturer = await prisma.lecturer.findUnique({
    where: { id: Number(lecturerId) },
    select: { user_id: true },
  });

  return lecturer ? lecturer.user_id : null;
};

// ---------- ปุ่ม "ล้างทั้งหมด" (ลบจริง ไม่ใช่แค่มาร์คว่าอ่านแล้ว) ----------

exports.deleteAllByStudentId = async (studentId) => {
  return await prisma.notification.deleteMany({
    where: { user: { student: { id: Number(studentId) } } },
  });
};

exports.deleteAllByLecturerId = async (lecturerId) => {
  return await prisma.notification.deleteMany({
    where: { user: { lecturer: { id: Number(lecturerId) } } },
  });
};