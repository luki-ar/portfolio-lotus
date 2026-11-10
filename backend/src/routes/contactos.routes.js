const { Router } = require('express');
const controller = require('../controllers/contactos.controller');

const router = Router();

router.get('/', controller.listar);
router.post('/', controller.crear);
router.post('/:id/responder', controller.responder);
router.patch('/:id/respondido', controller.marcarRespondido);
router.delete('/:id', controller.eliminar);

module.exports = router;
