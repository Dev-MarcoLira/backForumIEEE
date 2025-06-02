// src/services/respostaService.js
require('dotenv').config();
const database = require("../database/exports"); // Certifique-se que o caminho está correto
const crypto = require("crypto");
const v4 = require('../utilitario/uuid');

async function createResposta(dadosResposta) {
    const { descricao, duvida_id, usuario_id } = dadosResposta;

    if (!descricao || !duvida_id || !usuario_id) {
        throw new Error("Descrição, ID da dúvida e ID do usuário são obrigatórios.");
    }

    // Opcional: Verificar se a dúvida existe
    const duvidaExistente = await database("duvidas").where({ id: duvida_id }).first();
    if (!duvidaExistente) {
        throw new Error("Dúvida não encontrada.");
    }

    const novaResposta = {
        id: v4(),
        descricao,
        duvida_id,
        usuario_id,
        // criado_em e modificado_em são definidos pelo banco com defaultTo(knex.fn.now())
    };

    await database("respostas").insert(novaResposta);

    // Retornar a resposta criada com mais detalhes
    const respostaCriada = await database("respostas")
        .select(
            "respostas.id",
            "respostas.descricao",
            "respostas.duvida_id",
            "respostas.usuario_id",
            "respostas.criado_em",
            "respostas.modificado_em",
            "usuarios.nome as autorNome"
        )
        .join("usuarios", "respostas.usuario_id", "usuarios.id")
        .where("respostas.id", novaResposta.id)
        .first();

    return { message: "Resposta criada com sucesso.", resposta: respostaCriada };
}

async function readRespostasByDuvidaId(duvida_id, filtros = {}) {
    if (!duvida_id) {
        throw new Error("ID da dúvida é obrigatório para buscar respostas.");
    }

    const {
        page = 1,
        limit = 10,
        sortBy = 'criado_em', // Pode ser 'criado_em' ou 'curtidas'
        order = 'ASC'        // 'ASC' ou 'DESC'
    } = filtros;

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;
    const offset = (pageInt - 1) * limitInt;
    const orderUpper = order.toUpperCase();

    const queryBuilder = database("respostas")
        .select(
            "respostas.id",
            "respostas.descricao",
            "respostas.criado_em",
            "respostas.modificado_em",
            "respostas.usuario_id", // Importante para futuras verificações de autorização no front-end
            "usuarios.nome as autorNome",
            // Subquery para contagem de curtidas
            database.raw('(SELECT COUNT(*) FROM curtir_respostas WHERE curtir_respostas.resposta_id = respostas.id) as contagemDeCurtidas')
        )
        .join("usuarios", "respostas.usuario_id", "usuarios.id")
        .where("respostas.duvida_id", duvida_id);

    const countQueryBuilder = database("respostas").where("respostas.duvida_id", duvida_id);

    if (sortBy === 'curtidas') {
        queryBuilder.orderBy('contagemDeCurtidas', orderUpper);
        queryBuilder.orderBy('respostas.criado_em', 'ASC'); // Desempate para curtidas
    } else if (['criado_em', 'modificado_em'].includes(sortBy)) {
        queryBuilder.orderBy(`respostas.${sortBy}`, orderUpper);
    } else {
        queryBuilder.orderBy('respostas.criado_em', 'ASC'); // Padrão
    }

    queryBuilder.limit(limitInt).offset(offset);

    const respostas = await queryBuilder;
    const totalResult = await countQueryBuilder.count({ count: "*" }).first();
    const totalItems = parseInt(totalResult.count, 10);

    return {
        data: respostas,
        pagination: {
            totalItems: totalItems,
            currentPage: pageInt,
            itemsPerPage: limitInt,
            totalPages: Math.ceil(totalItems / limitInt),
            sortBy: sortBy,
            order: orderUpper,
        },
    };
}

