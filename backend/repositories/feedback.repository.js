const prisma = require("../src/connection");

exports.create = (data) => {
  return prisma.feedback.create({ data });
};

exports.findByProblemId = (pro_id) => {
  return prisma.feedback.findMany({
    where: { pro_id: Number(pro_id) },
    orderBy: { create_at: "asc" },
    // ชื่ออาจารย์ไม่ได้อยู่ที่ตาราง Lecturer ตรงๆ อยู่ที่ User.user_name
    // (Lecturer เชื่อมกับ User แบบ 1-to-1) — join สองชั้นเพื่อเอาชื่อมาด้วย
    // ให้ฝั่งนักศึกษาเห็นว่าใครตอบกลับ ใช้ select เจาะจงฟิลด์แทน include
    // เฉยๆ เพราะ Lecturer.avatar เป็น LongText (รูปเก็บเป็น base64) ถ้าดึง
    // มาทั้ง object จะหนักโดยไม่จำเป็น เหมือนบทเรียนจาก pro_images ก่อนหน้านี้
    include: {
      lecturer: {
        select: {
          id: true,
          user: {
            select: { user_name: true },
          },
        },
      },
    },
  });
};