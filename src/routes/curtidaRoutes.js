const router = require("express").Router();
const curtidaController = require("../controller/curtidaController");
const authMiddleware = require("../middleware/auth"); // Certifique-se que o caminho está correto

router.post("/api/curtidas/duvida/:duvida_id", authMiddleware, curtidaController.handleLikeDuvida);
router.delete("/api/curtidas/duvida/:duvida_id", authMiddleware, curtidaController.handleUnlikeDuvida);
router.post("/api/curtidas/resposta/:resposta_id", authMiddleware, curtidaController.handleLikeResposta);
router.delete("/api/curtidas/resposta/:resposta_id", authMiddleware, curtidaController.handleUnlikeResposta);
router.get("/api/conta/curtidas", authMiddleware, curtidaController.handleGetLikedItemsByUser);

module.exports = router;