import React, { useState, useEffect } from 'react';
import * as firestoreService from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

const VistaHorarios: React.FC = () => {
  const { user } = useAuth();
  const [fecha, setFecha] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [horarios, setHorarios] = useState([]);

  useEffect(() => {
    if (user) {
      firestoreService.obtenerHorarios(user.uid).then(setHorarios);
    }
  }, [user]);

  const registrar = async () => {
    if (user && fecha && horaEntrada && horaSalida) {
      const nuevo = await firestoreService.registrarHorario(user.uid, fecha, horaEntrada, horaSalida);
      setHorarios(prev => [...prev, nuevo]);
      setFecha('');
      setHoraEntrada('');
      setHoraSalida('');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Registro de Horario Laboral</h2>
      <div className="flex gap-2 mb-4">
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="border p-2 rounded"/>
        <input type="time" value={horaEntrada} onChange={e => setHoraEntrada(e.target.value)} className="border p-2 rounded"/>
        <input type="time" value={horaSalida} onChange={e => setHoraSalida(e.target.value)} className="border p-2 rounded"/>
        <button onClick={registrar} className="bg-blue-600 text-white px-4 py-2 rounded">Registrar</button>
      </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Horas Extras</th>
          </tr>
        </thead>
        <tbody>
          {horarios.map((h: any) => (
              <tr key={h.id}>
                <td>{formatearFecha(h.fecha)}</td>
                <td>{h.horaEntrada}</td>
                <td>{h.horaSalida}</td>
                <td>{h.horasExtras}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VistaHorarios;

function formatearFecha(fecha: string): string {
  // Espera formato 'yyyy-mm-dd' y retorna 'dd/mm/yyyy'
  const partes = fecha.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return fecha;
}
