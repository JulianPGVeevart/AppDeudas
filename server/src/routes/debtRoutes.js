const express = require('express');
const router = express.Router();
const debtController = require('#controllers/debtController');

// GET
router.get('/', debtController.getAllDebtsByUserId);
router.get('/detail/:debtId', debtController.getDebtById);
router.get('/create', debtController.getDebtStates);

//POST
router.post('/create', debtController.createDebt);

//PUT
router.put('/edit/:debtId', debtController.updateDebt);

//DELETE
router.delete('/delete', debtController.deleteDebt);
module.exports = router;