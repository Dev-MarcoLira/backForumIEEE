// src/services/usarService.js
require('dotenv').config();
const database = require("../database/exports");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const v4 = require('../utilitario/uuid');

async function createUser(nome, email, senha) { // Mantido: createUser
    if (!nome || !email || !senha) {
        throw new Error("Nome, email e senha são obrigatórios para o registro.");
    }
    const emailExistente = await database("usuarios").where({ email }).first();
    if (emailExistente) {
        throw new Error("Este email já estão cadastrado.");
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(senha, salt);
    const novoUsuario = {
        id: v4(),
        nome,
        email,
        senha: hash,
    };
    await database("usuarios").insert(novoUsuario);
    const { senha: _, ...usuarioCriado } = novoUsuario;
    return { message: "Usuário criado com sucesso.", usuario: usuarioCriado };
}

async function login(email, senha) { // Mantido: login
    if (!email || !senha) {
        throw new Error("Email e senha são obrigatórios.");
    }
    const usuario = await database("usuarios").where({ email }).first();
    if (!usuario) {
        throw new Error("Credenciais inválidas.");
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
        throw new Error("Credenciais inválidas.");
    }
    const token = jwt.sign(
        { id: usuario.id, email: usuario.email, nome: usuario.nome },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );
    return { token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } };
}

// readUser agora busca um perfil público por ID
async function readUser(idUsuario) { // Mantido: readUser (para perfil público)
    if (!idUsuario) {
        throw new Error("ID do usuário é obrigatório para buscar o perfil.");
    }
    const usuario = await database("usuarios")
        .select("id", "nome", "criado_em" /* Adicione outros campos públicos aqui, ex: biografia, foto_perfil */)
        .where({ id: idUsuario })
        .first();
    if (!usuario) {
        throw new Error("Usuúrio ã encontrado.");
    }
    // Aqui você pode adicionar lógica para buscar estatísticas públicas do usuário,
    // como número de dúvidas criadas, se desejar.
    return usuario;
}

async function updateUser(idUsuarioAutenticado, dadosUpdate) { // Mantido: updateUser (para o próprio perfil)
    const usuarioExistente = await database("usuarios").where({ id: idUsuarioAutenticado }).first();
    if (!usuarioExistente) {
        throw new Error("Usuário não encontrado para atualização (token inválido ou usuário deletado).");
    }

    const atualizacoes = {};
    let algumaAtualizacaoValida = false;

    if (dadosUpdate.hasOwnProperty('nome') && dadosUpdate.nome && dadosUpdate.nome !== usuarioExistente.nome) {
        atualizacoes.nome = dadosUpdate.nome;
        algumaAtualizacaoValida = true;
    }
    if (dadosUpdate.hasOwnProperty('email') && dadosUpdate.email && dadosUpdate.email !== usuarioExistente.email) {
        const emailExistenteOutroUsuario = await database("usuarios").where({ email: dadosUpdate.email }).whereNot({ id: idUsuarioAutenticado }).first();
        if (emailExistenteOutroUsuario) {
            throw new Error("Este email já está em uso por outro usuário.");
        }
        atualizacoes.email = dadosUpdate.email;
        algumaAtualizacaoValida = true;
    }
    if (dadosUpdate.hasOwnProperty('senha') && dadosUpdate.senha) {
        const salt = await bcrypt.genSalt(10);
        atualizacoes.senha = await bcrypt.hash(dadosUpdate.senha, salt);
        algumaAtualizacaoValida = true;
    }

    if (!algumaAtualizacaoValida) {
        throw new Error("Nenhum dado válido fornecido para atualização ou os dados são iguais aos existentes.");
    }
    atualizacoes.modificado_em = database.fn.now();
    await database("usuarios").where({ id: idUsuarioAutenticado }).update(atualizacoes);
    
    const usuarioAtualizado = await database("usuarios").select("id", "nome", "email", "criado_em", "modificado_em").where({ id: idUsuarioAutenticado }).first();
    return { message: "Perfil atualizado com sucesso.", usuario: usuarioAtualizado };
}

async function deleteUser(idUsuarioAutenticado) { // Mantido: deleteUser (para a própria conta)
    const usuarioExistente = await database("usuarios").where({ id: idUsuarioAutenticado }).first();
    if (!usuarioExistente) {
        throw new Error("Usuário não encontrado para deleção (token inválido ou usuário deletado).");
    }
    await database("usuarios").where({ id: idUsuarioAutenticado }).del();
    return { message: "Conta de usuário deletada com sucesso." };
}

// Função para obter dados da própria conta (mais completa que o perfil público)
async function obterDadosPropriaConta(idUsuarioAutenticado) {
    const usuario = await database("usuarios")
        .select("id", "nome", "email", "criado_em", "modificado_em") // Todos os campos relevantes para o usuário sobre si mesmo
        .where({ id: idUsuarioAutenticado })
        .first();
    if (!usuario) {
        throw new Error("Usuário não encontrado (token inválido ou usuário deletado).");
    }
    return usuario;
}


module.exports = {
    login,
    createUser,
    readUser, // Para ler perfil público de um usuário por ID
    updateUser, // Para o usuário logado atualizar o próprio perfil
    deleteUser, // Para o usuário logado deletar a própria conta
    obterDadosPropriaConta, // Para o usuário logado ver seus práprios dados de conta
};
