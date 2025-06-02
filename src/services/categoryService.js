const database = require("../database/exports"); 
const Category = require("../models/Category"); // Supondo que você tenha um modelo Category definido
const Question = require("../models/Question"); // Supondo que você tenha um modelo Question definido

async function createCategory(tipo) {
    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
        throw new Error("O nome (tipo) da category é obrigatório e deve ser um texto.");
    }

    try{
        const newCategory = {
            description: tipo
        }
        Category.createCategory(newCategory);
        return { message: "Category criada com sucesso.", category: newCategory };
    }catch(err){
        return { error: "Erro ao criar category: " + err.message };
    }

}

async function readAllCategories() {
    const categories = Category.findAll();
    return categories; // Retorna array vazio se não houver categorys
}

async function readCategoryById(id) {
    if (!id) 
        throw new Error("O ID da category é obrigatório.");
    
    const category = Category.findById(id);
    if (!category) {
        throw new Error("Category não encontrada.");
    }
    return category;
}

async function updateCategory(id, tipo) {
    if (!id) {
        throw new Error("O ID da category é obrigatório para atualização.");
    }
    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
        throw new Error("O novo nome (tipo) da category é obrigatório.");
    }

    const categoryExistente = Category.findById(id);
    if (!categoryExistente) {
        throw new Error("Category não encontrada para atualização.");
    }

    Category.updateCategory(id, tipo);

    const categoryAtualizada = Category.findById(id);

    return { message: "Category atualizada com sucesso.", category: categoryAtualizada };
}

async function deleteCategory(id) {
    if (!id) {
        throw new Error("O ID da category é obrigatório para deleção.");
    }
    const categoryExistente = await database("categories").where({ id }).first();
    if (!categoryExistente) {
        throw new Error("Category não encontrada para deleção.");
    }

    const duvidasComEstaCategory = Question.findByCategoryId(id);
    if (duvidasComEstaCategory) {
        throw new Error("Esta category não pode ser deletada pois está associada a uma ou mais dúvidas.");
    }

    Category.deleteCategory(id);
    return { message: "Category deletada com sucesso." };
}

module.exports = {
    createCategory,
    readAllCategories,
    readCategoryById,
    updateCategory,
    deleteCategory,
};