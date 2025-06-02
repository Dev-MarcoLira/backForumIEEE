const respostaService = require("../services/respostaService");

async function handleCreateResposta(req, res) {
    try {
        const { descricao, duvida_id } = req.body;
        // Assumindo que o authMiddleware anexa o ID do usuário em req.id
        const usuario_id = req.id; 

        // A validação de campos obrigatórios agora é mais robusta no service
        const resultado = await respostaService.createResposta({ descricao, duvida_id, usuario_id });
        return res.status(201).json(resultado);
    } catch (error) {
        if (error.message.includes("obrigatórios") || error.message.includes("Dúvida não encontrada")) {
            return res.status(400).json({ erro: error.message });
        }
        console.error("Erro ao criar resposta:", error);
        return res.status(500).json({ erro: "Erro interno ao criar resposta." });
    }
}

async function handleReadRespostasByDuvidaId(req, res) {
    try {
        const { duvida_id } = req.params;
        // Passa os query params (req.query) para filtros de paginação e ordenação
        const resultadoPaginado = await respostaService.readRespostasByDuvidaId(duvida_id, req.query);
        return res.status(200).json(resultadoPaginado);
    } catch (error) {
        if (error.message.includes("ID da dúvida é obrigatório")) {
            return res.status(400).json({ erro: error.message });
        }
        console.error("Erro ao buscar respostas:", error);
        return res.status(500).json({ erro: "Erro interno ao buscar respostas." });
    }
}

async function handleUpdateResposta(req, res) {
    try {
        const { id: idResposta } = req.params;
        const { descricao } = req.body;
        const usuarioAutenticadoId = req.id; // ID do usuário vindo do authMiddleware

        const resultado = await respostaService.updateResposta(idResposta, usuarioAutenticadoId, { descricao });
        return res.status(200).json(resultado);
    } catch (error) {
        if (error.message === "Resposta não encontrada.") {
            return res.status(404).json({ erro: error.message });
        }
        if (error.message === "Usuário não autorizado a editar esta resposta.") {
            return res.status(403).json({ erro: error.message }); // Forbidden
        }
        if (error.message.includes("obrigatória") || error.message.includes("Nenhuma alteração detectada")) {
            return res.status(400).json({ erro: error.message });
        }
        console.error("Erro ao atualizar resposta:", error);
        return res.status(500).json({ erro: "Erro interno ao atualizar resposta." });
    }
}

async function handleDeleteResposta(req, res) {
    try {
        const { id: idResposta } = req.params;
        const usuarioAutenticadoId = req.id; // ID do usuário vindo do authMiddleware

        const resultado = await respostaService.deleteResposta(idResposta, usuarioAutenticadoId);
        return res.status(200).json(resultado); // Poderia ser 204 No Content se não retornar corpo
    } catch (error) {
        if (error.message === "Resposta não encontrada.") {
            return res.status(404).json({ erro: error.message });
        }
        if (error.message === "Usuário não autorizado a deletar esta resposta.") {
            return res.status(403).json({ erro: error.message }); // Forbidden
        }
        if (error.message.includes("Falha ao deletar")) { // Erro mais genérico do service
            return res.status(500).json({ erro: error.message });
        }
        console.error("Erro ao deletar resposta:", error);
        return res.status(500).json({ erro: "Erro interno ao deletar resposta." });
    }
}

// (Opcional) Controller para buscar uma resposta por ID
async function handleReadRespostaById(req, res) {
    try {
        const { id } = req.params;
        const resposta = await respostaService.readRespostaById(id);
        return res.status(200).json(resposta);
    } catch (error) {
        if (error.message === "Resposta não encontrada.") {
            return res.status(404).json({ erro: error.message });
        }
        console.error("Erro ao buscar resposta por ID:", error);
        return res.status(500).json({ erro: "Erro interno ao buscar resposta." });
    }
}

module.exports = {
    handleCreateResposta,
    handleReadRespostasByDuvidaId,
    handleUpdateResposta,
    handleDeleteResposta,
   handleReadRespostaById, // Exporte se for usar
};