const debtService = require('#services/debtService');
const debtModel = require('#models/Debt');
const debtsMock = require('../mocks/DebtsMock.json');
const debtStatesMock = require('../mocks/DebtStatesMock.json');
const debtStatesSummarizedMock = require('../mocks/DebtStatesSummarizedMock.json');
const cacheClient = require('#utils/redisClient');

jest.mock('#models/Debt', () => ({
    getAllDebtsByUserId: jest.fn(),
    getDebtsByStateAndUser: jest.fn(),
    getDebtById: jest.fn(),
    getAmountSumsByState: jest.fn(),
    createDebt: jest.fn(),
    updateDebt: jest.fn(),
    deleteDebt: jest.fn(),
}));

jest.mock('#models/DebtStates', () => ({
    getAllDebtStates: jest.fn(),
}));

jest.mock('#utils/redisClient', () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    isReady: true, // Simulate a ready cache client
    isOpen: true,  // Simulate an open cache client
}));

describe('Debt Service with Caching', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        cacheClient.isReady = true;
        cacheClient.isOpen = true;
    });

    describe('getAllDebtsByUserId', () => {
        it('should return cached debts if available', async () => {
            cacheClient.get.mockResolvedValue(JSON.stringify(debtsMock));

            const debts = await debtService.getAllDebtsByUserId(1);

            expect(cacheClient.get).toHaveBeenCalledWith('debts:1');
            expect(debtModel.getAllDebtsByUserId).not.toHaveBeenCalled();
            expect(debts).toEqual(debtsMock);
        });

        it('should fetch from DB and save in cache', async () => {
            cacheClient.get.mockResolvedValue(null);
            debtModel.getAllDebtsByUserId.mockResolvedValue(debtsMock);

            const debts = await debtService.getAllDebtsByUserId(1);

            expect(cacheClient.get).toHaveBeenCalledWith('debts:1');
            expect(debtModel.getAllDebtsByUserId).toHaveBeenCalledWith(1);
            expect(cacheClient.set).toHaveBeenCalled();
            expect(debts).toEqual(debtsMock);
        });

        it('should not cache debts if cache is not available', async () => {
            debtModel.getAllDebtsByUserId.mockResolvedValue(debtsMock);
            disableCache();

            const debts = await debtService.getAllDebtsByUserId(1);

            expect(cacheClient.get).not.toHaveBeenCalled();
            expect(debtModel.getAllDebtsByUserId).toHaveBeenCalledWith(1);
            expect(debts).toEqual(debtsMock);
        });
    });

    describe('getDebtsByStateAndUser', () => {
        it("should return cached debts if available", async () => {
            cacheClient.get.mockResolvedValue(JSON.stringify(debtsMock));

            const debts = await debtService.getDebtsByStateAndUser(1, 1);

            expect(cacheClient.get).toHaveBeenCalledWith('debts:1:1');
            expect(debtModel.getDebtsByStateAndUser).not.toHaveBeenCalled();
            expect(debts).toEqual(debtsMock);
        });

        it("should fetch from DB and save in cache", async () => {
            cacheClient.get.mockResolvedValue(null);
            debtModel.getDebtsByStateAndUser.mockResolvedValue(debtsMock);

            const debts = await debtService.getDebtsByStateAndUser(1, 1);

            expect(cacheClient.get).toHaveBeenCalledWith('debts:1:1');
            expect(debtModel.getDebtsByStateAndUser).toHaveBeenCalledWith(1, 1);
            expect(cacheClient.set).toHaveBeenCalled();
            expect(debts).toEqual(debtsMock);
        });

        it('should not cache debts if cache is not available', async () => {
            debtModel.getDebtsByStateAndUser.mockResolvedValue(debtsMock);
            disableCache();

            const debts = await debtService.getDebtsByStateAndUser(1, 1);

            expect(cacheClient.get).not.toHaveBeenCalled();
            expect(debtModel.getDebtsByStateAndUser).toHaveBeenCalledWith(1, 1);
            expect(debts).toEqual(debtsMock);
        });
    });

    describe('getAmountSumsByState', () => {
        it('should return cached amount sums by state if available', async () => {
            cacheClient.get.mockResolvedValue(JSON.stringify(debtStatesSummarizedMock));

            const amountSumsByState = await debtService.getAmountSumsByState(1);

            expect(cacheClient.get).toHaveBeenCalledWith('amountSums:1');
            expect(debtModel.getAmountSumsByState).not.toHaveBeenCalled();
            expect(amountSumsByState).toEqual(debtStatesSummarizedMock);
        });

        it('should return db amount sums and save in cache', async () => {
            cacheClient.get.mockResolvedValue(null);
            debtModel.getAmountSumsByState.mockResolvedValue(debtStatesSummarizedMock);

            const sumarizedDebts = await debtService.getAmountSumsByState(1);

            expect(cacheClient.get).toHaveBeenCalledWith('amountSums:1');
            expect(debtModel.getAmountSumsByState).toHaveBeenCalled();
            expect(cacheClient.set).toHaveBeenCalled();
            expect(sumarizedDebts).toEqual(debtStatesSummarizedMock);
        });

        it('should return db amount when cache is not available', async () => {
            disableCache();
            debtModel.getAmountSumsByState.mockResolvedValue(debtStatesSummarizedMock);

            const amountSumsByState = await debtService.getAmountSumsByState();

            expect(cacheClient.get).not.toHaveBeenCalled();
            expect(debtModel.getAmountSumsByState).toHaveBeenCalled();
            expect(amountSumsByState).toEqual(debtStatesSummarizedMock);
        });
    });


    describe('createDebt', () => {
        it('should cache debts after creation', async () => {
            const newDebt = { user_id: 1, amount: 100, state_id: 1 };
            debtModel.createDebt.mockResolvedValue(newDebt);

            const createdDebt = await debtService.createDebt(newDebt);

            expect(debtModel.createDebt).toHaveBeenCalledWith(newDebt);
            expect(cacheClient.del).toHaveBeenCalledWith('debts:1');
            expect(cacheClient.del).toHaveBeenCalledWith('debts:1:1');
            expect(createdDebt).toEqual(newDebt);
        });

        it('should not cache debts if cache is not available', async () => {
            const newDebt = { user_id: 1, amount: 100, state_id: 1 };
            debtModel.createDebt.mockResolvedValue(newDebt);
            disableCache();

            const createdDebt = await debtService.createDebt(newDebt);

            expect(debtModel.createDebt).toHaveBeenCalledWith(newDebt);
            expect(cacheClient.del).not.toHaveBeenCalled();
            expect(createdDebt).toEqual(newDebt);
        });
    });

    describe('updateDebt', () => {
        it('should cache debts after update', async () => {
            const updatedDebt = { id: 1, user_id: 1, amount: 100, state_id: 1 };
            debtModel.updateDebt.mockResolvedValue(updatedDebt);

            const result = await debtService.updateDebt(updatedDebt);

            expect(debtModel.updateDebt).toHaveBeenCalledWith(updatedDebt);
            expect(cacheClient.del).toHaveBeenCalledWith('debts:1');
            expect(cacheClient.del).toHaveBeenCalledWith('debts:1:1');
            expect(cacheClient.del).toHaveBeenCalledWith('debt:1:1');
            expect(result).toEqual(updatedDebt);
        });

        it('should not cache debts if cache is not available', async () => {
            const updatedDebt = { id: 1, user_id: 1, amount: 1, state_id: 1 };
            debtModel.updateDebt.mockResolvedValue(updatedDebt);
            disableCache();

            const updatedDebtResult = await debtService.updateDebt(updatedDebt);

            expect(debtModel.updateDebt).toHaveBeenCalledWith(updatedDebt);
            expect(cacheClient.del).not.toHaveBeenCalled();
            expect(updatedDebtResult).toEqual(updatedDebt);
        });
    });

    describe('deleteDebt', () => {
        it('should cache debts after deletion', async () => {
            debtModel.deleteDebt.mockResolvedValue(1);

            const result = await debtService.deleteDebt(1, 1);

            expect(debtModel.deleteDebt).toHaveBeenCalledWith(1, 1);
            expect(cacheClient.del).toHaveBeenCalledWith('debts:1');
            expect(result).toBe(1);
        });

        it('should not cache debts if cache is not available', async () => {
            debtModel.deleteDebt.mockResolvedValue(1);
            disableCache();

            const result = await debtService.deleteDebt(1, 1);

            expect(debtModel.deleteDebt).toHaveBeenCalledWith(1, 1);
            expect(cacheClient.del).not.toHaveBeenCalled();
            expect(result).toBe(1);
        });
    });
});

const disableCache = () => {
    cacheClient.isReady = false;
    cacheClient.isOpen = false;
};