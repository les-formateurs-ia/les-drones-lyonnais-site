// The few GitHub REST calls the admin needs. A request is an issue labelled
// "demande-client"; the workflow answers with a PR from the branch claude/demande-<n>.

export const LABEL = 'demande-client';
export const BLOCKED_LABEL = 'demande-bloquee';
const branchFor = (issue: number) => `claude/demande-${issue}`;

export type Status = 'en-cours' | 'a-valider' | 'en-ligne' | 'refusee' | 'bloquee' | 'fermee';

export interface Demande {
  number: number;
  title: string;
  body: string;
  createdAt: string;
  status: Status;
  pr?: { number: number; url: string; branch: string; title: string; body: string };
  preview?: string;
  /** Last comment left by the workflow when the request is blocked. */
  note?: string;
}

interface Issue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  created_at: string;
  labels: { name: string }[];
  pull_request?: unknown;
}

interface Pull {
  number: number;
  html_url: string;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  merged_at: string | null;
  head: { ref: string };
}

export class GitHub {
  constructor(
    private token: string,
    private repo: string,
  ) {}

  private async call<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`https://api.github.com/repos/${this.repo}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'ldl-admin',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`GitHub ${method} ${path}: ${res.status} ${await res.text()}`);
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  async list(previewTemplate?: string): Promise<Demande[]> {
    const [issues, pulls] = await Promise.all([
      this.call<Issue[]>('GET', `/issues?labels=${LABEL}&state=all&sort=created&direction=desc&per_page=30`),
      this.call<Pull[]>('GET', `/pulls?state=all&sort=created&direction=desc&per_page=50`),
    ]);
    const byBranch = new Map(pulls.map((p) => [p.head.ref, p]));

    const demandes = issues
      .filter((i) => !i.pull_request)
      .map((i): Demande => {
        const pull = byBranch.get(branchFor(i.number));
        const blocked = i.labels.some((l) => l.name === BLOCKED_LABEL);
        const status: Status = pull
          ? pull.merged_at
            ? 'en-ligne'
            : pull.state === 'open'
              ? 'a-valider'
              : 'refusee'
          : blocked
            ? 'bloquee'
            : i.state === 'open'
              ? 'en-cours'
              : 'fermee';
        return {
          number: i.number,
          title: i.title,
          body: i.body ?? '',
          createdAt: i.created_at,
          status,
          pr: pull && {
            number: pull.number,
            url: pull.html_url,
            branch: pull.head.ref,
            title: pull.title,
            body: (pull.body ?? '').replace(/\n*Closes #\d+\s*$/, ''),
          },
          preview: pull && status === 'a-valider' ? previewUrl(previewTemplate, pull) : undefined,
        };
      });

    // Blocked requests show Claude's explanation (the workflow's last comment).
    await Promise.all(
      demandes
        .filter((d) => d.status === 'bloquee')
        .map(async (d) => {
          const comments = await this.call<{ body: string }[]>('GET', `/issues/${d.number}/comments?per_page=100`);
          d.note = comments.at(-1)?.body;
        }),
    );
    return demandes;
  }

  async create(title: string, body: string): Promise<number> {
    const issue = await this.call<Issue>('POST', '/issues', { title, body, labels: [LABEL] });
    return issue.number;
  }

  /** A follow-up on the open PR: Claude (claude-retouche.yml) updates the branch. */
  async retouche(issue: number, message: string): Promise<void> {
    const owner = this.repo.split('/')[0];
    const pulls = await this.call<Pull[]>('GET', `/pulls?state=open&head=${owner}:${branchFor(issue)}`);
    if (!pulls[0]) throw new UserError("Cette demande n'a pas de proposition en attente de validation.");
    await this.call('POST', `/issues/${pulls[0].number}/comments`, { body: `@claude ${message}` });
  }

  /** Adds details to a blocked request and runs it again (re-applying the label triggers the workflow). */
  async preciser(issue: number, addition: string): Promise<void> {
    const current = await this.call<Issue>('GET', `/issues/${issue}`);
    if (!current.labels.some((l) => l.name === LABEL)) throw new UserError('Demande introuvable.');
    await this.call('PATCH', `/issues/${issue}`, {
      body: `${current.body ?? ''}\n\n${addition}`,
      state: 'open',
      labels: current.labels.map((l) => l.name).filter((n) => n !== LABEL && n !== BLOCKED_LABEL),
    });
    await this.call('POST', `/issues/${issue}/labels`, { labels: [LABEL] });
  }
}

/** An error whose message can be shown to the client as is. */
export class UserError extends Error {}

/** PREVIEW_URL_TEMPLATE, e.g. "https://{branch}.les-drones-lyonnais.pages.dev" ({branch} = Cloudflare's branch alias). */
function previewUrl(template: string | undefined, pull: Pull): string | undefined {
  if (!template) return undefined;
  const alias = pull.head.ref.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return template.replaceAll('{branch}', alias).replaceAll('{pr}', String(pull.number));
}
