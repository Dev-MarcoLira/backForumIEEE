import express from 'express'
import * as Reply from '../models/Reply.js'
import { authenticate } from '../middleware/auth.js';
import { v4 } from 'uuid';

const router = express.Router()

router.get('/', (req, res) => {
    try {
        const replies = Reply.findAll()
        res.json({ replies })
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching replies' })
    }
})

router.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const reply = await Reply.findById(id)
        if (!reply) 
            return res.status(404).json({ error: 'Reply not found' })
        
        res.json({ reply })
    }catch (error) {
        return res.status(500).json({ error: 'Error fetching reply' })
    }

})

router.post('/', authenticate, async (req, res) => {

    const { content, questionId } = req.body
    const userId = req.user.id

    if (!content || !questionId) {
        return res.status(400).json({ error: 'Content and questionId are required' })
    }

    try {
        const newReply = {
            content,
            "question_id": questionId,
            "user_id": userId
        }
        
        await Reply.createReply(newReply)
        res.status(201).json(newReply)
    } catch (error) {
        res.status(500).json({ error: 'Error creating reply' })
    }
})

export default router