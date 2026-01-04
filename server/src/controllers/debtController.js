const debtService = require('#services/debtService');

//GET
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
        const [debtId, userId] = [req.params.debtId, req.body?.userId];
        if(!debtId) {
            return res.status(400).json({ message: 'Debt ID is required' });
        }
        if(!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const debt = await debtService.getDebtById(debtId, userId);
        if(!debt) {
            return res.status(404).json({ message: 'Debt not found for this user' });
        }
        res.status(200).json(debt);
    } catch (error) {
        res.status(400).json({ message: error.detail });
        next(error);
    }
};

//POST
exports.getAllDebtsByUserId = async (req, res, next) => {
    try {
        if(req.body?.stateId) {
            return this.getDebtsByStateAndUser(req, res, next);
        }

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

exports.getDebtsJSON = async (req, res, next) => {
    try {
        const userId = req.body?.userId;
        if(!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        };

        const debts = await debtService.getAllDebtsByUserId(userId);
        res.send(debts);
        res.status(200);
    } catch (error) {
        res.status(400).json({ message: error.detail });
        next(error);
    }
};

exports.getDebtsByStateAndUser = async (req, res, next) => {
    try {
        const { userId, stateId } = req.body;
        if(!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        if(!stateId) {
            return res.status(400).json({ message: 'State ID is required' });
        }
        const debts = await debtService.getDebtsByStateAndUser(userId, stateId);
        res.status(200).json(debts);
    } catch(error) {
        res.status(400).json({ message: error.detail });
        next(error);
    }
}

exports.getAmountSumsByState = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        if(!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const amountSums = await debtService.getAmountSumsByState(userId);
        res.status(200).json(amountSums);
    } catch (error) {
        res.status(400).json({ message: error.detail });
        next(error);
    }
};

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

//PUT
exports.updateDebt = async (req, res, next) => {
    try {
        const debtData = getValidDebtData(req.body);
        if(!debtData.id) {
            return res.status(400).json({ message: 'Debt ID is required to update it' });
        }
        const updatedDebt = await debtService.updateDebt(debtData);
        if(!updatedDebt) {
            return res.status(400).json({ message: 'Debt not found or already Paid' });
        }
        res.status(200).json(updatedDebt);
    } catch (error) {
        res.status(400).json({ message: error.detail });
        next(error);
    }
};

//DELETE
exports.deleteDebt = async (req, res, next) => {
    try {
        const debtInfo = req.body;
        if(!debtInfo.id) {
            return res.status(400).json({ message: 'Debt Id is required' });
        }
        if(!debtInfo.userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        if(!debtInfo.stateId) {
            return res.status(400).json({ message: 'Debt state ID is required' });
        }

        const result = await debtService.deleteDebt(debtInfo);
        if(result > 0) {
            return res.status(200).json({ message: `${result} rows deleted` });
        } else {
            return res.status(404).json({ message: 'Debt not found or not from this user' });
        }
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
    if(data.id) {
        debtData.id = data.id;
    }
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