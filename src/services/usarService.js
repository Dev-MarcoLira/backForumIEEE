require('dotenv').config();
const datebase = require("../database/exports");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

async function readUser() {
  const usuario = await datebase("usuarios").select("*");

  if (usuario.length === 0) {
    throw new Error("Não tem registro");
  }

  return usuario;
}

async function createUser(nome, email, senha) {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(senha, salt);

  const usuario = {
    id: crypto.randomUUID(),
    nome,
    email,
    senha: hash,
  };

  await datebase("usuarios").insert(usuario);
  return "Usuário criado com sucesso";
}

async function updateUser(id, nome, email, senha) {
  const busca = await datebase("usuarios").where({ id }).first();

  if (!busca) {
    throw new Error("Usuário não encontrado");
  }

  if (!nome || !email || !senha) {
    throw new Error("Preencha todos os campos");
  }

  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(senha, salt);

  const novo_usuario = {
    id,
    nome,
    email,
    senha: hash,
  };

  await datebase("usuarios").update(novo_usuario).where({ id });

  return "Usuário atualizado com sucesso";
}

async function login(email, senha) {
  const usuario = await datebase("usuarios").where({ email }).first();

  if (!usuario) {
    throw new Error("Usuário não encontrado");
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    throw new Error("Senha incorreta");
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
}

async function deleteUser(id) {
  const user = await datebase("usuarios").where({ id }).first();

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  await datebase("usuarios").delete().where({ id });

  return "Usuário deletado com sucesso";
}

module.exports = {
  login,
  createUser,
  readUser,
  updateUser,
  deleteUser,
};
