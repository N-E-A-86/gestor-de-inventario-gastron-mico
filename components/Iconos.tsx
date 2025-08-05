
import React from 'react';

// Un componente genérico para encapsular los íconos
const IconoBase: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-6 h-6 ${className}`}
  >
    {children}
  </svg>
);

export const IconoSol: React.FC<{ className?: string }> = ({ className }) => (
  <IconoBase className={className}>
    <path
      fillRule="evenodd"
      d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 5.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5ZM12 17.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5ZM5.5 12a.5.5 0 0 1 .5.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5ZM17.5 12a.5.5 0 0 1 .5.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5ZM8.04 8.04a.5.5 0 0 1 .707 0l.707.707a.5.5 0 0 1-.707.707l-.707-.707a.5.5 0 0 1 0-.707ZM15.243 15.243a.5.5 0 0 1 .707 0l.707.707a.5.5 0 0 1-.707.707l-.707-.707a.5.5 0 0 1 0-.707ZM15.96 8.04a.5.5 0 0 1 0 .707l-.707.707a.5.5 0 0 1-.707-.707l.707-.707a.5.5 0 0 1 .707 0ZM8.757 15.243a.5.5 0 0 1 0 .707l-.707.707a.5.5 0 0 1-.707-.707l.707-.707a.5.5 0 0 1 .707 0Z"
      clipRule="evenodd"
    />
  </IconoBase>
);

export const IconoLuna: React.FC<{ className?: string }> = ({ className }) => (
  <IconoBase className={className}>
    <path
      fillRule="evenodd"
      d="M12.5 2.5a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 1.5a8.5 8.5 0 1 0 6.01 14.51A8.5 8.5 0 0 1 12.5 4Z"
      clipRule="evenodd"
    />
  </IconoBase>
);

export const IconoEditar: React.FC<{ className?: string }> = ({ className }) => (
  <IconoBase className={className}><path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" /><path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" /></IconoBase>
);

export const IconoBasura: React.FC<{ className?: string }> = ({ className }) => (
  <IconoBase className={className}><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 0 1-.742.742H5.684a.75.75 0 0 1-.742-.742L3.937 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9Zm-1.487.888c.01-.011.02-.022.03-.033a.75.75 0 0 1 .256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9ZM8.25 8.25a.75.75 0 0 1 .75.75v8.25a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm3.75 0a.75.75 0 0 1 .75.75v8.25a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></IconoBase>
);

export const IconoCerrar: React.FC<{ className?: string }> = ({ className }) => (
  <IconoBase className={className}><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></IconoBase>
);

export const IconoSubir: React.FC<{ className?: string }> = ({ className }) => (
  <IconoBase className={className}><path d="M11.25 4.53v11.69l-4.94-4.94a.75.75 0 0 0-1.06 1.06l6.5 6.5a.75.75 0 0 0 1.06 0l6.5-6.5a.75.75 0 1 0-1.06-1.06l-4.94 4.94V4.53a.75.75 0 0 0-1.5 0Z" /><path d="M3.75 19.5h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Z" /></IconoBase>
);

export const IconoLibro: React.FC<{ className?: string }> = ({ className }) => (
  <IconoBase className={className}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9.172 10.34a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06Zm-1.5 1.5a.75.75 0 0 1 0-1.06l3-3a.75.75 0 0 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" /></IconoBase>
);
