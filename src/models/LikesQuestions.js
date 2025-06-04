const db = require('../db/knex');

const findById = id =>
    db('questions_likes')
        .where({ question_id: id })
        .count('user_id as likesCount')
        .then(rows => {
            if (rows.length === 0) {
                return 0; // No likes found
            }
            return rows[0].likesCount;
        })

const createLike = (questionId, userId) =>
    db('questions_likes')
        .insert({ question_id: questionId, user_id: userId })
        .then(rows => {
            if (rows.length === 0) {
                throw new Error('Error creating like');
            }
            return rows[0];
        });

const deleteLike = (questionId, userId) =>
    db('questions_likes')
        .where({ question_id: questionId, user_id: userId })
        .del()
        .then(rowsAffected => {
            if (rowsAffected === 0) {
                throw new Error('Like not found');
            }
            return rowsAffected;
        });

module.exports = {
    findById,
    deleteLike,
    createLike
};