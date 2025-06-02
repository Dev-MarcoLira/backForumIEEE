const categoryService = require("../services/categoryService");

async function handleCreateCategory(req, res) {
    
    const { description } = req.body;
    const resultado = categoryService.createCategory(description);
    
    if(resultado.error) {
        return res.status(400).json({ error: resultado.error });
    }
    
    return res.status(201).json(resultado);
   
}

async function handleReadAllCategories(req, res) {
    try {
        const categories = categoryService.readAllCategorys();
        res.status(200).json({ categories });
    } catch (e) {
        console.error("Erro ao listar categorys:", e.message);
        res.status(500).json({ error: "Erro interno ao listar categorys." });
    }
}

async function handleReadCategoryById(req, res) {
    try {
        const { id } = req.params;
        const category = categoryService.readCategoryById(id);
        res.status(200).json({ category });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

async function handleUpdateCategory(req, res) {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const resultado = categoryService.updateCategory(id, description);
        res.status(200).json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

async function handleDeleteCategory(req, res) {
    try {
        const { id } = req.params;
        const resultado = await categoryService.deleteCategory(id);
        res.status(200).json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

module.exports = {
    handleCreateCategory,
    handleReadAllCategories,
    handleReadCategoryById,
    handleUpdateCategory,
    handleDeleteCategory,
};