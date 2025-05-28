import { config } from "dotenv";
config()

import express from "express";
import cors from "cors";

import defaultRoutes from "./routes/default.js";
import adminRoutes from "./routes/admin.js";
import accountRoutes from "./routes/account.js";
import questionRoutes from "./routes/questions.js";
import repliesRoutes from "./routes/replies.js";
import authRoutes from "./routes/auth.js";
import categoriesRoutes from "./routes/categories.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", defaultRoutes);
app.use("/api/duvidas", questionRoutes);
app.use("/api/respostas", repliesRoutes);
app.use("/api/categorias", categoriesRoutes);
app.use("/api/auth", authRoutes);

// Protected Routes

app.use("/api/conta", accountRoutes)
app.use("/api/admin", adminRoutes)

app.listen(PORT, 
    () => console.log(`Server is running on port ${PORT}`))