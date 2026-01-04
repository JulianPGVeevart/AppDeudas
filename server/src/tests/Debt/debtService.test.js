const debtService = require('#services/debtService');
const debtModel = require('#models/Debt');
const debtStatesModel = require('#models/DebtStates');
const debtsMock = require('../mocks/DebtsMock.json');
const debtStatesMock = require('../mocks/DebtStatesMock.json');
const debtStatesSummarized = require('../mocks/DebtStatesSummarizedMock.json');


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

// Tell Jest to mock the 'redis' module
jest.mock('redis', () => ({
    createClient: jest.fn().mockReturnValue({
        connect: async  () => {},
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        isReady: false,
        isOpen: false,
        on: () => {}
    }),
}));

describe('Debt Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllDebtsByUserId', () => {
        it('should return debts when the model returns debts', async () => {
            debtModel.getAllDebtsByUserId.mockResolvedValue(debtsMock);

            const debts = await debtService.getAllDebtsByUserId(1);

            expect(debtModel.getAllDebtsByUserId).toHaveBeenCalledWith(1);
            expect(debts).toEqual(debtsMock);
        });

        it('should throw an error when the model throws an error', async () => {
            const error = new Error('Database error');
            debtModel.getAllDebtsByUserId.mockRejectedValue(error);

            await expect(debtService.getAllDebtsByUserId(1)).rejects.toThrow('Database error');
            expect(debtModel.getAllDebtsByUserId).toHaveBeenCalledWith(1);
        });
    });

    describe('getDebtsByStateAndUser', () => {
        it('should return debts when the model returns debts', async () => {
            debtModel.getDebtsByStateAndUser.mockResolvedValue(debtsMock);

            const debts = await debtService.getDebtsByStateAndUser(1, 1);

            expect(debtModel.getDebtsByStateAndUser).toHaveBeenCalledWith(1, 1);
            expect(debts).toEqual(debtsMock);
        });

        it('should throw an error when the model throws an error', async () => {
            const error = new Error('Database error');
            debtModel.getDebtsByStateAndUser.mockRejectedValue(error);

            await expect(debtService.getDebtsByStateAndUser(1, 1)).rejects.toThrow('Database error');
            expect(debtModel.getDebtsByStateAndUser).toHaveBeenCalledWith(1, 1);
        });
    });

    describe('getDebtStates', () => {
        it('should return debt states when the model returns them', async () => {
            debtStatesModel.getAllDebtStates.mockResolvedValue(debtStatesMock);

            const debtStates = await debtService.getDebtStates();

            expect(debtStatesModel.getAllDebtStates).toHaveBeenCalled();
            expect(debtStates).toEqual(debtStatesMock);
        });

        it('should throw an error when the model throws an error', async () => {
            const error = new Error('Database error');
            debtStatesModel.getAllDebtStates.mockRejectedValue(error);

            await expect(debtService.getDebtStates()).rejects.toThrow('Database error');
            expect(debtStatesModel.getAllDebtStates).toHaveBeenCalled();
        });
    });

    describe('getDebtById', () => {
        it('should return a debt when the model returns a debt', async () => {
            debtModel.getDebtById.mockResolvedValue(debtsMock[0]);

            const debt = await debtService.getDebtById(1, 1);

            expect(debtModel.getDebtById).toHaveBeenCalledWith(1, 1);
            expect(debt).toEqual(debtsMock[0]);
        });

        it('should throw an error when the model throws an error', async () => {
            const error = new Error('Database error');
            debtModel.getDebtById.mockRejectedValue(error);

            await expect(debtService.getDebtById(1, 1)).rejects.toThrow('Database error');
            expect(debtModel.getDebtById).toHaveBeenCalledWith(1, 1);
        });
    });

    describe('getAmountSumsByState', () => {
        it('should return amount sums by state when the model returns them', async () => {
            debtModel.getAmountSumsByState.mockResolvedValue(debtStatesSummarized);

            const amountSumsByState = await debtService.getAmountSumsByState();

            expect(debtModel.getAmountSumsByState).toHaveBeenCalled();
            expect(amountSumsByState).toEqual(debtStatesSummarized);
        });

        it('should throw an error when the model throws an error', async () => {
            const error = new Error('Database error');
            debtModel.getAmountSumsByState.mockRejectedValue(error);

            await expect(debtService.getAmountSumsByState()).rejects.toThrow('Database error');
            expect(debtModel.getAmountSumsByState).toHaveBeenCalled();
        });
    });


    describe('createDebt', () => {
        it('should return the new debt when the model creates it', async () => {
            const newDebt = { user_id: 1, amount: 100, state_id: 1 };
            debtModel.createDebt.mockResolvedValue(newDebt);

            const createdDebt = await debtService.createDebt(newDebt);

            expect(debtModel.createDebt).toHaveBeenCalledWith(newDebt);
            expect(createdDebt).toEqual(newDebt);
        });

        it('should throw an error when the model throws an error', async () => {
            const error = new Error('Database error');
            const newDebt = { user_id: 1, amount: 100, state_id: 1 };
            debtModel.createDebt.mockRejectedValue(error);

            await expect(debtService.createDebt(newDebt)).rejects.toThrow('Database error');
            expect(debtModel.createDebt).toHaveBeenCalledWith(newDebt);
        });

        it('should throw a custom error when user does not exist', async () => {
            const error = new Error('Key (user_id)=(1) is not present in table "users".');
            error.detail = 'Key (user_id)=(1) is not present in table "users".';
            const newDebt = { user_id: 1, amount: 100, state_id: 1 };
            debtModel.createDebt.mockRejectedValue(error);

            try {
                await debtService.createDebt(newDebt);
            } catch (e) {
                expect(e.detail).toBe('User does not exist');
            }
        });
    });

    describe('deleteDebt', () => {
        it('should return the number of rows deleted', async () => {
            debtModel.deleteDebt.mockResolvedValue(1);

            const result = await debtService.deleteDebt(1, 1);

            expect(debtModel.deleteDebt).toHaveBeenCalledWith(1, 1);
            expect(result).toBe(1);
        });

        it('should throw an error when the model throws an error', async () => {
            const error = new Error('Database error');
            debtModel.deleteDebt.mockRejectedValue(error);

            await expect(debtService.deleteDebt(1, 1)).rejects.toThrow('Database error');
            expect(debtModel.deleteDebt).toHaveBeenCalledWith(1, 1);
        });
    });

    describe('updateDebt', () => {
        it('should return the updated debt', async () => {
            const updatedDebt = { id: 1, user_id: 1, amount: 100, state_id: 1 };
            debtModel.updateDebt.mockResolvedValue(updatedDebt);

            const result = await debtService.updateDebt(updatedDebt);

            expect(debtModel.updateDebt).toHaveBeenCalledWith(updatedDebt);
            expect(result).toEqual(updatedDebt);
        });

        it('should throw an error when the model throws an error', async () => {
            const error = new Error('Database error');
            const updatedDebt = { id: 1, user_id: 1, amount: 100, state_id: 1 };
            debtModel.updateDebt.mockRejectedValue(error);

            await expect(debtService.updateDebt(updatedDebt)).rejects.toThrow('Database error');
            expect(debtModel.updateDebt).toHaveBeenCalledWith(updatedDebt);
        });
    });
});
