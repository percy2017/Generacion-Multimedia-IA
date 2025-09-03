import express from 'express';
import { 
  showLoginPage, 
  processLogin, 
  logout, 
  showMainApp 
} from '../controllers/auth.controller.js';
import { 
  isAuthenticatedPage, 
  isAuthenticatedApi 
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Ruta para mostrar la página de login
router.get('/', showLoginPage);

// Ruta para procesar el login
router.post('/login', processLogin);

// Ruta para mostrar la aplicación principal
router.get('/app', isAuthenticatedPage, showMainApp);

// Ruta para cerrar sesión
router.get('/logout', logout);

export default router;