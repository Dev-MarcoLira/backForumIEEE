import db from '../db/knex.js'

export const findByName = name =>
    db('categories')
        .where({ description: name })
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