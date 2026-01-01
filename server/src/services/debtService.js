const debtModel = require('#models/Debt');
const debtStatesModel = require('#models/DebtStates');

const getAllDebtsByUserId = async (userId) => {
    try {
        const debts = await debtModel.getAllDebtsByUserId(userId);
        return debts;
    } catch (error) {
        console.error('Error getting debts:', error);
        throw error;
    }
};

const getDebtStates = async () => {
    try {
        const debtStates = await debtStatesModel.getAllDebtStates();
        return debtStates;
    } catch (error) {
        console.error('Error getting debt states:', error);
        throw error;
    }
};

const getDebtById = async (debtId) => {
    try {
        const debt = await debtModel.getDebtById(debtId);
        return debt;
    } catch (error) {
        console.error('Error getting debt by ID:', error);
        throw error;
    }
};


exports.getAllDebtsByUserId = getAllDebtsByUserId;
exports.getDebtStates = getDebtStates;
exports.getDebtById = getDebtById;