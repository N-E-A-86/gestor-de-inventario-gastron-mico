// types.ts

/**
 * Define las unidades base en las que se almacena y se costea un artículo en el inventario.
 */
export type UnidadBaseInventario = 'kg' | 'l' | 'unidad';

/**
 * Define todas las unidades posibles que se pueden usar en una receta.
 */
export type UnidadReceta = 'g' | 'kg' | 'ml' | 'l' | 'unidad';

/**
 * Representa un artículo único en el inventario. El precioUnitario siempre
 * corresponde a la unidad base (ej., precio por kg, por l, o por unidad).
 */
export interface ArticuloInventario {
  id: string;
  nombre: string;
  // La unidad de almacenamiento y costeo principal.
  unidad: UnidadBaseInventario;
  cantidad: number;
  precioUnitario: number;
}

/**
 * Representa un ingrediente dentro de una receta. Permite usar unidades
 * diferentes a las del inventario (ej., usar 'g' para un artículo costeado en 'kg').
 */
export interface IngredienteReceta {
  articuloId: string;
  cantidad: number;
  // La unidad específica para este ingrediente en esta receta.
  unidad: UnidadReceta;
}

/**
 * Representa una receta, que consiste en un nombre y una lista de ingredientes.
 */
export interface Receta {
  id: string;
  nombre: string;
  ingredientes: IngredienteReceta[];
}

/**
 * Representa la sugerencia de actualización de precio generada por la IA.
 */
export interface SugerenciaPrecio {
    articuloId: string;
    nombreArticulo: string;
    precioAnterior: number;
    nuevoPrecio: number;
}
