const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount the modular routes
app.use('/api/', userRoutes);

// Global error handler to catch JSON syntax errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload. Please check your request body format.' });
    }
    next(err);
});

app.listen(5000, () => console.log('Server running on port 5000'));