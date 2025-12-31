const userService = require('../services/userService');
const userModel = require('../models/User');

// Mock the database connection to prevent actual connection attempts during tests
jest.mock('../../database/db', () => ({
    query: jest.fn(),
}));

// Mock the userModel to isolate service logic
jest.mock('../models/User');

describe('User Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const mockUser = { id: 1, email: 'test@example.com' };
            userModel.create.mockResolvedValue(mockUser);

            const result = await userService.createUser('test@example.com', 'password123');

            expect(userModel.create).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
            expect(result).toEqual(mockUser);
        });

        it('should throw and log an error if creation fails', async () => {
            const error = new Error('Database error');
            userModel.create.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(userService.createUser('test@example.com', 'password123')).rejects.toThrow('Database error');
            
            expect(consoleSpy).toHaveBeenCalledWith('Error creating user:', error);
            consoleSpy.mockRestore();
        });
    });

    describe('findUserWithCredentials', () => {
        it('should return user when credentials are valid', async () => {
            const mockUser = { id: 1, email: 'test@example.com' };
            userModel.findUserWithCredentials.mockResolvedValue(mockUser);

            const result = await userService.findUserWithCredentials('test@example.com', 'password123');

            expect(userModel.findUserWithCredentials).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(result).toEqual(mockUser);
        });

        it('should throw and log an error if finding user fails', async () => {
            const error = new Error('Database error');
            userModel.findUserWithCredentials.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(userService.findUserWithCredentials('test@example.com', 'password123')).rejects.toThrow('Database error');

            expect(consoleSpy).toHaveBeenCalledWith('Error getting user by email and password:', error);
            consoleSpy.mockRestore();
        });
    });
});