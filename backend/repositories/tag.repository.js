const prisma = require("../src/connection");

exports.findAll = () => {
  return prisma.tag.findMany();
};

exports.create = (name) => {
  return prisma.tag.create({ data: { name } });
};

exports.delete = (id) => {
  return prisma.tag.delete({ where: { id: Number(id) } });
};
