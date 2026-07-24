const prisma = require("../src/connection");

exports.findAll = () => {
  return prisma.student.findMany({ include: { user: true } });
};

// ใช้เช็คสิทธิ์ก่อนแก้ไข (ต้องรู้ user_id ของแถวนี้ ว่าตรงกับคนที่ login อยู่ไหม)
exports.findById = (id) => {
  return prisma.student.findUnique({ where: { id: Number(id) } });
};

exports.findByIds = (ids) => {
  return prisma.student.findMany({
    where: { id: { in: ids } },
    include: { user: true },
  });
};

exports.create = (data) => {
  return prisma.student.create({
    data,
    include: { user: true },
  });
};

exports.update = (id, data, userData) => {
  return prisma.student.update({
    where: { id: Number(id) },
    data: {
      ...data,
      user: userData ? { update: userData } : undefined,
    },
    include: { user: true },
  });
};

// Student.user has onDelete: Cascade, so deleting the User alone would remove
// the Student row too. We delete the Student explicitly first (in case it's
// ever detached from that cascade) then the User, in one transaction.
exports.deleteWithUser = (sid, uid) => {
  return prisma.$transaction([
    prisma.student.delete({ where: { id: Number(sid) } }),
    prisma.user.delete({ where: { id: Number(uid) } }),
  ]);
};