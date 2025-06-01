const userService = require("../services/userService");

// Handler para createUser
async function handleCreateUser(req, res) {
    try {
        const { nome, email, senha } = req.body;
        const resultado = await userService.createUser(nome, email, senha);
        res.status(201).json(resultado);
    } catch (e) {
        if (e.message.includes("obrigat�rios") || e.message.includes("Este email j� est� cadastrado")) {
            return res.status(400).json({ erro: e.message });
        }
        console.error("Erro no createUser:", e);
        res.status(500).json({ erro: "Erro interno ao registrar usu�rio." });
    }
}

// Handler para login
async function handleLogin(req, res) {
    try {
        const { email, senha } = req.body;
        const resultado = await userService.login(email, senha);
        res.status(200).json(resultado);
    } catch (e) {
        if (e.message.includes("Credenciais inv�lidas") || e.message.includes("obrigat�rios")) {
            return res.status(401).json({ erro: "Credenciais inv�lidas." });
        }
        console.error("Erro no login:", e);
        res.status(500).json({ erro: "Erro interno ao tentar fazer login." });
    }
}

// Handler para readUser (obter perfil p�blico de um usu�rio por ID)
async function handleReadUser(req, res) {
    try {
        const { id } = req.params; // ID do usu�rio cujo perfil est� sendo visualizado
        const usuario = await userService.readUser(id);
        res.status(200).json({ usuario });
    } catch (e) {
        if (e.message.includes("n�o encontrado") || e.message.includes("obrigat�rio")) {
            return res.status(404).json({ erro: e.message });
        }
        console.error("Erro no readUser (perfil p�blico):", e);
        res.status(500).json({ erro: "Erro ao buscar perfil do usu�rio." });
    }
}

// Handler para updateUser (usu�rio logado atualiza o pr�prio perfil)
async function handleUpdateUser(req, res) {
    try {
        // req.id � o ID do usu�rio autenticado (do token)
        // req.body cont�m os dados para atualiza��o (nome, email, senha nova)
        const resultado = await userService.updateUser(req.id, req.body);
        res.status(200).json(resultado);
    } catch (e) {
        if (e.message.includes("n�o encontrado") || e.message.includes("Nenhum dado v�lido") || e.message.includes("email j� est� em uso")) {
            return res.status(400).json({ erro: e.message });
        }
        console.error("Erro no updateUser (pr�prio perfil):", e);
        res.status(500).json({ erro: "Erro interno ao atualizar perfil." });
    }
}

// Handler para deleteUser (usu�rio logado deleta a pr�pria conta)
async function handleDeleteUser(req, res) {
    try {
        // req.id � o ID do usu�rio autenticado.
        const resultado = await userService.deleteUser(req.id);
        res.status(200).json(resultado);
    } catch (e) {
        if (e.message.includes("n�o encontrado")) {
            return res.status(404).json({ erro: e.message });
        }
        console.error("Erro no deleteUser (pr�pria conta):", e);
        res.status(500).json({ erro: "Erro interno ao deletar conta." });
    }
}

// Handler para obter dados da pr�pria conta (mais detalhado que perfil p�blico)
async function handleObterPropriaConta(req, res) {
    try {
        const usuario = await userService.obterDadosPropriaConta(req.id); // req.id do authMiddleware
        res.status(200).json({ usuario });
    } catch (e) {
        if (e.message.includes("n�o encontrado")) {
            return res.status(404).json({ erro: e.message });
        }
        console.error("Erro ao obter dados da pr�pria conta:", e);
        res.status(500).json({ erro: "Erro interno ao buscar dados da conta." });
    }
}

module.exports = {
    // Mantendo a nomenclatura que voc� pediu
    login: handleLogin,
    createUser: handleCreateUser,
    readUser: handleReadUser,     // Para /api/usuarios/:id/perfil (p�blico)
    updateUser: handleUpdateUser, // Para /api/conta (PUT, do pr�prio usu�rio)
    deleteUser: handleDeleteUser, // Para /api/conta (DELETE, do pr�prio usu�rio)
    
    // Handler adicional para a rota /api/conta (GET)
    handleObterPropriaConta,
};
