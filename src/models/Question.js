import db from '../db/knex.js'

export const findById = id =>
    db('questions')
        .where({ id })
        .first()

export const createQuestion = question =>
    db('questions')
        .insert(question)
        .then(rows => rows[0])

export const deleteQuestion = id =>
    db('questions')
        .where({ id })
        .del()
        .then(count => count > 0)

export const updateQuestion = (id, question) =>
    db('questions')
        .where({ id })
        .update(question)
        .then(count => count > 0)

export const findByCategoryName = categoryName =>
    db('questions')
        .join('categories', 'questions.category_id', 'categories.id')
        .where('categories.description', categoryName)
        .select('questions.*')
        .then(rows => rows)

export const findAll = () =>
    db('questions')
        .join('categories', 'questions.category_id', 'categories.id')
        .select('id', 'title', 'category_id', 'content', 'created_at', 'updated_at',
             'categories.description as category_description')
        .then(rows => rows.map(row => ({
            id: row.id,
            title: row.title,
            content: row.content,
            categoryId: row.category_id,
            categoryDescription: row.category_description,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        })))