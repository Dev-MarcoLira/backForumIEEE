require("dotenv").config();

const express = require("express")
const cors = require("cors")

const defaultRoutes = require("./routes/default.js")
const adminRoutes = require("./routes/admin.js")
const accountRoutes = require("./routes/account.js")
const questionRoutes = require("./routes/questions.js")
const repliesRoutes = require("./routes/replies.js")
const authRoutes = require("./routes/auth.js")
const categoriesRoutes = require("./routes/categories.js")

const PORT = process.env.PORT || 3000;

const app = express();
const porta = process.env.SERVER_PORT || 3000;
const host = process.env.SERVER_HOST || 'localhost';

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