export interface Project {
  id: string;
  num: string;
  name: string;
  tag: string;
  live: boolean;
  hook: string;
  problem: string;
  built: string;
  stack: string[];
  demo?: string;
  code?: string;
  video: string;
  poster: string;
  posterAlt: string;
}

export const projects: Project[] = [
  {
    id: 'renal',
    num: '01',
    name: 'HOJA DIARIA RENAL',
    tag: 'SALUD · APLICACIÓN WEB',
    live: true,
    hook: 'Una unidad renal entera, del papel al tiempo real.',
    problem:
      '48 camas por turno anotadas a mano. Pesos calculados con calculadora, alertas que dependían de la memoria de alguien y cierres que se comían el final del turno.',
    built:
      'Una hoja de sesión que se ve como la de siempre pero calcula sola: pérdida real y ganancia interdialítica con alertas, EPO y hierro programados por mes, cierre del día imprimible en un clic, historial por paciente y consultas con IA. Vengo del sector salud: conocí este problema desde adentro.',
    stack: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Tailwind', 'Claude API', 'Docker', 'GitHub Actions', 'Render'],
    demo: 'https://hoja-diaria-renal.onrender.com',
    code: 'https://github.com/devcarmona18/hoja-diaria-renal',
    video: '/media/renal.mp4',
    poster: '/media/renal.jpg',
    posterAlt: 'Hoja de sesión de diálisis con 48 camas, pesos calculados y alertas en rojo',
  },
  {
    id: 'fusion',
    num: '02',
    name: "FUSION D'LAURIS",
    tag: 'E-COMMERCE · VENTAS POR WHATSAPP',
    live: true,
    hook: 'Una tienda que convierte visitas en clientes que vuelven.',
    problem: 'Café de especialidad vendido por chat: pedidos sueltos, sin historial y sin saber quién vuelve a comprar.',
    built:
      'El cliente arma su café en la web y el pedido sale con código propio (FD-1013) directo a WhatsApp. Cada compra crea o actualiza su ficha: qué pide, cada cuánto y desde dónde. El equipo mueve el pedido de cotizado a entregado desde un panel, un bot atiende 24/7 y, si la API cae, la venta igual llega.',
    stack: ['React', 'TypeScript', 'Vite', 'NestJS', 'PostgreSQL', 'Supabase', 'Vercel'],
    demo: 'https://fusion-dlauris.vercel.app',
    video: '/media/fusion.mp4',
    poster: '/media/fusion.jpg',
    posterAlt: 'Tienda de café de especialidad donde el cliente arma su pedido y recibe un código',
  },
  {
    id: 'midia',
    num: '03',
    name: 'MI DÍA',
    tag: 'PWA · OFFLINE-FIRST',
    live: true,
    hook: 'Una app que vive en el celular, aunque no haya señal.',
    problem: 'Las apps de hábitos piden cuenta, internet y suscripción para algo que debería ser inmediato.',
    built:
      'Una PWA instalable que registra gym, alimentación, sueño, agua y oración en segundos, funciona 100 % sin conexión, protege las cuentas con hash y salt (Web Crypto) y cambia sola a modo oscuro.',
    stack: ['JavaScript', 'Service Worker', 'Web Crypto', 'PWA', 'HTML', 'CSS'],
    demo: 'https://devcarmona18.github.io/mi-dia-pwa/',
    code: 'https://github.com/devcarmona18/mi-dia-pwa',
    video: '/media/midia.mp4',
    poster: '/media/midia.jpg',
    posterAlt: 'Aplicación de hábitos en un teléfono con calendario mensual en verde, amarillo y rojo',
  },
  {
    id: 'sigur',
    num: '04',
    name: 'SIGUR',
    tag: 'GESTIÓN CLÍNICA · PANEL WEB',
    live: false,
    hook: 'Pacientes, turnos y reportes de una unidad renal en un solo panel.',
    problem: 'La información de pacientes, la malla de turnos y los reportes vivían en lugares distintos.',
    built:
      'Un panel con indicadores en tiempo real, malla de turnos, registro de sesiones con alertas clínicas automáticas (ganancia elevada, hipotensión) y reportes con gráficos, sobre una arquitectura MVC limpia.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'MVC', 'HTML', 'CSS'],
    video: '/media/sigur.mp4',
    poster: '/media/sigur.jpg',
    posterAlt: 'Panel de gestión clínica con indicadores, malla de turnos y alertas',
  },
  {
    id: 'ferrehogar',
    num: '05',
    name: 'FERREHOGAR',
    tag: 'ARQUITECTURA DE DATOS',
    live: false,
    hook: 'El cerebro de datos de una ferretería, diseñado para crecer.',
    problem: 'Inventario, ventas y proveedores sin un modelo que soportara crecer ni cambiar de motor.',
    built:
      'Un modelo relacional de 12 tablas con sus llaves e integridad, consultas de ventas por categoría y la migración completa de MySQL a PostgreSQL (IDENTITY, tipos ENUM, NUMERIC).',
    stack: ['PostgreSQL', 'MySQL', 'SQL', 'Modelado ER'],
    video: '/media/ferrehogar.mp4',
    poster: '/media/ferrehogar.jpg',
    posterAlt: 'Diagrama entidad-relación de 12 tablas y consultas SQL de ventas por categoría',
  },
];
