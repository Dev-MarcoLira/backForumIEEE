const userService = require("../services/userService");

// Handler para createUser
async function handleCreateUser(req, res) {
    try {
        const { nome, email, senha } = req.body;
        const resultado = await userService.createUser(nome, email, senha);
        res.status(201).json(resultado);
    } catch (e) {
        if (e.message.includes("obrigatórios") || e.message.includes("Este email já está cadastrado")) {
            return res.status(400).json({ erro: e.message });
        }
        console.error("Erro no createUser:", e);
        res.status(500).json({ erro: "Erro interno ao registrar usuário." });
    }
}

// Handler para login
async function handleLogin(req, res) {
    try {
        const { email, senha } = req.body;
        const resultado = await userService.login(email, senha);
        res.status(200).json(resultado);
    } catch (e) {
        if (e.message.includes("Credenciais inválidas") || e.message.includes("obrigatórios")) {
            return res.status(401).json({ erro: "Credenciais inválidas." });
        }
        console.error("Erro no login:", e);
        res.status(500).json({ erro: "Erro interno ao tentar fazer login." });
    }
}

// Handler para readUser (obter perfil público de um usuário por ID)
async function handleReadUser(req, res) {
    try {
        const { id } = req.params; // ID do usuário cujo perfil está sendo visualizado
        const usuario = await userService.readUser(id);
        res.status(200).json({ usuario });
    } catch (e) {
        if (e.message.includes("náo encontrado") || e.message.includes("obrigatário")) {
            return res.status(404).json({ erro: e.message });
        }
        console.error("Erro no readUser (perfil público):", e);
        res.status(500).json({ erro: "Erro ao buscar perfil do usuário." });
    }
}

// Handler para updateUser (usuário logado atualiza o práprio perfil)
async function handleUpdateUser(req, res) {
    try {
        // req.id é o ID do usuário autenticado (do token)
        // req.body contêm os dados para atualização (nome, email, senha nova)
        const resultado = await userService.updateUser(req.id, req.body);
        res.status(200).json(resultado);
    } catch (e) {
        if (e.message.includes("não encontrado") || e.message.includes("Nenhum dado válido") || e.message.includes("email já está em uso")) {
            return res.status(400).json({ erro: e.message });
        }
        console.error("Erro no updateUser (próprio perfil):", e);
        res.status(500).json({ erro: "Erro interno ao atualizar perfil." });
    }
}

// Handler para deleteUser (usuário logado deleta a própria conta)
async function handleDeleteUser(req, res) {
    try {
        // req.id é o ID do usuário autenticado.
        const resultado = await userService.deleteUser(req.id);
        res.status(200).json(resultado);
    } catch (e) {
        if (e.message.includes("não encontrado")) {
            return res.status(404).json({ erro: e.message });
        }
        console.error("Erro no deleteUser (própria conta):", e);
        res.status(500).json({ erro: "Erro interno ao deletar conta." });
    }
}

// Handler para obter dados da própria conta (mais detalhado que perfil público)
async function handleObterPropriaConta(req, res) {
    try {
        const usuario = await userService.obterDadosPropriaConta(req.id); // req.id do authMiddleware
        res.status(200).json({ usuario });
    } catch (e) {
        if (e.message.includes("não encontrado")) {
            return res.status(404).json({ erro: e.message });
        }
        console.error("Erro ao obter dados da própria conta:", e);
        res.status(500).json({ erro: "Erro interno ao buscar dados da conta." });
    }
}

module.exports = {
    // Mantendo a nomenclatura que você pediu
    login: handleLogin,
    createUser: handleCreateUser,
    readUser: handleReadUser,     // Para /api/usuarios/:id/perfil (público)
    updateUser: handleUpdateUser, // Para /api/conta (PUT, do próprio usuário)
    deleteUser: handleDeleteUser, // Para /api/conta (DELETE, do próprio usuário)
    
    // Handler adicional para a rota /api/conta (GET)
    handleObterPropriaConta,
};
