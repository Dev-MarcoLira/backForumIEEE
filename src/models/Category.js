const db = require('../db/knex.js')

const findById = id =>
    db('categories')
        .where({ id })
        .first()

const createCategory = category =>
    db('categories')
        .insert(category)
        .then(rows => rows[0])

const deleteCategory = name =>
    db('categories')
        .where({ description: name })
        .del()
        .then(count => count > 0)

const updateCategory = (name, category) =>
    db('categories')
        .where({ description: name })
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