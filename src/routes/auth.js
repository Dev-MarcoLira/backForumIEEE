import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as User from '../models/User.js'
import { v4 } from 'uuid'

const router = express.Router()

// Register route

router.post('/register', async (req, res) => {
    
    const { username, password, role } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = {
        username,
        password: hashedPassword,
        role: role || 'user',
    }

    try {
        
        await User.createUser(user)        
        res.status(201).json({ 
            username,
            role
        })
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' })
    }

})

// Login route

router.post('/login', async (req, res) => {

    const { username, password } = req.body
    
    try {
        const user = await User.findByUsername(username)
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' })

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) 
            return res.status(401).json({ error: 'Invalid credentials' })
        
        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: `${24 * 5}h` }
        )
        res.json({ token })
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' })
    }

})

export default router