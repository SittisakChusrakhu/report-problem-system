const prisma = require("../src/connection");

exports.findAll = () => {
    return prisma.roles.findMany();
};

exports.findById = (id) => {
    return prisma.roles.findUnique({
        where: {
            id: Number(id)
        }
    });
};

exports.create = (data) => {
    return prisma.roles.create({
        data
    });
};