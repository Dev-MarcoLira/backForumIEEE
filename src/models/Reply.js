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