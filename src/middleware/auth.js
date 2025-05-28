require("dotenv").config();
const jwt = require("jsonwebtoken");

async function autentican(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ erro: "Token de autenticação não fornecido." });
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
            return res.status(401).json({ erro: "Formato do token inválido. Use o formato 'Bearer <token>'." });
        }
        const token = parts[1];

        jwt.verify(token, process.env.JWT_SECRET, (erro, decoded) => {
            if (erro) {
                if (erro.name === 'TokenExpiredError') {
                    return res.status(401).json({ erro: "Token expirado. Por favor, faça login novamente." });
                }
                if (erro.name === 'JsonWebTokenError') {
                    return res.status(401).json({ erro: "Token inválido ou malformado." });
                }
                return res.status(401).json({ erro: "Falha na autenticação do token." });
            } else {
                req.id = decoded.id; // ID do usuário do payload do token
                req.user = decoded; // Anexa todo o payload decodificado, pode ser útil
                next();
            }
        });
    } catch (e) {
        console.error("Erro inesperado no middleware de autenticação:", e);
        res.status(500).json({ erro: "Erro interno no servidor durante a autenticação." });
    }
}
module.exports = autentican
