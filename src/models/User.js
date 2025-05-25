import db from '../db/knex.js'

export const findByUsername = username => 
    db('users')
        .where({ username })
        .first()

export const createUser = user => 
    db('users')
        .insert(user)
        .then(rows => rows[0])