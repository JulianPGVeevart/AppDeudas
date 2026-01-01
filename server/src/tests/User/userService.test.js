const userService = require('#services/userService');
const userModel = require('#models/User');
const usersMock = require('../mocks/UsersMock.json');

// Mock the database connection to prevent actual connection attempts during tests
jest.mock('#database/db', () => ({
    query: jest.fn(),
}));

// Mock the userModel to isolate service logic
jest.mock('#models/User');

describe('User Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const mockUser = usersMock[0];
            userModel.create.mockResolvedValue(mockUser);

            const result = await userService.createUser(mockUser.email, mockUser.password);

            expect(userModel.create).toHaveBeenCalledWith({ email: 'user1@mail.com', password: 'testpass1' });
            expect(result).toEqual(mockUser);
        });

        it('should throw and log an error if creation fails', async () => {
            const error = new Error('Database error');
            userModel.create.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(userService.createUser('user1@mail.com', 'testpass1')).rejects.toThrow('Database error');
            
            expect(consoleSpy).toHaveBeenCalledWith('Error creating user:', error);
            consoleSpy.mockRestore();
        });

        it('should throw an error if email already exists', async () => {
            const error = new Error('Key (email)=(user1@mail.com) already exists');
            error.detail = 'Key (email)=(user1@mail.com) already exists';
            userModel.create.mockRejectedValue(error);
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(userService.createUser('user1@mail.com', 'testpass1')).rejects.toThrow('Key (email)=(user1@mail.com) already exists');

            expect(consoleSpy).toHaveBeenCalledWith('Error creating user:', error);
            expect(error.detail).toBe('User already exists');
            consoleSpy.mockRestore();
        });
    });

    describe('findUserWithCredentials', () => {
        it('should return user when credentials are valid', async () => {
            const mockUser = usersMock[0];
            userModel.findUserWithCredentials.mockResolvedValue(mockUser);

            const result = await userService.findUserWithCredentials(mockUser.email, mockUser.password);

            expect(userModel.findUserWithCredentials).toHaveBeenCalledWith('user1@mail.com', 'testpass1');
            expect(result).toEqual(mockUser);
        });

        it('should throw and log an error if finding user fails', async () => {
            const error = new Error('Database error');
            userModel.findUserWithCredentials.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(userService.findUserWithCredentials('user1@mail.com', 'testpass1')).rejects.toThrow('Database error');

            expect(consoleSpy).toHaveBeenCalledWith('Error getting user by email and password:', error);
            consoleSpy.mockRestore();
        });
    });
});