# Espace admin : modifications du site par Claude

Le client décrit une modification sur une page web. Claude la réalise dans une GitHub
Action et ouvre une pull request. On vérifie l'aperçu, puis on merge.

```
admin.lesdroneslyonnais.com/admin/   (Cloudflare Access)
        │  POST /admin/api/demandes
        ▼
Worker ldl-admin ── issue GitHub labellisée « demande-client »
        ▼
.github/workflows/claude-demande-client.yml
   Claude modifie les fichiers → npm run build → branche claude/demande-<n> → PR
        ▼
Aperçu Cloudflare de la branche → retouches éventuelles (« @claude … » sur la PR,
claude-retouche.yml) → merge par nous → mise en ligne
```

Statuts affichés au client : *En préparation*, *À vérifier* (PR ouverte, avec aperçu et
champ de retouche), *Besoin de précisions* (Claude n'a rien modifié et explique pourquoi ;
le client précise et relance), *En ligne* (PR mergée), *Abandonnée* (PR fermée).

Les règles que suit Claude sont dans `.claude/CLAUDE.md`, section « Client requests (admin
page) ».

## Installation

### 1. GitHub (repo les-formateurs-ia/les-drones-lyonnais-site)

1. Installer l'app GitHub Claude sur le repo : https://github.com/apps/claude (ou
   `/install-github-app` dans Claude Code).
2. Ajouter le secret Actions `ANTHROPIC_API_KEY`. Créer la clé dans la Console Anthropic,
   dans un workspace dédié avec une limite de dépense.
3. Dans Settings → Actions → General → Workflow permissions : cocher « Read and write
   permissions » et « Allow GitHub Actions to create and approve pull requests ».
   Le workflow ouvre la PR avec le `GITHUB_TOKEN`.
4. Créer les labels :
   ```sh
   gh label create demande-client --color AF854A --description "Demande du client (espace admin)"
   gh label create demande-bloquee --color B3261E --description "Claude n'a pas pu traiter la demande"
   ```
5. Protéger `main` : PR obligatoire. Rien ne part en ligne sans notre merge.
6. Créer le token du Worker : fine-grained personal access token, propriétaire
   `les-formateurs-ia`, uniquement ce repo, avec les droits Issues (lecture et écriture),
   Pull requests (lecture et écriture) et Metadata (lecture). Le compte qui crée le token
   doit avoir l'accès en écriture au repo : l'action Claude ne répond qu'aux utilisateurs
   qui l'ont, et les commentaires « @claude » du Worker sont postés en son nom.
   Noter la date d'expiration du token.

### 2. Cloudflare

1. Dans Zero Trust → Access → Applications → Add → Self-hosted :
   - domaine `admin.lesdroneslyonnais.com` (ou un autre sous-domaine d'une zone du compte) ;
   - policy *Allow*, avec les emails du client et les nôtres (connexion par code envoyé
     par email).

   Copier l'**Application Audience (AUD) Tag**. Le *team domain* se trouve dans Zero
   Trust → Settings.
2. Dans `wrangler.jsonc` : renseigner `ACCESS_TEAM_DOMAIN` et, si besoin, la route et
   `PREVIEW_URL_TEMPLATE` (voir plus bas).
3. Déployer :
   ```sh
   cd admin
   npm install
   npx wrangler secret put GITHUB_TOKEN
   npx wrangler secret put ACCESS_AUD
   npm run deploy
   ```

Le Worker vérifie lui-même le jeton Access (signature, audience, expiration). Il reste
donc fermé même s'il est atteint par une autre route. `workers_dev` est désactivé.

Une fois le nouveau site en ligne sur Cloudflare, l'admin peut passer sur le site
lui-même : remplacer la route par `www.lesdroneslyonnais.com/admin*` (exemple commenté
dans `wrangler.jsonc`) et mettre ce chemin dans l'application Access.

### 3. Aperçu des propositions

Pour que le client voie la proposition avant la mise en ligne, il faut que Cloudflare
construise les branches autres que `main` (preview builds), puis renseigner
`PREVIEW_URL_TEMPLATE` selon l'hébergement. `{branch}` est remplacé par l'alias de
branche (`claude-demande-12`) et `{pr}` par le numéro de la PR.

- Cloudflare Pages : `https://{branch}.<projet>.pages.dev`
- Workers (static assets) avec preview URLs : `https://{branch}-<worker>.<sous-domaine>.workers.dev`

Si le template est vide, le lien d'aperçu n'est pas affiché. L'aperçu reste visible sur
la PR GitHub.

## Développement local

```sh
cp .dev.vars.example .dev.vars   # DEV_NO_AUTH=true : pas de vérification Access en local
npm run dev                      # http://localhost:8787/admin/
npm run check
```

Avec un vrai `GITHUB_TOKEN` dans `.dev.vars`, les demandes créent de vraies issues et
déclenchent le workflow.

## Produits depuis une page fabricant

Le client peut écrire par exemple « Ajoute le Mini 5 Pro en location à 45 € HT/jour :
https://www.dji.com/fr/mini-5-pro ». Claude :

- vérifie d'abord que le produit n'existe pas déjà ;
- lit les caractéristiques sur la page du fabricant ;
- récupère les photos sur fond blanc avec `scripts/product-images.mjs` ;
- rédige la fiche ;
- applique les prix donnés par le client, jamais ceux du fabricant.

La procédure détaillée est dans `.claude/CLAUDE.md`, section « Products from a
manufacturer page ».

Claude ne peut lire que les sites listés dans `scripts/product-sources.json`, et le
script ne télécharge que depuis ces sites. Pour une nouvelle marque, ajoute son domaine
dans ce fichier : les droits `WebFetch` des workflows en sont générés automatiquement
(`.github/claude-tools.mjs`).

Avant de valider, vérifie dans la PR les chiffres repris du fabricant (la source est
citée), et vérifie que le client a le droit d'utiliser les visuels de la marque.

## Limites actuelles

- Pas d'envoi de fichiers : pour une photo qui leur appartient (équipe, chantier…), le
  client l'envoie à part et Claude le signale dans sa réponse.
- La validation finale (merge) se fait sur GitHub, par nous.
- Coût : chaque demande consomme des tokens API (plafonnés à 40 tours) et des minutes
  GitHub Actions.
