const router = require('express').Router();
const LikesReplies = require('../models/LikesReplies');

router.get('/:replyId', async (req, res) => {
    const { replyId } = req.params;
    try {
        
        const likes = LikesReplies.findById(replyId)

        if (!likes) {
            return res.status(404).json({ error: 'No likes found for this Reply' });
        }

        res.json({ likes });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Error fetching likes for Reply' });
    }
});

router.delete('/:replyId', async (req, res) => {
    const { replyId } = req.params;
    const userId = req.user.id;

    if(!replyId) {
        return res.status(400).json({ error: 'Reply ID is required' });
    }

    try {
        const rowsAffected = await LikesReplies.deleteLike(replyId, userId);

        if (rowsAffected === 0) {
            return res.status(404).json({ error: 'Like not found' });
        }

        res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Error deleting like' });
    }
});

module.exports = router;