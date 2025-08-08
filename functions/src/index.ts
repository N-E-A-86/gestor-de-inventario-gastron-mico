import * as functions from "firebase-functions/v1";
import * as logger from "firebase-functions/logger";
import { GoogleGenAI, Type } from "@google/genai";

// Se inicializa la API de Gemini usando la configuración de Firebase Functions.
// Esto se conecta con el comando `firebase functions:config:set gemini.key="..."`
let ai: GoogleGenAI;
try {
  const apiKey = functions.config().gemini.key;
  if (!apiKey) {
    throw new Error(
      "La clave de API de Gemini no está configurada. Ejecuta 'firebase functions:config:set gemini.key=...'"
    );
  }
  ai = new GoogleGenAI({ apiKey });
} catch (error) {
  logger.error(
    "Error al inicializar la API de Gemini. Asegúrate de que la configuración exista y hayas desplegado las funciones.",
    error
  );
}

// Se exporta la función usando la sintaxis estándar de v1.
export const procesarListaPrecios = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    // Verificación de autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "La función debe ser llamada por un usuario autenticado."
      );
    }

    if (!ai) {
      logger.error(
        "La instancia de la IA de Gemini no está disponible. Revisa los logs de inicialización."
      );
      throw new functions.https.HttpsError(
        "internal",
        "El servicio de IA no está configurado correctamente."
      );
    }

    const uid = context.auth.uid;
    logger.info("Usuario autenticado. Iniciando procesamiento de lista de precios.", { userId: uid });

    const { pdfData, inventario } = data;

    if (!pdfData || !inventario) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "La función debe ser llamada con \"pdfData\" y \"inventario\"."
      );
    }

    const prompt = `
      Analiza el siguiente contenido de un archivo PDF que es una lista de precios de un proveedor.
      Luego, revisa la lista de artículos de inventario que te proporciono en formato JSON.
      Tu tarea es identificar los productos del inventario que aparecen en el PDF y extraer su nuevo precio unitario.
      Debes ser muy preciso al asociar los nombres de los productos, ignorando pequeñas variaciones.
      Devuelve únicamente un array JSON con los artículos para los que encuentres un precio actualizado.
      No incluyas nada más en tu respuesta.

      Inventario actual:
      ${JSON.stringify(inventario)}
    `;

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

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfData,
            },
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const textoRespuesta = response.text ? response.text.trim() : "";
      logger.info("Respuesta de Gemini recibida y parseada exitosamente.", { userId: uid });
      return JSON.parse(textoRespuesta);
    } catch (error) {
      logger.error("Error al procesar el PDF con la API de Gemini:", error, { userId: uid });
      throw new functions.https.HttpsError(
        "internal",
        "No se pudo analizar el documento con la IA.",
        error
      );
    }
  }
);
