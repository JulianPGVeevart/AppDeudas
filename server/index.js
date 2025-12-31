const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// Example Route
app.get('/api/app_users', async (req, res) => {
    try {
        console.log("running api query");
        const result = await pool.query('SELECT * FROM APP_USER');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));