const db = require('../db/knex.js')

const createReply = reply =>
    db('replies')
        .insert(reply)
        .then(rows => rows[0])

const deleteReply = id =>
    db('replies')
        .where({ id })
        .del()
        .then(count => count > 0)

const updateReply = (id, reply) =>
    db('replies')
        .where({ id })
        .update(reply)
        .then(count => count > 0)

const findById = id =>
    db('replies')
        .where({ id })
        .first()

const findByQuestionId = questionId =>
    db('replies')
        .where({ question_id: questionId })
        .select('id', 'content', 'user_id', 'created_at', 'updated_at')
        .then(rows => rows.map(row => ({
            id: row.id,
            content: row.content,
            userId: row.user_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        })))

const findAll = () =>
    db('replies')
        .select('id', 'content', 'question_id', 'user_id', 'created_at', 'updated_at')
        .then(rows => rows.map(row => ({
            id: row.id,
            questionId: row.question_id,
            userId: row.user_id,
            content: row.content,
            categoryId: row.category_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        })))

module.exports = {
    createReply,
    deleteReply,
    updateReply,
    findById,
    findByQuestionId,
    findAll
}