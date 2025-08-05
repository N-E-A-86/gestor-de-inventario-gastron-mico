
import React, { useState } from 'react';
import type { ArticuloInventario } from '../types';
import Modal from './Modal';
import { IconoEditar, IconoBasura } from './Iconos';

// Propiedades que el componente VistaInventario recibe
interface VistaInventarioProps {
  articulos: ArticuloInventario[];
  agregarArticulo: (articulo: Omit<ArticuloInventario, 'id'>) => void;
  editarArticulo: (articulo: ArticuloInventario) => void;
  eliminarArticulo: (id: string) => void;
}

const VistaInventario: React.FC<VistaInventarioProps> = ({ articulos, agregarArticulo, editarArticulo, eliminarArticulo }) => {
  // Estado para controlar la visibilidad del modal de agregar/editar
  const [modalAbierto, setModalAbierto] = useState(false);
  // Estado para guardar el artículo que se está editando. Si es null, el modal es para agregar uno nuevo.
  const [articuloActual, setArticuloActual] = useState<ArticuloInventario | null>(null);

  const abrirModalParaEditar = (articulo: ArticuloInventario) => {
    setArticuloActual(articulo);
    setModalAbierto(true);
  };

  const abrirModalParaAgregar = () => {
    setArticuloActual(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setArticuloActual(null);
  };

  const manejarSubmit = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formData = new FormData(evento.currentTarget);
    const datosArticulo = {
      nombre: formData.get('nombre') as string,
      unidad: formData.get('unidad') as 'kg' | 'g' | 'l' | 'ml' | 'unidad',
      cantidad: parseFloat(formData.get('cantidad') as string),
      precioUnitario: parseFloat(formData.get('precioUnitario') as string),
    };
    
    // Validaciones básicas
    if (!datosArticulo.nombre || isNaN(datosArticulo.cantidad) || isNaN(datosArticulo.precioUnitario)) {
        alert("Por favor, complete todos los campos correctamente.");
        return;
    }

    if (articuloActual) { // Si hay un artículo actual, lo estamos editando
      editarArticulo({ ...datosArticulo, id: articuloActual.id });
    } else { // Si no, estamos agregando uno nuevo
      agregarArticulo(datosArticulo);
    }
    cerrarModal();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventario</h1>
        <button
          onClick={abrirModalParaAgregar}
          className="bg-primario-claro dark:bg-primario-oscuro text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-opacity-90 transition"
        >
          Agregar Artículo
        </button>
      </div>

      <div className="bg-superficie-clara dark:bg-superficie-oscura shadow-xl rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Cantidad</th>
              <th className="p-4">Unidad</th>
              <th className="p-4">Precio Unitario</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articulos.length > 0 ? (
              articulos.map((articulo) => (
                <tr key={articulo.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-fondo-claro dark:hover:bg-fondo-oscuro">
                  <td className="p-4 font-medium">{articulo.nombre}</td>
                  <td className="p-4">{articulo.cantidad}</td>
                  <td className="p-4">{articulo.unidad}</td>
                  <td className="p-4">${articulo.precioUnitario.toFixed(2)}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => abrirModalParaEditar(articulo)} className="p-2 text-texto-secundario-claro dark:text-texto-secundario-oscuro hover:text-blue-500"><IconoEditar /></button>
                    <button onClick={() => eliminarArticulo(articulo.id)} className="p-2 text-texto-secundario-claro dark:text-texto-secundario-oscuro hover:text-red-500"><IconoBasura /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                  No hay artículos en el inventario. ¡Agrega el primero!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal estaAbierto={modalAbierto} alCerrar={cerrarModal} titulo={articuloActual ? 'Editar Artículo' : 'Agregar Artículo'}>
        <form onSubmit={manejarSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium mb-1">Nombre del Artículo</label>
              <input type="text" name="nombre" id="nombre" defaultValue={articuloActual?.nombre || ''} required className="w-full bg-fondo-claro dark:bg-fondo-oscuro border border-gray-300 dark:border-gray-600 rounded-md p-2"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cantidad" className="block text-sm font-medium mb-1">Cantidad</label>
                <input type="number" name="cantidad" id="cantidad" step="0.01" defaultValue={articuloActual?.cantidad || ''} required className="w-full bg-fondo-claro dark:bg-fondo-oscuro border border-gray-300 dark:border-gray-600 rounded-md p-2"/>
              </div>
              <div>
                <label htmlFor="unidad" className="block text-sm font-medium mb-1">Unidad</label>
                <select name="unidad" id="unidad" defaultValue={articuloActual?.unidad || 'unidad'} required className="w-full bg-fondo-claro dark:bg-fondo-oscuro border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  <option value="kg">Kilogramo (kg)</option>
                  <option value="g">Gramo (g)</option>
                  <option value="l">Litro (l)</option>
                  <option value="ml">Mililitro (ml)</option>
                  <option value="unidad">Unidad</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="precioUnitario" className="block text-sm font-medium mb-1">Precio Unitario ($)</label>
              <input type="number" name="precioUnitario" id="precioUnitario" step="0.01" defaultValue={articuloActual?.precioUnitario || ''} required className="w-full bg-fondo-claro dark:bg-fondo-oscuro border border-gray-300 dark:border-gray-600 rounded-md p-2"/>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={cerrarModal} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancelar</button>
            <button type="submit" className="py-2 px-4 rounded-lg bg-primario-claro dark:bg-primario-oscuro text-white font-semibold shadow-md hover:bg-opacity-90 transition">{articuloActual ? 'Guardar Cambios' : 'Agregar Artículo'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VistaInventario;
