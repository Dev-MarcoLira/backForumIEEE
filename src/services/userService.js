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
    return { message: "Usu�rio criado com sucesso.", usuario: usuarioCriado };
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

// readUser agora busca um perfil p�blico por ID
async function readUser(idUsuario) { // Mantido: readUser (para perfil p�blico)
    if (!idUsuario) {
        throw new Error("ID do usu�rio � obrigat�rio para buscar o perfil.");
    }
    const usuario = await database("usuarios")
        .select("id", "nome", "criado_em" /* Adicione outros campos p�blicos aqui, ex: biografia, foto_perfil */)
        .where({ id: idUsuario })
        .first();
    if (!usuario) {
        throw new Error("Usu�rio n�o encontrado.");
    }
    // Aqui voc� pode adicionar l�gica para buscar estat�sticas p�blicas do usu�rio,
    // como n�mero de d�vidas criadas, se desejar.
    return usuario;
}

async function updateUser(idUsuarioAutenticado, dadosUpdate) { // Mantido: updateUser (para o pr�prio perfil)
    const usuarioExistente = await database("usuarios").where({ id: idUsuarioAutenticado }).first();
    if (!usuarioExistente) {
        throw new Error("Usu�rio n�o encontrado para atualiza��o (token inv�lido ou usu�rio deletado).");
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
            throw new Error("Este email j� est� em uso por outro usu�rio.");
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
        throw new Error("Nenhum dado v�lido fornecido para atualiza��o ou os dados s�o iguais aos existentes.");
    }
    atualizacoes.modificado_em = database.fn.now();
    await database("usuarios").where({ id: idUsuarioAutenticado }).update(atualizacoes);
    
    const usuarioAtualizado = await database("usuarios").select("id", "nome", "email", "criado_em", "modificado_em").where({ id: idUsuarioAutenticado }).first();
    return { message: "Perfil atualizado com sucesso.", usuario: usuarioAtualizado };
}

async function deleteUser(idUsuarioAutenticado) { // Mantido: deleteUser (para a pr�pria conta)
    const usuarioExistente = await database("usuarios").where({ id: idUsuarioAutenticado }).first();
    if (!usuarioExistente) {
        throw new Error("Usu�rio n�o encontrado para dele��o (token inv�lido ou usu�rio deletado).");
    }
    await database("usuarios").where({ id: idUsuarioAutenticado }).del();
    return { message: "Conta de usu�rio deletada com sucesso." };
}

// Fun��o para obter dados da pr�pria conta (mais completa que o perfil p�blico)
async function obterDadosPropriaConta(idUsuarioAutenticado) {
    const usuario = await database("usuarios")
        .select("id", "nome", "email", "criado_em", "modificado_em") // Todos os campos relevantes para o usu�rio sobre si mesmo
        .where({ id: idUsuarioAutenticado })
        .first();
    if (!usuario) {
        throw new Error("Usu�rio n�o encontrado (token inv�lido ou usu�rio deletado).");
    }
    return usuario;
}


module.exports = {
    login,
    createUser,
    readUser, // Para ler perfil p�blico de um usu�rio por ID
    updateUser, // Para o usu�rio logado atualizar o pr�prio perfil
    deleteUser, // Para o usu�rio logado deletar a pr�pria conta
    obterDadosPropriaConta, // Para o usu�rio logado ver seus pr�prios dados de conta
};
