const debtService = require('#services/debtService');
const debtModel = require('#models/Debt');
const debtStatesModel = require('#models/DebtStates');
const debtsMock = require('../mocks/DebtsMock.json');
const debtStatesMock = require('../mocks/DebtStatesMock.json');

// Mock the database connection to prevent actual connection attempts during tests
jest.mock('#database/db', () => ({
    query: jest.fn(),
}));

// Mock the models to isolate service logic
jest.mock('#models/Debt');
jest.mock('#models/DebtStates');

describe('Debt Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllDebtsByUserId', () => {
        it('should return debts for a given user ID', async () => {
            const userId = 1;
            const expectedDebts = debtsMock.filter(debt => debt.user_id === userId);
            debtModel.getAllDebtsByUserId.mockResolvedValue(expectedDebts);

            const result = await debtService.getAllDebtsByUserId(userId);

            expect(debtModel.getAllDebtsByUserId).toHaveBeenCalledWith(userId);
            expect(result).toEqual(expectedDebts);
        });

        it('should throw and log an error if getting debts fails', async () => {
            const userId = 1;
            const error = new Error('Database error');
            debtModel.getAllDebtsByUserId.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(debtService.getAllDebtsByUserId(userId)).rejects.toThrow('Database error');

            expect(consoleSpy).toHaveBeenCalledWith('Error getting debts:', error);
            consoleSpy.mockRestore();
        });
    });

    describe('getDebtStates', () => {
        it('should return all debt states', async () => {
            debtStatesModel.getAllDebtStates.mockResolvedValue(debtStatesMock);

            const result = await debtService.getDebtStates();

            expect(debtStatesModel.getAllDebtStates).toHaveBeenCalled();
            expect(result).toEqual(debtStatesMock);
        });

        it('should throw and log an error if getting debt states fails', async () => {
            const error = new Error('Database error');
            debtStatesModel.getAllDebtStates.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(debtService.getDebtStates()).rejects.toThrow('Database error');

            expect(consoleSpy).toHaveBeenCalledWith('Error getting debt states:', error);
            consoleSpy.mockRestore();
        });
    });

    describe('getDebtById', () => {
        it('should return a debt by ID', async () => {
            const debtId = 1;
            const expectedDebt = debtsMock.find(debt => debt.id === debtId);
            debtModel.getDebtById.mockResolvedValue(expectedDebt);

            const result = await debtService.getDebtById(debtId);

            expect(debtModel.getDebtById).toHaveBeenCalledWith(debtId);
            expect(result).toEqual(expectedDebt);
        });

        it('should throw and log an error if getting debt by ID fails', async () => {
            const debtId = 1;
            const error = new Error('Database error');
            debtModel.getDebtById.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(debtService.getDebtById(debtId)).rejects.toThrow('Database error');

            expect(consoleSpy).toHaveBeenCalledWith('Error getting debt by ID:', error);
            consoleSpy.mockRestore();
        });
    });
});