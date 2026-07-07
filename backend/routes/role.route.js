const router = require("express").Router();

const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const {
    getAllRoles,
    getRole,
    createRole
} = require("../controllers/role.controller");

router.use(verifyToken);

router.get("/", getAllRoles);

router.get("/:id", getRole);

router.post("/", requireRole(3), createRole);

module.exports = router;