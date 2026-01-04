const express = require('express');
const router = express.Router();
const debtController = require('#controllers/debtController');

// GET
router.get('/', debtController.getDebtStates);
router.get('/detail/:debtId', debtController.getDebtById);

//POST
router.post('/', debtController.getAllDebtsByUserId); // Add POST route for getting debts
router.post('/JSON', debtController.getDebtsJSON);
router.post('/create', debtController.createDebt);

//PUT
router.put('/edit/:debtId', debtController.updateDebt);

//DELETE
router.delete('/delete', debtController.deleteDebt);
module.exports = router;