const router = require('express').Router() 
//const router = express.Router() //erro aqui
const userControlle = require("../controller/userControlle")
const auth = require("../middleware/auth")
router.get("/ver/usuarios", userControlle.readUser)
router.post("/login", userControlle.login)
router.post("/criar/usuario", userControlle.createUser)
router.patch("/atualizar/usuario/:id", userControlle.updateUser)
router.delete("/deletar/usuario/:id", userControlle.deleteUser)

module.exports = router


