const pool = require('../../database/db'); // Your PG connection
const userModel = require('../models/User');

const createUser = async (email, password) => {
    try {
        const newUser = await userModel.create({ email, password });
        return newUser;
    }
    catch (error) {
        if(error.detail?.includes('already exists')) {
            error.detail = 'User already exists';
        }
        console.error('Error creating user:', error);
        throw error;
    }
};

const findUserWithCredentials = async (email, password) => {
    try {
        const user = await userModel.findUserWithCredentials(email, password);
        return user;
    } catch (error) {
        console.error('Error getting user by email and password:', error);
        throw error;
    }
};

exports.createUser = createUser;
exports.findUserWithCredentials = findUserWithCredentials;