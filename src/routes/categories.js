import express from 'express'
import * as Category from '../models/Category.js'
import { authenticate } from '../middleware/auth.js'
import { v4 } from 'uuid'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll()
        res.json({ categories })
    } catch (error) {
        res.status(500).json({ error: 'Error fetching categories' })
    }
})

router.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const category = await Category.findById(id)

        if (!category) 
            return res.status(404).json({ error: 'Category not found' })
        
        res.json({ category })
    } catch (error) {
        res.status(500).json({ error: 'Error fetching category' })
    }
})

router.post('/', authenticate, async (req, res) => {
    const { name } = req.body

    if (!name) {
        return res.status(400).json({ error: 'Name is required' })
    }

    try {
        const newCategory = {
            description: name,
        }
        
        await Category.createCategory(newCategory)
        res.status(201).json(newCategory)
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error creating category' })
    }
})

export default router