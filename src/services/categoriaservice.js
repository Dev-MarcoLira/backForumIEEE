require('dotenv').config();
const database = require("../database/exports"); 
const crypto = require("crypto");

async function createCategoria(tipo) {
    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
        throw new Error("O nome (tipo) da categoria é obrigatório e deve ser um texto.");
    }

    const tipoFormatado = tipo.trim();
    const categoriaExistente = await database("categorias").where({ tipo: tipoFormatado }).first();
    if (categoriaExistente) {
        throw new Error(`A categoria "${tipoFormatado}" já existe.`);
    }

    const novaCategoria = {
        id: crypto.randomUUID(),
        tipo: tipoFormatado,
    };

    await database("categorias").insert(novaCategoria);
    return { message: "Categoria criada com sucesso.", categoria: novaCategoria };
}

async function readAllCategorias() {
    const categorias = await database("categorias").select("id", "tipo", "criado_em", "modificado_em").orderBy("tipo", "asc");
    return categorias; // Retorna array vazio se não houver categorias
}

async function readCategoriaById(id) {
    if (!id) {
        throw new Error("O ID da categoria é obrigatório.");
    }
    const categoria = await database("categorias").select("id", "tipo", "criado_em", "modificado_em").where({ id }).first();
    if (!categoria) {
        throw new Error("Categoria não encontrada.");
    }
    return categoria;
}

async function updateCategoria(id, tipo) {
    if (!id) {
        throw new Error("O ID da categoria é obrigatório para atualização.");
    }
    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
        throw new Error("O novo nome (tipo) da categoria é obrigatório.");
    }

    const categoriaExistente = await database("categorias").where({ id }).first();
    if (!categoriaExistente) {
        throw new Error("Categoria não encontrada para atualização.");
    }

    const tipoFormatado = tipo.trim();
    if (tipoFormatado !== categoriaExistente.tipo) {
        const outraCategoriaComMesmoTipo = await database("categorias")
            .where({ tipo: tipoFormatado })
            .whereNot({ id })
            .first();
        if (outraCategoriaComMesmoTipo) {
            throw new Error(`Já existe outra categoria com o nome "${tipoFormatado}".`);
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

    await database("categorias").where({ id }).update(dadosAtualizacao);
    
    // Retornar a categoria atualizada
    const categoriaAtualizada = await database("categorias").select("id", "tipo", "criado_em", "modificado_em").where({ id }).first();
    return { message: "Categoria atualizada com sucesso.", categoria: categoriaAtualizada };
}

async function deleteCategoria(id) {
    if (!id) {
        throw new Error("O ID da categoria é obrigatório para deleção.");
    }
    const categoriaExistente = await database("categorias").where({ id }).first();
    if (!categoriaExistente) {
        throw new Error("Categoria não encontrada para deleção.");
    }

    // Verificar se a categoria está sendo usada em alguma dúvida
    // Isso é importante porque a coluna 'categoria_id' em 'duvidas' é NOT NULLABLE
    // e a regra onDelete('SET NULL') da migration de dúvidas entraria em conflito.
    const duvidasComEstaCategoria = await database("duvidas").where({ categoria_id: id }).first();
    if (duvidasComEstaCategoria) {
        throw new Error("Esta categoria não pode ser deletada pois está associada a uma ou mais dúvidas.");
    }

    await database("categorias").where({ id }).del();
    return { message: "Categoria deletada com sucesso." };
}

module.exports = {
    createCategoria,
    readAllCategorias,
    readCategoriaById,
    updateCategoria,
    deleteCategoria,
};