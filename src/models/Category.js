const db = require('../db/knex.js'); // Verifique se o caminho está correto

// 1. Criamos um objeto principal para agrupar todas as funções.
const Category = {

    // 2. Definimos a função 'create' com o nome que a rota espera.
    // Usamos 'async/await' que é mais moderno e limpo que '.then()'.
    async create(categoryData) {
        try {
            // 'categoryData' será o objeto { description: "..." }
            const [id] = await db('categories').insert(categoryData);
            return db('categories').where({ id }).first();
        } catch (error) {
            // Re-lança o erro para ser capturado pelo 'catch' do controller.
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

// 3. Exportamos o objeto 'Category' completo.
module.exports = Category;