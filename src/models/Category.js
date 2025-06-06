const db = require('../db/knex.js'); // Verifique se o caminho está correto

// 1. Criamos um objeto principal para agrupar todas as funções.
const Category = {

    async create(categoryData) {
        try {
            const [id] = await db('categories').insert(categoryData);
            return db('categories').where({ id }).first();
        } catch (error) {
            throw error;
        }
    },

    async findById(id) {
        return db('categories').where({ id }).first();
    },

    async findAll() {
        return db('categories').select('*').orderBy('description');
    },

    async update(id, categoryData) {
        const count = await db('categories').where({ id }).update(categoryData);
        return count > 0; // Retorna true se atualizou, false se não
    },

    async delete(id) {
        const count = await db('categories').where({ id }).del();
        return count > 0; // Retorna true se deletou, false se não
    }
};

module.exports = Category;