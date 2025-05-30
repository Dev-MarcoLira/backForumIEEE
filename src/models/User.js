const db = require('../db/knex.js')

const findByUsername = username => 
    db('users')
        .where({ username })
        .first()

const createUser = user => 
    db('users')
        .insert(user)
        .then(rows => rows[0])

const deleteUser = username =>
    db('users')
        .where({ username })
        .del()
        .then(count => count > 0)

const updateUser = (username, user) =>
    db('users')
        .where({ username })
        .update(user)
        .then(count => count > 0)

const findAll = () =>
    db('users')
        .select('id', 'name', 'username', 'created_at', 'updated_at')
        .then(rows => rows.map(row => ({
            id: row.id,
            name: row.name,
            username: row.username,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        })))

module.exports = {
    findByUsername,
    createUser,
    deleteUser,
    updateUser,
    findAll
}