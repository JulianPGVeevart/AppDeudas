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
    
    static async getDebtsByStateAndUser(userId, stateId) {
        const query = `
            SELECT * FROM ${tables.DEBT} WHERE USER_ID = $1 AND STATE_ID = $2;
        `;
        const values = [userId, stateId];
        const { rows } = await pool.query(query, values);
        return rows;
    }

    static async getDebtById(debtId, userId) {
        //validate user ownership when consulting details from debts that are only theirs
        const query = `
            SELECT * FROM ${tables.DEBT} WHERE ID = $1 AND USER_ID = $2;
        `;
        const values = [debtId, userId];
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

    static async deleteDebt(debtId, userId) {
        const query = `
            DELETE FROM ${tables.DEBT} WHERE ID = $1 AND USER_ID = $2;
        `;
        const values = [debtId, userId];
        const { rowCount } = await pool.query(query, values);
        return rowCount;
    }

    //PUT
    static async updateDebt(debtData) {
        //Paid debts must not be modified
        //validate the userId to avoid updating others debts
        const PAID_STATE_ID = 3;
        const query = `
            UPDATE ${tables.DEBT}
            SET AMOUNT = $1, STATE_ID = $2
            WHERE ID = $3 AND STATE_ID != ${PAID_STATE_ID} AND USER_ID = $4
            RETURNING *;
        `;
        const values = [debtData.amount, debtData.state_id, debtData.id, debtData.user_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
}

module.exports = Debt;