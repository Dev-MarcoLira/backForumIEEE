// src/routes/userRoutes.js
const router = require('express').Router();
const userController = require("../controller/userController");
const authMiddleware = require("../middleware/auth");

// Rotas públicas
router.post("/api/usuarios/login", userController.login);      
router.post("/api/usuarios", userController.createUser);        
router.get("/api/usuarios/:id/perfil", userController.readUser); 
router.get("/api/conta", authMiddleware, userController.handleObterPropriaConta); 
router.delete("/api/conta", authMiddleware, userController.deleteUser);     
router.patch("/api/conta", authMiddleware, userController.updateUser);      

module.exports = router;
