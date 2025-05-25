require("dotenv").config()
const e = require("express")
const jwt = require("jsonwebtoken")

async function autentican(req, res, next) {
   

    try {
        const auth = req.headers.authorization
        if (!auth) {
            throw new Error("Token n�o encontrado")
        }
        const [, token] = auth.split(" ")
        jwt.verify(token, process.env.JWT_SECRET, (erro, decoded) =>{
            if (erro) {
                throw new Error("Token inv�lido" + erro.message)
            }else {
                req.id = decoded.id               
            }
            next()
        })
        
     }catch (e) {
        res.status(401).json({ erro: e.message });

}
}
module.exports = autentican


