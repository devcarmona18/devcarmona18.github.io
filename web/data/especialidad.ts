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
}

export const especialidades: Especialidad[] = [
  {
    id: 'interfaces',
    num: '01',
    label: 'INTERFACES',
    headline: 'Interfaces que se sienten rápidas.',
    text: 'Diseño para quien la usa a las 6 a. m. con prisa: atajos, guardado automático y cero pasos de más. Si una pantalla obliga a pensar, está mal hecha.',
    tech: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'PWA'],
    windowTitle: 'hoja-diaria / cama-12 / editor',
  },
  {
    id: 'api',
    num: '02',
    label: 'BACKEND Y APIS',
    headline: 'APIs que no se caen cuando importa.',
    text: 'Endpoints validados, autenticación, límites de uso y planes de respaldo. Si mi API falla, la venta no se pierde: el sistema tiene un plan B.',
    tech: ['Python', 'FastAPI', 'Node.js', 'NestJS', 'PHP', 'REST'],
    windowTitle: 'fusion-dlauris / flujo-de-pedido',
  },
  {
    id: 'datos',
    num: '03',
    label: 'DATOS',
    headline: 'Datos que cuentan la historia.',
    text: 'Modelo bases de datos para que crezcan sin romperse, y escribo las consultas que convierten miles de filas en una decisión.',
    tech: ['PostgreSQL', 'MySQL', 'Supabase', 'SQLAlchemy', 'SQLite'],
    windowTitle: 'ferrehogar / psql',
  },
  {
    id: 'ia',
    num: '04',
    label: 'IA Y AUTOMATIZACIÓN',
    headline: 'IA dentro del producto, no en la presentación.',
    text: 'Pongo la IA a trabajar donde ahorra tiempo de verdad, y automatizo lo que se repite.',
    lines: [
      'Consultas en lenguaje natural sobre el historial clínico de un paciente, dentro de Hoja Diaria Renal (API de Claude).',
      'Bot de WhatsApp que atiende, muestra el catálogo y registra clientes 24/7 sin costo por mensaje.',
      'Desarrollo con agentes de IA: planifico, delego y reviso código con flujos de agentes; entrego más rápido sin perder el control de la calidad.',
      'Automatización de procesos: de la planilla manual al cierre del día en un clic.',
    ],
    tech: ['Claude API', 'Agentes', 'Prompt engineering', 'Python', 'Automatización'],
    windowTitle: 'hoja-diaria / asistente-ia',
  },
];
