const { Router } = require('express');
const controller = require('../controllers/usuarios.controller');

const router = Router();

router.get('/', controller.listar);
router.post('/', controller.crear);
router.post('/registro', controller.registrarVisitante);
router.post('/login', controller.login);
router.patch('/:id/estado', controller.cambiarEstado);
router.patch('/:id/rol', controller.cambiarRol);
router.delete('/:id', controller.eliminar);

module.exports = router;
