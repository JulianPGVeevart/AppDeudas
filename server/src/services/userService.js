const userModel = require('#models/User');

const createUser = async (email, password) => {
    try {
        const newUser = await userModel.create({ email, password });
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
        const user = await userModel.findUserWithCredentials(email, password);
        return user;
    } catch (error) {
        throw error;
    }
};

exports.createUser = createUser;
exports.findUserWithCredentials = findUserWithCredentials;