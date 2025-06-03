const questionService = require("../services/questionService"); // Ajuste o caminho se necessário

async function handleCreateQuestion(req, res) {
    try {
        const { title, content, categoryId } = req.body
        const userId = req.user.id; 

        const resultado = await questionService.createQuestion(title, content, categoryId, userId);
       
            res.status(201).json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message || "Erro ao criar a dúvida." });
    }
}

async function handleReadAllQuestions(req, res) {
    try {
        const resultadoPaginado = await questionService.readAllQuestions();
        res.status(200).json(resultadoPaginado);
    } catch (e) {
        res.status(500).json({ error: e.message || "Erro ao buscar as dúvidas." });
    }
}

async function handleReadQuestionById(req, res) {
    try {
        const { id } = req.params;
        
        const duvida = await questionService.readQuestionById(id);

        if (!duvida) {
            return res.status(404).json({ error: "Dúvida não encontrada." });
        }
        res.status(200).json(duvida);
    } catch (e) {
        res.status(500).json({ error: e.message || "Erro ao buscar a dúvida." });
    }
}

async function handleUpdateQuestion(req, res) {
    try {
        const { id } = req.params
        const { title, content, categoryId } = req.body
        const userId = req.user.id;

        const resultado = await questionService.updateQuestion(id, title, content, categoryId, userId);
        if (!resultado) {
            return res.status(404).json({ error: "Dúvida não encontrada." });
        }
        res.status(200).json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message || "Erro ao atualizar a dúvida." });
    }
}

async function handleDeleteQuestion(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const resultado = await questionService.deleteQuestion(id, userId);

        if(!resultado) {
            return res.status(404).json({ error: e.message || "Dúvida não encontrada." });
        }

        res.status(200).json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message || "Erro ao deletar a dúvida." });
    }
}

module.exports = {
    handleCreateQuestion,
    handleReadAllQuestions,
    handleReadQuestionById,
    handleUpdateQuestion,
    handleDeleteQuestion
};