import express from "express";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import session from "express-session";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Importamos nuestros módulos personalizados
import logger from "./logger.js";

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import mediaRoutes from './routes/media.routes.js';
import generationRoutes from './routes/generation.routes.js';
import statsRoutes from './routes/stats.routes.js';

// --- CONFIGURACIÓN Y SETUP INICIAL ---
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use("/public", express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "un-secreto-muy-secreto-cambiar-en-produccion",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production" && process.env.PROTOCOL === "https",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// --- RUTAS ---
app.use('/', authRoutes);
app.use('/api', mediaRoutes);
app.use('/api', generationRoutes);
app.use('/api', statsRoutes);

async function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`Servidor backend escuchando en http://localhost:${PORT}`);
      logger.info(`Entorno actual: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error("FATAL: No se pudo iniciar el servidor.", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

startServer();