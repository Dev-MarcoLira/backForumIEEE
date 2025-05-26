require("dotenv").config()
const e = require("express")
const jwt = require("jsonwebtoken")

async function autenticate(req, res, next) {
    try {
        const auth = req.headers.authorization
        if (!auth) {
            throw new Error("Token não encontrado")
        }
        const [, token] = auth.split(" ")
        jwt.verify(token, process.env.JWT_SECRET, (erro, decoded) =>{
            if (erro) {
                throw new Error("Token inválido" + erro.message)
            }else {
                req.id = decoded.id               
            }
            next()
        })
        
     }catch (e) {
        res.status(401).json({ erro: e.message });

      }
}

const requireRole = role => (req, res, next) => {
    if (req.user.role !== role)
        return res.status(403).json({ message: 'Forbidden' })
    
    next()
}


module.exports = { authenticate, requireRole };