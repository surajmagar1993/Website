import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mocking the interface for the script
const content = fs.readFileSync(path.join(__dirname, '../lib/services-data.ts'), 'utf8');

function extractVar(name: string): Record<string, unknown>[] {
    const regex = new RegExp(`export const ${name}: .*? = (\\[[\\s\\S]*?\\]);`, 'm');
    const match = content.match(regex);
    if (!match) {
        console.error(`Could not find ${name}`);
        return [];
    }
    const jsArray = match[1];
    try {
        // Simple cleanup for eval
        const cleaned = jsArray
            .replace(/:\s*Service\[\]/g, '')
            .replace(/:\s*CaseStudy\[\]/g, '')
            .replace(/`([^`]*)`/g, '"$1"'); // multi-line backticks to double quotes
        return eval(cleaned);
    } catch (e: unknown) {
        console.error(`Error evaling ${name}:`, e instanceof Error ? e.message : String(e));
        return [];
    }
}

const services = extractVar('services');
const caseStudies = extractVar('caseStudies');

function sqlVal(val: string | number | boolean | object | null): string | number {
    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
    if (typeof val === 'number') return val;
    if (val === null) return 'NULL';
    if (Array.isArray(val) || typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
    return 'NULL';
}

let sql = `-- Migration SQL generated from services-data.ts\n\n`;

// Clear existing to avoid unique constraint errors if re-run
sql += `TRUNCATE TABLE public.services CASCADE;\n`;
sql += `TRUNCATE TABLE public.case_studies CASCADE;\n\n`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
services.forEach((s: any, i) => {
    sql += `INSERT INTO public.services (slug, title, subtitle, icon, description, display_order, features, technologies, process, pain_points, solutions, benefits, faqs, case_study_results)\n`;
    sql += `VALUES (${sqlVal(s.slug)}, ${sqlVal(s.title)}, ${sqlVal(s.subtitle)}, ${sqlVal(s.icon)}, ${sqlVal(s.description)}, ${i + 1}, ${sqlVal(s.features)}, ${sqlVal(s.technologies)}, ${sqlVal(s.process)}, ${sqlVal(s.painPoints)}, ${sqlVal(s.solutions)}, ${sqlVal(s.benefits)}, ${sqlVal(s.faqs)}, ${sqlVal(s.caseStudyResults)});\n\n`;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
caseStudies.forEach((c: any) => {
    sql += `INSERT INTO public.case_studies (slug, title, category, description, challenge, solution, results, technologies)\n`;
    sql += `VALUES (${sqlVal(c.slug)}, ${sqlVal(c.title)}, ${sqlVal(c.category)}, ${sqlVal(c.description)}, ${sqlVal(c.challenge)}, ${sqlVal(c.solution)}, ${sqlVal(c.results)}, ${sqlVal(c.technologies)});\n\n`;
});

// Add some dummy clients
sql += `INSERT INTO public.clients (name, logo_url) VALUES\n`;
sql += `('Google', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg'),\n`;
sql += `('Microsoft', 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg'),\n`;
sql += `('Amazon', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg'),\n`;
sql += `('Netflix', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'),\n`;
sql += `('Meta', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg'),\n`;
sql += `('Apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg');\n`;

console.log(sql);
