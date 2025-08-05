import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import type { ArticuloInventario, Receta } from './types';
import VistaInventario from './components/VistaInventario';
import VistaRecetas from './components/VistaRecetas';
import VistaActualizarPrecios from './components/VistaActualizarPrecios';
import { IconoSol, IconoLuna } from './components/Iconos';

// Datos iniciales para demostración
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

  // Estados principales de la aplicación
  const [articulos, setArticulos] = useState<ArticuloInventario[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  
  const location = useLocation();

  // Efecto para manejar el cambio de tema (claro/oscuro)
  useEffect(() => {
    const root = window.document.documentElement;
    if (modoOscuro) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('modoOscuro', JSON.stringify(modoOscuro));
  }, [modoOscuro]);

  // Efecto para cargar los datos desde localStorage al iniciar
  useEffect(() => {
    try {
      const modoGuardado = localStorage.getItem('modoOscuro');
      if (modoGuardado) {
        setModoOscuro(JSON.parse(modoGuardado));
      }
      
      const articulosGuardados = localStorage.getItem('articulosInventario');
      setArticulos(articulosGuardados ? JSON.parse(articulosGuardados) : DATOS_INICIALES_ARTICULOS);
      
      const recetasGuardadas = localStorage.getItem('recetasInventario');
      setRecetas(recetasGuardadas ? JSON.parse(recetasGuardadas) : DATOS_INICIALES_RECETAS);
    } catch (error) {
        console.error("Error al cargar datos desde localStorage", error);
        setArticulos(DATOS_INICIALES_ARTICULOS);
        setRecetas(DATOS_INICIALES_RECETAS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto para guardar artículos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('articulosInventario', JSON.stringify(articulos));
  }, [articulos]);

  // Efecto para guardar recetas en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('recetasInventario', JSON.stringify(recetas));
  }, [recetas]);


  // --- Lógica de negocio para Artículos ---
  const agregarArticulo = useCallback((articulo: Omit<ArticuloInventario, 'id'>) => {
    setArticulos(prev => [...prev, { ...articulo, id: new Date().toISOString() }]);
  }, []);

  const editarArticulo = useCallback((articuloActualizado: ArticuloInventario) => {
    setArticulos(prev => prev.map(a => a.id === articuloActualizado.id ? articuloActualizado : a));
  }, []);

  const eliminarArticulo = useCallback((id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
        setArticulos(prev => prev.filter(a => a.id !== id));
        // Opcional: También eliminar el artículo de las recetas que lo usan.
    }
  }, []);

  // --- Lógica de negocio para Recetas ---
  const agregarReceta = useCallback((receta: Omit<Receta, 'id'>) => {
    setRecetas(prev => [...prev, { ...receta, id: new Date().toISOString() }]);
  }, []);

  const editarReceta = useCallback((recetaActualizada: Receta) => {
    setRecetas(prev => prev.map(r => r.id === recetaActualizada.id ? recetaActualizada : r));
  }, []);

  const eliminarReceta = useCallback((id: string) => {
     if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
        setRecetas(prev => prev.filter(r => r.id !== id));
     }
  }, []);

  // --- Lógica de negocio para Actualización de Precios ---
  const actualizarPreciosMasivamente = useCallback((actualizaciones: { articuloId: string; nuevoPrecio: number }[]) => {
      const mapaActualizaciones = new Map(actualizaciones.map(u => [u.articuloId, u.nuevoPrecio]));
      setArticulos(prev =>
          prev.map(articulo => {
              if (mapaActualizaciones.has(articulo.id)) {
                  return { ...articulo, precioUnitario: mapaActualizaciones.get(articulo.id)! };
              }
              return articulo;
          })
      );
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