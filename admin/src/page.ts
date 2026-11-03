// The admin page, served by the Worker. Plain HTML + a small script; every piece of data
// is inserted with textContent, never as HTML.

export const PAGE = /* html */ `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Modifications du site · Les Drones Lyonnais</title>
<style>
  :root {
    --ink: #000; --ink-soft: #2b2b2b; --muted: #5c5c5c; --line: #e3e3e1;
    --paper: #fff; --mist: #f1f1ef; --gold: #af854a; --gold-deep: #85622f;
    --blue: #0835bd; --green: #296321; --orange: #e25d02; --red: #b3261e;
    font-family: "Archivo", system-ui, -apple-system, sans-serif;
    color: var(--ink); background: var(--mist);
  }
  * { box-sizing: border-box; }
  body { margin: 0; line-height: 1.5; }
  :focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
  header { background: var(--ink); color: #fff; }
  .wrap { max-width: 860px; margin: 0 auto; padding: 0 20px; }
  header .wrap { display: flex; align-items: center; justify-content: space-between; gap: 4px 16px; min-height: 64px; flex-wrap: wrap; padding-block: 12px; }
  .brand { font-weight: 800; letter-spacing: .02em; text-transform: uppercase; font-size: 14px; }
  .brand span { color: var(--gold); }
  .user { font-size: 13px; color: rgb(255 255 255 / .7); }
  main.wrap { padding-block: 40px 64px; }
  h1 { font-size: clamp(26px, 4vw, 34px); line-height: 1.15; margin: 0 0 8px; }
  h2 { font-size: 20px; margin: 0; }
  .lead { color: var(--muted); margin: 0 0 24px; max-width: 60ch; }
  .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 0 0 32px; padding: 0; list-style: none; counter-reset: step; }
  .steps li { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; font-size: 14px; counter-increment: step; }
  .steps li::before { content: counter(step); display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--gold); color: #fff; font-weight: 700; font-size: 13px; margin-right: 8px; }
  .card { background: var(--paper); border: 1px solid var(--line); border-radius: 16px; padding: 24px; }
  label { display: block; font-weight: 600; font-size: 14px; margin: 0 0 6px; }
  .hint { font-weight: 400; color: var(--muted); }
  input, textarea { width: 100%; font: inherit; color: inherit; border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; background: var(--paper); }
  input:focus, textarea:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgb(175 133 74 / .2); }
  textarea { min-height: 140px; resize: vertical; }
  .field { margin-bottom: 16px; }
  .field-hint { font-size: 13px; margin: 8px 0 0; }
  .actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  button { font: inherit; font-weight: 700; border: 0; border-radius: 999px; padding: 11px 22px; background: var(--ink); color: #fff; cursor: pointer; transition: background .2s, transform .1s; }
  button:hover { background: var(--gold-deep); }
  button:active { transform: scale(.98); }
  button:disabled { opacity: .5; cursor: progress; }
  button.ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); padding: 8px 16px; font-weight: 600; }
  button.ghost:hover { border-color: var(--ink); }
  .msg { font-size: 14px; }
  .msg.error { color: var(--red); }
  .msg.ok { color: var(--green); }
  .list-head { display: flex; align-items: center; justify-content: space-between; margin: 40px 0 16px; gap: 12px; }
  .list { display: grid; gap: 12px; }
  .item { background: var(--paper); border: 1px solid var(--line); border-radius: 16px; padding: 18px 20px; }
  .item-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .item h3 { font-size: 16px; margin: 0; }
  .date { font-size: 13px; color: var(--muted); }
  .badge { flex: none; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
  .s-en-cours { background: #e8edfb; color: var(--blue); }
  .s-a-valider { background: #fdeee3; color: var(--orange); }
  .s-en-ligne { background: #e7f0e5; color: var(--green); }
  .s-bloquee { background: #fbe9e8; color: var(--red); }
  .s-refusee, .s-fermee { background: var(--mist); color: var(--muted); }
  .s-en-cours::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: currentColor; margin-right: 6px; animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: .25; } }
  @media (prefers-reduced-motion: reduce) { .s-en-cours::before { animation: none; } }
  details { margin-top: 10px; font-size: 14px; }
  summary { cursor: pointer; color: var(--muted); }
  .text { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14px; color: var(--ink-soft); margin: 8px 0 0; }
  .box { margin-top: 14px; padding: 14px 16px; border-radius: 12px; background: var(--mist); }
  .box strong { display: block; margin-bottom: 4px; font-size: 14px; }
  .box textarea { min-height: 80px; margin: 10px 0; }
  .preview { display: inline-block; margin-top: 10px; font-weight: 700; color: var(--ink); }
  .empty { color: var(--muted); font-size: 14px; }
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="brand">Les Drones Lyonnais <span>· Modifications du site</span></div>
    <div class="user" id="user"></div>
  </div>
</header>
<main class="wrap">
  <h1>Demander une modification</h1>
  <p class="lead">Décrivez ce que vous voulez changer sur le site, comme vous l'écririez à quelqu'un de l'équipe. Claude prépare la modification, puis elle est vérifiée avant toute mise en ligne.</p>
  <ol class="steps">
    <li>Vous décrivez la modification.</li>
    <li>Claude la prépare (quelques minutes).</li>
    <li>Vous vérifiez la proposition, elle est validée puis mise en ligne.</li>
  </ol>

  <form class="card" id="form">
    <div class="field">
      <label for="titre">Titre <span class="hint">(facultatif)</span></label>
      <input id="titre" name="titre" maxlength="100" placeholder="Ex. : nouveau prix de la formation A2">
    </div>
    <div class="field">
      <label for="demande">Votre demande</label>
      <textarea id="demande" name="demande" maxlength="4000" required placeholder="Ex. : Sur la page Formations, la formation « Brevet A2 » passe à 290 € HT à partir du 1er décembre. Ajoutez aussi qu'elle est finançable par le CPF."></textarea>
      <p class="hint field-hint">Nouveau produit ? Collez le lien de sa page chez le fabricant (DJI, Insta360…) et indiquez vos prix, en précisant HT ou TTC et, pour la location, le prix par jour. Claude reprend les caractéristiques et les photos.</p>
    </div>
    <div class="actions">
      <button type="submit">Envoyer la demande</button>
      <span class="msg" id="form-msg" role="status"></span>
    </div>
  </form>

  <div class="list-head">
    <h2>Vos demandes</h2>
    <button class="ghost" type="button" id="refresh">Actualiser</button>
  </div>
  <div class="list" id="list" aria-live="polite"><p class="empty">Chargement…</p></div>
</main>

<script>
const API = '/admin/api/demandes';
const STATUS = {
  'en-cours': 'En préparation',
  'a-valider': 'À vérifier',
  'en-ligne': 'En ligne',
  'refusee': 'Abandonnée',
  'bloquee': 'Besoin de précisions',
  'fermee': 'Fermée',
};
let timer;

function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) if (c) node.append(c);
  return node;
}

// Request text without the signature line the Worker appends.
const ownText = (body) => body.split('\\n---\\nDemande envoyée depuis')[0].trim();
// PR descriptions are short Markdown: show them as plain text.
const plain = (md) => md.replace(/^#+\\s*/gm, '').replace(/\\*\\*(.+?)\\*\\*/g, '$1').replace(/\`([^\`]+)\`/g, '$1').trim();

async function send(url, data) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Une erreur est survenue.');
  return json;
}

function followUp(d, kind) {
  const isRetouche = kind === 'retouche';
  const area = el('textarea', { maxlength: '4000', 'aria-label': isRetouche ? 'Retouche à demander' : 'Précisions',
    placeholder: isRetouche ? 'Ex. : Mettez plutôt le prix en gras, et retirez la mention CPF.' : 'Apportez les précisions demandées…' });
  const msg = el('span', { class: 'msg', role: 'status' });
  const btn = el('button', { type: 'button', text: isRetouche ? 'Demander une retouche' : 'Préciser et relancer' });
  btn.addEventListener('click', async () => {
    if (!area.value.trim()) { area.focus(); return; }
    btn.disabled = true; msg.className = 'msg'; msg.textContent = 'Envoi…';
    try {
      await send(API + '/' + d.number + '/' + kind, { message: area.value });
      area.value = '';
      msg.className = 'msg ok';
      msg.textContent = isRetouche ? 'Retouche envoyée : la proposition sera mise à jour dans quelques minutes.' : 'Demande relancée.';
      if (!isRetouche) load();
    } catch (e) { msg.className = 'msg error'; msg.textContent = e.message; }
    btn.disabled = false;
  });
  return el('div', {}, area, el('div', { class: 'actions' }, btn, msg));
}

function item(d) {
  const date = new Date(d.createdAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
  const node = el('article', { class: 'item' },
    el('div', { class: 'item-head' },
      el('div', {}, el('h3', { text: d.title }), el('div', { class: 'date', text: 'Demande n° ' + d.number + ' · ' + date })),
      el('span', { class: 'badge s-' + d.status, text: STATUS[d.status] || d.status })),
    el('details', {}, el('summary', { text: 'Voir la demande' }), el('p', { class: 'text', text: ownText(d.body) })));

  if (d.status === 'a-valider' && d.pr) {
    node.append(el('div', { class: 'box' },
      el('strong', { text: 'Proposition de Claude' }),
      el('p', { class: 'text', text: plain(d.pr.body) || d.pr.title }),
      d.preview && el('a', { class: 'preview', href: d.preview, target: '_blank', rel: 'noopener', text: "Voir l'aperçu du site →" }),
      el('p', { class: 'text', text: "Quelque chose à corriger ? Décrivez-le ci-dessous. Sinon, la proposition sera validée puis mise en ligne." }),
      followUp(d, 'retouche')));
  }
  if (d.status === 'bloquee') {
    node.append(el('div', { class: 'box' },
      el('strong', { text: "Claude n'a pas pu faire la modification" }),
      d.note && el('p', { class: 'text', text: plain(d.note) }),
      followUp(d, 'precision')));
  }
  return node;
}

async function load() {
  clearTimeout(timer);
  const list = document.getElementById('list');
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Impossible de charger les demandes.');
    const { user, demandes } = await res.json();
    document.getElementById('user').textContent = user;
    list.replaceChildren(...(demandes.length ? demandes.map(item) : [el('p', { class: 'empty', text: "Aucune demande pour l'instant." })]));
    // Keep the list fresh while Claude is working.
    if (demandes.some((d) => d.status === 'en-cours')) timer = setTimeout(load, 30000);
  } catch (e) {
    list.replaceChildren(el('p', { class: 'msg error', text: e.message }));
  }
}

document.getElementById('form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const btn = form.querySelector('button');
  const msg = document.getElementById('form-msg');
  btn.disabled = true; msg.className = 'msg'; msg.textContent = 'Envoi…';
  try {
    const { number } = await send(API, { titre: form.titre.value, demande: form.demande.value });
    form.reset();
    msg.className = 'msg ok';
    msg.textContent = 'Demande n° ' + number + ' envoyée. Claude s\\'en occupe.';
    load();
  } catch (e) { msg.className = 'msg error'; msg.textContent = e.message; }
  btn.disabled = false;
});
document.getElementById('refresh').addEventListener('click', load);
load();
</script>
</body>
</html>
`;
