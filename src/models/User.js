import db from '../db/knex.js'

export const findByUsername = username => 
    db('users')
        .where({ username })
        .first()

export const createUser = user => 
    db('users')
        .insert(user)
        .then(rows => rows[0])

export const deleteUser = username =>
    db('users')
        .where({ username })
        .del()
        .then(count => count > 0)

export const updateUser = (username, user) =>
    db('users')
        .where({ username })
        .update(user)
        .then(count => count > 0)