const roleService = require("../services/role.service");

exports.getAllRoles = async (req, res) => {

    try {

        const result = await roleService.getAllRoles();

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.getRole = async (req, res) => {

    try {

        const result = await roleService.getRole(req.params.id);

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.createRole = async (req, res) => {

    try {

        const result = await roleService.createRole(req.body);

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};