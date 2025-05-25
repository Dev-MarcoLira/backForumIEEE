require('dotenv').config();
const express = require('express');
const router = require('./routes/routes.js');

const app = express();
const porta = process.env.SERVER_PORT || 3000;
const host = process.env.SERVER_HOST || 'localhost';

app.use(express.json()); // CORRIGIDO: necessário para receber JSON
app.use(router);

// Rota de teste
app.get("/", (req, res) => {
  res.send("API funcionando!");
});

app.listen(porta, host, () => {
  console.log(`Servidor rodando em http://${host}:${porta}`)
})