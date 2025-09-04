import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio para almacenar los metadatos
const METADATA_DIR = path.join(__dirname, "..", "public", "media", "metadata");

// Asegurarse de que el directorio de metadatos exista
async function ensureMetadataDir() {
  try {
    await fs.access(METADATA_DIR);
  } catch (error) {
    // Crear directorio si no existe
    await fs.mkdir(METADATA_DIR, { recursive: true });
    logger.info("Directorio de metadatos creado", { metadataDir: METADATA_DIR });
  }
}

// Guardar metadatos de generación
export async function saveGenerationMetadata(filename, metadata) {
  try {
    await ensureMetadataDir();
    
    // Crear un nombre de archivo para los metadatos basado en el nombre del archivo de medios
    const metadataFilename = `${filename}.json`;
    const metadataPath = path.join(METADATA_DIR, metadataFilename);
    
    // Guardar los metadatos en un archivo JSON
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    logger.debug("Metadatos de generación guardados", {
      filename: filename,
      metadataPath: metadataPath,
      metadata: metadata
    });
  } catch (error) {
    logger.error("Error al guardar metadatos de generación", {
      error: error.message,
      filename: filename
    });
  }
}

// Obtener metadatos de generación
export async function getGenerationMetadata(filename) {
  try {
    const metadataFilename = `${filename}.json`;
    const metadataPath = path.join(METADATA_DIR, metadataFilename);
    
    // Verificar si el archivo de metadatos existe
    try {
      await fs.access(metadataPath);
    } catch (error) {
      // Si no existe, devolver null
      return null;
    }
    
    // Leer y parsear los metadatos
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataContent);
    
    logger.debug("Metadatos de generación cargados", {
      filename: filename,
      metadata: metadata
    });
    
    return metadata;
  } catch (error) {
    logger.error("Error al cargar metadatos de generación", {
      error: error.message,
      filename: filename
    });
    return null;
  }
}