export interface Cronograma {
  id: string;
  fechaHora: string; // ISO datetime
  especialista: string;
  especialistaInitials: string;
  institucion: string;
  docenteDirectivo: string;
  tipo: 'DOCENTE' | 'DIRECTIVO';
  nroVisita: string;
  estado: 'PROGRAMADO' | 'EN PROCESO' | 'COMPLETADO' | 'REPROGRAMADO' | 'CANCELADO';
  modalidad: string;
  nivel: string;
  observaciones?: string;
}
