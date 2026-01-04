const debtModel = require('#models/Debt');
const debtStatesModel = require('#models/DebtStates');
const cacheClient = require('#utils/redisClient');

//GET
const getAllDebtsByUserId = async (userId) => {
    try {
        //get from cache
        if(useCache()) {
            const cachedDebts = await cacheClient.get(`debts:${userId}`);
            if (cachedDebts) {
                return JSON.parse(cachedDebts);
            }
        }

        //get from database
        const debts = await debtModel.getAllDebtsByUserId(userId);

        //set in cache
        if(useCache()){
            await cacheClient.set(`debts:${userId}`, JSON.stringify(debts), 'EX', 3600); // Cache for 1 hour
        }
        
        return debts;
    } catch (error) {
        throw error;
    }
};
exports.getAllDebtsByUserId = getAllDebtsByUserId;

const getDebtsByStateAndUser = async (userId, stateId) => {
    try {
        if(useCache()){
            const cachedDebts = await cacheClient.get(`debts:${userId}:${stateId}`);
            if (cachedDebts) {
                return JSON.parse(cachedDebts);
            }
        }

        const debts = await debtModel.getDebtsByStateAndUser(userId, stateId);

        if(useCache()){
            await cacheClient.set(`debts:${userId}:${stateId}`, JSON.stringify(debts), 'EX', 3600); // Cache for 1 hour
        }
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
        if(useCache()){
            const cachedDebt = await cacheClient.get(`debt:${debtId}:${userId}`);
            if (cachedDebt) {
                return JSON.parse(cachedDebt);
            }
        }

        const debt = await debtModel.getDebtById(debtId, userId);
        if(useCache()){
            await cacheClient.set(`debt:${debtId}:${userId}`, JSON.stringify(debt), 'EX', 3600); // Cache for 1 hour
        }

        return debt;
    } catch (error) {
        throw error;
    }
};
exports.getDebtById = getDebtById;

const getAmountSumsByState = async (userId) => {
    try {
        if(useCache()){
            const cachedAmountSums = await cacheClient.get(`amountSums:${userId}`);
            if (cachedAmountSums) {
                return JSON.parse(cachedAmountSums);
            }
        }

        const amountSums = await debtModel.getAmountSumsByState(userId);

        if(useCache()) {
            await cacheClient.set(`amountSums:${userId}`, JSON.stringify(amountSums), 'EX', 3600); // Cache for 1 hour
        }

        return amountSums;
    } catch (error) {
        throw error;
    }
};
exports.getAmountSumsByState = getAmountSumsByState;

//POST
const createDebt = async (debtData) => {
    try {
        const newDebt = await debtModel.createDebt(debtData);

        if(useCache()) {
            await cacheClient.del(`debts:${debtData.user_id}`);
            await cacheClient.del(`debts:${debtData.user_id}:${newDebt.state_id}`);
            await cacheClient.del(`amountSums:${debtData.user_id}`);
        }
        return newDebt;
    } catch (error) {
        if(error.detail?.includes('Key (user_id)') && error.detail?.includes('is not present in table')) {
            error.detail = 'User does not exist';
        }
        throw error;
    }
};
exports.createDebt = createDebt;

const deleteDebt = async (debtInfo) => {
    try {
        const { id, userId, stateId } = debtInfo;
        const result = await debtModel.deleteDebt(id, userId);
        if(useCache()) {
            await cacheClient.del(`debts:${userId}`);
            await cacheClient.del(`debts:${userId}:${stateId}`);
            await cacheClient.del(`debt:${id}:${userId}`);
            await cacheClient.del(`amountSums:${userId}`);
        }
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

        if(useCache()) {
            await cacheClient.del(`debts:${updatedDebt.user_id}`);
            await cacheClient.del(`debts:${updatedDebt.user_id}:${updatedDebt.state_id}`);
            await cacheClient.del(`debt:${debtData.id}:${debtData.user_id}`);
            await cacheClient.del(`amountSums:${updatedDebt.user_id}`);
        }

        return updatedDebt;
    } catch (error) {
        throw error;
    }
};
exports.updateDebt = updateDebt;

const useCache = () => {
    if(!cacheClient) {return false;}
    if(!cacheClient.isReady) {return false;}
    if(!cacheClient.isOpen) {return false;}
    return true;
};