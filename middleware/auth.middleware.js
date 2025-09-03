import logger from '../logger.js';

// Middleware para verificar autenticación en rutas de página
export const isAuthenticatedPage = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/");
};

// Middleware para verificar autenticación en rutas API
export const isAuthenticatedApi = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res
    .status(401)
    .json({ message: "No autorizado. Por favor, inicia sesión de nuevo." });
};