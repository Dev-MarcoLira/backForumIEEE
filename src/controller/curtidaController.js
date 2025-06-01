const curtidaService = require("../services/curtidaService"); // Certifique-se que o caminho está correto

async function handleLikeDuvida(req, res) {
    try {
        const usuario_id = req.id; // ID do usuário autenticado (do authMiddleware)
        const { duvida_id } = req.params;

        const resultado = await curtidaService.likeDuvida(usuario_id, duvida_id);
        res.status(200).json(resultado); // 200 OK ou 201 Created se a curtida foi realmente nova
    } catch (error) {
        if (error.message.includes("obrigatórios") || error.message === "Dúvida não encontrada.") {
            return res.status(400).json({ erro: error.message });
        }
        console.error("Erro ao curtir dúvida:", error);
        res.status(500).json({ erro: "Erro interno ao curtir dúvida." });
    }
}

async function handleUnlikeDuvida(req, res) {
    try {
        const usuario_id = req.id;
        const { duvida_id } = req.params;

        const resultado = await curtidaService.unlikeDuvida(usuario_id, duvida_id);
        res.status(200).json(resultado);
    } catch (error) {
        if (error.message.includes("obrigatórios") || error.message === "Curtida não encontrada ou já removida.") {
            return res.status(404).json({ erro: error.message });
        }
        console.error("Erro ao descurtir dúvida:", error);
        res.status(500).json({ erro: "Erro interno ao descurtir dúvida." });
    }
}

async function handleLikeResposta(req, res) {
    try {
        const usuario_id = req.id;
        const { resposta_id } = req.params;

        const resultado = await curtidaService.likeResposta(usuario_id, resposta_id);
        res.status(200).json(resultado); // 200 OK ou 201 Created
    } catch (error) {
        if (error.message.includes("obrigatórios") || error.message === "Resposta não encontrada.") {
            return res.status(400).json({ erro: error.message });
        }
        console.error("Erro ao curtir resposta:", error);
        res.status(500).json({ erro: "Erro interno ao curtir resposta." });
    }
}

async function handleUnlikeResposta(req, res) {
    try {
        const usuario_id = req.id;
        const { resposta_id } = req.params;

        const resultado = await curtidaService.unlikeResposta(usuario_id, resposta_id);
        res.status(200).json(resultado);
    } catch (error) {
        if (error.message.includes("obrigatórios") || error.message === "Curtida não encontrada ou já removida.") {
            return res.status(404).json({ erro: error.message });
        }
        console.error("Erro ao descurtir resposta:", error);
        res.status(500).json({ erro: "Erro interno ao descurtir resposta." });
    }
}

async function handleGetLikedItemsByUser(req, res) {
    try {
        const usuario_id = req.id;
        const resultado = await curtidaService.getLikedItemsByUser(usuario_id);
        res.status(200).json(resultado);
    } catch (error) {
        if (error.message.includes("obrigatório")) {
            return res.status(400).json({ erro: error.message });
        }
        console.error("Erro ao buscar itens curtidos:", error);
        res.status(500).json({ erro: "Erro interno ao buscar itens curtidos." });
    }
}

module.exports = {
    handleLikeDuvida,
    handleUnlikeDuvida,
    handleLikeResposta,
    handleUnlikeResposta,
    handleGetLikedItemsByUser,
};