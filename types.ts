
// types.ts

/**
 * Representa un artículo único en el inventario.
 */
export interface ArticuloInventario {
  id: string;
  nombre: string;
  unidad: 'kg' | 'g' | 'l' | 'ml' | 'unidad';
  cantidad: number;
  precioUnitario: number; // Precio por la unidad base (ej. precio por kg, por litro, etc.)
}

/**
 * Representa un ingrediente dentro de una receta, vinculando un artículo del inventario
 * y la cantidad necesaria para la receta.
 */
export interface IngredienteReceta {
  articuloId: string;
  cantidad: number; // La cantidad del ingrediente en su unidad base (ej. 0.5 kg)
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
