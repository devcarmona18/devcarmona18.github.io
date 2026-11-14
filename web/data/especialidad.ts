export type DemoKind = 'interfaces' | 'api' | 'datos' | 'ia';

export interface Especialidad {
  id: DemoKind;
  num: string;
  label: string;
  headline: string;
  text: string;
  lines?: string[];
  tech: string[];
  windowTitle: string;
  stats: { value: number; suffix?: string; label: string }[];
}

export const especialidades: Especialidad[] = [
  {
    id: 'interfaces',
    num: '01',
    label: 'INTERFACES',
    headline: 'Interfaces de alto rendimiento.',
    text: 'Desarrollo interfaces responsivas y accesibles con React y TypeScript, pensadas para flujos de trabajo reales: validación en tiempo real, guardado automático y respuesta inmediata. Cada pantalla está diseñada para reducir errores y acelerar la operación.',
    tech: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'PWA'],
    windowTitle: 'hoja-diaria / cama-12 / editor',
    stats: [{ value: 48, label: 'camas por turno' }, { value: 1, label: 'clic para cerrar el día' }],
  },
  {
    id: 'api',
    num: '02',
    label: 'BACKEND Y APIS',
    headline: 'Arquitectura backend resiliente.',
    text: 'Diseño APIs REST seguras y escalables con FastAPI y NestJS: validación de datos, autenticación, control de tráfico y estrategias de respaldo que garantizan la continuidad del servicio incluso ante fallos.',
    tech: ['Python', 'FastAPI', 'Node.js', 'NestJS', 'PHP', 'REST'],
    windowTitle: 'fusion-dlauris / flujo-de-pedido',
    stats: [{ value: 0, label: 'ventas perdidas si la API cae' }, { value: 8, suffix: '/min', label: 'pedidos por IP (control de tráfico)' }],
  },
  {
    id: 'datos',
    num: '03',
    label: 'DATOS',
    headline: 'Ingeniería de datos relacional.',
    text: 'Modelo y optimizo bases de datos PostgreSQL y MySQL con integridad referencial, migraciones controladas y consultas analíticas que convierten la información operativa en indicadores para tomar decisiones.',
    tech: ['PostgreSQL', 'MySQL', 'Supabase', 'SQLAlchemy', 'SQLite'],
    windowTitle: 'ferrehogar / psql',
    stats: [{ value: 12, label: 'tablas relacionales' }, { value: 2, label: 'motores: MySQL y PostgreSQL' }],
  },
  {
    id: 'ia',
    num: '04',
    label: 'IA Y AUTOMATIZACIÓN',
    headline: 'Inteligencia artificial aplicada.',
    text: 'Integro modelos de IA en productos reales y automatizo procesos de punta a punta para reducir tareas manuales y tiempos de respuesta.',
    lines: [
      'Consultas en lenguaje natural sobre historiales clínicos, integradas en Hoja Diaria Renal mediante la API de Claude.',
      'Bot de WhatsApp que atiende, presenta el catálogo y registra clientes de forma automática, 24/7.',
      'Desarrollo asistido por agentes de IA: planificación, delegación y revisión de código con control total de la calidad.',
      'Automatización de procesos operativos: de la planilla manual al cierre del día en un solo clic.',
    ],
    tech: ['Claude API', 'Agentes', 'Prompt engineering', 'Python', 'Automatización'],
    windowTitle: 'hoja-diaria / asistente-ia',
    stats: [{ value: 24, suffix: '/7', label: 'bot atendiendo por WhatsApp' }, { value: 1, label: 'clic: de la planilla al cierre' }],
  },
];
