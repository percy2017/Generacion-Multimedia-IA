import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generar contenido
export const generateContent = async (req, res) => {
  try {
    // Importar los esquemas de herramientas
    const { TOOL_SCHEMAS } = await import('../public/schemas.js');
    
    const { toolId, inputs } = req.body;

    logger.debug("Iniciando generación de contenido", {
      toolId,
      userId: req.session.user.key.substring(0, 8) + "...",
      inputs: Object.keys(inputs),
    });

    // Find the tool schema
    const tool = TOOL_SCHEMAS.find((t) => t.id === toolId);
    if (!tool) {
      logger.warn("Herramienta no encontrada", { toolId });
      return res.status(400).json({ message: "Herramienta no encontrada" });
    }

    logger.debug("Herramienta encontrada", {
      toolName: tool.name,
      provider: tool.provider,
    });

    // Fetch current user spend from LiteLLM to ensure accuracy
    let currentUserSpend = req.session.user.spend || 0;
    try {
      logger.debug("Consultando gasto actual del usuario en LiteLLM", {
        userId: req.session.user.key.substring(0, 8) + "...",
        url: req.session.user.url,
      });

      const keyInfoUrl = new URL("/key/info", req.session.user.url);
      keyInfoUrl.searchParams.append("key", req.session.user.key);
      const keyInfoRes = await fetch(keyInfoUrl.href, {
        headers: {
          Authorization: `Bearer ${req.session.user.key}`,
          "Content-Type": "application/json",
        },
      });

      if (keyInfoRes.ok) {
        const keyInfo = await keyInfoRes.json();
        currentUserSpend = keyInfo.info.spend || 0;
        // Update session with current spend
        req.session.user.spend = currentUserSpend;

        logger.debug("Gasto actual del usuario obtenido", {
          userId: req.session.user.key.substring(0, 8) + "...",
          currentSpend: currentUserSpend,
        });
      } else {
        logger.warn("No se pudo obtener el gasto del usuario de LiteLLM", {
          status: keyInfoRes.status,
          userId: req.session.user.key.substring(0, 8) + "...",
        });
      }
    } catch (fetchError) {
      logger.error("Error fetching current spend from LiteLLM:", {
        error: fetchError.message,
        userId: req.session.user.key.substring(0, 8) + "...",
      });
      // Continue with session spend if LiteLLM fetch fails
    }

    // Get user budget
    const userBudget = req.session.user.budget;

    logger.debug("Información de presupuesto del usuario", {
      userId: req.session.user.key.substring(0, 8) + "...",
      currentSpend: currentUserSpend,
      budget: userBudget,
    });

    // Calculate generation cost based on tool pricing
    let generationCost = 0;

    if (tool.pricing) {
      if (tool.pricing.per_million_pixels) {
        // Calculate cost based on image dimensions
        // Default to 1024x1024 if not specified
        let width = 1024;
        let height = 1024;

        // Try to get dimensions from inputs
        if (inputs.width && inputs.height) {
          width = parseInt(inputs.width);
          height = parseInt(inputs.height);
        } else if (inputs.size) {
          // Parse size string like "1024x1024"
          const dimensions = inputs.size.split("x");
          if (dimensions.length === 2) {
            width = parseInt(dimensions[0]);
            height = parseInt(dimensions[1]);
          }
        }

        const pixels = width * height;
        const millionPixels = pixels / 1000000;
        generationCost = millionPixels * tool.pricing.per_million_pixels;

        logger.debug("Cálculo de costo basado en píxeles", {
          width,
          height,
          pixels,
          millionPixels,
          costPerMillion: tool.pricing.per_million_pixels,
          generationCost,
        });
      } else if (tool.pricing.type === "per_image") {
        // Get size and quality from inputs
        const size = inputs.size || "1024x1024";
        const quality = inputs.quality || "standard";

        if (tool.pricing.costs[quality] && tool.pricing.costs[quality][size]) {
          generationCost = tool.pricing.costs[quality][size];
        } else {
          // Fallback to standard quality
          generationCost = tool.pricing.costs.standard[size] || 0;
        }

        logger.debug("Cálculo de costo por imagen", {
          size,
          quality,
          generationCost,
        });
      } else if (tool.pricing.type === "per_generation") {
        generationCost = tool.pricing.cost || 0;

        logger.debug("Cálculo de costo por generación", {
          generationCost,
        });
      }
    }

    logger.info("Costo de generación calculado", {
      userId: req.session.user.key.substring(0, 8) + "...",
      toolName: tool.name,
      generationCost: generationCost.toFixed(6),
    });

    // Check if user has enough balance for this generation
    if (userBudget && currentUserSpend + generationCost > userBudget) {
      logger.warn("Saldo insuficiente para la generación", {
        userId: req.session.user.key.substring(0, 8) + "...",
        currentSpend,
        generationCost,
        totalRequired: currentUserSpend + generationCost,
        budget: userBudget,
      });

      return res.status(400).json({
        message: "Saldo insuficiente para realizar esta generación",
        currentSpend: currentUserSpend,
        generationCost: generationCost,
        budget: userBudget,
      });
    }

    logger.debug(
      "Usuario tiene saldo suficiente, procediendo con la generación"
    );

    // Build the request payload based on tool configuration
    let payload = {};

    // Handle root structure
    if (tool.request_config.payload_structure.root) {
      payload[tool.request_config.payload_structure.root] = {};
    }

    // Map inputs to payload
    const target = tool.request_config.payload_structure.root
      ? payload[tool.request_config.payload_structure.root]
      : payload;

    // Add fixed parameters
    if (tool.request_config.payload_structure.__fixed) {
      Object.assign(target, tool.request_config.payload_structure.__fixed);
    }

    // Map user inputs
    const paramMapping = tool.request_config.payload_structure.param_mapping;
    for (const [inputName, paramName] of Object.entries(paramMapping)) {
      if (inputName === "__fixed") continue;

      if (inputs[inputName] !== undefined) {
        // Handle file uploads for image editing tools
        if (
          inputName === "image" &&
          typeof inputs[inputName] === "object" &&
          inputs[inputName].constructor.name === "File"
        ) {
          // This is a file upload, save it to media directory and use the URL
          try {
            const file = inputs[inputName];
            const timestamp = Date.now();
            const keyName = req.session.user.key;
            const fileNumber = timestamp.toString().slice(-5);
            const fileExtension = path.extname(file.name) || ".png";
            const filename = `${keyName}_${fileNumber}${fileExtension}`;
            const filePath = path.join(__dirname, "..", "public", "media", filename);

            // Save file to disk
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(filePath, buffer);

            // Create public URL
            const publicUrl = `${req.protocol}://${req.get(
              "host"
            )}/public/media/${filename}`;
            target[paramName] = publicUrl;

            logger.debug("Imagen subida guardada", {
              filename: filename,
              publicUrl: publicUrl,
              fileSize: buffer.length,
            });
          } catch (fileError) {
            logger.error("Error al guardar imagen subida", {
              error: fileError.message,
            });
            throw new Error("No se pudo procesar la imagen subida");
          }
        } else {
          // Handle type conversion for regular inputs
          let value = inputs[inputName];
          if (
            tool.request_config.payload_structure.type_handling &&
            tool.request_config.payload_structure.type_handling[inputName]
          ) {
            const type =
              tool.request_config.payload_structure.type_handling[inputName];
            switch (type) {
              case "integer":
                value = parseInt(value);
                break;
              case "float":
                value = parseFloat(value);
                break;
              case "boolean":
                value =
                  value === "true" ||
                  value === true ||
                  value === "on" ||
                  value === "1" ||
                  value === 1;
                break;
            }
          }

          target[paramName] = value;
        }
      }
    }

    logger.debug("Payload construido para la API", {
      toolName: tool.name,
      endpoint: tool.api_endpoint,
      payload: JSON.stringify(payload, null, 2),
    });

    // Make API request
    let apiResponse;
    try {
      // Get API key based on provider from environment variables
      let apiKey = "";
      switch (tool.provider) {
        case "runpod":
          apiKey = process.env.RUNPOD_API_KEY || "";
          break;
        case "openai":
          apiKey = process.env.OPENAI_API_KEY || "";
          break;
        default:
          apiKey = process.env.DEFAULT_API_KEY || "";
      }

      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      };

      // Special handling for OpenAI
      if (tool.provider === "openai") {
        fetchOptions.headers["Authorization"] = `Bearer ${apiKey}`;
      }

      logger.info("=== SOLICITUD A LA API DEL PROVEEDOR ===");
      logger.info("HERRAMIENTA: " + tool.name);
      logger.info("PROVEEDOR: " + tool.provider);
      logger.info("ENDPOINT: " + tool.api_endpoint);
      logger.info("HEADERS DE LA SOLICITUD:");
      logger.info(
        JSON.stringify(
          {
            "Content-Type": fetchOptions.headers["Content-Type"],
            Authorization: fetchOptions.headers["Authorization"]
              ? "Bearer ***" + apiKey.substring(apiKey.length - 4)
              : undefined,
          },
          null,
          2
        )
      );
      logger.info("CUERPO DE LA SOLICITUD (PAYLOAD):");
      logger.info(JSON.stringify(payload, null, 2));
      logger.info("=====================================");

      apiResponse = await fetch(tool.api_endpoint, fetchOptions);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        logger.error("=== ERROR EN LA SOLICITUD A LA API ===");
        logger.error("HERRAMIENTA: " + tool.name);
        logger.error("STATUS: " + apiResponse.status);
        logger.error("STATUS TEXT: " + apiResponse.statusText);
        logger.error("ERROR DETALLADO:");
        logger.error(errorText);
        logger.error("=====================================");
        throw new Error(
          `API request failed with status ${apiResponse.status}: ${errorText}`
        );
      }

      logger.debug("Respuesta exitosa de la API del proveedor", {
        toolName: tool.name,
        status: apiResponse.status,
        statusText: apiResponse.statusText,
      });
    } catch (apiError) {
      logger.error("Error en la solicitud a la API:", {
        error: apiError.message,
        toolId: tool.id,
        endpoint: tool.api_endpoint,
      });
      return res.status(500).json({
        message: "Error al conectar con el servicio de generación",
        details: apiError.message,
      });
    }

    // Process API response
    const apiResult = await apiResponse.json();

    logger.info("=== RESPUESTA DE LA API DEL PROVEEDOR ===");
    logger.info("HERRAMIENTA: " + tool.name);
    logger.info("STATUS: " + apiResponse.status);
    logger.info("CUERPO DE LA RESPUESTA:");
    logger.info(JSON.stringify(apiResult, null, 2));
    logger.info("=====================================");

    // Extract media URL from response based on tool configuration
    let mediaUrl = null;
    let mediaType = "image";

    if (tool.response_config.image_url_path) {
      // Navigate through the response object using dot notation
      const pathParts = tool.response_config.image_url_path.split(".");
      let current = apiResult;
      for (const part of pathParts) {
        // Handle array notation like "data.0.url"
        if (/^\d+$/.test(part) && Array.isArray(current)) {
          // Part is an array index
          const index = parseInt(part);
          if (current && current[index] !== undefined) {
            current = current[index];
          } else {
            current = null;
            break;
          }
        } else if (current && current[part] !== undefined) {
          // Part is an object property
          current = current[part];
        } else {
          current = null;
          break;
        }
      }
      mediaUrl = current;

      logger.debug("URL de imagen extraída", {
        path: tool.response_config.image_url_path,
        mediaUrl: mediaUrl ? mediaUrl.substring(0, 100) + "..." : null,
        fullResponseSample:
          JSON.stringify(apiResult, null, 2).substring(0, 500) + "...",
      });
    }

    if (tool.response_config.video_url_path) {
      // Navigate through the response object using dot notation
      const pathParts = tool.response_config.video_url_path.split(".");
      let current = apiResult;
      for (const part of pathParts) {
        // Handle array notation like "data.0.url"
        if (/^\d+$/.test(part) && Array.isArray(current)) {
          // Part is an array index
          const index = parseInt(part);
          if (current && current[index] !== undefined) {
            current = current[index];
          } else {
            current = null;
            break;
          }
        } else if (current && current[part] !== undefined) {
          // Part is an object property
          current = current[part];
        } else {
          current = null;
          break;
        }
      }
      mediaUrl = current;
      mediaType = "video";

      logger.debug("URL de video extraída", {
        path: tool.response_config.video_url_path,
        mediaUrl: mediaUrl ? mediaUrl.substring(0, 100) + "..." : null,
        fullResponseSample:
          JSON.stringify(apiResult, null, 2).substring(0, 500) + "...",
      });
    }

    if (!mediaUrl) {
      logger.error(
        "No se pudo extraer la URL del medio de la respuesta de la API",
        {
          toolId: tool.id,
          response: apiResult,
        }
      );
      return res.status(500).json({
        message: "No se pudo obtener el contenido generado",
      });
    }

    logger.info("Contenido generado exitosamente", {
      toolName: tool.name,
      mediaType,
      mediaUrl: mediaUrl.substring(0, 50) + "...",
    });

    // Download and save the media file locally
    try {
      // Generate a filename based on user key and timestamp
      const timestamp = Date.now();
      // Use the user key as the key name
      const keyName = req.session.user.key;
      // Generate a simple file number based on timestamp
      const fileNumber = timestamp.toString().slice(-5); // Last 5 digits of timestamp
      const fileExtension = mediaType === "video" ? ".mp4" : ".png";
      const filename = `${keyName}_${fileNumber}${fileExtension}`;
      const filePath = path.join(__dirname, "..", "public", "media", filename);

      logger.debug("Descargando contenido generado", {
        mediaUrl: mediaUrl.substring(0, 100) + "...",
        localFilename: filename,
      });

      // Download the media file
      const mediaResponse = await fetch(mediaUrl);
      logger.debug("Respuesta de descarga", {
        status: mediaResponse.status,
        statusText: mediaResponse.statusText,
        headers: Object.fromEntries(mediaResponse.headers.entries()),
      });

      if (!mediaResponse.ok) {
        throw new Error(
          `Failed to download media: ${mediaResponse.status} ${mediaResponse.statusText}`
        );
      }

      // Save the file
      const mediaBuffer = await mediaResponse.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(mediaBuffer));

      logger.info("Contenido guardado localmente", {
        localPath: filePath,
        fileSize: mediaBuffer.byteLength,
      });

      // Create local URL for the saved media
      const localMediaUrl = `/public/media/${filename}`;

      // Return the local URL
      const result = {
        mediaUrl: localMediaUrl,
        mediaType: mediaType,
        userSpend: currentUserSpend + generationCost,
        generationCost: generationCost,
        userBudget: userBudget, // Add user budget to response
      };

      // Update user session spend
      req.session.user.spend = currentUserSpend + generationCost;

      logger.debug("Actualizando gasto del usuario en la sesión", {
        userId: req.session.user.key.substring(0, 8) + "...",
        previousSpend: currentUserSpend,
        generationCost,
        newSpend: currentUserSpend + generationCost,
      });

      // Update spend in LiteLLM
      try {
        const updateKeyUrl = new URL("/key/update", req.session.user.url);
        const updateResponse = await fetch(updateKeyUrl.href, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${req.session.user.key}`,
          },
          body: JSON.stringify({
            key: req.session.user.key,
            spend: currentUserSpend + generationCost,
          }),
        });

        if (!updateResponse.ok) {
          logger.error("Failed to update spend in LiteLLM", {
            status: updateResponse.status,
            statusText: updateResponse.statusText,
          });
        } else {
          logger.info("Gasto actualizado exitosamente en LiteLLM", {
            userId: req.session.user.key.substring(0, 8) + "...",
            newSpend: currentUserSpend + generationCost,
          });
        }
      } catch (updateError) {
        logger.error("Error updating spend in LiteLLM", {
          error: updateError.message,
        });
      }

      logger.info("Generación completada exitosamente", {
        userId: req.session.user.key.substring(0, 8) + "...",
        toolName: tool.name,
        localMediaUrl,
      });

      res.json(result);
    } catch (downloadError) {
      logger.error("Error al descargar y guardar el archivo multimedia:", {
        error: downloadError.message,
        stack: downloadError.stack,
        mediaUrl: mediaUrl,
      });

      // Fallback to returning the direct URL if download fails
      const result = {
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        userSpend: currentUserSpend + generationCost,
        generationCost: generationCost,
        userBudget: userBudget, // Add user budget to response
      };

      // Update user session spend
      req.session.user.spend = currentUserSpend + generationCost;

      // Update spend in LiteLLM
      try {
        const updateKeyUrl = new URL("/key/update", req.session.user.url);
        const updateResponse = await fetch(updateKeyUrl.href, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${req.session.user.key}`,
          },
          body: JSON.stringify({
            key: req.session.user.key,
            spend: currentUserSpend + generationCost,
          }),
        });

        if (!updateResponse.ok) {
          logger.error("Failed to update spend in LiteLLM", {
            status: updateResponse.status,
            statusText: updateResponse.statusText,
          });
        } else {
          logger.info("Gasto actualizado exitosamente en LiteLLM (fallback)", {
            userId: req.session.user.key.substring(0, 8) + "...",
            newSpend: currentUserSpend + generationCost,
          });
        }
      } catch (updateError) {
        logger.error("Error updating spend in LiteLLM", {
          error: updateError.message,
        });
      }

      res.json(result);
    }
  } catch (error) {
    logger.error("Error en la generación de contenido:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error interno del servidor" });
  }
};