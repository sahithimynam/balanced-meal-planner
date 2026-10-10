const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_balanced_diet_jwt_key_2026', {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/signup
// @desc    Register a new user & auto-login
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check email uniqueness
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        // Create user (bcrypt pre-save hook handles hashing)
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password
        });

        // Automatic login: generate token immediately
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
});

// @route   POST /api/auth/signin
// @desc    Authenticate user & get token
// @access  Public
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Signed in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Signin error:', error.message);
        res.status(500).json({ message: error.message || 'Server error during sign in' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile for persistent login validation
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
});

module.exports = router;
