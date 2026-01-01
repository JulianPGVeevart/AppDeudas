const debtService = require('#services/debtService');

//GET
exports.getAllDebtsByUserId = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        if(!userId) {
            return res.status(400).json({ message: 'User ID is required to get user debts' });
        }
        const debts = await debtService.getAllDebtsByUserId(userId);
        res.status(200).json(debts);
    } catch (error) {
        res.status(400).json({ message: error.detail });
        next(error);
    }
};

exports.getDebtStates = async (req, res, next) => {
    try {
        const debtStates = await debtService.getDebtStates();
        res.status(200).json(debtStates);
    } catch (error) {
        res.status(400).json({ message: error.detail });
        next(error);
    }
};

exports.getDebtById = async (req, res, next) => {
    try {
        const debtId = req.params.debtId;
        if(!debtId) {
            return res.status(400).json({ message: 'Debt ID is required' });
        }
        const debt = await debtService.getDebtById(debtId);
        res.status(200).json(debt);
    } catch (error) {
        res.status(400).json({ message: error.detail });
        next(error);
    }
};

//POST
exports.createDebt = async (req, res, next) => {
    try {
        const debtData = getValidDebtData(req.body);
        const newDebt = await debtService.createDebt(debtData);
        res.status(201).json(newDebt);
    } catch (error) {
        res.status(400).json({ message: error.detail });
        next(error);
    }
};

function getValidDebtData(data) {
    const debtData = {
        user_id: data.userId,
        amount: data.amount,
        creation_date: data.creationDate || new Date().toISOString(),
        state_id: data.stateId
    };
    validateData(debtData);
    return debtData;
}

function validateData(debtData) {
    let errorMsg = '';
    if(!debtData.user_id) {
        errorMsg = 'User ID is required';
    }
    if(!debtData.amount) {
        errorMsg = 'Amount is required';
    }
    if(!debtData.state_id) {
        errorMsg = 'Debt state ID is required';
    }
    if(debtData.amount <= 0) {
        errorMsg = 'Amount must be a positive number';
    }

    if(errorMsg != '') {
        const error = new Error(errorMsg);
        error.detail = errorMsg;
        throw error;
    }
}