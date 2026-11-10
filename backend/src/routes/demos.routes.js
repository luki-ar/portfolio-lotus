const { Router } = require('express');
const controller = require('../controllers/demos.controller');

const router = Router();

router.get('/', controller.listar);
router.post('/', controller.crear);
router.delete('/:id', controller.eliminar);

module.exports = router;
