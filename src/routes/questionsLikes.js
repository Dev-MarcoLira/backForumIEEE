const router = require('express').Router();
const LikesQuestions = require('../models/LikesQuestions');

router.get('/:questionId', async (req, res) => {
    const { questionId } = req.params;
    try {
        
        const likes = LikesQuestions.findById(questionId)

        if (!likes) {
            return res.status(404).json({ error: 'No likes found for this question' });
        }

        res.json({ likes });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Error fetching likes for question' });
    }
});

router.delete('/:questionId', async (req, res) => {
    const { questionId } = req.params;
    const userId = req.user.id;

    if(!questionId) {
        return res.status(400).json({ error: 'Question ID is required' });
    }

    try {
        const rowsAffected = await LikesQuestions.deleteLike(questionId, userId);

        if (rowsAffected === 0) {
            return res.status(404).json({ error: 'Like not found' });
        }

        res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Error deleting like' });
    }
});

module.exports = router;