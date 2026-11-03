// Admin Worker: the client describes a change, it becomes a GitHub issue, Claude makes it
// in a GitHub Action and opens a PR (.github/workflows/claude-demande-client.yml).
//   GET  /admin/                              page
//   GET  /admin/api/demandes                  requests and their status
//   POST /admin/api/demandes                  { titre?, demande } → new request
//   POST /admin/api/demandes/:n/retouche      { message } → Claude updates the PR
//   POST /admin/api/demandes/:n/precision     { message } → blocked request, run again

import { accessUser } from './access';
import { GitHub, UserError } from './github';
import { PAGE } from './page';

export interface Env {
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  PREVIEW_URL_TEMPLATE?: string;
  /** Local development only (.dev.vars): skip the Access check. */
  DEV_NO_AUTH?: string;
}

const MAX_TEXT = 4000;

const reply = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/' || url.pathname === '/admin') return Response.redirect(`${url.origin}/admin/`, 302);
    if (!url.pathname.startsWith('/admin/')) return new Response('Not found', { status: 404 });

    const user =
      env.DEV_NO_AUTH === 'true' ? 'dev@localhost' : await accessUser(req, env.ACCESS_TEAM_DOMAIN, env.ACCESS_AUD);
    if (!user) return new Response('Accès réservé.', { status: 403 });

    if (url.pathname === '/admin/' && req.method === 'GET') {
      return new Response(PAGE, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'Content-Security-Policy':
            "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
          'X-Robots-Tag': 'noindex',
        },
      });
    }

    if (!url.pathname.startsWith('/admin/api/')) return new Response('Not found', { status: 404 });

    // JSON only, same origin: a cross-site form cannot send this without a preflight.
    if (req.method === 'POST') {
      const origin = req.headers.get('Origin');
      if (!req.headers.get('Content-Type')?.startsWith('application/json') || (origin && origin !== url.origin)) {
        return reply({ error: 'Requête refusée.' }, 400);
      }
    }

    const github = new GitHub(env.GITHUB_TOKEN, env.GITHUB_REPO);
    try {
      if (url.pathname === '/admin/api/demandes') {
        if (req.method === 'GET') return reply({ user, demandes: await github.list(env.PREVIEW_URL_TEMPLATE) });
        if (req.method === 'POST') {
          const { titre, demande } = await body(req);
          const text = clean(demande);
          const title = clean(titre).slice(0, 100) || summarize(text);
          const number = await github.create(title, `${text}\n\n---\nDemande envoyée depuis l'espace admin par ${user}.`);
          return reply({ number }, 201);
        }
      }

      const action = url.pathname.match(/^\/admin\/api\/demandes\/(\d+)\/(retouche|precision)$/);
      if (action && req.method === 'POST') {
        const number = Number(action[1]);
        const text = clean((await body(req)).message);
        if (!text) throw new UserError('Écrivez votre message.');
        if (action[2] === 'retouche') await github.retouche(number, `${text}\n\n— ${user}`);
        else await github.preciser(number, `**Précision de ${user} :**\n\n${text}`);
        return reply({ ok: true });
      }

      return reply({ error: 'Not found' }, 404);
    } catch (err) {
      if (err instanceof UserError) return reply({ error: err.message }, 400);
      console.error(err);
      return reply({ error: "Le service est momentanément indisponible. Réessayez dans quelques minutes." }, 502);
    }
  },
} satisfies ExportedHandler<Env>;

async function body(req: Request): Promise<Record<string, unknown>> {
  try {
    const data = await req.json();
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function clean(value: unknown): string {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length > MAX_TEXT) throw new UserError(`Le texte est trop long (${MAX_TEXT} caractères maximum).`);
  return text;
}

function summarize(text: string): string {
  if (!text) throw new UserError('Décrivez la modification souhaitée.');
  const line = text.split('\n')[0];
  return line.length > 80 ? `${line.slice(0, 77)}…` : line;
}
