
import React, { useEffect } from 'react';
import { IconoCerrar } from './Iconos';

interface ModalProps {
  estaAbierto: boolean;
  alCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ estaAbierto, alCerrar, titulo, children }) => {
  useEffect(() => {
    // Función para manejar el cierre del modal con la tecla Escape
    const manejarTeclaEsc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        alCerrar();
      }
    };

    if (estaAbierto) {
      window.addEventListener('keydown', manejarTeclaEsc);
    }

    // Limpieza: remover el event listener cuando el componente se desmonta o el modal se cierra
    return () => {
      window.removeEventListener('keydown', manejarTeclaEsc);
    };
  }, [estaAbierto, alCerrar]);

  if (!estaAbierto) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={alCerrar} // Cierra el modal si se hace clic en el fondo
    >
      <div
        className="relative bg-superficie-clara dark:bg-superficie-oscura rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 transform transition-all"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="modal-title" className="text-xl font-semibold text-texto-claro dark:text-texto-oscuro">
            {titulo}
          </h2>
          <button
            onClick={alCerrar}
            className="text-texto-secundario-claro dark:text-texto-secundario-oscuro hover:text-texto-claro dark:hover:text-texto-oscuro transition"
            aria-label="Cerrar modal"
          >
            <IconoCerrar className="w-6 h-6" />
          </button>
        </div>
        <div className="mt-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
