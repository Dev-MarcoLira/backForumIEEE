//const { use } = require("react")
const userService = require("../services/usarService");

async function readUser(req, res) {
  try {
    const usuario = await userService.readUser();
    res.status(200).json({ users: usuario });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
}

async function createUser(req, res) {
  try {
    const { nome, email, senha } = req.body;
    const userCreate = await userService.createUser(nome, email, senha);
    res.status(200).json({ message: userCreate });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
}

async function updateUser(req, res) {
  try {
    const { nome, email, senha } = req.body;
    const id = req.params.id;
    const message = await userService.updateUser(id, nome, email, senha);
    res.status(200).json({ message: message });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    const token = await userService.login(email, senha);
    res.status(200).json({ token: token });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
}

async function deleteUser(req, res) {
  try {
    const id = req.params.id;
    const message = await userService.deleteUser(id);
    res.status(200).json({ message: message });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
}

module.exports = {
  login,
  createUser,
  readUser,
  updateUser,
  deleteUser,
};
