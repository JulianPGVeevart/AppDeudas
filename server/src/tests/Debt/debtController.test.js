const debtController = require('#controllers/debtController');
const debtStatesMock = require('../mocks/DebtStatesMock.json');
const debtsMock = require('../mocks/DebtsMock.json');

// Mock the debtService to isolate controller logic
// Note: Ensure your Jest configuration maps '#services/debtService' correctly,
// or adjust the mock path if necessary.
jest.mock('#services/debtService', () => ({
    getAllDebtsByUserId: jest.fn(),
    getDebtStates: jest.fn(),
    getDebtById: jest.fn(),
    createDebt: jest.fn(),
    updateDebt: jest.fn(),
    deleteDebt: jest.fn(),
    getDebtsByStateAndUser: jest.fn(),
}));

const debtService = require('#services/debtService');

describe('Debt Controller', () => {
    let req, res, next;
    
    beforeEach(() => {
        req = {
            body: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getDebtsByStateAndUser', () => {
        it('should return 400 if userId is missing', async () => {
            req.body = { stateId: 1 };
            await debtController.getDebtsByStateAndUser(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 400 if stateId is missing', async () => {
            req.body = { userId: 1 };
            await debtController.getDebtsByStateAndUser(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'State ID is required' });
        });

        it('should return debts when userId and stateId are provided', async () => {
            req.body = { userId: 1, stateId: 1 };
            debtService.getDebtsByStateAndUser.mockResolvedValue(debtsMock);

            await debtController.getDebtsByStateAndUser(req, res, next);

            expect(debtService.getDebtsByStateAndUser).toHaveBeenCalledWith(1, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(debtsMock);
        });

        it('should handle errors', async () => {
            req.body = { userId: 1, stateId: 1 };
            const error = { detail: 'Database error' };
            debtService.getDebtsByStateAndUser.mockRejectedValue(error);

            await debtController.getDebtsByStateAndUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllDebtsByUserId', () => {
        it('should return 400 if userId is missing', async () => {
            req.body = {}; // Missing userId
            await debtController.getAllDebtsByUserId(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required to get user debts' });
        });

        it('should return debts when userId is provided', async () => {
            req.body.userId = 'user123';
            debtService.getAllDebtsByUserId.mockResolvedValue(debtsMock);

            await debtController.getAllDebtsByUserId(req, res, next);

            expect(debtService.getAllDebtsByUserId).toHaveBeenCalledWith('user123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(debtsMock);
        });

        it('should handle errors', async () => {
            req.body.userId = 'user123';
            const error = { detail: 'Database error' };
            debtService.getAllDebtsByUserId.mockRejectedValue(error);

            await debtController.getAllDebtsByUserId(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getDebtStates', () => {
        it('should return debt states', async () => {
            debtService.getDebtStates.mockResolvedValue(debtStatesMock);

            await debtController.getDebtStates(req, res, next);

            expect(debtService.getDebtStates).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(debtStatesMock);
        });
    });

    describe('getDebtById', () => {
        it('should return 400 if debtId is missing', async () => {
            req.params = {}; // Missing debtId
            req.body = { userId: 1 };
            await debtController.getDebtById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Debt ID is required' });
        });

        it('should return 400 if userId is missing', async () => {
            req.params = { debtId: 'debt123' };
            req.body = {}; // Missing userId
            await debtController.getDebtById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return debt details when both debtId and userId are provided', async () => {
            req.params.debtId = '1';
            req.body.userId = 1;
            debtService.getDebtById.mockResolvedValue(debtsMock[0]);

            await debtController.getDebtById(req, res, next);

            expect(debtService.getDebtById).toHaveBeenCalledWith('1', 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(debtsMock[0]);
        });

        it('should return 404 if debt not found for this user', async () => {
            req.params.debtId = '1';
            req.body.userId = 1;
            debtService.getDebtById.mockResolvedValue(null);

            await debtController.getDebtById(req, res, next);

            expect(debtService.getDebtById).toHaveBeenCalledWith('1', 1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Debt not found for this user' });
        });
    });

    describe('createDebt', () => {
        it('should return 400 if userId is missing', async () => {
            req.body = { amount: 1000, stateId: 1 };
            await debtController.createDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 400 if amount is missing', async () => {
            req.body = { userId: 1, stateId: 1 };
            await debtController.createDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Amount is required' });
        });

        it('should return 400 if stateId is missing', async () => {
            req.body = { userId: 1, amount: 1000 };
            await debtController.createDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Debt state ID is required' });
        });

        it('should return 400 if amount is not positive', async () => {
            req.body = { userId: 1, amount: 0, stateId: 1 };
            await debtController.createDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Amount must be a positive number' });
        });

        it('should create a debt successfully', async () => {
            req.body = { userId: 1, amount: 1000, stateId: 1 };
            const mockCreatedDebt = { id: 5, user_id: 1, amount: '1000.00', creation_date: new Date().toISOString(), state_id: 1 };
            debtService.createDebt.mockResolvedValue(mockCreatedDebt);

            await debtController.createDebt(req, res, next);

            expect(debtService.createDebt).toHaveBeenCalledWith({
                user_id: 1,
                amount: 1000,
                creation_date: expect.any(String),
                state_id: 1
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCreatedDebt);
        });

        it('should handle service errors', async () => {
            req.body = { userId: 1, amount: 1000, stateId: 1 };
            const error = new Error('Database error');
            error.detail = 'Database error';
            debtService.createDebt.mockRejectedValue(error);

            await debtController.createDebt(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateDebt', () => {
        it('should return 400 if userId is missing', async () => {
            req.body = { id: 1, amount: 1500, stateId: 2 };
            await debtController.updateDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 400 if amount is missing', async () => {
            req.body = { id: 1, userId: 1, stateId: 2 };
            await debtController.updateDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Amount is required' });
        });

        it('should return 400 if stateId is missing', async () => {
            req.body = { id: 1, userId: 1, amount: 1500 };
            await debtController.updateDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Debt state ID is required' });
        });

        it('should return 400 if debtId is missing', async () => {
            req.body = { userId: 1, amount: 1500, stateId: 2 };
            await debtController.updateDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Debt ID is required to update it' });
        });

        it('should return 400 if amount is not positive', async () => {
            req.body = { id: 1, userId: 1, amount: 0, stateId: 2 };
            await debtController.updateDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Amount must be a positive number' });
        });

        it('should update a debt successfully', async () => {
            req.body = { id: 1, userId: 1, amount: 1500, stateId: 2 };
            const mockUpdatedDebt = { id: 1, user_id: 1, amount: '1500.00', creation_date: new Date().toISOString(), state_id: 2 };
            debtService.updateDebt.mockResolvedValue(mockUpdatedDebt);

            await debtController.updateDebt(req, res, next);

            expect(debtService.updateDebt).toHaveBeenCalledWith({
                id: 1,
                user_id: 1,
                amount: 1500,
                creation_date: expect.any(String),
                state_id: 2
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdatedDebt);
        });

        it('should return 400 if debt not found or already paid', async () => {
            req.body = { id: 1, userId: 1, amount: 1500, stateId: 2 };
            debtService.updateDebt.mockResolvedValue(null);

            await debtController.updateDebt(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Debt not found or already Paid' });
        });

        it('should handle service errors', async () => {
            req.body = { id: 1, userId: 1, amount: 1500, stateId: 2 };
            const error = new Error('Database error');
            error.detail = 'Database error';
            debtService.updateDebt.mockRejectedValue(error);

            await debtController.updateDebt(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteDebt', () => {
        it('should return 400 if debtId is missing', async () => {
            req.body = { userId: 1 };
            await debtController.deleteDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Debt Id is required' });
        });

        it('should return 400 if userId is missing', async () => {
            req.body = { id: 1 };
            await debtController.deleteDebt(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should delete a debt successfully', async () => {
            req.body = { id: 1, userId: 1 };
            debtService.deleteDebt.mockResolvedValue(1);

            await debtController.deleteDebt(req, res, next);

            expect(debtService.deleteDebt).toHaveBeenCalledWith(1, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: '1 rows deleted' });
        });

        it('should return 404 if debt not found or not from this user', async () => {
            req.body = { id: 1, userId: 1 };
            debtService.deleteDebt.mockResolvedValue(0);

            await debtController.deleteDebt(req, res, next);

            expect(debtService.deleteDebt).toHaveBeenCalledWith(1, 1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Debt not found or not from this user' });
        });

        it('should handle service errors', async () => {
            req.body = { id: 1, userId: 1 };
            const error = new Error('Database error');
            error.detail = 'Database error';
            debtService.deleteDebt.mockRejectedValue(error);

            await debtController.deleteDebt(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});