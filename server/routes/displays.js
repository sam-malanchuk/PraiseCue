const express = require('express');
const router = express.Router();
const displayController = require('../controllers/displayController');

router.get('/', displayController.getDisplays);
router.post('/', displayController.createDisplay);
router.delete('/:display_number', displayController.deleteDisplay);
router.patch('/:display_number', displayController.patchDisplay);

module.exports = router;
