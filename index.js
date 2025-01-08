const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const authRoutes = require('./routes/auth') // Import auth routes

const app = express()

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Middleware for Token Validation
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data) {
      return res.status(401).json({ message: 'Invalid or expired token.' })
    }

    req.user = data // Attach user info to the request object
    next() // Pass control to the next middleware or route handler
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

// Routes
// Landing Page
app.get('/', (req, res) => {
  res.send('Welcome to Insta Posts API')
})

// Connect Auth Routes
app.use('/api/auth', authRoutes)

// Protected Home Route
app.get('/api/home', authMiddleware, (req, res) => {
  res.json({ message: 'Welcome to the Home Page', user: req.user })
})

// Start the Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
