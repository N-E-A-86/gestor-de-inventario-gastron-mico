import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import type { ArticuloInventario, Receta } from './types';
import VistaInventario from './components/VistaInventario';
import VistaRecetas from './components/VistaRecetas';
import VistaActualizarPrecios from './components/VistaActualizarPrecios';
import { IconoSol, IconoLuna } from './components/Iconos';
import * as apiService from './services/apiService';

// Componente para el enlace de navegación con estilo activo
const EnlaceNavegacion: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => {
    const baseClasses = "py-2 px-4 rounded-md text-sm font-medium transition-colors";
    const activeClasses = "bg-primario-claro/20 dark:bg-primario-oscuro/30 text-primario-claro dark:text-blue-300";
    const inactiveClasses = "hover:bg-gray-200 dark:hover:bg-gray-700";

    return (
        <NavLink to={to} className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </NavLink>
    );
};


const App: React.FC = () => {
  // Estado para el modo oscuro
  const [modoOscuro, setModoOscuro] = useState(true);
  const [cargando, setCargando] = useState(true);
  
  // Estados principales de la aplicación
  const [articulos, setArticulos] = useState<ArticuloInventario[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  
  const location = useLocation();

  // Efecto para manejar el cambio de tema (claro/oscuro)
  useEffect(() => {
    const root = window.document.documentElement;
    const modoGuardado = localStorage.getItem('modoOscuro');
    const modoInicial = modoGuardado ? JSON.parse(modoGuardado) : true;
    setModoOscuro(modoInicial);

    if (modoInicial) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
     if (modoOscuro) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('modoOscuro', JSON.stringify(modoOscuro));
  }, [modoOscuro]);


  // Efecto para cargar los datos desde el servicio de API al iniciar
  useEffect(() => {
    const cargarDatosIniciales = async () => {
        try {
            const [articulosData, recetasData] = await Promise.all([
                apiService.obtenerArticulos(),
                apiService.obtenerRecetas()
            ]);
            setArticulos(articulosData);
            setRecetas(recetasData);
        } catch (error) {
            console.error("Error al cargar los datos iniciales:", error);
            // Opcional: mostrar un mensaje de error al usuario
        } finally {
            setCargando(false);
        }
    };
    cargarDatosIniciales();
  }, []);


  // --- Lógica de negocio para Artículos ---
  const agregarArticulo = useCallback(async (articulo: Omit<ArticuloInventario, 'id'>) => {
    const nuevoArticulo = await apiService.agregarArticulo(articulo);
    setArticulos(prev => [...prev, nuevoArticulo]);
  }, []);

  const editarArticulo = useCallback(async (articuloActualizado: ArticuloInventario) => {
    const articuloEditado = await apiService.editarArticulo(articuloActualizado);
    setArticulos(prev => prev.map(a => a.id === articuloEditado.id ? articuloEditado : a));
  }, []);

  const eliminarArticulo = useCallback(async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
        await apiService.eliminarArticulo(id);
        setArticulos(prev => prev.filter(a => a.id !== id));
        // Opcional: También eliminar el artículo de las recetas que lo usan.
    }
  }, []);

  // --- Lógica de negocio para Recetas ---
  const agregarReceta = useCallback(async (receta: Omit<Receta, 'id'>) => {
    const nuevaReceta = await apiService.agregarReceta(receta);
    setRecetas(prev => [...prev, nuevaReceta]);
  }, []);

  const editarReceta = useCallback(async (recetaActualizada: Receta) => {
    const recetaEditada = await apiService.editarReceta(recetaActualizada);
    setRecetas(prev => prev.map(r => r.id === recetaEditada.id ? recetaEditada : r));
  }, []);

  const eliminarReceta = useCallback(async (id: string) => {
     if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
        await apiService.eliminarReceta(id);
        setRecetas(prev => prev.filter(r => r.id !== id));
     }
  }, []);

  // --- Lógica de negocio para Actualización de Precios ---
  const actualizarPreciosMasivamente = useCallback(async (actualizaciones: { articuloId: string; nuevoPrecio: number }[]) => {
      const articulosActualizados = await apiService.actualizarPreciosMasivamente(actualizaciones);
      setArticulos(articulosActualizados);
      alert(`${actualizaciones.length} precios han sido actualizados exitosamente.`);
  }, []);
  
  const obtenerTituloPagina = () => {
    switch (location.pathname) {
        case '/': return 'Inventario';
        case '/recetas': return 'Recetas';
        case '/actualizar-precios': return 'Actualizar Precios';
        default: return 'Gestor Gastronómico';
    }
  };

  if (cargando) {
      return (
          <div className="min-h-screen flex justify-center items-center bg-fondo-claro dark:bg-fondo-oscuro">
              <div className="text-xl font-semibold text-texto-claro dark:text-texto-oscuro">Cargando datos...</div>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-superficie-clara dark:bg-superficie-oscura shadow-md sticky top-0 z-30">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold whitespace-nowrap">
                <span className="hidden sm:inline">Gestor Gastronómico / </span>{obtenerTituloPagina()}
            </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <EnlaceNavegacion to="/">Inventario</EnlaceNavegacion>
            <EnlaceNavegacion to="/recetas">Recetas</EnlaceNavegacion>
            <EnlaceNavegacion to="/actualizar-precios">Actualizar Precios</EnlaceNavegacion>
          </div>
          <button onClick={() => setModoOscuro(!modoOscuro)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {modoOscuro ? <IconoSol /> : <IconoLuna />}
          </button>
        </nav>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<VistaInventario articulos={articulos} agregarArticulo={agregarArticulo} editarArticulo={editarArticulo} eliminarArticulo={eliminarArticulo} />} />
          <Route path="/recetas" element={<VistaRecetas recetas={recetas} articulos={articulos} agregarReceta={agregarReceta} editarReceta={editarReceta} eliminarReceta={eliminarReceta} />} />
          <Route path="/actualizar-precios" element={<VistaActualizarPrecios articulos={articulos} actualizarPrecios={actualizarPreciosMasivamente} />} />
        </Routes>
      </main>

       <footer className="text-center py-4 text-xs text-texto-secundario-claro dark:text-texto-secundario-oscuro border-t border-gray-200 dark:border-gray-800">
        <p>Desarrollado con React, Tailwind CSS y Gemini API.</p>
       </footer>
    </div>
  );
};

export default App;
