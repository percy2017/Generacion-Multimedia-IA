import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// Determina el entorno actual. Por defecto, es 'development'.
const environment = process.env.NODE_ENV || 'development';

// Define los niveles de logging estándar de Winston
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define los colores para cada nivel en el modo de desarrollo
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Define el formato para los logs en la consola (desarrollo)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

// Define el formato para los logs en archivos (producción)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Define los "transportes" (dónde se guardan los logs)
const transports = [];

if (environment === 'production') {
  // En producción, guarda los logs en archivos
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  transports.push(
    // Guarda todos los logs de nivel 'info' o inferior en un archivo combinado
    new winston.transports.File({
      filename: path.join(__dirname, 'logs', 'combined.log'),
      format: fileFormat,
    }),
    // Guarda todos los logs de nivel 'error' en un archivo separado para fácil acceso
    new winston.transports.File({
      level: 'error',
      filename: path.join(__dirname, 'logs', 'error.log'),
      format: fileFormat,
    })
  );
} else {
  // En desarrollo, solo muestra los logs en la consola
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Crea la instancia del logger con la configuración definida
const logger = winston.createLogger({
  level: environment === 'production' ? 'info' : 'debug',
  levels,
  transports,
});

export default logger;