const roleRepository = require("../repositories/role.repository");

exports.getAllRoles = async () => {

    return await roleRepository.findAll();

};

exports.getRole = async (id) => {

    return await roleRepository.findById(id);

};

exports.createRole = async (data) => {

    return await roleRepository.create(data);

};