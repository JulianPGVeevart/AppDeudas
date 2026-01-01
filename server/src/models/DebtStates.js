const pool = require('#database/db');
const tables = require('#database/tables');

class DebtStates {
    // Get Debt States
    static async getAllDebtStates() {
        const query = `
            SELECT * FROM ${tables.DEBT_STATES};
        `;
        const { rows } = await pool.query(query);
        return rows;
    }   
}

module.exports = DebtStates;