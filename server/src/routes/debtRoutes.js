const express = require('express');
const router = express.Router();
const debtController = require('#controllers/debtController');

// GET
router.get('/', debtController.getAllDebtsByUserId);
router.get('/detail/:debtId', debtController.getDebtById);
router.get('/create', debtController.getDebtStates);

router.post('/create', debtController.createDebt);
//router.post('/edit', debtController.updateDebt);
//router.post('/delete', debtController.deleteDebt);

module.exports = router;