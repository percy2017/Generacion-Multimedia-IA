import logger from '../logger.js';

// Middleware para verificar autenticación en rutas de página
export const isAuthenticatedPage = (req, res, next) => {
  logger.debug("Verificando autenticación de página", {
    hasSession: !!req.session,
    hasUser: !!(req.session && req.session.user),
    sessionId: req.session ? req.session.id : null,
    sessionUser: req.session && req.session.user ? {
      alias: req.session.user.alias,
      key: req.session.user.key ? req.session.user.key.substring(0, 8) + "..." : null
    } : null
  });
  
  if (req.session && req.session.user) {
    logger.debug("Autenticación verificada, permitiendo acceso a la página");
    return next();
  }
  
  logger.debug("Autenticación fallida, redirigiendo a la página de login");
  res.redirect("/");
};

// Middleware para verificar autenticación en rutas API
export const isAuthenticatedApi = (req, res, next) => {
  logger.debug("Verificando autenticación de API", {
    hasSession: !!req.session,
    hasUser: !!(req.session && req.session.user),
    sessionId: req.session ? req.session.id : null,
    sessionUser: req.session && req.session.user ? {
      alias: req.session.user.alias,
      key: req.session.user.key ? req.session.user.key.substring(0, 8) + "..." : null
    } : null
  });
  
  if (req.session && req.session.user) {
    logger.debug("Autenticación API verificada, permitiendo acceso");
    return next();
  }
  
  logger.debug("Autenticación API fallida, devolviendo error 401");
  res
    .status(401)
    .json({ message: "No autorizado. Por favor, inicia sesión de nuevo." });
};