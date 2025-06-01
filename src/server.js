require('dotenv').config();
const express = require('express');
const router = require('./routes/routes.js');
const duvidaRoutes = require('./routes/duvidasroutes.js'); 
const categoriaRoutes = require('./routes/categoriaRoutes.js')
const respostaRoutes = require("./routes/respostaRoutes.js");
const curtidaRoutes = require("./routes/curtidaRoutes.js"); // Importando as rotas de curtidas

const app = express();
const porta = process.env.SERVER_PORT || 3000;
const host = process.env.SERVER_HOST || 'localhost';

app.use(express.json()); 

app.use(router);   
app.use(duvidaRoutes); 
app.use(categoriaRoutes);
app.use(respostaRoutes);
app.use(curtidaRoutes); // Registrando as rotas de curtidas


app.get("/", (req, res) => {
    res.send(`API funcionando e ouvindo em http://${host}:${porta}`);
});

app.use((err, req, res, next) => {
    console.error("Erro não capturado:", err.message);
    console.error(err.stack);
    if (!res.headersSent) { 
        res.status(500).send({ erro: 'Ocorreu um erro inesperado no servidor.' });
    }
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
