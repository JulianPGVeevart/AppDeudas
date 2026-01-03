const userService = require('#services/userService');
const userModel = require('#models/User');
const usersMock = require('../mocks/UsersMock.json');

// Mock the database connection to prevent actual connection attempts during tests
jest.mock('#database/db', () => ({
    query: jest.fn(),
}));

// Mock the userModel to isolate service logic
jest.mock('#models/User');

const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

jest.mock('crypto', () => ({
    ...jest.requireActual('crypto'),
    randomBytes: jest.fn().mockReturnValue({ toString: () => 'salt' }),
    scrypt: jest.fn().mockImplementation((password, salt, a, callback) => {
        callback(null, Buffer.from(password + salt));
    }),
}));

describe('User Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user successfully and not return the password', async () => {
            const mockUser = { id: 1, email: 'user1@mail.com', password: 'salt.74657374706173733173616c74' };
            userModel.create.mockResolvedValue(mockUser);

            const result = await userService.createUser(mockUser.email, 'testpass1');

            expect(userModel.create).toHaveBeenCalledWith({ email: 'user1@mail.com', password: 'salt.74657374706173733173616c74' });
            expect(result).not.toHaveProperty('password');
            expect(result.email).toEqual(mockUser.email);
        });

        it('should throw an error if creation fails', async () => {
            const error = new Error('Database error');
            userModel.create.mockRejectedValue(error);

            await expect(userService.createUser('user1@mail.com', 'testpass1')).rejects.toThrow('Database error');
        });

        it('should throw a custom error if email already exists', async () => {
            const error = new Error('Key (email)=(user1@mail.com) already exists');
            error.detail = 'Key (email)=(user1@mail.com) already exists';
            userModel.create.mockRejectedValue(error);
            
            try {
                await userService.createUser('user1@mail.com', 'testpass1');
            } catch (e) {
                expect(e.detail).toBe('User already exists');
            }
        });
    });

    describe('findUserWithCredentials', () => {
        it('should return user when credentials are valid and not return the password', async () => {
            const mockUser = {
                id: 1,
                email: 'user1@mail.com',
                password: 'salt.74657374706173733173616c74',
            };
            userModel.findByEmail.mockResolvedValue(mockUser);

            const result = await userService.findUserWithCredentials('user1@mail.com', 'testpass1');

            expect(userModel.findByEmail).toHaveBeenCalledWith('user1@mail.com');
            expect(result).not.toHaveProperty('password');
            expect(result.email).toEqual(mockUser.email);
        });

        it('should return null when credentials are invalid', async () => {
            const mockUser = {
                id: 1,
                email: 'user1@mail.com',
                password: 'salt.74657374706173733173616c74',
            };
            userModel.findByEmail.mockResolvedValue(mockUser);

            const result = await userService.findUserWithCredentials('user1@mail.com', 'wrongpassword');

            expect(userModel.findByEmail).toHaveBeenCalledWith('user1@mail.com');
            expect(result).toBeNull();
        });

        it('should return null if user is not found', async () => {
            userModel.findByEmail.mockResolvedValue(null);

            const result = await userService.findUserWithCredentials('user1@mail.com', 'testpass1');

            expect(userModel.findByEmail).toHaveBeenCalledWith('user1@mail.com');
            expect(result).toBeNull();
        });

        it('should throw an error if finding user fails', async () => {
            const error = new Error('Database error');
            userModel.findByEmail.mockRejectedValue(error);

            await expect(userService.findUserWithCredentials('user1@mail.com', 'testpass1')).rejects.toThrow('Database error');
        });
    });
});