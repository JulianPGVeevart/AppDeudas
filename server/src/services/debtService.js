const debtModel = require('#models/Debt');
const debtStatesModel = require('#models/DebtStates');

//GET
const getAllDebtsByUserId = async (userId) => {
    try {
        const debts = await debtModel.getAllDebtsByUserId(userId);
        return debts;
    } catch (error) {
        console.error('Error getting debts:', error);
        throw error;
    }
};
exports.getAllDebtsByUserId = getAllDebtsByUserId;

const getDebtStates = async () => {
    try {
        const debtStates = await debtStatesModel.getAllDebtStates();
        return debtStates;
    } catch (error) {
        console.error('Error getting debt states:', error);
        throw error;
    }
};
exports.getDebtStates = getDebtStates;

const getDebtById = async (debtId) => {
    try {
        const debt = await debtModel.getDebtById(debtId);
        return debt;
    } catch (error) {
        console.error('Error getting debt by ID:', error);
        throw error;
    }
};
exports.getDebtById = getDebtById;


//POST
const createDebt = async (debtData) => {
    try {
        const newDebt = await debtModel.createDebt(debtData);
        return newDebt;
    } catch (error) {
        if(error.detail?.includes('Key (user_id)') && error.detail?.includes('is not present in table')) {
            error.detail = 'User does not exist';
        }
        console.error('Error creating debt:', error);
        throw error;
    }
};
exports.createDebt = createDebt;