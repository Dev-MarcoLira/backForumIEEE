require('dotenv').config();
const database = require("../database/exports"); 
const v4 = require('../utils/uuid');


async function createCategory(tipo) {
    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
        throw new Error("O nome (tipo) da category é obrigatório e deve ser um texto.");
    }

    const tipoFormatado = tipo.trim();
    const categoryExistente = await database("categories").where({ tipo: tipoFormatado }).first();
    if (categoryExistente) {
        throw new Error(`A category "${tipoFormatado}" já existe.`);
    }

    const novaCategory = {
        id: v4(),
        tipo: tipoFormatado,
    };

    await database("categories").insert(novaCategory);
    return { message: "Category criada com sucesso.", category: novaCategory };
}

async function readAllCategories() {
    const categorys = await database("categories").select("id", "tipo", "criado_em", "modificado_em").orderBy("tipo", "asc");
    return categorys; // Retorna array vazio se não houver categorys
}

async function readCategoryById(id) {
    if (!id) {
        throw new Error("O ID da category é obrigatório.");
    }
    const category = await database("categories").select("id", "tipo", "criado_em", "modificado_em").where({ id }).first();
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

    const categoryExistente = await database("categories").where({ id }).first();
    if (!categoryExistente) {
        throw new Error("Category não encontrada para atualização.");
    }

    const tipoFormatado = tipo.trim();
    if (tipoFormatado !== categoryExistente.tipo) {
        const outraCategoryComMesmoTipo = await database("categories")
            .where({ tipo: tipoFormatado })
            .whereNot({ id })
            .first();
        if (outraCategoryComMesmoTipo) {
            throw new Error(`Já existe outra category com o nome "${tipoFormatado}".`);
        }
    } else {
        // Se o tipo não mudou, não há necessidade de atualizar, a menos que você tenha outros campos.
        // Poderia retornar uma mensagem informando que não houve alteração.
        // Por ora, permitiremos a "atualização" para o mesmo nome, que apenas atualizará o modificado_em.
    }
    

    const dadosAtualizacao = {
        tipo: tipoFormatado,
        modificado_em: database.fn.now(),
    };

    await database("categories").where({ id }).update(dadosAtualizacao);
    
    // Retornar a category atualizada
    const categoryAtualizada = await database("categories").select("id", "tipo", "criado_em", "modificado_em").where({ id }).first();
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

    const duvidasComEstaCategory = await database("questions").where({ category_id: id }).first();
    if (duvidasComEstaCategory) {
        throw new Error("Esta category não pode ser deletada pois está associada a uma ou mais dúvidas.");
    }

    await database("categories").where({ id }).del();
    return { message: "Category deletada com sucesso." };
}

module.exports = {
    createCategory,
    readAllCategories,
    readCategoryById,
    updateCategory,
    deleteCategory,
};