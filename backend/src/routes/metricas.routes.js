const { Router } = require('express');
const controller = require('../controllers/metricas.controller');

const router = Router();

router.get('/', controller.obtenerResumen);
router.post('/visita', controller.registrarVisita);

module.exports = router;
