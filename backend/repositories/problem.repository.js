const prisma = require("../src/connection");

// ใช้กับ endpoint "รายการ" (list) เท่านั้น — ตัด pro_images (base64 เต็มรูป,
// เก็บเป็น LongText) ออก เพราะหน้าลิสต์ไม่เคยโชว์รูป แต่ endpoint นี้ถูก poll
// ทุก 15-30 วิ (HomeOverview, lect_graph, stu_listreport, lect_read) ถ้าดึง
// รูปมาด้วยทุกครั้งจะโหลดข้อมูลซ้ำๆ โดยไม่จำเป็นและทำให้ backend/DB หนักขึ้น
// เรื่อยๆ ตามจำนวนปัญหาที่เพิ่มขึ้น ต้องการรูปเมื่อไหร่ให้ไปเรียก findById แทน
const problemListSelect = {
  id: true,
  pro_title: true,
  pro_type: true,
  pro_desc: true,
  status: true,
  is_read: true,
  create_at: true,
  update_at: true,
  sid: true,
  lecturerId: true,
  tags: true,
};

exports.findAll = () => {
  return prisma.problem.findMany({ select: problemListSelect });
};

exports.findByLecturerId = (lecturerId) => {
  return prisma.problem.findMany({
    where: { lecturerId: Number(lecturerId) },
    select: problemListSelect,
  });
};

exports.findByStudentId = (sid) => {
  return prisma.problem.findMany({
    where: { sid: Number(sid) },
    select: problemListSelect,
  });
};

exports.findById = (id) => {
  return prisma.problem.findUnique({
    where: { id: Number(id) },
    include: { tags: true, student: true, lecturer: true },
  });
};

exports.create = (data) => {
  return prisma.problem.create({
    data,
    include: { tags: true },
  });
};

exports.findStudentWithUser = (id) => {
  return prisma.student.findUnique({
    where: { id: Number(id) },
    include: { user: true },
  });
};

exports.findLecturerWithUser = (id) => {
  return prisma.lecturer.findUnique({
    where: { id: Number(id) },
    include: { user: true },
  });
};

exports.update = (id, data) => {
  return prisma.problem.update({
    where: { id: Number(id) },
    data,
  });
};

exports.updateStatus = (id, status) => {
  return prisma.problem.update({
    where: { id: Number(id) },
    data: { status },
  });
};

exports.delete = (id) => {
  return prisma.problem.delete({ where: { id: Number(id) } });
};