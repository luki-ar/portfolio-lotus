const { Router } = require('express');
const controller = require('../controllers/servicios.controller');

const router = Router();

router.get('/', controller.listar);
router.post('/', controller.crear);
router.patch('/:id/estado', controller.cambiarEstado);
router.delete('/:id', controller.eliminar);

module.exports = router;
