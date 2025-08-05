// services/apiService.ts
import type { ArticuloInventario, Receta } from '../types';

const ARTICULOS_KEY = 'articulosInventario';
const RECETAS_KEY = 'recetasInventario';

// Datos iniciales para demostración si no hay nada en localStorage
const DATOS_INICIALES_ARTICULOS: ArticuloInventario[] = [
  { id: '1', nombre: 'Harina 0000', cantidad: 5, unidad: 'kg', precioUnitario: 1.50 },
  { id: '2', nombre: 'Huevos', cantidad: 24, unidad: 'unidad', precioUnitario: 0.20 },
  { id: '3', nombre: 'Leche Entera', cantidad: 6, unidad: 'l', precioUnitario: 1.10 },
  { id: '4', nombre: 'Azúcar', cantidad: 2, unidad: 'kg', precioUnitario: 1.80 },
  { id: '5', nombre: 'Chocolate Cobertura', cantidad: 1, unidad: 'kg', precioUnitario: 15.00 },
];

const DATOS_INICIALES_RECETAS: Receta[] = [
    { id: 'r1', nombre: 'Bizcochuelo Básico', ingredientes: [{ articuloId: '1', cantidad: 0.5 }, { articuloId: '2', cantidad: 4 }, { articuloId: '4', cantidad: 0.25 }] },
];


// Simula la latencia de la red
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const leerDesdeStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error al leer desde localStorage (${key}):`, error);
        return defaultValue;
    }
};

const escribirEnStorage = <T>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error al escribir en localStorage (${key}):`, error);
    }
};


// --- API para Artículos ---

export const obtenerArticulos = async (): Promise<ArticuloInventario[]> => {
    await delay(50); // Simular latencia
    let articulos = leerDesdeStorage<ArticuloInventario[]>(ARTICULOS_KEY, []);
    if (articulos.length === 0) {
        articulos = DATOS_INICIALES_ARTICULOS;
        escribirEnStorage(ARTICULOS_KEY, articulos);
    }
    return articulos;
};

export const agregarArticulo = async (articulo: Omit<ArticuloInventario, 'id'>): Promise<ArticuloInventario> => {
    await delay(50);
    const articulos = await obtenerArticulos();
    const nuevoArticulo = { ...articulo, id: new Date().toISOString() };
    const articulosActualizados = [...articulos, nuevoArticulo];
    escribirEnStorage(ARTICULOS_KEY, articulosActualizados);
    return nuevoArticulo;
};

export const editarArticulo = async (articuloActualizado: ArticuloInventario): Promise<ArticuloInventario> => {
    await delay(50);
    const articulos = await obtenerArticulos();
    const articulosActualizados = articulos.map(a => a.id === articuloActualizado.id ? articuloActualizado : a);
    escribirEnStorage(ARTICULOS_KEY, articulosActualizados);
    return articuloActualizado;
};

export const eliminarArticulo = async (id: string): Promise<void> => {
    await delay(50);
    const articulos = await obtenerArticulos();
    const articulosActualizados = articulos.filter(a => a.id !== id);
    escribirEnStorage(ARTICULOS_KEY, articulosActualizados);
};


// --- API para Recetas ---

export const obtenerRecetas = async (): Promise<Receta[]> => {
    await delay(50);
    let recetas = leerDesdeStorage<Receta[]>(RECETAS_KEY, []);
     if (recetas.length === 0) {
        recetas = DATOS_INICIALES_RECETAS;
        escribirEnStorage(RECETAS_KEY, recetas);
    }
    return recetas;
};

export const agregarReceta = async (receta: Omit<Receta, 'id'>): Promise<Receta> => {
    await delay(50);
    const recetas = await obtenerRecetas();
    const nuevaReceta = { ...receta, id: new Date().toISOString() };
    const recetasActualizadas = [...recetas, nuevaReceta];
    escribirEnStorage(RECETAS_KEY, recetasActualizadas);
    return nuevaReceta;
};

export const editarReceta = async (recetaActualizada: Receta): Promise<Receta> => {
    await delay(50);
    const recetas = await obtenerRecetas();
    const recetasActualizadas = recetas.map(r => r.id === recetaActualizada.id ? recetaActualizada : r);
    escribirEnStorage(RECETAS_KEY, recetasActualizadas);
    return recetaActualizada;
};

export const eliminarReceta = async (id: string): Promise<void> => {
    await delay(50);
    const recetas = await obtenerRecetas();
    const recetasActualizadas = recetas.filter(r => r.id !== id);
    escribirEnStorage(RECETAS_KEY, recetasActualizadas);
};


// --- API para Actualizaciones Masivas ---

export const actualizarPreciosMasivamente = async (actualizaciones: { articuloId: string; nuevoPrecio: number }[]): Promise<ArticuloInventario[]> => {
    await delay(100);
    const articulos = await obtenerArticulos();
    const mapaActualizaciones = new Map(actualizaciones.map(u => [u.articuloId, u.nuevoPrecio]));
    const articulosActualizados = articulos.map(articulo => {
        if (mapaActualizaciones.has(articulo.id)) {
            return { ...articulo, precioUnitario: mapaActualizaciones.get(articulo.id)! };
        }
        return articulo;
    });
    escribirEnStorage(ARTICULOS_KEY, articulosActualizados);
    return articulosActualizados;
};
