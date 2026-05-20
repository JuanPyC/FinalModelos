export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Estudiante {
  estudiante_id: number;
  nombre: string;
  email: string;
  telefono?: string;
  fecha_nacimiento: string;
  fecha_registro: string;
  saldo_pendiente: string;
  inscripciones?: Inscripcion[];
}

export interface Profesor {
  profesor_id: number;
  nombre: string;
  email: string;
  telefono?: string;
  especialidad?: string;
}

export interface Nivel {
  nivel_id: number;
  nombre: string;
  descripcion?: string;
  duracion_semanas: number;
  precio: string;
}

export interface Salon {
  salon_id: number;
  nombre: string;
  capacidad: number;
  equipado: boolean;
}

export interface Sesion {
  sesion_id: number;
  nivel_id: number;
  profesor_id: number;
  salon_id: number;
  fecha: string;
  hora_inicio: string;
  duracion_min: number;
  cupos_disponibles: number;
  nivel?: Nivel;
  profesor?: Profesor;
  salon?: Salon;
  inscripciones?: Inscripcion[];
}

export interface Inscripcion {
  inscripcion_id: number;
  estudiante_id: number;
  sesion_id: number;
  fecha_inscripcion: string;
  estado_asistencia: 'PROGRAMADA' | 'ASISTIO' | 'FALTO' | 'CANCELADA';
  estudiante?: Estudiante;
  sesion?: Sesion;
}

export interface Multa {
  multa_id: number;
  inscripcion_id: number;
  estudiante_id: number;
  monto: string;
  fecha_generacion: string;
  estado_pago: 'PENDIENTE' | 'PAGADA';
  estudiante?: Estudiante;
  inscripcion?: Inscripcion;
}
