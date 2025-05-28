require('dotenv').config();
const database = require("../database/exports"); 
const crypto = require("crypto");

async function createCategoria(tipo) {
    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
        throw new Error("O nome (tipo) da categoria � obrigat�rio e deve ser um texto.");
    }

    const tipoFormatado = tipo.trim();
    const categoriaExistente = await database("categorias").where({ tipo: tipoFormatado }).first();
    if (categoriaExistente) {
        throw new Error(`A categoria "${tipoFormatado}" j� existe.`);
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
    return categorias; // Retorna array vazio se n�o houver categorias
}

async function readCategoriaById(id) {
    if (!id) {
        throw new Error("O ID da categoria � obrigat�rio.");
    }
    const categoria = await database("categorias").select("id", "tipo", "criado_em", "modificado_em").where({ id }).first();
    if (!categoria) {
        throw new Error("Categoria n�o encontrada.");
    }
    return categoria;
}

async function updateCategoria(id, tipo) {
    if (!id) {
        throw new Error("O ID da categoria � obrigat�rio para atualiza��o.");
    }
    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
        throw new Error("O novo nome (tipo) da categoria � obrigat�rio.");
    }

    const categoriaExistente = await database("categorias").where({ id }).first();
    if (!categoriaExistente) {
        throw new Error("Categoria n�o encontrada para atualiza��o.");
    }

    const tipoFormatado = tipo.trim();
    if (tipoFormatado !== categoriaExistente.tipo) {
        const outraCategoriaComMesmoTipo = await database("categorias")
            .where({ tipo: tipoFormatado })
            .whereNot({ id })
            .first();
        if (outraCategoriaComMesmoTipo) {
            throw new Error(`J� existe outra categoria com o nome "${tipoFormatado}".`);
        }
    } else {
        // Se o tipo n�o mudou, n�o h� necessidade de atualizar, a menos que voc� tenha outros campos.
        // Poderia retornar uma mensagem informando que n�o houve altera��o.
        // Por ora, permitiremos a "atualiza��o" para o mesmo nome, que apenas atualizar� o modificado_em.
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
        throw new Error("O ID da categoria � obrigat�rio para dele��o.");
    }
    const categoriaExistente = await database("categorias").where({ id }).first();
    if (!categoriaExistente) {
        throw new Error("Categoria n�o encontrada para dele��o.");
    }

    // Verificar se a categoria est� sendo usada em alguma d�vida
    // Isso � importante porque a coluna 'categoria_id' em 'duvidas' � NOT NULLABLE
    // e a regra onDelete('SET NULL') da migration de d�vidas entraria em conflito.
    const duvidasComEstaCategoria = await database("duvidas").where({ categoria_id: id }).first();
    if (duvidasComEstaCategoria) {
        throw new Error("Esta categoria n�o pode ser deletada pois est� associada a uma ou mais d�vidas.");
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