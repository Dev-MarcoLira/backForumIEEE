const db = require('../db/knex.js')

const findById = id =>
    db('questions')
        .where({ id })
        .first()
        .then(row => {
            if (!row) return null
            return {
                id: row.id,
                title: row.title,
                categoryId: row.category_id,
                category: row.category_description,
                content: row.content,
                solved: row.solved,
                userId: row.user_id,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }
        })

const createQuestion = question =>
    db('questions')
        .insert(question)
        .then(rows => rows[0])

const resolveQuestion = id =>
    db('questions')
        .where({ id })
        .update({ solved: true })
        .then(count => count > 0 ? findById(id) : null)

const deleteQuestion = id =>
    db('questions')
        .where({ id })
        .del()
        .then(count => count > 0)

const updateQuestion = (id, question) =>
    db('questions')
        .where({ id })
        .update(question)
        .then(count => count > 0)

const findByCategoryName = categoryName =>
    db('questions')
        .join('categories', 'questions.category_id', 'categories.id')
        .where('categories.description', categoryName)
        .select('questions.*')
        .then(rows => rows)

const findAll = () =>
    db('questions as q')
        .innerJoin('categories as c', 'q.category_id', 'c.id')
        .select(
            'q.id', 
            'q.title', 
            'q.category_id',
            'c.description as category_description', 
            'q.content',
            'q.solved',
            'q.user_id',
            'q.created_at', 
            'q.updated_at'
        )
        .then(rows => rows.map(row => ({
            id: row.id,
            title: row.title,
            categoryId: row.category_id,
            category: row.category_description,
            content: row.content,
            solved: row.solved,
            createdAt: row.created_at,
            userId: row.user_id,
            updatedAt: row.updated_at
        })))

module.exports = {
    findById,
    createQuestion,
    deleteQuestion,
    updateQuestion,
    findByCategoryName,
    findAll,
    resolveQuestion
}