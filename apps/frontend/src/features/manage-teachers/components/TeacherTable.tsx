import { useState } from 'react';
import type { Teacher } from '../../../entities/teacher/teacher.entity';

// Datos falsos (Mock Data) basados exactamente en tu Figma para pintar la UI de inmediato
const MOCK_TEACHERS: Teacher[] = [
  {
    id: '1',
    dni: '12345678',
    nombres: 'María Elena',
    apellidos: 'Flores Choque',
    correo: 'maria.flores@ugel.edu.pe',
    celular: '951234567',
    condicion: 'NOMBRADO',
    nivel: 'Secundaria',
    institucionId: 'inst-101',
    institucionNombre: 'I.E. 70043 Lampa',
    estado: 'ACTIVO'
  },
  {
    id: '2',
    dni: '87654321',
    nombres: 'Carlos Alberto',
    apellidos: 'Mamani Quispe',
    correo: 'carlos.mamani@ugel.edu.pe',
    celular: '952987654',
    condicion: 'CONTRATADO',
    nivel: 'Primaria',
    institucionId: 'inst-102',
    institucionNombre: 'I.E. Politécnico Lampa',
    estado: 'INACTIVO'
  }
];

export const TeacherTable = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      {/* SECCIÓN SUPERIOR: Buscador y Botón Agregar (Basado en Figma) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <div>
          <input
            type="text"
            placeholder="Buscar docente por DNI o Nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 16px', width: '320px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          />
        </div>
        <button style={{ backgroundColor: '#0284c7', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          + Agregar Docente
        </button>
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb', color: '#374151', textTransform: 'uppercase', fontSize: '12px' }}>
              <th style={{ padding: '16px' }}>DNI</th>
              <th style={{ padding: '16px' }}>Docente</th>
              <th style={{ padding: '16px' }}>I.E. Institución</th>
              <th style={{ padding: '16px' }}>Nivel</th>
              <th style={{ padding: '16px' }}>Condición</th>
              <th style={{ padding: '16px' }}>Estado</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((docente) => (
              <tr key={docente.id} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '14px', color: '#4b5563' }}>
                <td style={{ padding: '16px', fontWeight: '500' }}>{docente.dni}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 'bold', color: '#111827' }}>{docente.apellidos}, {docente.nombres}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{docente.correo} | {docente.celular}</div>
                </td>
                <td style={{ padding: '16px' }}>{docente.institucionNombre}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                    {docente.nivel}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>{docente.condicion}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    backgroundColor: docente.estado === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                    color: docente.estado === 'ACTIVO' ? '#15803d' : '#b91c1c',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {docente.estado}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button style={{ marginRight: '8px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Editar</button>
                  <button style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};