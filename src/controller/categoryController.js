const categoryService = require("../services/categoryService");

async function handleCreateCategory(req, res) {
    try {
        const { tipo } = req.body;
        const resultado = await categoryService.createCategory(tipo);
        res.status(201).json(resultado);
    } catch (e) {
        if (e.message.includes("obrigatório") || e.message.includes("já existe")) {
            return res.status(400).json({ erro: e.message });
        }
        console.error("Erro ao criar category:", e);
        res.status(500).json({ erro: "Erro interno ao criar category." });
    }
}

async function handleReadAllCategories(req, res) {
    try {
        const categorys = await categoryService.readAllCategorys();
        res.status(200).json({ categorys });
    } catch (e) {
        console.error("Erro ao listar categorys:", e);
        res.status(500).json({ erro: "Erro interno ao listar categorys." });
    }
}

async function handleReadCategoryById(req, res) {
    try {
        const { id } = req.params;
        const category = await categoryService.readCategoryById(id);
        res.status(200).json({ category });
    } catch (e) {
        if (e.message.includes("obrigatório") || e.message.includes("não encontrada")) {
            return res.status(404).json({ erro: e.message });
        }
        console.error("Erro ao buscar category por ID:", e);
        res.status(500).json({ erro: "Erro interno ao buscar category." });
    }
}

async function handleUpdateCategory(req, res) {
    try {
        const { id } = req.params;
        const { tipo } = req.body;
        const resultado = await categoryService.updateCategory(id, tipo);
        res.status(200).json(resultado);
    } catch (e) {
        if (e.message.includes("obrigatório") || e.message.includes("não encontrada") || e.message.includes("já existe outra category com o nome")) {
            return res.status(400).json({ erro: e.message });
        }
        console.error("Erro ao atualizar category:", e);
        res.status(500).json({ erro: "Erro interno ao atualizar category." });
    }
}

async function handleDeleteCategory(req, res) {
    try {
        const { id } = req.params;
        const resultado = await categoryService.deleteCategory(id);
        res.status(200).json(resultado); // Ou 204 No Content
    } catch (e) {
        if (e.message.includes("obrigatório") || e.message.includes("não encontrada")) {
            return res.status(404).json({ erro: e.message });
        }
        if (e.message.includes("não pode ser deletada pois está associada")) {
            return res.status(409).json({ erro: e.message }); // 409 Conflict
        }
        console.error("Erro ao deletar category:", e);
        res.status(500).json({ erro: "Erro interno ao deletar category." });
    }
}

module.exports = {
    handleCreateCategory,
    handleReadAllCategories,
    handleReadCategoryById,
    handleUpdateCategory,
    handleDeleteCategory,
};