const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const LikesQuestions = require('../models/LikesQuestions');
const Question = require('../models/Question');

router.get('/:questionId', async (req, res) => {
    const { questionId } = req.params;
    try {
        
        const likes = await LikesQuestions.findById(questionId)

        if (!likes) {
            return res.status(404).json({ error: 'No likes found for this question' });
        }

        res.json({ likes });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Error fetching likes for question' });
    }
});

router.post('/:questionId', authenticate, async (req, res) => {
    const { questionId } = req.params;

    const userId = req.user.id;

    const question = await Question.findById(questionId);

    if(!question) 
        return res.status(404).json({ error: 'Question not found' });
    
    if(await LikesQuestions.findById(questionId, userId))
        return res.status(400).json({ error: 'You have already liked this question' });

    try{
        const like = await LikesQuestions.createLike(questionId, userId);

        res.status(201).json(like);
    }catch(e){
        res.status(500).json({ error: e.message || 'Error creating like' });
    }

})

router.delete('/:questionId', authenticate, async (req, res) => {
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