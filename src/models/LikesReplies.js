const db = require('../db/knex');

const findById = id =>
    db('replies_likes')
        .where({ reply_id: id })
        .count('user_id as likesCount')
        .then(rows => {
            if (rows.length === 0) {
                return 0; // No likes found
            }
            return rows[0].likesCount;
        })

const createLike = (replyId, userId) =>
    db('replies_likes')
        .insert({ reply_id: replyId, user_id: userId })
        .then(() => ({ replyId, userId }));

const deleteLike = (replyId, userId) =>
    db('replies_likes')
        .where({ reply_id: replyId, user_id: userId })
        .del()
        .then(rowsAffected => {
            if (rowsAffected === 0) {
                throw new Error('Like not found');
            }
            return rowsAffected;
        });

module.exports = {
    findById,
    createLike,
    deleteLike
};