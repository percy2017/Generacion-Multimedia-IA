import express from 'express';
import { generateContent } from '../controllers/generation.controller.js';
import { isAuthenticatedApi } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ruta para generar contenido
router.post('/api/generate', isAuthenticatedApi, generateContent);

export default router;