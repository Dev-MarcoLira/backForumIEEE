const db = require('../db/knex.js')

const findById = id =>
    db('categories')
        .where({ id })
        .first()

const createCategory = category =>
    db('categories')
        .insert(category)
        .then(rows => rows[0])

const deleteCategory = id =>
    db('categories')
        .where({ id })
        .del()
        .then(count => count > 0)

const updateCategory = (id, category) =>
    db('categories')
        .where({ id })
        .update(category)
        .then(count => count > 0)

const findAll = () =>
    db('categories')
        .select('id', 'description', 'created_at', 'updated_at')
        .then(rows => rows.map(row => ({
            id: row.id,
            description: row.description,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        })))

module.exports = {
    findById,
    createCategory,
    deleteCategory,
    updateCategory,
    findAll
}