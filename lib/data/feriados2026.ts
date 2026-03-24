export interface Feriado {
  date: string;
  nombre: string;
  tipo: 'nacional' | 'local';
}

export const FERIADOS_NACIONALES_2026: Feriado[] = [
  { date: '2026-01-01', nombre: 'Año Nuevo', tipo: 'nacional' },
  { date: '2026-02-16', nombre: 'Carnaval', tipo: 'nacional' },
  { date: '2026-02-17', nombre: 'Carnaval', tipo: 'nacional' },
  { date: '2026-03-24', nombre: 'Día de la Memoria', tipo: 'nacional' },
  { date: '2026-04-02', nombre: 'Día del Veterano', tipo: 'nacional' },
  { date: '2026-04-03', nombre: 'Viernes Santo', tipo: 'nacional' },
  { date: '2026-05-01', nombre: 'Día del Trabajador', tipo: 'nacional' },
  { date: '2026-05-25', nombre: 'Día de la Patria', tipo: 'nacional' },
  { date: '2026-06-15', nombre: 'Paso a la Inmortalidad de Güemes', tipo: 'nacional' },
  { date: '2026-06-20', nombre: 'Paso a la Inmortalidad de Belgrano', tipo: 'nacional' },
  { date: '2026-07-09', nombre: 'Día de la Independencia', tipo: 'nacional' },
  { date: '2026-08-17', nombre: 'Paso a la Inmortalidad de San Martín', tipo: 'nacional' },
  { date: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'nacional' },
  { date: '2026-11-20', nombre: 'Día de la Soberanía Nacional', tipo: 'nacional' },
  { date: '2026-12-08', nombre: 'Inmaculada Concepción', tipo: 'nacional' },
  { date: '2026-12-25', nombre: 'Navidad', tipo: 'nacional' },
];

export const MENSAJES_COMICOS = [
  '¡Feriado! No todo el día durmiendo 😄',
  '¡Día libre! Aunque los chicos igual necesitan llevar y traer 😅',
  '¡Hoy es feriado! El mate no tiene día libre ☕',
  '¡Feriado! Los chicos siguen siendo un proyecto full time 👨‍👩‍👧‍👦',
  '¡Feriado nacional! Descansá, pero no demasiado 😎',
];

export function getMensajeComico(): string {
  return MENSAJES_COMICOS[Math.floor(Math.random() * MENSAJES_COMICOS.length)];
}
