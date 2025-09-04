import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';
import { getGenerationMetadata } from './metadata.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener estadísticas del usuario
export const getUserStats = async (req, res) => {
  try {
    const mediaDir = path.join(__dirname, "..", "public", "media");
    const metadataDir = path.join(mediaDir, "metadata");
    
    logger.debug("Obteniendo estadísticas del usuario", {
      userId: req.session.user.key.substring(0, 8) + "...",
      mediaDir,
      metadataDir
    });

    // Verificar si el directorio de metadatos existe
    try {
      await fs.access(metadataDir);
    } catch (error) {
      // Si no existe, devolver estadísticas vacías
      return res.json({
        totalFiles: 0,
        totalSpend: 0,
        lastGeneration: null,
        mostUsedTools: []
      });
    }

    // Leer archivos de metadatos
    const metadataFiles = await fs.readdir(metadataDir);
    
    logger.debug("Archivos de metadatos encontrados", {
      count: metadataFiles.length,
      files: metadataFiles.slice(0, 10) // Mostrar solo los primeros 10
    });

    // Filtrar y procesar metadatos del usuario actual
    const userStats = {
      totalFiles: 0,
      totalSpend: 0,
      lastGeneration: null,
      mostUsedTools: {},
      toolsUsage: []
    };

    // Variables para encontrar la última generación
    let latestTimestamp = 0;
    let lastGenerationData = null;

    for (const file of metadataFiles) {
      // Solo procesar archivos JSON
      if (file.endsWith('.json')) {
        try {
          // Obtener metadatos
          const metadata = await getGenerationMetadata(path.basename(file, '.json'));
          
          // Solo incluir metadatos del usuario actual
          if (metadata && metadata.userId === req.session.user.key) {
            userStats.totalFiles++;
            
            // Sumar costo
            if (metadata.cost) {
              userStats.totalSpend += metadata.cost;
            }
            
            // Verificar si es la última generación
            if (metadata.timestamp && metadata.timestamp > latestTimestamp) {
              latestTimestamp = metadata.timestamp;
              lastGenerationData = metadata;
            }
            
            // Contar uso de herramientas
            if (metadata.toolName) {
              if (!userStats.mostUsedTools[metadata.toolName]) {
                userStats.mostUsedTools[metadata.toolName] = 0;
              }
              userStats.mostUsedTools[metadata.toolName]++;
            }
          }
        } catch (error) {
          logger.warn("Error al procesar archivo de metadatos", {
            filename: file,
            error: error.message
          });
        }
      }
    }
    
    // Convertir el objeto de herramientas a un array ordenado
    userStats.toolsUsage = Object.entries(userStats.mostUsedTools)
      .map(([toolName, count]) => ({ toolName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Tomar solo las 5 herramientas más usadas
    
    // Establecer la última generación
    userStats.lastGeneration = lastGenerationData;
    
    logger.info("Estadísticas del usuario calculadas", {
      userId: req.session.user.key.substring(0, 8) + "...",
      totalFiles: userStats.totalFiles,
      totalSpend: userStats.totalSpend,
      toolsCount: userStats.toolsUsage.length
    });

    res.json(userStats);
  } catch (error) {
    logger.error("Error al obtener estadísticas del usuario:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error interno del servidor" });
  }
};