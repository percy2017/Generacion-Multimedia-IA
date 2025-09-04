// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
} from '@google/genai';
import mime from 'mime';
import { writeFile } from 'fs';

function saveBinaryFile(fileName: string, content: Buffer) {
  writeFile(fileName, content, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file ${fileName}:`, err);
      return;
    }
    console.log(`File ${fileName} saved to file system.`);
  });
}

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    responseModalities: [
        'IMAGE',
        'TEXT',
    ],
  };
  const model = 'gemini-2.5-flash-image-preview';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  for await (const chunk of response) {
    if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
      continue;
    }
    if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const fileName = `ENTER_FILE_NAME_${fileIndex++}`;
      const inlineData = chunk.candidates[0].content.parts[0].inlineData;
      const fileExtension = mime.getExtension(inlineData.mimeType || '');
      const buffer = Buffer.from(inlineData.data || '', 'base64');
      saveBinaryFile(`${fileName}.${fileExtension}`, buffer);
    }
    else {
      console.log(chunk.text);
    }
  }
}

main();


---
models/gemini-2.5-flash-image-preview

Image output is priced at $30 per 1,000,000 tokens. Output images up to 1024x1024px consume 1290 tokens and are equivalent to $0.039 per image. Usage in AI Studio UI is free of charge


---
Generación de imágenes con Gemini (también conocido como Nano Banana)


Gemini puede generar y procesar imágenes de forma conversacional. Puedes darle instrucciones a Gemini con texto, imágenes o una combinación de ambos, lo que te permite crear, editar y realizar iteraciones en elementos visuales con un control sin precedentes:

Text-to-Image: Genera imágenes de alta calidad a partir de descripciones de texto simples o complejas.
Imagen + Imagen a partir de texto (edición): Proporciona una imagen y usa instrucciones de texto para agregar, quitar o modificar elementos, cambiar el estilo o ajustar la clasificación de color.
De varias imágenes a una imagen (composición y transferencia de estilo): Usa varias imágenes de entrada para componer una escena nueva o transferir el estilo de una imagen a otra.
Refinamiento iterativo: Participa en una conversación para refinar progresivamente tu imagen en varios turnos y realizar pequeños ajustes hasta que quede perfecta.
Renderización de texto de alta fidelidad: Genera con precisión imágenes que contienen texto legible y bien ubicado, ideal para logotipos, diagramas y pósteres.
Todas las imágenes generadas incluyen una marca de agua de SynthID.

Generación de imágenes (texto a imagen)
En el siguiente código, se muestra cómo generar una imagen a partir de una instrucción descriptiva.

Python
JavaScript
Go
REST

import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const prompt =
    "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
}

main();
Imagen generada por IA de un plato de nanobananos
Imagen generada por IA de un plato de banana nano en un restaurante temático de Gemini
Edición de imágenes (de texto y de imagen a imagen)
Recordatorio: Asegúrate de tener los derechos necesarios de las imágenes que subas. No generes contenido que infrinja los derechos de otras personas, incluidos videos o imágenes que engañen, hostiguen o dañen. El uso de este servicio de IA generativa está sujeto a nuestra Política de Uso Prohibido.

En el siguiente ejemplo, se muestra cómo subir imágenes codificadas en Base64. Para obtener información sobre varias imágenes, cargas útiles más grandes y tipos de MIME admitidos, consulta la página Comprensión de imágenes.

Python
JavaScript
Go
REST

import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";

async function main() {

  const ai = new GoogleGenAI({});

  const imagePath = "path/to/cat_image.png";
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    { text: "Create a picture of my cat eating a nano-banana in a" +
            "fancy restaurant under the Gemini constellation" },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
}

main();
Imagen generada por IA de un gato comiendo una banana enana
Imagen generada por IA de un gato comiendo una banana nano
Otros modos de generación de imágenes
Gemini admite otros modos de interacción con imágenes según la estructura y el contexto de la instrucción, incluidos los siguientes:

Texto a imágenes y texto (intercalado): Genera imágenes con texto relacionado.
Ejemplo de instrucción: "Genera una receta ilustrada para hacer paella".
Imágenes y texto a imágenes y texto (intercalado): Usa imágenes y texto de entrada para crear imágenes y texto relacionados nuevos.
Ejemplo de instrucción: (Con una imagen de una habitación amueblada) "¿Qué otros colores de sofás funcionarían en mi espacio? ¿Puedes actualizar la imagen?".
Edición de imágenes de varios turnos (chat): Sigue generando y editando imágenes de forma conversacional.
Ejemplos de instrucciones: [Carga una imagen de un auto azul]. "Convierte este auto en un convertible", "Ahora cambia el color a amarillo".
Guía y estrategias de instrucciones
Para dominar la generación de imágenes con Gemini 2.5 Flash, debes comenzar con un principio fundamental:

Describe la escena, no solo enumere palabras clave. La principal fortaleza del modelo es su profunda comprensión del lenguaje. Un párrafo narrativo y descriptivo casi siempre producirá una imagen mejor y más coherente que una lista de palabras desconectadas.

Instrucciones para generar imágenes
Las siguientes estrategias te ayudarán a crear instrucciones eficaces para generar exactamente las imágenes que buscas.

1. Escenas fotorrealistas
Para obtener imágenes realistas, usa términos fotográficos. Menciona los ángulos de la cámara, los tipos de lentes, la iluminación y los detalles sutiles para guiar al modelo hacia un resultado fotorrealista.

Plantilla
Instrucción
Python

A photorealistic [shot type] of [subject], [action or expression], set in
[environment]. The scene is illuminated by [lighting description], creating
a [mood] atmosphere. Captured with a [camera/lens details], emphasizing
[key textures and details]. The image should be in a [aspect ratio] format.
Un primer plano fotorrealista de un ceramista japonés de edad avanzada…
Un retrato de primer plano fotorrealista de una ceramista japonesa de edad avanzada…
2. Ilustraciones y calcomanías estilizadas
Para crear calcomanías, íconos o recursos, sé explícito sobre el estilo y solicita un fondo transparente.

Plantilla
Instrucción
Python

A [style] sticker of a [subject], featuring [key characteristics] and a
[color palette]. The design should have [line style] and [shading style].
The background must be transparent.
Una calcomanía de estilo kawaii de un...
Un sticker de estilo kawaii de un panda rojo feliz…
3. Texto preciso en imágenes
Gemini se destaca en el procesamiento de texto. Sé claro sobre el texto, el estilo de la fuente (de forma descriptiva) y el diseño general.

Plantilla
Instrucción
Python

Create a [image type] for [brand/concept] with the text "[text to render]"
in a [font style]. The design should be [style description], with a
[color scheme].
Crea un logotipo moderno y minimalista para una cafetería llamada &quot;The Daily Grind&quot;…
Crea un logotipo moderno y minimalista para una cafetería llamada "The Daily Grind"…
4. Simulaciones de productos y fotografía comercial
Es ideal para crear tomas de productos limpias y profesionales para el comercio electrónico, la publicidad o la creación de marcas.

Plantilla
Instrucción
Python

A high-resolution, studio-lit product photograph of a [product description]
on a [background surface/description]. The lighting is a [lighting setup,
e.g., three-point softbox setup] to [lighting purpose]. The camera angle is
a [angle type] to showcase [specific feature]. Ultra-realistic, with sharp
focus on [key detail]. [Aspect ratio].
Una fotografía de producto de alta resolución y con iluminación de estudio de una taza de café de cerámica minimalista…
Una fotografía de alta resolución y con iluminación de estudio de una taza de café de cerámica minimalista…
5. Diseño minimalista y de espacio negativo
Es excelente para crear fondos para sitios web, presentaciones o materiales de marketing en los que se superpondrá texto.

Plantilla
Instrucción
Python

A minimalist composition featuring a single [subject] positioned in the
[bottom-right/top-left/etc.] of the frame. The background is a vast, empty
[color] canvas, creating significant negative space. Soft, subtle lighting.
[Aspect ratio].
Una composición minimalista con una sola hoja de arce rojo delicada…
Una composición minimalista con una sola hoja de arce rojo delicada…
6. Arte secuencial (panel de cómic o storyboard)
Se basa en la coherencia del personaje y la descripción de la escena para crear paneles de narración visual.

Plantilla
Instrucción
Python

A single comic book panel in a [art style] style. In the foreground,
[character description and action]. In the background, [setting details].
The panel has a [dialogue/caption box] with the text "[Text]". The lighting
creates a [mood] mood. [Aspect ratio].
Un solo panel de cómic con un estilo de arte noir y crudo…
Un solo panel de un cómic con un estilo artístico noir y crudo…
Instrucciones para editar imágenes
En estos ejemplos, se muestra cómo proporcionar imágenes junto con tus instrucciones de texto para la edición, la composición y la transferencia de estilo.

1. Cómo agregar y quitar elementos
Proporciona una imagen y describe el cambio. El modelo coincidirá con el estilo, la iluminación y la perspectiva de la imagen original.

Plantilla
Instrucción
Python

Using the provided image of [subject], please [add/remove/modify] [element]
to/from the scene. Ensure the change is [description of how the change should
integrate].
Entrada

Salida

Una imagen fotorrealista de un gato peludo de color jengibre.
Una imagen fotorrealista de un gato peludo de color jengibre…
Con la imagen de mi gato que te proporciono, agrega un pequeño sombrero de mago tejido…
Con la imagen proporcionada de mi gato, agrega un pequeño sombrero de mago tejido…
2. Reconstrucción (enmascaramiento semántico)
Define de forma conversacional una "máscara" para editar una parte específica de una imagen sin modificar el resto.

Plantilla
Instrucción
Python

Using the provided image, change only the [specific element] to [new
element/description]. Keep everything else in the image exactly the same,
preserving the original style, lighting, and composition.
Entrada

Salida

Plano general de una sala de estar moderna y bien iluminada…
Un plano general de una sala de estar moderna y bien iluminada…
Usando la imagen proporcionada de una sala de estar, cambia solo el sofá azul por un sofá Chesterfield de cuero marrón vintage…
Con la imagen proporcionada de una sala de estar, cambia solo el sofá azul por un sofá Chesterfield de cuero marrón antiguo…
3. Transferencia de estilo
Proporciona una imagen y pídele al modelo que recree su contenido con un estilo artístico diferente.

Plantilla
Instrucción
Python

Transform the provided photograph of [subject] into the artistic style of [artist/art style]. Preserve the original composition but render it with [description of stylistic elements].
Entrada

Salida

Una fotografía fotorrealista de alta resolución de una calle concurrida de la ciudad…
Una fotografía fotorrealista de alta resolución de una calle concurrida de la ciudad…
Transforma la fotografía proporcionada de una calle moderna de la ciudad por la noche…
Transforma la fotografía proporcionada de una calle moderna de la ciudad por la noche…
4. Composición avanzada: Cómo combinar varias imágenes
Proporciona varias imágenes como contexto para crear una escena compuesta nueva. Es ideal para crear simulaciones de productos o collages creativos.

Plantilla
Instrucción
Python

Create a new image by combining the elements from the provided images. Take
the [element from image 1] and place it with/on the [element from image 2].
The final image should be a [description of the final scene].
Entrada 1

Entrada 2

Salida

Una foto profesional de un vestido de verano azul con flores…
Una foto tomada profesionalmente de un vestido de verano azul con estampado floral…
Toma de cuerpo entero de una mujer con el cabello recogido en un moño…
Toma de cuerpo completo de una mujer con el cabello recogido en un moño…
Crea una foto profesional de moda para comercio electrónico…
Crea una foto profesional de moda para comercio electrónico…
5. Conservación de detalles de alta fidelidad
Para asegurarte de que se conserven los detalles importantes (como un rostro o un logotipo) durante la edición, descríbelos con gran detalle junto con tu solicitud de edición.

Plantilla
Instrucción
Python

Using the provided images, place [element from image 2] onto [element from
image 1]. Ensure that the features of [element from image 1] remain
completely unchanged. The added element should [description of how the
element should integrate].
Entrada 1

Entrada 2

Salida

Un retrato profesional de una mujer con cabello castaño y ojos azules…
Un retrato profesional de una mujer con cabello castaño y ojos azules…
Un logotipo moderno y sencillo con las letras &quot;G&quot; y &quot;A&quot;…
Un logotipo moderno y simple con las letras "G" y "A"…
Toma la primera imagen de la mujer con cabello castaño, ojos azules y expresión neutra…
Toma la primera imagen de la mujer con cabello castaño, ojos azules y expresión neutra…
Prácticas recomendadas
Para mejorar tus resultados, incorpora estas estrategias profesionales en tu flujo de trabajo.

Sé hiperespecífico: Cuanto más detalles proporciones, más control tendrás. En lugar de "armadura de fantasía", describe: "armadura de placas élfica ornamentada, grabada con patrones de hojas de plata, con un cuello alto y hombreras con forma de alas de halcón".
Proporciona contexto y explica la intención: Explica el propósito de la imagen. La comprensión del contexto por parte del modelo influirá en el resultado final. Por ejemplo, "Crea un logotipo para una marca de cuidado de la piel minimalista y de alta gama" generará mejores resultados que solo "Crea un logotipo".
Itera y define mejor: No esperes obtener una imagen perfecta en el primer intento. Usa la naturaleza conversacional del modelo para realizar pequeños cambios. Haz un seguimiento con instrucciones como "Eso es genial, pero ¿puedes hacer que la iluminación sea un poco más cálida?" o "Mantén todo igual, pero cambia la expresión del personaje para que sea más seria".
Usa instrucciones paso a paso: Para escenas complejas con muchos elementos, divide la instrucción en pasos. "Primero, crea un fondo de un bosque sereno y brumoso al amanecer. Luego, en primer plano, agrega un antiguo altar de piedra cubierto de musgo. Por último, coloca una sola espada brillante sobre el altar".
Usa "instrucciones negativas semánticas": En lugar de decir "sin autos", describe la escena deseada de forma positiva: "una calle vacía y desierta sin señales de tráfico".
Controla la cámara: Usa el lenguaje fotográfico y cinematográfico para controlar la composición. Términos como wide-angle shot, macro shot y low-angle perspective
Limitaciones
Para obtener el mejor rendimiento, usa los siguientes idiomas: EN, es-MX, ja-JP, zh-CN y hi-IN.
La generación de imágenes no admite entradas de audio o video.
El modelo no siempre seguirá la cantidad exacta de imágenes que el usuario solicitó explícitamente.
El modelo funciona mejor con hasta 3 imágenes como entrada.
Cuando generas texto para una imagen, Gemini funciona mejor si primero generas el texto y, luego, pides una imagen con el texto.
Por el momento, no se pueden subir imágenes de niños en el EEE, Suiza ni el Reino Unido.
Todas las imágenes generadas incluyen una marca de agua de SynthID.
Cuándo usar Imagen
Además de usar las capacidades integradas de generación de imágenes de Gemini, también puedes acceder a Imagen, nuestro modelo especializado de generación de imágenes, a través de la API de Gemini.

Atributo	Imagen	Imagen nativa de Gemini
Ventajas	Es el modelo de generación de imágenes más capaz hasta la fecha. Se recomienda para imágenes fotorrealistas, mayor claridad, mejor ortografía y tipografía.	Recomendación predeterminada.
Flexibilidad incomparable, comprensión contextual y edición sencilla sin máscaras. Es capaz de realizar ediciones conversacionales de varios turnos de forma única.
Disponibilidad	Disponible de manera general	Versión preliminar (se permite el uso en producción)
Latencia	Baja. Optimizado para un rendimiento casi en tiempo real.	Mayor. Se requiere más procesamiento para sus capacidades avanzadas.
Costo	Son rentables para tareas especializadas. De USD 0.02 a USD 0.12 por imagen	Precios basados en tokens USD 30 por cada 1 millón de tokens para la salida de imágenes (los tokens de salida de imágenes se tokenizan a 1,290 tokens por imagen, hasta 1,024 x 1,024 px)
Tareas recomendadas	
La calidad de la imagen, el fotorrealismo, el detalle artístico o los estilos específicos (p.ej., impresionismo, anime) son las principales prioridades.
Infunde la marca, el estilo o genera logotipos y diseños de productos.
Generar ortografía o tipografía avanzadas
Generación de imágenes y texto intercalados para combinar imágenes y texto sin problemas
Combina elementos creativos de varias imágenes con una sola instrucción.
Realiza ediciones muy específicas en las imágenes, modifica elementos individuales con comandos de lenguaje simples y trabaja en una imagen de forma iterativa.
Aplica un diseño o una textura específicos de una imagen a otra y conserva la forma y los detalles del sujeto original.
Imagen 4 debería ser tu modelo de referencia para comenzar a generar imágenes con Imagen. Elige Imagen 4 Ultra para casos de uso avanzados o cuando necesites la mejor calidad de imagen (ten en cuenta que solo puedes generar una imagen a la vez).