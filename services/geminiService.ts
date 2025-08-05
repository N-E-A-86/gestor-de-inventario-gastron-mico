
import { GoogleGenAI, Type } from "@google/genai";
import type { ArticuloInventario } from '../types';

// En un proyecto con Vite, las variables de entorno deben empezar con VITE_
// para ser expuestas en el cliente. Se acceden a través de `import.meta.env`.
// El usuario debe crear un archivo .env en la raíz del proyecto con:
// VITE_API_KEY="SU_API_KEY_AQUI"
const API_KEY = import.meta.env.VITE_API_KEY || "";
if (!API_KEY) {
    console.warn("API Key de Gemini no encontrada. La funcionalidad de IA estará deshabilitada.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });


/**
 * Convierte un objeto File a una cadena de texto base64.
 * @param archivo El archivo a convertir.
 * @returns Una promesa que se resuelve con la cadena base64.
 */
const archivoABase64 = (archivo: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

/**
 * Procesa un archivo PDF de lista de precios utilizando la API de Gemini para extraer
 * y sugerir actualizaciones de precios para los artículos del inventario.
 * @param archivoPdf El archivo PDF subido por el usuario.
 * @param inventarioActual La lista actual de artículos en el inventario.
 * @returns Una promesa que se resuelve con un array de sugerencias de actualización de precios.
 */
export const procesarPdfPrecios = async (archivoPdf: File, inventarioActual: ArticuloInventario[]) => {
  if (!API_KEY) {
      throw new Error("La API Key de Gemini no está configurada. No se puede procesar el PDF.");
  }

  const base64Pdf = await archivoABase64(archivoPdf);

  const prompt = `
    Analiza el siguiente contenido de un archivo PDF que es una lista de precios.
    Luego, revisa la lista de artículos de inventario que te proporciono en formato JSON.
    Tu tarea es identificar los productos del inventario que aparecen en el PDF y extraer su nuevo precio.
    Debes ser preciso al asociar los nombres. Devuelve únicamente los artículos para los que encuentres un precio nuevo.

    Inventario actual:
    ${JSON.stringify(inventarioActual.map(a => ({ id: a.id, nombre: a.nombre })))}
  `;

  // Define el esquema de respuesta que esperamos de la IA.
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        articuloId: {
          type: Type.STRING,
          description: "El ID del artículo del inventario que debe ser actualizado.",
        },
        nuevoPrecio: {
          type: Type.NUMBER,
          description: "El nuevo precio extraído del PDF para este artículo.",
        },
      },
      required: ["articuloId", "nuevoPrecio"],
    },
  };
  
  // Realiza la llamada a la API de Gemini.
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            { text: prompt },
            { 
                inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Pdf,
                }
            }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    // Parsea la respuesta JSON.
    const textoRespuesta = response.text.trim();
    return JSON.parse(textoRespuesta);

  } catch (error) {
    console.error("Error al procesar el PDF con la API de Gemini:", error);
    throw new Error("No se pudo analizar el documento. Revisa el formato del PDF o la consola para más detalles.");
  }
};
