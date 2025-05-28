const router = require('express').Router();
const categoriaController = require("../controller/categoriacontrolle");
const authMiddleware = require("../middleware/auth"); // Seu middleware de autenticação
router.post("/api/categorias", authMiddleware, categoriaController.handleCreateCategoria);
router.get("/api/categorias", categoriaController.handleReadAllCategorias);
router.get("/api/categorias/:id", categoriaController.handleReadCategoriaById);
router.patch("/api/categorias/:id", authMiddleware, categoriaController.handleUpdateCategoria); 
router.delete("/api/categorias/:id", authMiddleware, categoriaController.handleDeleteCategoria);

module.exports = router;