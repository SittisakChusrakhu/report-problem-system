const prisma = require("../src/connection");

exports.findAll = () => {
  return prisma.lecturer.findMany({ include: { user: true } });
};

// ใช้เช็คสิทธิ์ก่อนแก้ไข (ต้องรู้ user_id ของแถวนี้ ว่าตรงกับคนที่ login อยู่ไหม)
exports.findById = (id) => {
  return prisma.lecturer.findUnique({ where: { id: Number(id) } });
};

exports.findByIds = (ids) => {
  return prisma.lecturer.findMany({
    where: { id: { in: ids } },
    include: { user: true },
  });
};

exports.create = (data) => {
  return prisma.lecturer.create({
    data,
    include: { user: true },
  });
};

exports.update = (id, data, userData) => {
  return prisma.lecturer.update({
    where: { id: Number(id) },
    data: {
      ...data,
      user: userData ? { update: userData } : undefined,
    },
    include: { user: true },
  });
};

exports.delete = (id) => {
  return prisma.lecturer.delete({ where: { id: Number(id) } });
};

// Lecturer.user has onDelete: Cascade (same as Student), so deleting the
// User alone would remove the Lecturer row too — but deleting the Lecturer
// alone (the old behavior) left an orphaned User account with no profile,
// which broke login (role_id=2 with nothing for authRepository.findLecturerProfile
// to find). Delete both explicitly, same pattern as student.repository.js.
exports.deleteWithUser = (lid, uid) => {
  return prisma.$transaction([
    prisma.lecturer.delete({ where: { id: Number(lid) } }),
    prisma.user.delete({ where: { id: Number(uid) } }),
  ]);
};