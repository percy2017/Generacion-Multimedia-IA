import logger from '../logger.js';

// Renderizar página de login
export const showLoginPage = (req, res) => {
  logger.debug("Mostrando página de login", {
    hasSession: !!req.session,
    hasUser: !!(req.session && req.session.user),
    sessionId: req.session ? req.session.id : null
  });
  
  res.render("login", { error: null });
};

// Procesar login
export const processLogin = async (req, res) => {
  const { litellm_url, litellm_key, remember } = req.body;

  logger.debug("Intento de inicio de sesión", {
    url: litellm_url,
    keyPrefix: litellm_key.substring(0, 8) + "...",
    remember: !!remember,
  });

  try {
    const keyInfoUrl = new URL("/key/info", litellm_url);
    keyInfoUrl.searchParams.append("key", litellm_key);

    logger.debug("Consultando información del usuario en LiteLLM", {
      url: keyInfoUrl.href,
      keyPrefix: litellm_key.substring(0, 8) + "...",
    });

    const keyInfoRes = await fetch(keyInfoUrl.href, {
      headers: { "x-litellm-api-key": litellm_key },
    });

    if (!keyInfoRes.ok) {
      logger.warn("Credenciales inválidas o servidor LiteLLM no accesible", {
        status: keyInfoRes.status,
        keyPrefix: litellm_key.substring(0, 8) + "...",
      });
      throw new Error(
        "Credenciales inválidas o servidor liteLLM no accesible."
      );
    }

    const keyInfo = await keyInfoRes.json();

    logger.debug("Información del usuario obtenida de LiteLLM - RESPUESTA COMPLETA", {
      keyInfo: keyInfo
    });

    // Extraer datos correctamente de la estructura de LiteLLM
    const alias = keyInfo.info?.key_alias || keyInfo.info?.alias || "Usuario";
    const spend = keyInfo.info?.spend || 0;
    const budget = keyInfo.info?.max_budget;
    const createdAt = keyInfo.info?.created_at || "";
    const userId = keyInfo.info?.user_id || "";
    const keyName = keyInfo.info?.key_name || "";
    const models = keyInfo.info?.models || [];

    logger.debug("Información del usuario obtenida de LiteLLM", {
      alias: alias,
      spend: spend,
      budget: budget,
      createdAt: createdAt,
      userId: userId,
      keyName: keyName,
      models: models
    });

    req.session.user = {
      key: litellm_key,
      url: litellm_url,
      alias: alias,
      spend: spend,
      budget: budget,
      keyName: keyName,
      userId: userId,
      createdAt: createdAt,
      models: models,
    };

    // Configurar la duración de la sesión según la opción "Recuérdame"
    if (remember) {
      // Extender la duración a 30 días si se selecciona "Recuérdame"
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
      logger.debug("Sesión configurada para 30 días (Recuérdame activado)");
    } else {
      // Usar la duración por defecto (24 horas)
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 horas
      logger.debug("Sesión configurada para 24 horas (Recuérdame desactivado)");
    }

    logger.info(`Login exitoso para el usuario: ${req.session.user.alias}`, {
      userId: req.session.user.key.substring(0, 8) + "...",
      spend: req.session.user.spend,
      budget: req.session.user.budget,
    });

    // Ensure session is saved before redirecting
    req.session.save((err) => {
      if (err) {
        logger.error("Error al guardar la sesión:", err);
        return res.status(500).render("login", {
          error: "Error interno del servidor. Por favor, inténtalo de nuevo."
        });
      }
      
      logger.debug("Sesión guardada correctamente, redirigiendo a /app");
      res.redirect("/app");
    });
  } catch (error) {
    logger.error("Fallo en el login:", { error: error.message });
    res.render("login", {
      error: "Credenciales inválidas. Por favor, inténtalo de nuevo.",
    });
  }
};

// Cerrar sesión
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error("Error al destruir la sesión:", err);
    }
    res.redirect("/");
  });
};

// Mostrar aplicación principal
export const showMainApp = (req, res) => {
  logger.debug("Mostrando aplicación principal", {
    hasSession: !!req.session,
    hasUser: !!(req.session && req.session.user),
    user: req.session && req.session.user ? {
      alias: req.session.user.alias,
      key: req.session.user.key ? req.session.user.key.substring(0, 8) + "..." : null,
      createdAt: req.session.user.createdAt,
      userId: req.session.user.userId,
      models: req.session.user.models
    } : null
  });
  
  // Importar los esquemas de herramientas
  import('../public/schemas.js').then(({ TOOL_SCHEMAS }) => {
    res.render("main", {
      user: req.session.user,
      TOOL_SCHEMAS: TOOL_SCHEMAS,
    });
  }).catch(error => {
    logger.error("Error al importar TOOL_SCHEMAS:", error);
    res.status(500).send("Error interno del servidor");
  });
};