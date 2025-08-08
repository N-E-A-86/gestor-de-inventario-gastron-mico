import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import type { ArticuloInventario, Receta } from './types';
import VistaInventario from './components/VistaInventario';
import VistaRecetas from './components/VistaRecetas';
import VistaActualizarPrecios from './components/VistaActualizarPrecios';
import { IconoSol, IconoLuna, IconoUsuario, IconoCerrarSesion } from './components/Iconos';
import * as firestoreService from './services/firestoreService';
import { useAuth } from './contexts/AuthContext';


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

  // Se consume el contexto de autenticación para obtener el estado del usuario y las funciones.
  const { user, authCargando, login, logout } = useAuth();

  // Estados para los datos de la aplicación (inventario, recetas)
  const [articulos, setArticulos] = useState<ArticuloInventario[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true); // Estado de carga para los datos de Firestore
  
  const location = useLocation();

  // Efecto para manejar el cambio de tema (claro/oscuro)
  useEffect(() => {
    const root = window.document.documentElement;
    const modoGuardado = localStorage.getItem('modoOscuro');
    const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const modoInicial = modoGuardado !== null ? JSON.parse(modoGuardado) : prefiereOscuro;
    
    setModoOscuro(modoInicial);

    if (modoInicial) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);
  
  const toggleModoOscuro = () => {
      setModoOscuro(prev => {
          const nuevoModo = !prev;
          const root = window.document.documentElement;
          root.classList.toggle('dark', nuevoModo);
          localStorage.setItem('modoOscuro', JSON.stringify(nuevoModo));
          return nuevoModo;
      });
  };

  // Efecto para cargar los datos desde Firestore cuando el usuario cambia.
  useEffect(() => {
    // No hacer nada hasta que la autenticación inicial termine.
    if (authCargando) return;

    const cargarDatos = async () => {
      if (user) {
        try {
            setCargando(true);
            const [articulosFs, recetasFs] = await Promise.all([
                firestoreService.getArticulos(user.uid),
                firestoreService.getRecetas(user.uid)
            ]);
            setArticulos(articulosFs);
            setRecetas(recetasFs);
        } catch (error) {
            console.error("Error al cargar datos desde Firestore:", error);
            alert("No se pudieron cargar los datos. Por favor, revisa tu conexión y la configuración de Firebase.");
        } finally {
            setCargando(false);
        }
      } else {
        // Si no hay usuario, limpiar los datos y detener la carga.
        setArticulos([]);
        setRecetas([]);
        setCargando(false);
      }
    };
    cargarDatos();
  }, [user, authCargando]);

  // --- Lógica de negocio para Artículos (Callbacks memoizadas para optimización) ---
  const agregarArticulo = useCallback(async (articulo: Omit<ArticuloInventario, 'id'>) => {
    if (!user) return;
    try {
        const nuevoArticulo = await firestoreService.addArticulo(user.uid, articulo);
        setArticulos(prev => [...prev, nuevoArticulo]);
    } catch (error) {
        console.error("Error al agregar artículo:", error);
    }
  }, [user]);

  const editarArticulo = useCallback(async (articuloActualizado: ArticuloInventario) => {
    if (!user) return;
    try {
        await firestoreService.updateArticulo(user.uid, articuloActualizado.id, articuloActualizado);
        setArticulos(prev => prev.map(a => a.id === articuloActualizado.id ? articuloActualizado : a));
    } catch (error) {
        console.error("Error al editar artículo:", error);
    }
  }, [user]);

  const eliminarArticulo = useCallback(async (id: string) => {
    if (!user) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
        try {
            await firestoreService.deleteArticulo(user.uid, id);
            setArticulos(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error("Error al eliminar artículo:", error);
        }
    }
  }, [user]);

  // --- Lógica de negocio para Recetas ---
  const agregarReceta = useCallback(async (receta: Omit<Receta, 'id'>) => {
    if (!user) return;
    try {
        const nuevaReceta = await firestoreService.addReceta(user.uid, receta);
        setRecetas(prev => [...prev, nuevaReceta]);
    } catch (error) {
        console.error("Error al agregar receta:", error);
    }
  }, [user]);

  const eliminarReceta = useCallback(async (id: string) => {
    if (!user) return;
     if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
        try {
            await firestoreService.deleteReceta(user.uid, id);
            setRecetas(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("Error al eliminar receta:", error);
        }
     }
  }, [user]);

  // --- Lógica de negocio para Actualización de Precios ---
  const actualizarPreciosMasivamente = useCallback(async (actualizaciones: { articuloId: string; nuevoPrecio: number }[]) => {
      if (!user) return;
      try {
          await firestoreService.batchUpdatePrecios(user.uid, actualizaciones);
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
      } catch (error) {
          console.error("Error en la actualización masiva:", error);
      }
  }, [user]);
  
  const obtenerTituloPagina = () => {
    switch (location.pathname) {
        case '/': return 'Inventario';
        case '/recetas': return 'Recetas';
        case '/actualizar-precios': return 'Actualizar Precios';
        default: return 'Gestor Gastronómico';
    }
  };

  // Muestra un spinner mientras se verifica la sesión o se cargan los datos iniciales.
  if (authCargando || (cargando && user)) {
      return (
          <div className="flex justify-center items-center min-h-screen bg-fondo-claro dark:bg-fondo-oscuro">
              <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primario-claro dark:border-primario-oscuro"></div>
          </div>
      );
  }

  // Si no hay usuario, muestra la pantalla de login.
  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-fondo-claro dark:bg-fondo-oscuro text-texto-claro dark:text-texto-oscuro">
            <div className="text-center p-8 bg-superficie-clara dark:bg-superficie-oscura rounded-xl shadow-2xl w-full max-w-sm mx-4">
                <h1 className="text-3xl font-bold mb-2">Gestor Gastronómico</h1>
                <p className="mb-8 text-texto-secundario-claro dark:text-texto-secundario-oscuro">Inicia sesión para administrar tu negocio</p>
                <button
                    onClick={login} // Usa la función `login` del contexto.
                    className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    <IconoUsuario className="w-5 h-5"/>
                    <span>Iniciar Sesión con Google</span>
                </button>
            </div>
            <footer className="absolute bottom-0 text-center py-4 text-xs text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                <p>Desarrollado con React, Firebase y Gemini API.</p>
            </footer>
        </div>
    );
  }

  // Si hay un usuario, muestra la aplicación principal.
  return (
    <div className="min-h-screen flex flex-col bg-fondo-claro dark:bg-fondo-oscuro text-texto-claro dark:text-texto-oscuro">
      <header className="bg-superficie-clara dark:bg-superficie-oscura shadow-md sticky top-0 z-30">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold whitespace-nowrap truncate">
                    <span className="hidden sm:inline">Gestor / </span>{obtenerTituloPagina()}
                </h1>
            </div>
          <div className="flex items-center gap-2 sm:gap-4 mx-4">
            <EnlaceNavegacion to="/">Inventario</EnlaceNavegacion>
            <EnlaceNavegacion to="/recetas">Recetas</EnlaceNavegacion>
            <EnlaceNavegacion to="/actualizar-precios">Actualizar Precios</EnlaceNavegacion>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden lg:inline text-sm text-texto-secundario-claro dark:text-texto-secundario-oscuro">{user.displayName || user.email}</span>
            <button onClick={toggleModoOscuro} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Cambiar tema">
              {modoOscuro ? <IconoSol /> : <IconoLuna />}
            </button>
            <button onClick={logout} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors" aria-label="Cerrar sesión">
                <IconoCerrarSesion />
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<VistaInventario articulos={articulos} agregarArticulo={agregarArticulo} editarArticulo={editarArticulo} eliminarArticulo={eliminarArticulo} />} />
          <Route path="/recetas" element={<VistaRecetas recetas={recetas} articulos={articulos} agregarReceta={agregarReceta} eliminarReceta={eliminarReceta} />} />
          <Route path="/actualizar-precios" element={<VistaActualizarPrecios articulos={articulos} actualizarPrecios={actualizarPreciosMasivamente} />} />
        </Routes>
      </main>

       <footer className="text-center py-4 text-xs text-texto-secundario-claro dark:text-texto-secundario-oscuro border-t border-gray-200 dark:border-gray-800">
        <p>Desarrollado con React, Firebase y Gemini API.</p>
       </footer>
    </div>
  );
};

export default App;