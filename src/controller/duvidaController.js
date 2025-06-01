const duvidaService = require("../services/duvidaService"); // Ajuste o caminho se necessário

async function handleCreateDuvida(req, res) {
    try {
        const { descricao, categoria_id } = req.body;
        const usuario_id = req.id; // ID do usuário vindo do middleware de autenticação

        // O service já trata a obrigatoriedade da descrição e usuario_id
        const resultado = await duvidaService.createDuvida(descricao, usuario_id, categoria_id);
        // O service retorna "Dúvida criada com sucesso" ou um objeto. Padronizar o retorno do service seria bom.
        // Assumindo que queremos retornar uma mensagem e talvez o ID da nova dúvida:
        if (typeof resultado === 'string') { // Se o service retornar apenas a mensagem
            res.status(201).json({ message: resultado });
        } else { // Se o service retornar um objeto (ex: com a nova dúvida)
            res.status(201).json(resultado);
        }
    } catch (e) {
        // Tratar erros específicos do service, se necessário
        if (e.message.includes("obrigatórios") || e.message.includes("Categoria não encontrada")) {
            return res.status(400).json({ erro: e.message });
        }
        console.error("Erro em handleCreateDuvida:", e);
        res.status(500).json({ erro: e.message });
    }
}

async function handleReadAllDuvidas(req, res) {
    try {
        // Passa todos os query params (req.query) como o objeto 'filtros' para o service.
        // O service já tem valores padrão para page, limit, sortBy, order.
        // Outros query params como categoria_id, usuario_id, resolvida, termoDeBusca
        // devem ser tratados dentro da função readDuvidas no service, inclusive na countQueryBuilder.
        const resultadoPaginado = await duvidaService.readDuvidas(req.query);
        res.status(200).json(resultadoPaginado);
    } catch (e) {
        console.error("Erro em handleReadAllDuvidas:", e);
        res.status(500).json({ erro: "Erro ao buscar dívidas." });
    }
}

async function handleReadDuvidaById(req, res) {
    try {
        const { id } = req.params;
        // opções para ordenação de respostas podem vir da query string
        // Ex: /api/duvidas/ID_DA_DUVIDA?sortByRespostas=curtidas&orderRespostas=DESC
        const opcoesRespostas = {
            sortBy: req.query.sortByRespostas, // O service espera 'sortBy' e 'order'
            order: req.query.orderRespostas,
        };
        const duvida = await duvidaService.readDuvidaById(id, opcoesRespostas);
        res.status(200).json(duvida);
    } catch (e) {
        if (e.message === "Dúvida não encontrada.") {
            return res.status(404).json({ erro: e.message });
        }
        console.error("Erro em handleReadDuvidaById:", e);
        res.status(500).json({ erro: "Erro ao buscar a dúvida." });
    }
}

async function handleUpdateDuvida(req, res) {
    try {
        const { id: duvidaId } = req.params;
        const usuarioAutenticadoId = req.id; // ID do usuário autenticado
        const dadosUpdate = req.body; // { descricao, categoria_id, resolvida }

        const resultado = await duvidaService.updateDuvida(duvidaId, usuarioAutenticadoId, dadosUpdate);
        res.status(200).json(resultado);
    } catch (e) {
        if (e.message.includes("não encontrada") || 
            e.message.includes("Nenhum dado válido") ||
            e.message.includes("Categoria fornecida para atualização não encontrada")) {
            return res.status(400).json({ erro: e.message });
        }
        if (e.message.includes("não autorizado")) {
            return res.status(403).json({ erro: e.message });
        }
        console.error("Erro em handleUpdateDuvida:", e);
        res.status(500).json({ erro: e.message });
    }
}

async function handleDeleteDuvida(req, res) {
    try {
        const { id: duvidaId } = req.params;
        const usuarioAutenticadoId = req.id;

        const resultado = await duvidaService.deleteDuvida(duvidaId, usuarioAutenticadoId);
        res.status(200).json(resultado); // Ou status 204 se preferir não retornar corpo
    } catch (e) {
        if (e.message.includes("não encontrada")) {
            return res.status(404).json({ erro: e.message });
        }
        if (e.message.includes("não autorizado")) {
            return res.status(403).json({ erro: e.message });
        }
        console.error("Erro em handleDeleteDuvida:", e);
        res.status(500).json({ erro: e.message });
    }
}

module.exports = {
    handleCreateDuvida,
    handleReadAllDuvidas,
    handleReadDuvidaById,
    handleUpdateDuvida,
    handleDeleteDuvida,
};
