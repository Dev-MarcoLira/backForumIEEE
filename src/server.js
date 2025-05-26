require('dotenv').config();

const express = require("express");
const cors = require("cors");

const defaultRoutes = require("./routes/default.js");
const protectedRoutes = require("./routes/protected.js");
const accountRoutes = require("./routes/account.js");
const questionRoutes = require("./routes/questions.js");
const authRoutes = require("./routes/auth.js");

const PORT = process.env.SERVER_PORT || 3000;
const HOST = process.env.SERVER_HOST || 'localhost';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", defaultRoutes);
app.use("/api/duvidas", questionRoutes);

// Authentication Routes
app.use("/api/auth", authRoutes);

// Protected Routes

app.use("/api/conta", accountRoutes)
app.use("/api/admin", protectedRoutes)

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`)
})