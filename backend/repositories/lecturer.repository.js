const prisma = require("../src/connection");

exports.findAll = () => {
  return prisma.lecturer.findMany({ include: { user: true } });
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
