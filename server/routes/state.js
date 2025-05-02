const express = require('express');
const router = express.Router();
const stateController = require('../controllers/stateController');

router.get('/', stateController.getState);
router.post('/', stateController.updateState);

module.exports = router;
