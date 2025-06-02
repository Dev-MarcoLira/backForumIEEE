const categoriaService = require("../services/categoriaservice");

async function handleCreateCategoria(req, res) {
    try {
        const { tipo } = req.body;
        const resultado = await categoriaService.createCategoria(tipo);
        res.status(201).json(resultado);
    } catch (e) {
        if (e.message.includes("obrigatório") || e.message.includes("já existe")) {
            return res.status(400).json({ erro: e.message });
        }
        console.error("Erro ao criar categoria:", e);
        res.status(500).json({ erro: "Erro interno ao criar categoria." });
    }
}

async function handleReadAllCategorias(req, res) {
    try {
        const categorias = await categoriaService.readAllCategorias();
        res.status(200).json({ categorias });
    } catch (e) {
        console.error("Erro ao listar categorias:", e);
        res.status(500).json({ erro: "Erro interno ao listar categorias." });
    }
}

async function handleReadCategoriaById(req, res) {
    try {
        const { id } = req.params;
        const categoria = await categoriaService.readCategoriaById(id);
        res.status(200).json({ categoria });
    } catch (e) {
        if (e.message.includes("obrigatório") || e.message.includes("não encontrada")) {
            return res.status(404).json({ erro: e.message });
        }
        console.error("Erro ao buscar categoria por ID:", e);
        res.status(500).json({ erro: "Erro interno ao buscar categoria." });
    }
}

async function handleUpdateCategoria(req, res) {
    try {
        const { id } = req.params;
        const { tipo } = req.body;
        const resultado = await categoriaService.updateCategoria(id, tipo);
        res.status(200).json(resultado);
    } catch (e) {
        if (e.message.includes("obrigatório") || e.message.includes("não encontrada") || e.message.includes("já existe outra categoria com o nome")) {
            return res.status(400).json({ erro: e.message });
        }
        console.error("Erro ao atualizar categoria:", e);
        res.status(500).json({ erro: "Erro interno ao atualizar categoria." });
    }
}

async function handleDeleteCategoria(req, res) {
    try {
        const { id } = req.params;
        const resultado = await categoriaService.deleteCategoria(id);
        res.status(200).json(resultado); // Ou 204 No Content
    } catch (e) {
        if (e.message.includes("obrigatório") || e.message.includes("não encontrada")) {
            return res.status(404).json({ erro: e.message });
        }
        if (e.message.includes("não pode ser deletada pois está associada")) {
            return res.status(409).json({ erro: e.message }); // 409 Conflict
        }
        console.error("Erro ao deletar categoria:", e);
        res.status(500).json({ erro: "Erro interno ao deletar categoria." });
    }
}

module.exports = {
    handleCreateCategoria,
    handleReadAllCategorias,
    handleReadCategoriaById,
    handleUpdateCategoria,
    handleDeleteCategoria,
};