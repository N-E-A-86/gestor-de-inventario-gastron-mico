import React, { useState, useMemo } from 'react';
import type { Receta, ArticuloInventario, IngredienteReceta } from '../types';
import Modal from './Modal';
import { IconoBasura, IconoLibro, IconoEditar } from './Iconos';

// Propiedades que el componente VistaRecetas recibe
interface VistaRecetasProps {
  recetas: Receta[];
  articulos: ArticuloInventario[];
  agregarReceta: (receta: Omit<Receta, 'id'>) => void;
  editarReceta: (receta: Receta) => void;
  eliminarReceta: (id: string) => void;
}

const VistaRecetas: React.FC<VistaRecetasProps> = ({ recetas, articulos, agregarReceta, editarReceta, eliminarReceta }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [recetaActual, setRecetaActual] = useState<Receta | null>(null);
  const [nombreReceta, setNombreReceta] = useState('');
  const [ingredientes, setIngredientes] = useState<IngredienteReceta[]>([]);

  // Memoizamos el mapa de artículos para un acceso rápido y evitar recálculos
  const mapaArticulos = useMemo(() => {
    return new Map(articulos.map(articulo => [articulo.id, articulo]));
  }, [articulos]);

  // Función para calcular el costo total de una receta
  const calcularCostoReceta = (ingredientesReceta: IngredienteReceta[]): number => {
    return ingredientesReceta.reduce((total, ingrediente) => {
      const articulo = mapaArticulos.get(ingrediente.articuloId);
      if (!articulo) return total;
      return total + (articulo.precioUnitario * ingrediente.cantidad);
    }, 0);
  };

  const abrirModalParaCrear = () => {
    setRecetaActual(null);
    setNombreReceta('');
    setIngredientes([]);
    setModalAbierto(true);
  };

  const abrirModalParaEditar = (receta: Receta) => {
    setRecetaActual(receta);
    setNombreReceta(receta.nombre);
    // Copia profunda de los ingredientes para evitar la mutación del estado original durante la edición
    setIngredientes(JSON.parse(JSON.stringify(receta.ingredientes)));
    setModalAbierto(true);
  };
  
  const cerrarModal = () => {
    setModalAbierto(false);
    setRecetaActual(null);
    setNombreReceta('');
    setIngredientes([]);
  };

  const agregarIngrediente = () => {
    // Agrega un nuevo ingrediente vacío, siempre que haya artículos en el inventario
    if (articulos.length > 0) {
      setIngredientes([...ingredientes, { articuloId: articulos[0].id, cantidad: 0 }]);
    } else {
      alert("Necesitas agregar artículos al inventario primero.");
    }
  };

  const actualizarIngrediente = (index: number, campo: keyof IngredienteReceta, valor: string | number) => {
    const nuevosIngredientes = [...ingredientes];
    const ingrediente = nuevosIngredientes[index];

    if (campo === 'articuloId') {
      ingrediente.articuloId = valor as string;
    } else if (campo === 'cantidad') {
      ingrediente.cantidad = parseFloat(valor as string) || 0;
    }
    setIngredientes(nuevosIngredientes);
  };

  const eliminarIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const manejarSubmit = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!nombreReceta.trim() || ingredientes.length === 0) {
      alert("La receta debe tener un nombre y al menos un ingrediente.");
      return;
    }
    
    if (recetaActual) {
      editarReceta({ ...recetaActual, nombre: nombreReceta, ingredientes });
    } else {
      agregarReceta({ nombre: nombreReceta, ingredientes });
    }

    cerrarModal();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Recetas</h1>
        <button
          onClick={abrirModalParaCrear}
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
                    <div className="flex items-center gap-2">
                        <button onClick={() => abrirModalParaEditar(receta)} className="p-1 text-texto-secundario-claro dark:text-texto-secundario-oscuro hover:text-blue-500 transition-colors rounded-full"><IconoEditar className="w-5 h-5"/></button>
                        <button onClick={() => eliminarReceta(receta.id)} className="p-1 text-texto-secundario-claro dark:text-texto-secundario-oscuro hover:text-red-500 transition-colors rounded-full"><IconoBasura className="w-5 h-5"/></button>
                    </div>
                  </div>
                  <ul className="mb-4 space-y-1">
                    {receta.ingredientes.map((ing, index) => {
                      const articulo = mapaArticulos.get(ing.articuloId);
                      return (
                        <li key={index} className="flex justify-between text-sm">
                          <span>{articulo?.nombre || 'Artículo no encontrado'}</span>
                          <span className="text-texto-secundario-claro dark:text-texto-secundario-oscuro">{ing.cantidad} {articulo?.unidad}</span>
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

      <Modal estaAbierto={modalAbierto} alCerrar={cerrarModal} titulo={recetaActual ? 'Editar Receta' : 'Crear Nueva Receta'}>
        <form onSubmit={manejarSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nombreReceta" className="block text-sm font-medium mb-1">Nombre de la Receta</label>
              <input type="text" id="nombreReceta" value={nombreReceta} onChange={(e) => setNombreReceta(e.target.value)} required className="w-full bg-fondo-claro dark:bg-fondo-oscuro border border-gray-300 dark:border-gray-600 rounded-md p-2"/>
            </div>
            <div>
              <h3 className="text-md font-medium mb-2">Ingredientes</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {ingredientes.map((ing, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-fondo-claro dark:bg-fondo-oscuro rounded-md">
                    <select value={ing.articuloId} onChange={(e) => actualizarIngrediente(index, 'articuloId', e.target.value)} className="flex-grow bg-superficie-clara dark:bg-superficie-oscura border border-gray-300 dark:border-gray-600 rounded-md p-2">
                      {articulos.map(art => <option key={art.id} value={art.id}>{art.nombre}</option>)}
                    </select>
                    <input type="number" step="0.01" value={ing.cantidad} onChange={(e) => actualizarIngrediente(index, 'cantidad', e.target.value)} placeholder="Cant." className="w-24 bg-superficie-clara dark:bg-superficie-oscura border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <button type="button" onClick={() => eliminarIngrediente(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><IconoBasura className="w-5 h-5"/></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={agregarIngrediente} disabled={articulos.length === 0} className="mt-3 text-sm font-semibold text-primario-claro dark:text-primario-oscuro hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                + Agregar Ingrediente
              </button>
            </div>
            <div className="text-right font-semibold text-lg border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              Costo Total: <span className="text-primario-claro dark:text-primario-oscuro">${calcularCostoReceta(ingredientes).toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={cerrarModal} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancelar</button>
            <button type="submit" className="py-2 px-4 rounded-lg bg-primario-claro dark:bg-primario-oscuro text-white font-semibold shadow-md hover:bg-opacity-90 transition">{recetaActual ? 'Guardar Cambios' : 'Guardar Receta'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VistaRecetas;