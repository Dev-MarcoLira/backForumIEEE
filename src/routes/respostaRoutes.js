const router = require("express").Router();
const respostaController = require("../controller/respostaController");
const authMiddleware = require("../middleware/auth"); 
router.post("/api/respostas", authMiddleware, respostaController.handleCreateResposta)
router.get("/api/respostas/duvida/:duvida_id", respostaController.handleReadRespostasByDuvidaId)
router.patch("/api/respostas/:id", authMiddleware, respostaController.handleUpdateResposta)
router.delete("/api/respostas/:id", authMiddleware, respostaController.handleDeleteResposta)
// (Opcional) Ler uma resposta específica por seu ID (se necessário)
router.get("/api/respostas/:id", respostaController.handleReadRespostaById);

module.exports = router;