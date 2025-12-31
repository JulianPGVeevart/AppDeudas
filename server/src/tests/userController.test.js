const userController = require('../controllers/userController');
const userService = require('../services/userService');

// Mock the userService to isolate controller logic
jest.mock('../services/userService');

describe('User Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getUserByEmailAndPassword', () => {
        it('should return 400 if email or password is missing', async () => {
            req.body = { email: 'test@example.com' }; // Missing password
            await userController.findUserWithCredentials(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
        });

        it('should return 401 if user is not found (invalid credentials)', async () => {
            req.body = { email: 'test@example.com', password: 'wrongpassword' };
            userService.findUserWithCredentials.mockResolvedValue(null);

            await userController.findUserWithCredentials(req, res, next);
            
            expect(userService.findUserWithCredentials).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
        });

        it('should return 200 and the user object if credentials are correct', async () => {
            const mockUser = { id: 1, email: 'test@example.com' };
            req.body = { email: 'test@example.com', password: 'password123' };
            userService.findUserWithCredentials.mockResolvedValue(mockUser);

            await userController.findUserWithCredentials(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should call next with error if service throws an exception', async () => {
            const error = new Error('Database connection failed');
            req.body = { email: 'test@example.com', password: 'password123' };
            userService.findUserWithCredentials.mockRejectedValue(error);

            await userController.findUserWithCredentials(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('createUser', () => {
        it('should return 400 if email or password is missing', async () => {
            req.body = { password: 'password123' };
            await userController.createUser(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
        });

        it('should return 400 if email format is invalid', async () => {
            req.body = { email: 'invalid-email', password: 'password123' };
            await userController.createUser(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email format' });
        });

        it('should return 201 and the new user on success', async () => {
            const mockUser = { id: 1, email: 'new@example.com' };
            req.body = { email: 'new@example.com', password: 'password123' };
            userService.createUser.mockResolvedValue(mockUser);

            await userController.createUser(req, res, next);
            
            expect(userService.createUser).toHaveBeenCalledWith('new@example.com', 'password123');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should call next with error if service throws an exception', async () => {
            const error = new Error('User already exists');
            req.body = { email: 'new@example.com', password: 'password123' };
            userService.createUser.mockRejectedValue(error);

            await userController.createUser(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});