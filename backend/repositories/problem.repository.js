const prisma = require("../src/connection");

exports.findAll = () => {
  return prisma.problem.findMany({ include: { tags: true } });
};

exports.findByLecturerId = (lecturerId) => {
  return prisma.problem.findMany({
    where: { lecturerId: Number(lecturerId) },
    include: { tags: true },
  });
};

exports.findByStudentId = (sid) => {
  return prisma.problem.findMany({
    where: { sid: Number(sid) },
    include: { tags: true },
  });
};

exports.findById = (id) => {
  return prisma.problem.findUnique({
    where: { id: Number(id) },
    include: { tags: true },
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