async function updateResposta(idResposta, usuarioAutenticadoId, dadosUpdate) {
    const { descricao } = dadosUpdate;

    if (!descricao || typeof descricao !== 'string' || descricao.trim() === '') {
        throw new Error("A descrição é obrigatória e deve ser um texto válido.");
    }

    const respostaExistente = await database("respostas").where({ id: idResposta }).first();
    if (!respostaExistente) {
        throw new Error("Resposta não encontrada.");
    }

    if (respostaExistente.usuario_id !== usuarioAutenticadoId) {
        throw new Error("Usuário não autorizado a editar esta resposta.");
    }

    if (respostaExistente.descricao === descricao.trim()) {
        // Se não houve mudança na descrição, poderia retornar a resposta existente ou uma mensagem.
        // Por ora, vamos permitir a "atualização" que apenas tocará o modificado_em.
        // Ou lançar: throw new Error("Nenhuma alteração detectada na descrição.");
    }

    const atualizacoes = {
        descricao: descricao.trim(),
        modificado_em: database.fn.now(),
    };

    await database("respostas").where({ id: idResposta }).update(atualizacoes);
    
    const respostaAtualizada = await database("respostas")
        .select("id", "descricao", "criado_em", "modificado_em", "usuario_id", "duvida_id")
        .where({ id: idResposta })
        .first();

    return { message: "Resposta atualizada com sucesso.", resposta: respostaAtualizada };
}

async function deleteResposta(idResposta, usuarioAutenticadoId) {
    const respostaExistente = await database("respostas").where({ id: idResposta }).first();
    if (!respostaExistente) {
        throw new Error("Resposta não encontrada.");
    }

    if (respostaExistente.usuario_id !== usuarioAutenticadoId) {
        throw new Error("Usuário não autorizado a deletar esta resposta.");
    }
    const duvidaDaResposta = await database("duvidas").where({id: respostaExistente.duvida_id}).first();
    if (!duvidaDaResposta) {
        throw new Error("Dúvida associada à resposta não encontrada."); // Caso de integridade de dados
    }
    if (respostaExistente.usuario_id !== usuarioAutenticadoId && duvidaDaResposta.usuario_id !== usuarioAutenticadoId) {
    throw new Error("Usuário não autorizado a deletar esta resposta.");
}

    // Antes de deletar a resposta, é importante deletar as curtidas associadas a ela
    // para evitar erros de chave estrangeira se 'curtir_respostas' não tiver onDelete('CASCADE') para resposta_id.
    // Se a migration de `curtir_respostas` já tem `onDelete('CASCADE')` para `resposta_id`, este passo é redundante.
    // await database("curtir_respostas").where({ resposta_id: idResposta }).del();

    const deletedRows = await database("respostas").where({ id: idResposta }).del();
    if (deletedRows === 0) {
        // Isso não deveria acontecer se a respostaExistente foi encontrada, mas é uma checagem extra.
        throw new Error("Falha ao deletar a resposta, nenhum registro foi removido.");
    }

    return { message: "Resposta deletada com sucesso." };
}

// Opcional: Se precisar de uma função para buscar uma única resposta por ID
async function readRespostaById(idResposta) {
    const resposta = await database("respostas")
        .select(
            "respostas.id",
            "respostas.descricao",
            "respostas.criado_em",
            "respostas.modificado_em",
            "respostas.duvida_id",
            "respostas.usuario_id",
            "usuarios.nome as autorNome",
            database.raw('(SELECT COUNT(*) FROM curtir_respostas WHERE curtir_respostas.resposta_id = respostas.id) as contagemDeCurtidas')
        )
        .join("usuarios", "respostas.usuario_id", "usuarios.id")
        .where("respostas.id", idResposta)
        .first();

    if (!resposta) {
        throw new Error("Resposta não encontrada.");
    }
    return resposta;
}

module.exports = {
    createResposta,
    readRespostasByDuvidaId,
    updateResposta,
    deleteResposta,
    readRespostaById, // Exporte se a função for implementada e usada
};