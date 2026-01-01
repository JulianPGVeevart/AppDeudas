const pool = require('#database/db');
const tables = require('#database/tables');

class Debt {
    //GET
    static async getAllDebtsByUserId(userId) {
        const query = `
            SELECT * FROM ${tables.DEBT} WHERE USER_ID = $1;
        `;
        const values = [userId];
        const { rows } = await pool.query(query,values);
        return rows;
    }

    static async getDebtById(debtId) {
        const query = `
            SELECT * FROM ${tables.DEBT} WHERE ID = $1;
        `;
        const values = [debtId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    //POST
    static async createDebt(debtData) {
        const query = `
            INSERT INTO ${tables.DEBT} (USER_ID, AMOUNT, CREATION_DATE, STATE_ID)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [debtData.user_id, debtData.amount, debtData.creation_date, debtData.state_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
}

module.exports = Debt;