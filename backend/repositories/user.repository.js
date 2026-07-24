const prisma = require("../src/connection");

// ใช้กับ /check-email — ไม่ต้องดึงทั้งแถว แค่รู้ว่ามีอยู่ไหมพอ
exports.findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { user_email: email },
    select: { id: true },
  });
};

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