const express = require('express')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const router = express.Router()

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Register Route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(201).json({ message: 'User registered successfully', data });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ message: error.message });
    }
    res.status(200).json({ message: 'Login successful', data });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Validate Token (Optional)
router.get('/validate', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data) {
      return res.status(401).json({ message: 'Invalid or expired token.' })
    }
    res.status(200).json({ message: 'Token is valid', user: data })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message })
  }
})

module.exports = router
