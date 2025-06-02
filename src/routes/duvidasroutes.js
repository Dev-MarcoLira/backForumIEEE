
const router = require('express').Router()
const duvidaController = require("../controller/duvidaController")
const authMiddleware = require("../middleware/auth")
router.post("/api/duvidas", authMiddleware, duvidaController.handleCreateDuvida)
router.get("/api/duvidas", duvidaController.handleReadAllDuvidas)
router.get("/api/duvidas/:id", duvidaController.handleReadDuvidaById)
router.patch("/api/duvidas/:id", authMiddleware, duvidaController.handleUpdateDuvida)
router.delete("/api/duvidas/:id", authMiddleware, duvidaController.handleDeleteDuvida)

module.exports = router;