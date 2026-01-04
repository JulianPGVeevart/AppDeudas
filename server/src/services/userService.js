const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const userModel = require('#models/User');

const scryptAsync = promisify(scrypt);

const createUser = async (email, password) => {
    try {
        const salt = randomBytes(16).toString('hex');
        const hashedPassword = await scryptAsync(password, salt, 64);
        const storedPassword = `${salt}.${hashedPassword.toString('hex')}`;
        const newUser = await userModel.create({ email, password: storedPassword });
        delete newUser.password;
        return newUser;
    }
    catch (error) {
        if(error.detail?.includes('already exists')) {
            error.detail = 'User already exists';
        }
        throw error;
    }
};

const findUserWithCredentials = async (email, password) => {
    try {
        const user = await userModel.findByEmail(email);
        if (!user) {
            return null;
        }
        const [salt, storedHash] = user.password.split('.');
        const hashedPassword = await scryptAsync(password, salt, 64);
        if (hashedPassword.toString('hex') !== storedHash) {
            return null;
        }
        delete user.password;
        return user;
    } catch (error) {
        throw error;
    }
};

exports.createUser = createUser;
exports.findUserWithCredentials = findUserWithCredentials;