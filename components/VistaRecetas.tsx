
import React, { useState, useMemo } from 'react';
import type { Receta, ArticuloInventario, IngredienteReceta, UnidadReceta, UnidadBaseInventario } from '../types';
import Modal from './Modal';
import { IconoBasura, IconoLibro } from './Iconos';

// Propiedades que el componente VistaRecetas recibe
interface VistaRecetasProps {
  recetas: Receta[];
  articulos: ArticuloInventario[];
  agregarReceta: (receta: Omit<Receta, 'id'>) => void;
  eliminarReceta: (id: string) => void;
}

// Mapa para obtener las unidades compatibles según la unidad base del inventario
const unidadesCompatibles: Record<UnidadBaseInventario, UnidadReceta[]> = {
    kg: ['g', 'kg'],
    l: ['ml', 'l'],
    unidad: ['unidad'],
};

const VistaRecetas: React.FC<VistaRecetasProps> = ({ recetas, articulos, agregarReceta, eliminarReceta }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreReceta, setNombreReceta] = useState('');
  const [ingredientes, setIngredientes] = useState<IngredienteReceta[]>([]);

  const mapaArticulos = useMemo(() => {
    return new Map(articulos.map(articulo => [articulo.id, articulo]));
  }, [articulos]);

  // Nueva lógica de cálculo de costos proporcional
  const calcularCostoReceta = (ingredientesReceta: IngredienteReceta[]): number => {
    return ingredientesReceta.reduce((total, ingrediente) => {
      const articulo = mapaArticulos.get(ingrediente.articuloId);
      if (!articulo || articulo.precioUnitario <= 0 || ingrediente.cantidad <= 0) return total;

      let cantidadEnUnidadBase = ingrediente.cantidad;

      // Conversión de unidades para el cálculo del costo
      if (articulo.unidad === 'kg' && ingrediente.unidad === 'g') {
        cantidadEnUnidadBase = ingrediente.cantidad / 1000; // Gramos a Kilos
      } else if (articulo.unidad === 'l' && ingrediente.unidad === 'ml') {
        cantidadEnUnidadBase = ingrediente.cantidad / 1000; // Mililitros a Litros
      } else if (articulo.unidad !== ingrediente.unidad) {
        // Si las unidades no son compatibles (ej. kg con ml), no se suma el costo.
        console.warn(`Unidades incompatibles para ${articulo.nombre}: ${articulo.unidad} y ${ingrediente.unidad}`);
        return total;
      }
      
      return total + (articulo.precioUnitario * cantidadEnUnidadBase);
    }, 0);
  };
  
  const abrirModal = () => setModalAbierto(true);
  
  const cerrarModalYReiniciar = () => {
    setModalAbierto(false);
    setNombreReceta('');
    setIngredientes([]);
  };

  const agregarIngrediente = () => {
    if (articulos.length > 0) {
      const primerArticulo = articulos[0];
      const unidadPorDefecto = unidadesCompatibles[primerArticulo.unidad][0];
      setIngredientes([...ingredientes, { articuloId: primerArticulo.id, cantidad: 0, unidad: unidadPorDefecto }]);
    } else {
      alert("Necesitas agregar artículos al inventario primero.");
    }
  };

  const actualizarIngrediente = (index: number, campo: keyof IngredienteReceta, valor: string | number) => {
    const nuevosIngredientes = [...ingredientes];
    const ingrediente = nuevosIngredientes[index];
    
    if (campo === 'articuloId') {
      ingrediente.articuloId = valor as string;
      const articuloSeleccionado = mapaArticulos.get(valor as string);
      // Al cambiar el artículo, se actualiza la unidad a la primera compatible.
      if (articuloSeleccionado) {
        ingrediente.unidad = unidadesCompatibles[articuloSeleccionado.unidad][0];
      }
    } else if (campo === 'cantidad') {
      ingrediente.cantidad = parseFloat(valor as string) || 0;
    } else if (campo === 'unidad') {
      ingrediente.unidad = valor as UnidadReceta;
    }

    setIngredientes(nuevosIngredientes);
  };

  const eliminarIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const manejarSubmit = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!nombreReceta.trim() || ingredientes.length === 0 || ingredientes.some(ing => ing.cantidad <= 0)) {
      alert("La receta debe tener un nombre y al menos un ingrediente con cantidad mayor a cero.");
      return;
    }
    agregarReceta({ nombre: nombreReceta, ingredientes });
    cerrarModalYReiniciar();
  };
  
  const costoTotalModal = useMemo(() => calcularCostoReceta(ingredientes), [ingredientes, mapaArticulos]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Recetas</h1>
        <button
          onClick={abrirModal}
          className="bg-primario-claro dark:bg-primario-oscuro text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-opacity-90 transition"
        >
          Crear Receta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recetas.length > 0 ? (
          recetas.map(receta => {
            const costoTotal = calcularCostoReceta(receta.ingredientes);
            return (
              <div key={receta.id} className="bg-superficie-clara dark:bg-superficie-oscura shadow-lg rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold mb-2">{receta.nombre}</h2>
                    <button onClick={() => eliminarReceta(receta.id)} className="text-texto-secundario-claro dark:text-texto-secundario-oscuro hover:text-red-500"><IconoBasura /></button>
                  </div>
                  <ul className="mb-4 space-y-1">
                    {receta.ingredientes.map((ing, index) => {
                      const articulo = mapaArticulos.get(ing.articuloId);
                      return (
                        <li key={index} className="flex justify-between text-sm">
                          <span>{articulo?.nombre || 'Artículo no encontrado'}</span>
                          <span className="text-texto-secundario-claro dark:text-texto-secundario-oscuro">{ing.cantidad} {ing.unidad}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="text-right font-semibold text-lg border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  Costo Total: <span className="text-primario-claro dark:text-primario-oscuro">${costoTotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-superficie-clara dark:bg-superficie-oscura rounded-lg shadow-md">
            <IconoLibro className="mx-auto w-16 h-16 text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-4"/>
            <h3 className="text-xl font-semibold">No hay recetas todavía.</h3>
            <p className="text-texto-secundario-claro dark:text-texto-secundario-oscuro">¡Crea tu primera obra maestra culinaria!</p>
          </div>
        )}
      </div>

      <Modal estaAbierto={modalAbierto} alCerrar={cerrarModalYReiniciar} titulo="Crear Nueva Receta">
        <form onSubmit={manejarSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nombreReceta" className="block text-sm font-medium mb-1">Nombre de la Receta</label>
              <input type="text" id="nombreReceta" value={nombreReceta} onChange={(e) => setNombreReceta(e.target.value)} required className="w-full bg-fondo-claro dark:bg-fondo-oscuro border border-gray-300 dark:border-gray-600 rounded-md p-2"/>
            </div>
            <div>
              <h3 className="text-md font-medium mb-2">Ingredientes</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {ingredientes.map((ing, index) => {
                   const articuloSeleccionado = mapaArticulos.get(ing.articuloId);
                   const opcionesUnidad = articuloSeleccionado ? unidadesCompatibles[articuloSeleccionado.unidad] : [];
                  return(
                  <div key={index} className="grid grid-cols-[1fr,auto,auto,auto] items-center gap-2 p-2 bg-fondo-claro dark:bg-fondo-oscuro rounded-md">
                    <select value={ing.articuloId} onChange={(e) => actualizarIngrediente(index, 'articuloId', e.target.value)} className="flex-grow bg-superficie-clara dark:bg-superficie-oscura border border-gray-300 dark:border-gray-600 rounded-md p-2">
                      {articulos.map(art => <option key={art.id} value={art.id}>{art.nombre}</option>)}
                    </select>
                    <input type="number" step="0.01" value={ing.cantidad > 0 ? ing.cantidad : ''} onChange={(e) => actualizarIngrediente(index, 'cantidad', e.target.value)} placeholder="Cant." required className="w-24 bg-superficie-clara dark:bg-superficie-oscura border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <select value={ing.unidad} onChange={(e) => actualizarIngrediente(index, 'unidad', e.target.value)} className="bg-superficie-clara dark:bg-superficie-oscura border border-gray-300 dark:border-gray-600 rounded-md p-2">
                      {opcionesUnidad.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <button type="button" onClick={() => eliminarIngrediente(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><IconoBasura className="w-5 h-5"/></button>
                  </div>
                )})}
              </div>
              <button type="button" onClick={agregarIngrediente} disabled={articulos.length === 0} className="mt-3 text-sm font-semibold text-primario-claro dark:text-primario-oscuro hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                + Agregar Ingrediente
              </button>
            </div>
            <div className="text-right font-semibold text-lg border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              Costo Total Estimado: <span className="text-primario-claro dark:text-primario-oscuro">${costoTotalModal.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={cerrarModalYReiniciar} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancelar</button>
            <button type="submit" className="py-2 px-4 rounded-lg bg-primario-claro dark:bg-primario-oscuro text-white font-semibold shadow-md hover:bg-opacity-90 transition">Guardar Receta</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VistaRecetas;
