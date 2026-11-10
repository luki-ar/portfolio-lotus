const { Router } = require('express');
const controller = require('../controllers/proyectos.controller');

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.delete('/:id', controller.eliminar);

module.exports = router;
