require('dotenv').config();
const  v4  = require('../utilitario/uuid'); 
const database = require("../database/exports"); // Ajuste o caminho se necessário

async function readDuvidas(filtros = {}) {
    // Define valores padráo para paginação, ordenação e extrai outros filtros.
    const {
        page = 1,
        limit = 10,
        sortBy = 'criado_em',
        order = 'DESC',
        // Filtros específicos que podem ser passados em req.query
        categoria_id,
        usuario_id,
        resolvida,
        termoDeBusca
    } = filtros;

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;
    const offset = (pageInt - 1) * limitInt;

    // Constrói a query principal para buscar as dúvidas.
    const queryBuilder = database('duvidas')
        .select(
            'duvidas.id',
            'duvidas.descricao',
            'duvidas.criado_em',
            'duvidas.modificado_em', // Adicionado para consistência
            'duvidas.resolvida',
            'usuarios.nome as autorNome', // Seleciona o nome do autor da tabela 'usuarios'.
            'categorias.tipo as nome_categoria' // Adiciona o nome da categoria
        )
        .join('usuarios', 'duvidas.usuario_id', 'usuarios.id') // Junta com a tabela 'usuarios'.
        .leftJoin('categorias', 'duvidas.categoria_id', 'categorias.id') // Left join para categorias (categoria_id pode ser null).
        .select(database.raw('(SELECT COUNT(*) FROM curtir_duvidas WHERE curtir_duvidas.duvida_id = duvidas.id) as contagemdecurtidas'));

    // Constrói a query para contagem. Deve espelhar os JOINS e WHEREs da queryBuilder.
    const countQueryBuilder = database('duvidas')
        .join('usuarios', 'duvidas.usuario_id', 'usuarios.id')
        .leftJoin('categorias', 'duvidas.categoria_id', 'categorias.id');

    // **INÍCIO DA CORREÇÃO: Aplicar filtros em AMBAS as queries (queryBuilder e countQueryBuilder)**
    if (categoria_id) {
        queryBuilder.where('duvidas.categoria_id', categoria_id);
        countQueryBuilder.where('duvidas.categoria_id', categoria_id);
    }
    if (usuario_id) {
        queryBuilder.where('duvidas.usuario_id', usuario_id);
        countQueryBuilder.where('duvidas.usuario_id', usuario_id);
    }
    if (resolvida !== undefined && resolvida !== null && resolvida !== '') {
        // Converte 'true'/'false' (strings) para booleanos
        const resolvidaBool = String(resolvida).toLowerCase() === 'true';
        queryBuilder.where('duvidas.resolvida', resolvidaBool);
        countQueryBuilder.where('duvidas.resolvida', resolvidaBool);
    }
    if (termoDeBusca) {
        const buscaLike = `%${termoDeBusca}%`;
        queryBuilder.where('duvidas.descricao', 'like', buscaLike);
        // Adicione outros campos para busca se desejar:
        // .orWhere('usuarios.nome', 'like', buscaLike)
        // .orWhere('categorias.tipo', 'like', buscaLike)
        countQueryBuilder.where('duvidas.descricao', 'like', buscaLike);
        // E os mesmos orWhere se aplicável para a contagem
    }
    // **FIM DA CORREÇÃO**

    // Adiciona a lógica de ordenação é query principal.
    const orderUpper = order.toUpperCase();
    if (sortBy === 'curtidas') {
        queryBuilder.orderBy('contagemdecurtidas', orderUpper);
        queryBuilder.orderBy('duvidas.criado_em', 'DESC'); // Desempate.
    } else if (sortBy === 'autorNome') {
        queryBuilder.orderBy('autorNome', orderUpper); // Ordena pelo alias
    } else if (sortBy === 'nome_categoria') {
        queryBuilder.orderBy('nome_categoria', orderUpper); // Ordena pelo alias
    } else if (['id', 'descricao', 'criado_em', 'modificado_em', 'resolvida'].includes(sortBy)) {
        // Ordena por colunas válidas da tabela 'duvidas'.
        queryBuilder.orderBy(`duvidas.${sortBy}`, orderUpper);
    } else {
        // Fallback para ordenação padrão.
        queryBuilder.orderBy('duvidas.criado_em', 'DESC');
    }

    // Aplica limite e offset para paginação é query principal.
    queryBuilder.limit(limitInt).offset(offset);

    // Executa as queries.
    const duvidas = await queryBuilder;
    const totalResult = await countQueryBuilder.count({ count: "*" }).first();
    const totalItems = parseInt(totalResult.count, 10);

    // Retorna os dados das dúvidas e as informaçães de paginação.
    return {
        data: duvidas,
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

async function createDuvida(descricao, usuario_id, categoria_id) {
    if (!descricao || !usuario_id) {
        throw new Error("Descrição e ID do usuário são obrigatórios.");
    }

    // Opcional: Verificar se categoria_id (se fornecido) existe
    if (categoria_id) {
        const categoriaExiste = await database("categorias").where({ id: categoria_id }).first();
        if (!categoriaExiste) {
            throw new Error("Categoria não encontrada.");
        }
    }

    const novaDuvida = {
        id: v4(),
        descricao,
        usuario_id,
        categoria_id: categoria_id || null, // Permite que a categoria seja opcional
        resolvida: false, // Dúvida não resolvida por padrão
        // criado_em e modificado_em são definidos pelo banco com defaultTo(knex.fn.now())
    };

    await database("duvidas").insert(novaDuvida);
    // É uma boa prática retornar o objeto criado ou um objeto com mensagem e o ID/objeto.
    return { message: "Dúvida criada com sucesso", duvida: novaDuvida };
}

async function readDuvidaById(id, opcoesRespostas = {}) {
    const duvida = await database("duvidas")
        .select(
            "duvidas.*", // Seleciona todos os campos de 'duvidas'
            "usuarios.nome as nome_usuario",
            "categorias.tipo as nome_categoria",
            database.raw('(SELECT COUNT(*) FROM curtir_duvidas WHERE curtir_duvidas.duvida_id = duvidas.id) as contagem_curtidas_duvida')
        )
        .join("usuarios", "duvidas.usuario_id", "usuarios.id")
        .leftJoin("categorias", "duvidas.categoria_id", "categorias.id") // leftJoin caso categoria_id seja null
        .where("duvidas.id", id)
        .first();

    if (!duvida) {
        throw new Error("Dúvida não encontrada.");
    }

    const {
        sortByRespostas = 'criado_em', // Campo padrão para ordenação das respostas
        orderRespostas = 'ASC',       // Ordem padrão para as respostas
    } = opcoesRespostas;

    const queryRespostas = database("respostas")
        .select(
            "respostas.*",
            "usuarios.nome as nome_usuario_resposta",
            database.raw('(SELECT COUNT(*) FROM curtir_respostas WHERE curtir_respostas.resposta_id = respostas.id) as contagem_curtidas_resposta')
        )
        .leftJoin("usuarios", "respostas.usuario_id", "usuarios.id") // leftJoin se usuario_id em respostas puder ser null
        .where("respostas.duvida_id", id);

    // Ordenação das respostas
    const orderRespostasUpper = orderRespostas.toUpperCase();
    if (sortByRespostas === 'curtidas') {
        queryRespostas.orderBy('contagem_curtidas_resposta', orderRespostasUpper);
        queryRespostas.orderBy('respostas.criado_em', 'ASC'); // Desempate
    } else if (['id', 'conteudo', 'criado_em'].includes(sortByRespostas)) { // Adicione campos válidos de 'respostas'
        queryRespostas.orderBy(`respostas.${sortByRespostas}`, orderRespostasUpper);
    } else {
        queryRespostas.orderBy('respostas.criado_em', 'ASC'); // Fallback para ordenação de respostas
    }

    const respostas = await queryRespostas;
    duvida.respostas = respostas; // Anexa as respostas ao objeto da dúvida

    return duvida;
}

async function updateDuvida(id, usuarioAutenticadoId, dadosUpdate) {
    const duvidaExistente = await database("duvidas").where({ id }).first();

    if (!duvidaExistente) {
        throw new Error("Dúvida não encontrada.");
    }

    if (duvidaExistente.usuario_id !== usuarioAutenticadoId) {
        throw new Error("Usuário não autorizado a editar esta dúvida.");
    }

    const camposPermitidos = ['descricao', 'categoria_id', 'resolvida'];
    const atualizacoesValidas = {};
    let algumaAtualizacaoValida = false;

    for (const campo of camposPermitidos) {
        if (dadosUpdate.hasOwnProperty(campo)) { // Verifica se o campo está presente nos dados para update
            if (campo === 'categoria_id' && dadosUpdate[campo] != null) { // Se for categoria_id e não for explicitamente null
                const categoriaExiste = await database("categorias").where({ id: dadosUpdate[campo] }).first();
                if (!categoriaExiste) {
                    throw new Error("Categoria fornecida para atualização não encontrada.");
                }
            }
            atualizacoesValidas[campo] = dadosUpdate[campo]; // Aceita null para categoria_id se enviado
            algumaAtualizacaoValida = true;
        }
    }

    if (!algumaAtualizacaoValida) {
        throw new Error("Nenhum dado válido fornecido para atualização.");
    }

    atualizacoesValidas.modificado_em = database.fn.now();

    await database("duvidas").where({ id }).update(atualizacoesValidas);

    return { message: "Dúvida atualizada com sucesso." };
}

async function deleteDuvida(id, usuarioAutenticadoId) {
    const duvidaExistente = await database("duvidas").where({ id }).first();

    if (!duvidaExistente) {
        throw new Error("Dúvida não encontrada.");
    }

    if (duvidaExistente.usuario_id !== usuarioAutenticadoId) {
        throw new Error("Usuário não autorizado a deletar esta dúvida.");
    }

   
    await database("duvidas").where({ id }).del(); 

    return { message: "Dúvida deletada com sucesso." };
}

module.exports = {
    readDuvidas,
    createDuvida,
    readDuvidaById,
    updateDuvida,
    deleteDuvida,
};

//OBRIGADO GEMINI, DIMINIU GRANDEMENTE O PROCESSO DE ESCREVER O CÓDIGO



