const debtModel = require('#models/Debt');
const debtStatesModel = require('#models/DebtStates');

//GET
const getAllDebtsByUserId = async (userId) => {
    try {
        const debts = await debtModel.getAllDebtsByUserId(userId);
        return debts;
    } catch (error) {
        throw error;
    }
};
exports.getAllDebtsByUserId = getAllDebtsByUserId;

const getDebtsByStateAndUser = async (userId, stateId) => {
    try {
        const debts = await debtModel.getDebtsByStateAndUser(userId, stateId);
        return debts;
    } catch (error) {
        throw error;
    }
};
exports.getDebtsByStateAndUser = getDebtsByStateAndUser;

const getDebtStates = async () => {
    try {
        const debtStates = await debtStatesModel.getAllDebtStates();
        return debtStates;
    } catch (error) {
        throw error;
    }
};
exports.getDebtStates = getDebtStates;

const getDebtById = async (debtId, userId) => {
    try {
        const debt = await debtModel.getDebtById(debtId, userId);
        return debt;
    } catch (error) {
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
        throw error;
    }
};
exports.createDebt = createDebt;

const deleteDebt = async (debtId, userId) => {
    try {
        const result = await debtModel.deleteDebt(debtId, userId);
        return result;
    } catch (error) {
        throw error;
    }
};
exports.deleteDebt = deleteDebt;

//PUT
const updateDebt = async (debtData) => {
    try {
        const updatedDebt = await debtModel.updateDebt(debtData);
        return updatedDebt;
    } catch (error) {
        throw error;
    }
};
exports.updateDebt = updateDebt;