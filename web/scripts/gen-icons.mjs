// Genera data/icons.ts desde simple-icons (CC0). Verifica que cada slug exista.
import * as si from 'simple-icons';
import { writeFileSync } from 'node:fs';

export const FACE_ICONS = {
  FRONTEND: ['react', 'typescript', 'javascript', 'nextdotjs', 'vite', 'tailwindcss', 'html5', 'css', 'pwa'],
  BACKEND: ['python', 'fastapi', 'nodedotjs', 'nestjs', 'php', 'express', 'swagger', 'jsonwebtokens', 'postman'],
  DATOS: ['postgresql', 'mysql', 'sqlite', 'supabase', 'sqlalchemy', 'mariadb', 'neon', 'dbeaver', 'prisma'],
  IA: ['claude', 'googlegemini', 'githubcopilot', 'python', 'jupyter', 'huggingface', 'langchain', 'n8n', 'zapier'],
  DEVOPS: ['docker', 'githubactions', 'git', 'github', 'vercel', 'render', 'linux', 'ubuntu', 'nginx'],
  PRODUCTO: ['figma', 'notion', 'trello', 'googleanalytics', 'whatsapp', 'android', 'googlechrome', 'lighthouse', 'googlesheets'],
};
const ARSENAL = ['react', 'typescript', 'nextdotjs', 'tailwindcss', 'vite', 'python', 'fastapi', 'nodedotjs', 'nestjs', 'php', 'postgresql', 'mysql', 'supabase', 'sqlalchemy', 'docker', 'githubactions', 'git', 'vercel', 'render', 'claude', 'pwa', 'linux'];

const bySlug = new Map(Object.values(si).filter((v) => v && v.slug).map((v) => [v.slug, v]));
const all = [...new Set([...Object.values(FACE_ICONS).flat(), ...ARSENAL])];
const missing = all.filter((s) => !bySlug.has(s));
if (missing.length) {
  console.error('Slugs inexistentes:', missing.join(', '));
  process.exit(1);
}
const body = all
  .map((s) => {
    const i = bySlug.get(s);
    return `  ${s}: { title: ${JSON.stringify(i.title)}, hex: '${i.hex}', path: ${JSON.stringify(i.path)} },`;
  })
  .join('\n');
writeFileSync(
  new URL('../data/icons.ts', import.meta.url),
  `// GENERADO por scripts/gen-icons.mjs (simple-icons, licencia CC0). No editar a mano.\nexport interface IconDef {\n  title: string;\n  hex: string;\n  path: string;\n}\n\nexport const ICONS = {\n${body}\n} as const satisfies Record<string, IconDef>;\n\nexport type IconSlug = keyof typeof ICONS;\n`,
);
console.log(`OK: ${all.length} iconos verificados y escritos.`);
