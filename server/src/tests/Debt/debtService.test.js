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
            const userId = 1;
            const expectedDebt = debtsMock.find(debt => debt.id === debtId && debt.user_id === userId);
            debtModel.getDebtById.mockResolvedValue(expectedDebt);

            const result = await debtService.getDebtById(debtId, userId);

            expect(debtModel.getDebtById).toHaveBeenCalledWith(debtId, userId);
            expect(result).toEqual(expectedDebt);
        });

        it('should throw and log an error if getting debt by ID fails', async () => {
            const debtId = 1;
            const userId = 1;
            const error = new Error('Database error');
            debtModel.getDebtById.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(debtService.getDebtById(debtId, userId)).rejects.toThrow('Database error');

            expect(consoleSpy).toHaveBeenCalledWith('Error getting debt by ID:', error);
            consoleSpy.mockRestore();
        });
    });

    describe('createDebt', () => {
        it('should create a new debt successfully', async () => {
            const debtData = {
                user_id: 1,
                amount: 1000.00,
                creation_date: new Date(),
                state_id: 1
            };
            const mockCreatedDebt = { id: 5, ...debtData };
            debtModel.createDebt.mockResolvedValue(mockCreatedDebt);

            const result = await debtService.createDebt(debtData);

            expect(debtModel.createDebt).toHaveBeenCalledWith(debtData);
            expect(result).toEqual(mockCreatedDebt);
        });

        it('should throw and log an error if creation fails', async () => {
            const debtData = {
                user_id: 1,
                amount: 1000.00,
                creation_date: new Date(),
                state_id: 1
            };
            const error = new Error('Database error');
            debtModel.createDebt.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(debtService.createDebt(debtData)).rejects.toThrow('Database error');

            expect(consoleSpy).toHaveBeenCalledWith('Error creating debt:', error);
            consoleSpy.mockRestore();
        });

        it('should throw an error with custom message if user does not exist', async () => {
            const debtData = {
                user_id: 999,
                amount: 1000.00,
                creation_date: new Date(),
                state_id: 1
            };
            const error = new Error('Foreign key violation');
            error.detail = 'Key (user_id)=(999) is not present in table "APP_USER"';
            debtModel.createDebt.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(debtService.createDebt(debtData)).rejects.toThrow('Foreign key violation');

            expect(consoleSpy).toHaveBeenCalledWith('Error creating debt:', error);
            expect(error.detail).toBe('User does not exist');
            consoleSpy.mockRestore();
        });
    });

    describe('updateDebt', () => {
        it('should update a debt successfully', async () => {
            const debtData = {
                id: 1,
                user_id: 1,
                amount: 1500.00,
                state_id: 2
            };
            const mockUpdatedDebt = { ...debtsMock[0], amount: '1500.00', state_id: 2 };
            debtModel.updateDebt.mockResolvedValue(mockUpdatedDebt);

            const result = await debtService.updateDebt(debtData);

            expect(debtModel.updateDebt).toHaveBeenCalledWith(debtData);
            expect(result).toEqual(mockUpdatedDebt);
        });

        it('should throw and log an error if updating debt fails', async () => {
            const debtData = {
                id: 1,
                user_id: 1,
                amount: 1500.00,
                state_id: 2
            };
            const error = new Error('Database error');
            debtModel.updateDebt.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(debtService.updateDebt(debtData)).rejects.toThrow('Database error');

            expect(consoleSpy).toHaveBeenCalledWith('Error updating debt:', error);
            consoleSpy.mockRestore();
        });
    });
});