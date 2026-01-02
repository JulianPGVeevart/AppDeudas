const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('#routes/userRoutes');
const debtRoutes = require('#routes/debtRoutes');

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from Vite dev server
  credentials: true
}));

app.use(express.json({ type: '*/*' }));
app.use(express.urlencoded({ extended: true }));

// Mount the modular routes
app.use('/api/', userRoutes);
app.use('/api/debts', debtRoutes);

// Global error handler to catch JSON syntax errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload. Please check your request body format.' });
    }
    next(err);
});

app.listen(5000, () => console.log('Server running on port 5000'));