import db from '../db/knex.js'

export const findById = id =>
    db('categories')
        .where({ id })
        .first()

export const createCategory = category =>
    db('categories')
        .insert(category)
        .then(rows => rows[0])

export const deleteCategory = name =>
    db('categories')
        .where({ description: name })
        .del()
        .then(count => count > 0)

export const updateCategory = (name, category) =>
    db('categories')
        .where({ description: name })
        .update(category)
        .then(count => count > 0)

export const findAll = () =>
    db('categories')
        .select('id', 'description', 'created_at', 'updated_at')
        .then(rows => rows.map(row => ({
            id: row.id,
            description: row.description,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        })))