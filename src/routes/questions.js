const Question = require('../models/Question.js')
const { authenticate } = require('../middleware/auth.js')

const router = require('express').Router();

router.get('/', async (req, res) => {
    try{
        const questions = await Question.findAll()
        res.json({ questions })
    }catch (error) {
        return res.status(500).json({ error: 'Error fetching questions' })
    }
})

router.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const question = await Question.findById(id)
        
        if (!question) 
            return res.status(404).json({ error: 'Question not found' })
        
        res.json({ question })
    }catch (error) {
        return res.status(500).json({ error: 'Error fetching question' })
    }
    
})

router.post('/', authenticate, async (req, res) => {
    
    const { title, content, categoryId } = req.body
    const userId = req.user.id
    
    if (!title || !content || !categoryId) {
        return res.status(400).json({ error: 'Title and content are required' })
    }
    
    try {
        const newQuestion = {
            title,
            content,
            "user_id": userId,
            "category_id": categoryId,
        }
        
        await Question.createQuestion(newQuestion)
        res.status(201).json(newQuestion)
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error creating question' })
    }
})

module.exports = router;