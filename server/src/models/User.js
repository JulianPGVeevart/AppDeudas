const pool = require('#database/db');
const tables = require('#database/tables');

class User {
    // Create a new user
    static async create({ email, password }) {
        const query = `
            INSERT INTO ${tables.USER} (EMAIL, PASSWORD) 
            VALUES ($1, $2) 
            RETURNING *;
        `;
        const values = [email,password];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    //find by id and password
    static async findByEmail(email) {
        const query = `
            SELECT * FROM ${tables.USER} WHERE EMAIL = $1;
        `;
        const values = [email];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
}

module.exports = User;