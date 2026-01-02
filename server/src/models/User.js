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
    static async findUserWithCredentials(email, password) {
        const query = `
            SELECT Id FROM ${tables.USER} WHERE EMAIL = $1 AND PASSWORD = $2;
        `;
        const values = [email, password];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
}

module.exports = User;