// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// NIVEL DTOs
export interface CreateNivelDTO {
  nombre: string;
  descripcion?: string;
  duracion_semanas: number;
  precio: number;
}

export interface NivelResponse {
  nivel_id: number;
  nombre: string;
  descripcion?: string;
  duracion_semanas: number;
  precio: number;
}

// PROFESOR DTOs
export interface CreateProfesorDTO {
  nombre: string;
  email: string;
  telefono?: string;
  especialidad: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export interface ProfesorResponse {
  profesor_id: number;
  nombre: string;
  email: string;
  telefono?: string;
  especialidad: string;
  fecha_creacion: Date;
}

// SALON DTOs
export interface CreateSalonDTO {
  nombre: string;
  capacidad: number;
  equipado?: boolean;
}

export interface SalonResponse {
  salon_id: number;
  nombre: string;
  capacidad: number;
  equipado: boolean;
  fecha_creacion: Date;
}

// ESTUDIANTE DTOs
export interface CreateEstudianteDTO {
  nombre: string;
  email: string;
  telefono?: string;
  fecha_nacimiento: string;
}

export interface EstudianteResponse {
  estudiante_id: number;
  nombre: string;
  email: string;
  telefono?: string;
  fecha_nacimiento: Date;
  saldo_pendiente: number;
  fecha_creacion: Date;
}

// SESION DTOs
export interface CreateSesionDTO {
  nivel_id: number;
  profesor_id: number;
  salon_id: number;
  fecha: string;
  hora_inicio: string;
  duracion_min: number;
  cupos_disponibles: number;
}

export interface SesionResponse {
  sesion_id: number;
  nivel_id: number;
  profesor_id: number;
  salon_id: number;
  fecha: Date;
  hora_inicio: string;
  duracion_min: number;
  cupos_disponibles: number;
}

// INSCRIPCION DTOs
export interface CreateInscripcionDTO {
  estudiante_id: number;
  sesion_id: number;
}

export interface UpdateInscripcionDTO {
  estado_asistencia: 'Programada' | 'Asistió' | 'Faltó' | 'Cancelada';
}

export interface InscripcionResponse {
  inscripcion_id: number;
  estudiante_id: number;
  sesion_id: number;
  fecha_inscripcion: Date;
  estado_asistencia: string;
}

// MULTA DTOs
export interface MultaResponse {
  multa_id: number;
  estudiante_id: number;
  monto: number;
  estado_pago: 'Pendiente' | 'Pagada' | 'Condonada';
  fecha_multa: Date;
  fecha_pago?: Date;
}

// Pagination helper
export interface PaginationQuery {
  page?: number;
  limit?: number;
  skip?: number;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}
