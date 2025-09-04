const TOOL_SCHEMAS = [
  {
    id: "black-forest-labs-flux-1-dev",
    name: "black-forest-labs / FLUX.1 [dev]",
    description: "Ofrece una adherencia excepcional al prompt, alta fidelidad visual y detalles de imagen ricos.",
    logo: "/public/img/flux1.svg",
    provider: "runpod",
    id_provider: "runpod",
    api_endpoint: "https://api.runpod.ai/v2/black-forest-labs-flux-1-dev/runsync",
    apiKey: "",
    pricing: {
      per_million_pixels: 0.04,
      example_template:
        "Por ejemplo, una imagen de 1024x1024 cuesta (1024 * 1024 / 1.000.000) * $0,04 = $0,0420.",
    },
    inputs: [
      {
        type: "textbox",
        name: "prompt",
        label: "Prompt",
        placeholder: "Describe la imagen en detalle...",
        lines: 4,
        required: true,
      },
      {
        type: "textbox",
        name: "negative_prompt",
        label: "Prompt negativo",
        placeholder: "",
        lines: 1,
      },
      {
        type: "group",
        label: "Configuraciones adicionales",
        collapsible: true,
        default_open: true,
        children: [
          {
            type: "number",
            name: "seed",
            label: "Semilla",
            description:
              "Semilla aleatoria para resultados reproducibles. Usa -1 para semilla aleatoria.",
            default: -1,
          },
          {
            type: "number",
            name: "width",
            label: "Ancho",
            description: "Ancho de la imagen en píxeles",
            default: 1024,
            min: 256,
            max: 1536,
            step: 64
          },
          {
            type: "number",
            name: "height",
            label: "Alto",
            description: "Alto de la imagen en píxeles",
            default: 1024,
            min: 256,
            max: 1536,
            step: 64
          },
          {
            type: "stepper",
            name: "num_inference_steps",
            label: "Número de pasos de inferencia",
            description: "Más pasos generalmente producen mayor calidad.",
            min: 1,
            max: 50,
            default: 28,
            step: 1,
          },
          {
            type: "stepper",
            name: "guidance_scale",
            label: "Escala de orientación (CFG)",
            description: "Valores más altos siguen el prompt más de cerca.",
            min: 0,
            max: 20,
            default: 7,
            step: 0.5,
          },
          {
            type: "button_group",
            name: "output_format",
            label: "Formato de salida",
            options: ["png", "jpeg"],
            default: "png",
          },
        ],
      },
    ],

    request_config: {
      payload_structure: {
        root: "input",
        param_mapping: {
          prompt: "prompt",
          negative_prompt: "negative_prompt",
          num_inference_steps: "num_inference_steps",
          guidance_scale: "guidance",
          seed: "seed",
          output_format: "image_format",
          width: "width",
          height: "height",
          __fixed: {},
        },
        type_handling: {
          num_inference_steps: "integer",
          guidance_scale: "float",
          seed: "integer",
          width: "integer",
          height: "integer"
        },
      },
    },
    response_config: {
      image_url_path: "output.image_url",
    },
  },
  {
    id: "qwen-image-edit",
    name: "qwen / Qwen Image Edit",
    description:
      "La versión de edición de imágenes de Qwen-Image. Qwen-Image-Edit extiende con éxito las capacidades únicas de renderizado de texto de Qwen-Image a tareas de edición de imágenes, permitiendo una edición de texto precisa.",
    logo: "/public/img/qwen-edit.svg",
    provider: "runpod",
    id_provider: "runpod",
    api_endpoint: "https://api.runpod.ai/v2/qwen-image-edit/run",
    apiKey: "",
    pricing: {
      per_million_pixels: 0.04,
      example_template:
        "Por ejemplo, una imagen de 1024x1024 cuesta (1024 * 1024 / 1.000.000) * $0,04 = $0,0420.",
    },
    inputs: [
      {
        type: "textbox",
        name: "prompt",
        label: "Prompt",
        placeholder: "Por ejemplo, cambia el color del coche a rojo",
        lines: 3,
        required: true,
      },
      {
        type: "textbox",
        name: "negative_prompt",
        label: "Prompt negativo",
        placeholder: "",
        lines: 1,
      },
      {
        type: "image_upload",
        name: "image",
        label: "Imagen",
        description:
          "Arrastra y suelta archivo(s) o proporciona una URL de datos codificada en base64",
        placeholder: "Ingresa URL o datos base64",
        helper_text: "jpeg, jpg, png hasta 20 MB (archivo único)",
        required: true,
      },
      {
        type: "group",
        label: "Configuraciones adicionales",
        collapsible: true,
        default_open: false,
        children: [
          {
            type: "number",
            name: "seed",
            label: "Semilla",
            description: "Usa -1 para una semilla aleatoria y obtener resultados diferentes.",
            default: -1,
          },
          {
            type: "button_group",
            name: "output_format",
            label: "Formato de salida",
            options: ["png", "jpeg"],
            default: "png",
          },
          {
            type: "toggle",
            name: "enable_safety_checker",
            label: "Activar verificador de seguridad",
            description: "Filtra contenido potencialmente inseguro de la salida.",
            default: true,
          },
        ],
      },
    ],

    request_config: {
      payload_structure: {
        root: "input",
        param_mapping: {
          prompt: "prompt",
          negative_prompt: "negative_prompt",
          image: "image",
          seed: "seed",
          output_format: "output_format",
          enable_safety_checker: "enable_safety_checker",
        },
        type_handling: {
          seed: "integer",
          enable_safety_checker: "boolean",
        },
      },
    },
    response_config: {
      image_url_path: "output.image_url",
    },
  },
  {
    id: "openai-dall-e-3",
    name: "OpenAI / DALL-E 3",
    description: "El modelo más avanzado de OpenAI para la generación de imágenes. Sobresale en la comprensión de prompts complejos y detallados, generando imágenes coherentes, de alta calidad y con una adherencia al texto excepcional.",
    logo: "/public/img/dalle3.svg",
    provider: "openai",
    api_endpoint: "https://api.openai.com/v1/images/generations",
    apiKey: "",
    pricing: {
      type: "per_image",
      costs: {
        standard: {
          "1024x1024": 0.080,
          "1792x1024": 0.160,
          "1024x1792": 0.160
        },
        hd: {
          "1024x1024": 0.160,
          "1792x1024": 0.240,
          "1024x1792": 0.240
        }
      }
    },

    inputs: [
      {
        type: "textbox",
        name: "prompt",
        label: "Prompt",
        placeholder: "Describe la imagen que quieres crear con el mayor detalle posible...",
        lines: 6,
        required: true
      },
      {
        type: "button_group",
        name: "size",
        label: "Tamaño (Relación de aspecto)",
        options: [
          { label: "Cuadrado (1:1)", value: "1024x1024" },
          { label: "Paisaje (16:9)", value: "1792x1024" },
          { label: "Retrato (9:16)", value: "1024x1792" }
        ],
        default: "1024x1024"
      },
      {
        type: "button_group",
        name: "quality",
        label: "Calidad",
        description: "La calidad 'HD' crea imágenes con detalles más finos y mayor consistencia, pero tiene un costo mayor.",
        options: [
          { label: "Estándar", value: "standard" },
          { label: "HD", value: "hd" }
        ],
        default: "standard"
      },
      {
        type: "button_group",
        name: "style",
        label: "Estilo",
        description: "'Vívido' genera imágenes más dramáticas e hiperrealistas. 'Natural' produce imágenes menos exageradas y más fotográficas.",
        options: [
          { label: "Vívido", value: "vivid" },
          { label: "Natural", value: "natural" }
        ],
        default: "vivid"
      }
    ],

    request_config: {
      payload_structure: {
        root: null,
        param_mapping: {
          "prompt": "prompt",
          "size": "size",
          "quality": "quality",
          "style": "style"
        },
        __fixed: {
          "model": "dall-e-3",
          "n": 1
        }
      },
      type_handling: {}
    },

    response_config: {
      image_url_path: "data.0.url"
    }
  },
  {
    id: "wan-2-1-t2v-720",
    name: "Alibaba / Wan 2.1 T2V 720p",
    description: "Wan 2.1 es un modelo de generación de video AI de código abierto que utiliza una arquitectura de transformador de difusión y un VAE espaciotemporal 3D novedoso (Wan-VAE).",
    logo: "/public/img/wan21.svg",

    provider: "runpod",
    api_endpoint: "https://api.runpod.ai/v2/wan-2-1-t2v-720/runsync",
    apiKey: "",
    pricing: {
      type: "per_generation",
      cost: 0.60,
      template: "Una generación de video costará ${cost}"
    },

    inputs: [
      {
        type: "textbox",
        name: "prompt",
        label: "Prompt",
        placeholder: "Describe la escena de video que quieres crear. Incluye detalles de acción, movimiento de cámara y estilo...",
        lines: 5,
        required: true
      },
      {
        type: "textbox",
        name: "negative_prompt",
        label: "Prompt Negativo (Opcional)",
        placeholder: "¿Qué elementos o acciones NO quieres en el video?",
        lines: 2
      },
      {
        type: "group",
        label: "Configuraciones adicionales",
        collapsible: true,
        default_open: true,
        children: [
          {
            type: "number",
            name: "seed",
            label: "Semilla",
            description: "Semilla aleatoria para resultados reproducibles. Usa -1 para semilla aleatoria.",
            default: -1
          },
          {
            type: "button_group",
            name: "size",
            label: "Tamaño",
            options: ["1280*720", "720*1280"],
            default: "1280*720"
          },
          {
            type: "button_group",
            name: "duration",
            label: "Duración (segundos)",
            description: "La duración del clip de video generado (solo 5 o 8 segundos permitidos).",
            options: [
              { label: "5 segundos", value: 5 },
              { label: "8 segundos", value: 8 }
            ],
            default: 5
          },
          {
            type: "stepper",
            name: "flow_shift",
            label: "Desplazamiento de flujo",
            description: "El valor de desplazamiento para el programa de pasos de tiempo para la correspondencia de flujo.",
            min: 0,
            max: 10,
            default: 5,
            step: 1
          },
          {
            type: "stepper",
            name: "num_inference_steps",
            label: "Número de pasos de inferencia",
            description: "Más pasos generalmente producen mayor calidad.",
            min: 10,
            max: 50,
            default: 30,
            step: 1
          },
          {
            type: "stepper",
            name: "guidance", // Nombre del parámetro en la API.
            label: "Escala de orientación (CFG)", // Etiqueta visible en la UI.
            description: "Valores más altos siguen el prompt más de cerca.",
            min: 1,
            max: 15,
            default: 5,
            step: 0.5
          },
          // Usamos el tipo 'checkbox' que se ajusta perfectamente a la UI.
          {
            type: "checkbox",
            name: "enable_safety_checker",
            label: "Activar verificador de seguridad",
            description: "Si activar el verificador de seguridad.",
            default: true
          }
        ]
      }
    ],

    request_config: {
      payload_structure: {
        root: "input",
        param_mapping: {
          "prompt": "prompt",
          "negative_prompt": "negative_prompt",
          "seed": "seed",
          "size": "size",
          "duration": "duration",
          "flow_shift": "flow_shift",
          "num_inference_steps": "num_inference_steps",
          "guidance": "guidance",
          "enable_safety_checker": "enable_safety_checker"
        },
        __fixed: {
          "enable_prompt_optimization": false
        }
      },
      type_handling: {
        "seed": "integer",
        "duration": "integer",
        "flow_shift": "integer",
        "num_inference_steps": "integer",
        "guidance": "float",
        "enable_safety_checker": "boolean"
      }
    },
    response_config: {
      video_url_path: "output.result"
    }
  },
  {
    id: "nano-banana",
    name: "Gemini / Nano Banana",
    description: "Modelo Gemini 2.5 Flash con capacidad avanzada de generación de imágenes. Ofrece una combinación única de velocidad y calidad para crear contenido visual.",
    logo: "/public/img/nano-banana.svg",
    provider: "google",
    api_endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent",
    apiKey: "",
    pricing: {
      per_million_tokens: 30,
      example_template: "Imágenes de hasta 1024x1024px consumen 1290 tokens y cuestan $0.039 por imagen."
    },
    inputs: [
      {
        type: "textbox",
        name: "prompt",
        label: "Prompt",
        placeholder: "Describe la imagen que quieres crear con el mayor detalle posible...",
        lines: 6,
        required: true
      },
      {
        type: "image_upload",
        name: "image",
        label: "Imagen (opcional para edición)",
        description:
          "Arrastra y suelta archivo(s) o proporciona una URL para editar una imagen existente",
        placeholder: "Ingresa URL o datos base64",
        helper_text: "jpeg, jpg, png hasta 20 MB (archivo único)",
        required: false,
      },
      {
        type: "group",
        label: "Configuraciones adicionales",
        collapsible: true,
        default_open: false,
        children: [
          {
            type: "number",
            name: "temperature",
            label: "Temperatura",
            description: "Controla la aleatoriedad de la generación. Valores más bajos son más deterministas.",
            min: 0,
            max: 1,
            default: 0.7,
            step: 0.1
          },
          {
            type: "number",
            name: "max_output_tokens",
            label: "Tokens máximos de salida",
            description: "Límite máximo de tokens en la respuesta.",
            min: 1,
            max: 2048,
            default: 1024
          }
        ]
      }
    ],
    request_config: {
      payload_structure: {
        root: null,
        param_mapping: {
        },
        __fixed: {
          "contents": [
            {
              "role": "user",
              "parts": [
                {
                  "text": ""
                }
              ]
            }
          ],
          "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "temperature": 0.7,
            "maxOutputTokens": 1024
          }
        }
      },
      type_handling: {
      }
    },
    response_config: {
      image_url_path: "candidates.0.content.parts.0.inlineData"
    }
  }
];

export { TOOL_SCHEMAS };
