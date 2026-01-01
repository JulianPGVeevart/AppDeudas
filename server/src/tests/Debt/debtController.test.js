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
            await debtController.getDebtById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Debt ID is required' });
        });

        it('should return debt details when debtId is provided', async () => {
            req.params.debtId = 'debt123';
            debtService.getDebtById.mockResolvedValue(debtsMock[0]);

            await debtController.getDebtById(req, res, next);

            expect(debtService.getDebtById).toHaveBeenCalledWith('debt123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(debtsMock[0]);
        });
    });
});