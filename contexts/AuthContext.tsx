import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebaseConfig';
import firebase from 'firebase/compat/app';

// Define la estructura de los datos que el contexto proveerá.
interface AuthContextType {
  user: firebase.User | null;
  authCargando: boolean; // Estado de carga específico para la autenticación.
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

// Crea el contexto con un valor inicial undefined.
// La verificación de nulidad se hará en el hook `useAuth` para asegurar su uso correcto.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook personalizado para consumir el contexto de autenticación de forma segura y limpia.
 * Lanza un error si se intenta usar fuera de un AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

/**
 * Componente proveedor que envuelve la aplicación y maneja el estado global de autenticación.
 * Se suscribe a los cambios de estado de Firebase y provee el usuario actual y funciones
 * de autenticación a todos sus componentes hijos.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [authCargando, setAuthCargando] = useState(true);

  // Efecto que se ejecuta una vez para suscribirse a los cambios de estado de autenticación de Firebase.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
      setAuthCargando(false);
    });
    // Limpieza: se desuscribe al desmontar el componente para evitar fugas de memoria.
    return unsubscribe;
  }, []);

  // Función para iniciar sesión con el popup de Google.
  const login = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      alert("No se pudo iniciar sesión. Revisa la consola para más detalles.");
    }
  };

  // Función para cerrar la sesión del usuario.
  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // El valor que se pasará a los componentes hijos a través del proveedor.
  const value = { user, authCargando, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
