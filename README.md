# 🚀 KipuxAI - Portal de Generación Multimedia

Un portal de autoservicio y backend unificado, diseñado para interactuar con una multitud de APIs de generación de contenido multimedia (imagen, video, etc.) a través de una única interfaz flexible y dinámica.

![Captura de Pantalla de la Aplicación](https-prod-files-min-dev-public/images/8646f901-4470-4952-b918-fc3373406e23.png)
*(Recomendación: Reemplaza la URL de arriba con una captura de pantalla de tu aplicación en acción)*

---

## ✨ Concepto Central: Arquitectura Dirigida por Esquemas

Este proyecto se fundamenta en una **arquitectura dirigida por esquemas**. En lugar de tener código específico para cada modelo de IA, toda la lógica de la interfaz, la construcción de peticiones a la API y el manejo de respuestas se define en un único archivo de configuración: `public/js/schemas.js`.

Este archivo actúa como la **fuente única de verdad** y le dice a la aplicación cómo debe comportarse para cada herramienta. El flujo de trabajo es el siguiente:

1.  **Definición (El Esquema):** Se describe una nueva herramienta de IA (sus parámetros, precios, endpoints, etc.) en `public/js/schemas.js`.
2.  **Renderizado (Frontend):** El frontend lee el esquema y construye dinámicamente la interfaz de usuario (formularios, sliders, botones) sin necesidad de código específico para esa herramienta.
3.  **Procesamiento (Backend):** El backend recibe una petición con un `schemaId`, lee el mismo esquema para construir el payload correcto, llama a la API externa, procesa la respuesta, calcula costos y guarda el resultado.

Este enfoque permite añadir nuevas herramientas de IA con un esfuerzo mínimo, a menudo **sin escribir una sola línea de código de lógica de negocio**, simplemente actualizando el archivo de esquemas.

## 📋 Tabla de Contenidos

