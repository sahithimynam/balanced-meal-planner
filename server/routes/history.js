const express = require('express');
const router = express.Router();
const DietHistory = require('../models/DietHistory');
const { protect } = require('../middleware/auth');

// All history routes are protected
router.use(protect);

// @route   POST /api/history
// @desc    Save completed diet analysis
// @access  Private
router.post('/', async (req, res) => {
    try {
        const {
            ingredients,
            rawIngredientsText,
            dietScore,
            presentNutrients,
            missingNutrients,
            presentNutrientsDetails,
            recommendations
        } = req.body;

        if (!ingredients || ingredients.length === 0 || dietScore === undefined) {
            return res.status(400).json({ message: 'Ingredients and dietScore are required' });
        }

        const newRecord = await DietHistory.create({
            userId: req.user.id,
            ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
            rawIngredientsText: rawIngredientsText || (Array.isArray(ingredients) ? ingredients.join(', ') : ingredients),
            dietScore,
            presentNutrients: presentNutrients || [],
            missingNutrients: missingNutrients || [],
            presentNutrientsDetails: presentNutrientsDetails || {},
            recommendations: recommendations || []
        });

        res.status(201).json({
            success: true,
            message: 'Diet analysis saved successfully',
            record: newRecord
        });
    } catch (error) {
        console.error('Save history error:', error.message);
        res.status(500).json({ message: error.message || 'Server error saving diet history' });
    }
});

// @route   GET /api/history
// @desc    Get all diet analysis history for current user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const history = await DietHistory.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: history.length,
            history
        });
    } catch (error) {
        console.error('Get history error:', error.message);
        res.status(500).json({ message: 'Server error retrieving diet history' });
    }
});

// @route   GET /api/history/:id
// @desc    Get single diet analysis by id
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const record = await DietHistory.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!record) {
            return res.status(404).json({ message: 'History record not found' });
        }

        res.json({
            success: true,
            record
        });
    } catch (error) {
        console.error('Get single record error:', error.message);
        res.status(500).json({ message: 'Server error retrieving record' });
    }
});

module.exports = router;
