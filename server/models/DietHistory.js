const mongoose = require('mongoose');

const dietHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    ingredients: {
        type: [String],
        required: [true, 'Ingredients are required']
    },
    rawIngredientsText: {
        type: String,
        default: ''
    },
    dietScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    presentNutrients: {
        type: [String],
        default: []
    },
    missingNutrients: {
        type: [String],
        default: []
    },
    presentNutrientsDetails: {
        type: Map,
        of: [String],
        default: {}
    },
    recommendations: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DietHistory', dietHistorySchema);
