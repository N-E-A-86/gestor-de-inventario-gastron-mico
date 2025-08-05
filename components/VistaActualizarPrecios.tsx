
import React, { useState, useCallback, useMemo } from 'react';
import { procesarPdfPrecios } from '../services/geminiService';
import type { ArticuloInventario, SugerenciaPrecio } from '../types';
import { IconoSubir } from './Iconos';

interface VistaActualizarPreciosProps {
  articulos: ArticuloInventario[];
  actualizarPrecios: (actualizaciones: { articuloId: string; nuevoPrecio: number }[]) => void;
}

type EstadoCarga = 'idle' | 'cargando' | 'error' | 'exito';

const VistaActualizarPrecios: React.FC<VistaActualizarPreciosProps> = ({ articulos, actualizarPrecios }) => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [estado, setEstado] = useState<EstadoCarga>('idle');
  const [mensajeError, setMensajeError] = useState('');
  const [sugerencias, setSugerencias] = useState<SugerenciaPrecio[]>([]);

  const mapaArticulos = useMemo(() => {
    return new Map(articulos.map(articulo => [articulo.id, articulo]));
  }, [articulos]);

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
      setEstado('idle');
      setSugerencias([]);
      setMensajeError('');
    }
  };

  const procesarArchivo = useCallback(async () => {
    if (!archivo) {
      setMensajeError('Por favor, selecciona un archivo PDF primero.');
      setEstado('error');
      return;
    }

    setEstado('cargando');
    setMensajeError('');
    setSugerencias([]);

    try {
      const resultados = await procesarPdfPrecios(archivo, articulos);
      if (resultados && resultados.length > 0) {
        const sugerenciasConDatos = resultados.map((s: { articuloId: string; nuevoPrecio: number; }) => {
          const articulo = mapaArticulos.get(s.articuloId);
          return {
            ...s,
            nombreArticulo: articulo?.nombre || 'Desconocido',
            precioAnterior: articulo?.precioUnitario || 0,
          };
        });
        setSugerencias(sugerenciasConDatos);
        setEstado('exito');
      } else {
        setMensajeError('No se encontraron actualizaciones de precios en el documento.');
        setEstado('error');
      }
    } catch (error) {
      setEstado('error');
      setMensajeError(error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    }
  }, [archivo, articulos, mapaArticulos]);

  const aplicarActualizaciones = () => {
    const actualizaciones = sugerencias.map(({ articuloId, nuevoPrecio }) => ({ articuloId, nuevoPrecio }));
    actualizarPrecios(actualizaciones);
    // Resetear la vista después de aplicar
    setEstado('idle');
    setArchivo(null);
    setSugerencias([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Actualización Masiva de Precios</h1>
      <p className="text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-6">
        Sube un archivo PDF con una lista de productos y sus nuevos precios. La IA analizará el documento y sugerirá los cambios.
      </p>

      <div className="bg-superficie-clara dark:bg-superficie-oscura p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label htmlFor="file-upload" className="flex-grow w-full cursor-pointer">
            <div className="flex items-center justify-center w-full h-16 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-texto-secundario-claro dark:text-texto-secundario-oscuro hover:border-primario-claro dark:hover:border-primario-oscuro transition">
              <IconoSubir className="w-6 h-6 mr-2" />
              <span>{archivo ? archivo.name : 'Selecciona un archivo PDF'}</span>
            </div>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={manejarCambioArchivo} />
          </label>
          <button
            onClick={procesarArchivo}
            disabled={!archivo || estado === 'cargando'}
            className="w-full sm:w-auto bg-primario-claro dark:bg-primario-oscuro text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-wait"
          >
            {estado === 'cargando' ? 'Procesando...' : 'Analizar PDF'}
          </button>
        </div>

        {estado === 'error' && <p className="mt-4 text-center text-red-500 font-semibold">{mensajeError}</p>}
      </div>

      {estado === 'exito' && sugerencias.length > 0 && (
        <div className="mt-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">Sugerencias de Actualización</h2>
          <div className="bg-superficie-clara dark:bg-superficie-oscura shadow-lg rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-fondo-claro dark:bg-fondo-oscuro">
                <tr>
                  <th className="p-3 text-left">Artículo</th>
                  <th className="p-3 text-right">Precio Anterior</th>
                  <th className="p-3 text-right">Nuevo Precio</th>
                </tr>
              </thead>
              <tbody>
                {sugerencias.map((s, i) => (
                  <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3">{s.nombreArticulo}</td>
                    <td className="p-3 text-right text-red-500">${s.precioAnterior.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-green-500">${s.nuevoPrecio.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={aplicarActualizaciones}
              className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Aplicar {sugerencias.length} Actualizaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaActualizarPrecios;
