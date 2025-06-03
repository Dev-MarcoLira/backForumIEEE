require('dotenv').config();
const Question = require('../models/Question');
const Category = require('../models/Category');

async function readAllQuestions(filtros = {}) {

    const questions = Question.findAll()

    return questions
}

async function createQuestion(title, content, categoryId, userId) {
    if (!descricao || !usuario_id) {
        throw new Error("Descrição e ID do usuário são obrigatórios.");
    }

    const category = Category.findById(categoryId)

    if (categoryId && !category) {
        throw new Error("Categoria fornecida não encontrada.");
    }

    const newQuestion = {
        title,
        content,
        "category_id": categoryId,
        "user_id": userId
    };

    Question.create(newQuestion)

    return { message: "Dúvida criada com sucesso", question: newQuestion };
}

async function readQuestionById(id) {
    
    try{

        const category = Category.findById(id)
        if (!category) {
            throw new Error("Dúvida não encontrada.");
        }
    }catch(e){
        throw new Error("Erro ao buscar a dúvida: " + e.message);
    }

}

async function updateQuestion(id, title, content, categoryId, userId) {
    
    const question = Question.findById(id)

    if (!question) 
        throw new Error("Dúvida não encontrada.");

    if(question.user_id !== userId) 
        throw new Error("Usuário não autorizado a atualizar esta dúvida.");
    
    const updatedQuestion = {
        title,
        content,
        category_id: categoryId,
    };

    Question.updateQuestion(id, updatedQuestion);
    return { message: "Dúvida atualizada com sucesso.", question: updatedQuestion };
}

async function deleteQuestion(id, userId) {

    const question = Question.findById(id);

    if (!question) 
        throw new Error("Dúvida não encontrada.");
    

    if (question.user_id !== userId) 
        throw new Error("Usuário não autorizado a deletar esta dúvida.");
    
    Question.deleteQuestion(id);
    
    return { message: "Dúvida deletada com sucesso." };
}

module.exports = {
    readAllQuestions,
    createQuestion,
    readQuestionById,
    updateQuestion,
    deleteQuestion
};