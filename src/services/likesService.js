// src/services/curtidaService.js
require('dotenv').config();
const database = require("../database/exports"); // Certifique-se que o caminho está correto

/**
 * Adiciona uma curtida a uma dúvida.
 */
async function likeDuvida(usuario_id, duvida_id) {
    if (!usuario_id || !duvida_id) {
        throw new Error("ID do usuário e ID da dúvida são obrigatórios.");
    }

    // 1. Verificar se a dúvida existe
    const duvidaExistente = await database("duvidas").where({ id: duvida_id }).first();
    if (!duvidaExistente) {
        throw new Error("Dúvida não encontrada.");
    }

    // 2. Verificar se já não curtiu (embora o PK composto previna, é bom ter um feedback claro)
    const curtidaExistente = await database("curtir_duvidas")
        .where({ usuario_id, duvida_id })
        .first();

    if (curtidaExistente) {
        // Se já curtiu, não faz nada ou retorna uma mensagem específica.
        // A especificação do backlog é "prevenção de duplicidade"[cite: 36]. O PK já faz isso.
        // Poderíamos lançar um erro ou simplesmente confirmar que está curtido.
        // Por ora, vamos assumir que se já existe, a operação é "bem-sucedida" no sentido de que o estado desejado (curtido) é alcançado.
        return { message: "Dúvida já estava curtida.", curtida: curtidaExistente };
    }

    // 3. Inserir a curtida
    const novaCurtida = {
        usuario_id,
        duvida_id,
        // criado_em e modificado_em são gerenciados pelo DB
    };
    await database("curtir_duvidas").insert(novaCurtida);

    return { message: "Dúvida curtida com sucesso.", duvida_id };
}

/**
 * Remove uma curtida de uma dúvida.
 */
async function unlikeDuvida(usuario_id, duvida_id) {
    if (!usuario_id || !duvida_id) {
        throw new Error("ID do usuário e ID da dúvida são obrigatórios.");
    }

    const deletedRows = await database("curtir_duvidas")
        .where({ usuario_id, duvida_id })
        .del();

    if (deletedRows === 0) {
        throw new Error("Curtida não encontrada ou já removida.");
    }

    return { message: "Curtida da dúvida removida com sucesso.", duvida_id };
}

/**
 * Adiciona uma curtida a uma resposta.
 */
async function likeResposta(usuario_id, resposta_id) {
    if (!usuario_id || !resposta_id) {
        throw new Error("ID do usuário e ID da resposta são obrigatórios.");
    }

    const respostaExistente = await database("respostas").where({ id: resposta_id }).first();
    if (!respostaExistente) {
        throw new Error("Resposta não encontrada.");
    }

    const curtidaExistente = await database("curtir_respostas")
        .where({ usuario_id, resposta_id })
        .first();

    if (curtidaExistente) {
        return { message: "Resposta já estava curtida.", curtida: curtidaExistente };
    }

    const novaCurtida = {
        usuario_id,
        resposta_id,
    };
    await database("curtir_respostas").insert(novaCurtida);

    return { message: "Resposta curtida com sucesso.", resposta_id };
}

/**
 * Remove uma curtida de uma resposta.
 */
async function unlikeResposta(usuario_id, resposta_id) {
    if (!usuario_id || !resposta_id) {
        throw new Error("ID do usuário e ID da resposta são obrigatórios.");
    }

    const deletedRows = await database("curtir_respostas")
        .where({ usuario_id, resposta_id })
        .del();

    if (deletedRows === 0) {
        throw new Error("Curtida não encontrada ou já removida.");
    }

    return { message: "Curtida da resposta removida com sucesso.", resposta_id };
}

/**
 * Lista dúvidas e respostas curtidas por um usuário.
 */
async function getLikedItemsByUser(usuario_id) {
    if (!usuario_id) {
        throw new Error("ID do usuário é obrigatório.");
    }

    const likedDuvidas = await database("curtir_duvidas")
        .join("duvidas", "curtir_duvidas.duvida_id", "duvidas.id")
        .join("usuarios as autor_duvida", "duvidas.usuario_id", "autor_duvida.id")
        .leftJoin("categorias", "duvidas.categoria_id", "categorias.id")
        .where("curtir_duvidas.usuario_id", usuario_id)
        .select(
            "duvidas.id",
            "duvidas.descricao",
            "duvidas.criado_em",
            "duvidas.resolvida",
            "autor_duvida.nome as autorNomeDuvida",
            "categorias.tipo as nomeCategoria",
            "curtir_duvidas.criado_em as dataDaCurtida" // Data em que o usuário curtiu
        )
        .orderBy("curtir_duvidas.criado_em", "desc"); // Mais recentes primeiro

    const likedRespostas = await database("curtir_respostas")
        .join("respostas", "curtir_respostas.resposta_id", "respostas.id")
        .join("duvidas", "respostas.duvida_id", "duvidas.id") // Para dar contexto à resposta
        .join("usuarios as autor_resposta", "respostas.usuario_id", "autor_resposta.id")
        .where("curtir_respostas.usuario_id", usuario_id)
        .select(
            "respostas.id",
            "respostas.descricao",
            "respostas.criado_em",
            "autor_resposta.nome as autorNomeResposta",
            "duvidas.id as duvidaPaiId", // ID da dúvida à qual a resposta pertence
            "duvidas.descricao as duvidaPaiDescricao", // Descrição da dúvida pai
            "curtir_respostas.criado_em as dataDaCurtida" // Data em que o usuário curtiu
        )
        .orderBy("curtir_respostas.criado_em", "desc");

    return {
        duvidasCurtidas: likedDuvidas,
        respostasCurtidas: likedRespostas,
    };
}

module.exports = {
    likeDuvida,
    unlikeDuvida,
    likeResposta,
    unlikeResposta,
    getLikedItemsByUser,
};