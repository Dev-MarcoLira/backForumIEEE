import express from 'express'
import * as Question from '../models/Question.js'
import { authenticate } from '../middleware/auth.js'
import { v4 } from 'uuid'

const router = express.Router()

router.get('/', (req, res) => {
    try{
        const questions = Question.findAll()
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

    const { title, content, userId } = req.body
    // const userId = req.user.id

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' })
    }

    try {
        const newQuestion = {
            title,
            content,
            "user_id": userId
        }
        
        await Question.createQuestion(newQuestion)
        res.status(201).json(newQuestion)
    } catch (error) {
        res.status(500).json({ error: 'Error creating question' })
    }
})

export default router