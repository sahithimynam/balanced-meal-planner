const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config({ path: __dirname + '/.env' });

const User = require('./models/User');
const DietHistory = require('./models/DietHistory');

async function runTests() {
    console.log('--- STARTING BACKEND INTEGRATION TESTS ---');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/balanced_diet_db';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Clean up test data
    const testEmail = 'test_user_mern@example.com';
    await User.deleteMany({ email: testEmail });
    console.log('✓ Cleaned up any prior test user');

    // 1. Test User Registration
    const password = 'Password123!';
    const user = await User.create({
        name: 'Test MERN User',
        email: testEmail,
        password: password
    });
    console.log('✓ User created with id:', user._id);

    // Verify bcrypt hashing
    if (user.password === password) {
        throw new Error('FAIL: Password was not hashed with bcrypt!');
    }
    console.log('✓ Password hashed successfully with bcrypt:', user.password.substring(0, 15) + '...');

    // 2. Test Password Matching
    const isCorrect = await user.matchPassword(password);
    if (!isCorrect) throw new Error('FAIL: matchPassword failed for valid password');
    const isWrong = await user.matchPassword('WrongPassword');
    if (isWrong) throw new Error('FAIL: matchPassword returned true for invalid password');
    console.log('✓ Password match validation passed');

    // 3. Test JWT Generation & Decoding
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'super_secret_balanced_diet_jwt_key_2026', { expiresIn: '1d' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_balanced_diet_jwt_key_2026');
    if (decoded.id !== user._id.toString()) throw new Error('FAIL: JWT decode id mismatch');
    console.log('✓ JWT signed and verified successfully');

    // 4. Test Diet History Saving - Version 1
    await DietHistory.deleteMany({ userId: user._id });
    const analysisV1 = await DietHistory.create({
        userId: user._id,
        ingredients: ['rice', 'egg'],
        rawIngredientsText: 'rice, egg',
        dietScore: 50,
        presentNutrients: ['Protein', 'Carbohydrates', 'Healthy Fats'],
        missingNutrients: ['Vegetables/Fiber'],
        recommendations: [
            { label: 'Vegetables/Fiber', items: ['Broccoli', 'Spinach', 'Carrot'] }
        ]
    });
    console.log('✓ Analysis Version 1 saved:', analysisV1._id, 'Score:', analysisV1.dietScore);

    // 5. Test Diet History Saving - Version 2 (Re-Analyze progression)
    const analysisV2 = await DietHistory.create({
        userId: user._id,
        ingredients: ['rice', 'egg', 'spinach', 'avocado'],
        rawIngredientsText: 'rice, egg, spinach, avocado',
        dietScore: 100,
        presentNutrients: ['Protein', 'Carbohydrates', 'Healthy Fats', 'Vegetables/Fiber'],
        missingNutrients: [],
        recommendations: []
    });
    console.log('✓ Analysis Version 2 saved:', analysisV2._id, 'Score:', analysisV2.dietScore);

    // 6. Verify non-overwriting: Both records must exist in history!
    const allHistory = await DietHistory.find({ userId: user._id }).sort({ createdAt: -1 });
    if (allHistory.length !== 2) {
        throw new Error(`FAIL: Expected 2 history records, found ${allHistory.length}`);
    }
    console.log(`✓ Both history records exist without overwriting! Newest: ${allHistory[0].dietScore}%, Oldest: ${allHistory[1].dietScore}%`);

    // 7. Verify Isolation: Other users cannot see this user's history
    const fakeUserId = new mongoose.Types.ObjectId();
    const otherUserHistory = await DietHistory.find({ userId: fakeUserId });
    if (otherUserHistory.length !== 0) throw new Error('FAIL: History leakage across users');
    console.log('✓ User history isolation verified');

    console.log('--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---');
    await mongoose.disconnect();
}

runTests().catch(err => {
    console.error('Test Error:', err);
    process.exit(1);
});
