const debtService = require('#services/debtService');

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