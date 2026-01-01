const pool = require('#database/db');
const tables = require('#database/tables');

class Debt {
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
}

module.exports = Debt;