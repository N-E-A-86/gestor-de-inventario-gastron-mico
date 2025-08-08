import { db } from '../firebaseConfig';
import type { ArticuloInventario, Receta } from '../types';

// La lógica se ha modificado para trabajar con subcolecciones dentro de un documento de usuario.
// Esto asegura que los datos de cada usuario estén aislados y seguros.
// La estructura en Firestore será: /users/{userId}/articulos/{articuloId}

// --- Funciones para Artículos (por usuario) ---

const getArticulosCollection = (userId: string) => db.collection('users').doc(userId).collection('articulos');

export const getArticulos = async (userId: string): Promise<ArticuloInventario[]> => {
    const snapshot = await getArticulosCollection(userId).orderBy('nombre').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArticuloInventario));
};

export const addArticulo = async (userId: string, articulo: Omit<ArticuloInventario, 'id'>): Promise<ArticuloInventario> => {
    const docRef = await getArticulosCollection(userId).add(articulo);
    return { id: docRef.id, ...articulo };
};

export const updateArticulo = async (userId: string, id: string, articulo: Partial<ArticuloInventario>): Promise<void> => {
    const articuloDoc = getArticulosCollection(userId).doc(id);
    await articuloDoc.update(articulo);
};

export const deleteArticulo = async (userId: string, id: string): Promise<void> => {
    const articuloDoc = getArticulosCollection(userId).doc(id);
    await articuloDoc.delete();
};

export const batchUpdatePrecios = async (userId: string, actualizaciones: { articuloId: string; nuevoPrecio: number }[]): Promise<void> => {
    const batch = db.batch();
    const articulosCollection = getArticulosCollection(userId);
    actualizaciones.forEach(({ articuloId, nuevoPrecio }) => {
        const docRef = articulosCollection.doc(articuloId);
        batch.update(docRef, { precioUnitario: nuevoPrecio });
    });
    await batch.commit();
};


// --- Funciones para Recetas (por usuario) ---

const getRecetasCollection = (userId: string) => db.collection('users').doc(userId).collection('recetas');

export const getRecetas = async (userId: string): Promise<Receta[]> => {
    const snapshot = await getRecetasCollection(userId).orderBy('nombre').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receta));
};

export const addReceta = async (userId: string, receta: Omit<Receta, 'id'>): Promise<Receta> => {
    const docRef = await getRecetasCollection(userId).add(receta);
    return { id: docRef.id, ...receta };
};

export const deleteReceta = async (userId: string, id: string): Promise<void> => {
    const recetaDoc = getRecetasCollection(userId).doc(id);
    await recetaDoc.delete();
};
