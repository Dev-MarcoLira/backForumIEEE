const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User.js')

const router = require('express').Router()

// Register route

router.post('/register', async (req, res) => {
    
    const { name, username, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = {
        name,
        username,
        password: hashedPassword,
        role: 'user', 
        /* Por padrão é sempre user. Para ser adm, vamos alterar via banco de dados... 
        Mas isso não vai ser implementado agora...*/
    }

    try {
        
        await User.createUser(user)        
        res.status(201).json({ 
            username,
            role
        })
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error creating user' })
    }

})

// Login route

router.post('/login', async (req, res) => {

    const { username, password } = req.body
    
    try {
        const user = await User.findByUsername(username)
        if (!user)
            return res.status(401).json({ error: 'User does not exist' })

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
        res.status(500).json({ error: error.message || 'Error logging in' })
    }

})

module.exports = router