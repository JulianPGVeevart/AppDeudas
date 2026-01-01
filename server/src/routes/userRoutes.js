const express = require('express');
const router = express.Router();
const userController = require('#controllers/userController');

// GET /api connection test
router.get('/', (_, res) => {
    res.json({ message: 'Welcome to the API!' });
});

router.post('/login', userController.findUserWithCredentials);
router.post('/register', userController.createUser);

module.exports = router;