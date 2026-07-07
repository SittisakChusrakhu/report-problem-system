const prisma = require("../src/connection");

exports.getAllUsers = async () => {
  return await prisma.user.findMany();
};

exports.createUser = async (data) => {
  return await prisma.user.create({
    data,
  });
};

exports.updateUser = async (id, data) => {
  return await prisma.user.update({
    where: {
      id: Number(id),
    },
    data,
  });
};

exports.deleteUser = async (id) => {
  return await prisma.user.delete({
    where: {
      id: Number(id),
    },
  });
};