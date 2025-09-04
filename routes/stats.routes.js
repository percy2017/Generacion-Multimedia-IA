import express from 'express';
import { getUserStats } from '../controllers/stats.controller.js';
import { isAuthenticatedApi } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ruta para obtener estadísticas del usuario
router.get('/stats', isAuthenticatedApi, getUserStats);

export default router;