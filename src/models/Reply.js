import db from '../db/knex.js'

export const findById = id =>
    db('replies')
        .where({ id })
        .first()

export const createReply = reply =>
    db('replies')
        .insert(reply)
        .then(rows => rows[0])

export const deleteReply = id =>
    db('replies')
        .where({ id })
        .del()
        .then(count => count > 0)

export const updateReply = (id, reply) =>
    db('replies')
        .where({ id })
        .update(reply)
        .then(count => count > 0)

export const findAll = () =>
    db('categories')
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