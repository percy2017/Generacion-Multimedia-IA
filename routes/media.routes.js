import express from 'express';
import { getMediaFiles } from '../controllers/media.controller.js';
import { isAuthenticatedApi } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ruta para obtener archivos de medios
router.get('/media', isAuthenticatedApi, getMediaFiles);

export default router;