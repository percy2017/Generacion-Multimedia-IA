import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener archivos de medios
export const getMediaFiles = async (req, res) => {
  try {
    const mediaDir = path.join(__dirname, "..", "public", "media");

    logger.debug("Obteniendo archivos de medios para el usuario", {
      userId: req.session.user.key.substring(0, 8) + "...",
      mediaDir,
    });

    // Check if directory exists
    try {
      await fs.access(mediaDir);
    } catch (error) {
      // Create directory if it doesn't exist
      await fs.mkdir(mediaDir, { recursive: true });
      logger.info("Directorio de medios creado", { mediaDir });
    }

    // Read files from directory
    const files = await fs.readdir(mediaDir);

    logger.debug("Archivos encontrados en el directorio", {
      count: files.length,
      files: files.filter((f) => f !== "placeholder.jpg").slice(0, 10), // Mostrar solo los primeros 10
    });

    // Filter and map files to include metadata
    const mediaFiles = [];

    for (const file of files) {
      // Skip placeholder files
      if (file === "placeholder.jpg") continue;

      // Get file stats
      const filePath = path.join(mediaDir, file);
      const stats = await fs.stat(filePath);

      // Only include files (not directories)
      if (stats.isFile()) {
        // Parse filename to extract key and file number
        const lastUnderscoreIndex = file.lastIndexOf("_");
        const lastDotIndex = file.lastIndexOf(".");

        if (
          lastUnderscoreIndex !== -1 &&
          lastDotIndex !== -1 &&
          lastUnderscoreIndex < lastDotIndex
        ) {
          const keyName = file.substring(0, lastUnderscoreIndex);
          const fileNumber = file.substring(
            lastUnderscoreIndex + 1,
            lastDotIndex
          );

          // Only include files that belong to the current user
          if (keyName === req.session.user.key) {
            const fileUrl = `/public/media/${file}`;
            const timestamp = stats.birthtime.getTime();

            mediaFiles.push({
              name: file,
              url: fileUrl,
              timestamp: timestamp,
              size: stats.size,
              keyName: keyName,
              fileNumber: fileNumber,
            });

            logger.debug("Archivo de medio agregado", {
              filename: file,
              userId: keyName.substring(0, 8) + "...",
              size: stats.size,
            });
          } else {
            logger.debug("Archivo omitido (no pertenece al usuario)", {
              filename: file,
              fileUserId: keyName.substring(0, 8) + "...",
              currentUserId: req.session.user.key.substring(0, 8) + "...",
            });
          }
        } else {
          logger.warn("Nombre de archivo con formato incorrecto", {
            filename: file,
          });
        }
      }
    }

    // Sort by timestamp (newest first)
    mediaFiles.sort((a, b) => b.timestamp - a.timestamp);

    logger.info("Galería cargada exitosamente", {
      userId: req.session.user.key.substring(0, 8) + "...",
      mediaCount: mediaFiles.length,
    });

    res.json({ media: mediaFiles });
  } catch (error) {
    logger.error("Error al obtener archivos de medios:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error interno del servidor" });
  }
};