1.  [Características Principales](#-características-principales)
2.  [Pila Tecnológica](#-pila-tecnológica)
3.  [Estructura del Proyecto](#-estructura-del-proyecto)
4.  [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
5.  [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
6.  [Cómo Integrar un Nuevo Modelo de IA](#-cómo-integrar-un-nuevo-modelo-de-ia)
7.  [Endpoints de la API](#-endpoints-de-la-api)
8.  [Flujo de Generación de Contenido](#-flujo-de-generación-de-contenido)
9.  [Arquitectura del Código](#-arquitectura-del-código)
10. [Licencia](#-licencia)

## 🌟 Características Principales

-   **Interfaz de Usuario Dinámica:** La UI se genera automáticamente a partir de los esquemas, creando controles adaptados a cada herramienta.
-   **Soporte Multi-Proveedor:** Interactúa con APIs de RunPod, OpenAI y otros a través de una capa de abstracción unificada.
-   **Autenticación y Gestión de Presupuestos:** Integrado con [LiteLLM](https://github.com/BerriAI/litellm) para validar claves de API, gestionar usuarios y controlar el gasto.
-   **Seguimiento de Costos en Tiempo Real:** Calcula el costo de cada generación y lo verifica contra el presupuesto del usuario antes de ejecutar la tarea.
-   **Almacenamiento Local de Medios:** Descarga y guarda todas las generaciones en el servidor para un acceso rápido y persistente.
-   **Galería Personalizada:** Cada usuario solo puede ver los contenidos que ha generado, garantizando la privacidad.
-   **Perfil de Usuario Detallado:** Muestra información completa de la cuenta, incluyendo gasto, presupuesto, fecha de creación y modelos permitidos.
-   **Tema Claro y Oscuro:** Interfaz adaptable a las preferencias del usuario.
-   **Arquitectura Modular y Escalable:** Separación clara de responsabilidades entre el servidor web, la lógica de negocio y la UI.

## 🔧 Pila Tecnológica

-   **Backend:** Node.js, Express.js
-   **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
-   **Motor de Plantillas:** EJS (Embedded JavaScript)
-   **Estilos:** Bootstrap 5
-   **Integraciones:** LiteLLM (para autenticación y gestión de costos)
-   **Dependencias Clave:** `express-session` para la gestión de sesiones, `dotenv` para variables de entorno.

## 📂 Estructura del Proyecto

```
GENERACION-MULTIMEDIA-AI/
├── public/                     # Archivos estáticos accesibles públicamente.
│   ├── img/                    # Logos e imágenes de la UI.
│   ├── js/                     # Lógica del frontend modularizada.
│   │   ├── modules/            # Módulos específicos de funcionalidad.
│   │   │   ├── dynamic-ui.js   # Manejo de interfaz dinámica.
│   │   │   ├── form-handler.js # Manejo de formularios.
│   │   │   ├── tab-handler.js  # Manejo de pestañas.
│   │   │   ├── gallery-handler.js # Manejo de galería.
│   │   │   └── model-handler.js # Manejo de modelos.
│   │   ├── main.js             # Punto de entrada del frontend.
│   │   └── login-theme.js      # Manejo de tema claro/oscuro para login.
│   ├── schemas.js              # ¡El corazón del proyecto! Define las herramientas de IA.
│   └── media/                  # Directorio donde se guardan las imágenes y videos generados.
├── views/                      # Plantillas EJS para la interfaz de usuario.
│   ├── login.ejs               # Página de inicio de sesión.
│   └── main.ejs                # Dashboard principal de la aplicación.
├── controllers/                # Controladores para la lógica del backend.
│   ├── auth.controller.js      # Autenticación y gestión de usuarios.
│   ├── media.controller.js     # Manejo de archivos multimedia.
│   └── generation.controller.js # Generación de contenido IA.
├── routes/                     # Definición de rutas de la API.
│   ├── auth.routes.js          # Rutas de autenticación.
│   ├── media.routes.js         # Rutas de manejo de medios.
│   └── generation.routes.js    # Rutas de generación de contenido.
├── middleware/                 # Middleware personalizado.
│   └── auth.middleware.js      # Middleware de autenticación.
├── index.js                    # Punto de entrada del servidor Express (controlador).
├── logger.js                   # Módulo de configuración para el logging.
├── package.json                # Metadatos y dependencias del proyecto.
├── .env                        # Variables de entorno (NO se sube a GitHub).
├── .gitignore                  # Archivos y directorios ignorados por Git.
└── README.md                   # Esta documentación.
```

## 💡 Instalación y Puesta en Marcha

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd GENERACION-MULTIMEDIA-AI
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Copia el archivo `.env.example` a `.env` y configura las variables necesarias:
    ```bash
    cp .env.example .env
    # Edita .env con tus valores
    ```

4.  **Iniciar el servidor en modo desarrollo:**
    ```bash
    npm run dev
    ```

5.  **Acceder a la aplicación:**
    Abre tu navegador en `http://localhost:7860`

## ⚙️ Configuración de Variables de Entorno

El archivo `.env` contiene todas las configuraciones sensibles y específicas del entorno:

```env
# Define el entorno de ejecución
NODE_ENV=production
PORT=7860

# Secreto para las sesiones de express. Cámbialo por un valor largo y aleatorio.
SESSION_SECRET=

# API Keys para los diferentes proveedores (mantenidas seguras en el servidor)
RUNPOD_API_KEY=
OPENAI_API_KEY=
```

**Importante:** El archivo `.env` está incluido en `.gitignore` para evitar que las claves secretas se suban a GitHub.

## 💡 Cómo Integrar un Nuevo Modelo de IA

Este es el principal beneficio de la arquitectura del proyecto. Para integrar un nuevo modelo, solo sigue estos pasos:

1.  **Investigar la API Externa:** Consulta la documentación del nuevo modelo para obtener su `endpoint`, los `parámetros` que acepta, el `formato del payload` y la `estructura de la respuesta`.
2.  **Definir el Esquema:** Abre `public/js/schemas.js` y añade un nuevo objeto al array `TOOL_SCHEMAS`. Rellena todas las propiedades (`id`, `name`, `api_endpoint`, `inputs`, `request_config`, etc.) basándote en tu investigación.
3.  **Configurar API Key:** Añade la nueva variable de entorno en `.env` si es necesario.
4.  **Actualizar el controlador:** Modifica `controllers/generation.controller.js` para manejar el nuevo proveedor si es necesario.

¡Eso es todo! Reinicia el servidor y la nueva herramienta aparecerá en la interfaz, completamente funcional.

## 🌐 Endpoints de la API

-   `GET /`: Página de inicio de sesión.
-   `POST /login`: Valida las credenciales del usuario contra LiteLLM y crea una sesión.
-   `GET /app`: Renderiza la aplicación principal para usuarios autenticados.
-   `GET /logout`: Cierra la sesión del usuario.
-   `POST /api/generate`: Endpoint principal para generar contenido.
-   `GET /api/media`: Obtiene los archivos multimedia generados por el usuario.

## 💰 Flujo de Generación de Contenido

1.  **Autenticación:** El usuario inicia sesión con su clave de API de LiteLLM.
2.  **Selección y Configuración:** Elige una herramienta y completa los parámetros del formulario.
3.  **Verificación de Saldo:** El sistema calcula el costo de la generación y verifica que el usuario tenga suficientes créditos en su cuenta de LiteLLM.
4.  **Llamada a la API:** Se construye y envía la solicitud al proveedor externo (OpenAI, RunPod, etc.). Las API keys se manejan de forma segura en el servidor.
5.  **Almacenamiento:** El contenido generado se descarga y se guarda en la carpeta `public/media/`.
6.  **Actualización de Créditos:** El costo de la operación se descuenta del saldo del usuario en LiteLLM.
7.  **Presentación:** El resultado se muestra en la interfaz y el saldo del usuario se actualiza visualmente.

## 🏗️ Arquitectura del Código

### Backend (Node.js/Express)
- **Arquitectura modular:** Separación clara de rutas, controladores y middleware.
- **Seguridad de claves:** Todas las API keys se manejan en el servidor a través de variables de entorno.
- **Logging:** Sistema de logging con Winston para seguimiento de operaciones.

### Frontend (JavaScript Vanilla)
- **Modularidad:** Código JavaScript dividido en módulos reutilizables.
- **Dinamismo:** UI generada dinámicamente a partir de esquemas.
- **Separación de responsabilidades:** Cada módulo tiene una única responsabilidad.

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.