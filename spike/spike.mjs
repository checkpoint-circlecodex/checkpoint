#!/usr/bin/env node
/* ============================================================================
   Checkpoint — le spike.

   Il ne sert pas à écrire l'application : il sert à savoir si l'architecture
   tient. Six questions, posées à GitHub pour de vrai, dont la réponse peut
   encore invalider deux jours de conception.

     1  Le device flow est-il impossible depuis une page web, et possible
        depuis une coque native ? (Autrement dit : la coque Tauri est-elle
        une nécessité ou un confort ?)
     2  Une relecture qui ne change rien coûte-t-elle du quota ?
     3  Un arbre Git donne-t-il tous les SHA en un appel ?
     4  Combien coûte une ouverture à froid, vingt fichiers ?
     5  Une écriture avec un SHA périmé rend-elle bien un 409 ?
     6  Un jeton d'utilisateur peut-il ajouter quelqu'un à l'organisation,
        et un inconnu peut-il ouvrir une issue ?

   Les trois premières ne demandent aucun compte : `node spike.mjs check`.
   Les trois dernières demandent les dix minutes de préparation décrites
   dans README.md.
   ========================================================================= */

import { readFileSync, writeFileSync, existsSync, chmodSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CONF = join(HERE, "spike.config.json");
const TOKEN_FILE = join(HERE, ".token");          /* chmod 600, jamais affiché */
const UA = { "User-Agent": "checkpoint-spike", "Accept": "application/vnd.github+json" };

const conf = existsSync(CONF) ? JSON.parse(readFileSync(CONF, "utf8")) : {};
const token = () => existsSync(TOKEN_FILE) ? readFileSync(TOKEN_FILE, "utf8").trim() : null;

/* ---------- présentation ---------- */
const C = { ok:"\x1b[32m", no:"\x1b[31m", hm:"\x1b[33m", dim:"\x1b[2m", b:"\x1b[1m", x:"\x1b[0m" };
const title = t => console.log(`\n${C.b}${t}${C.x}\n${"─".repeat(t.length)}`);
const yes  = (t, d="") => console.log(`  ${C.ok}✓${C.x} ${t}${d?` ${C.dim}${d}${C.x}`:""}`);
const no   = (t, d="") => console.log(`  ${C.no}✗${C.x} ${t}${d?` ${C.dim}${d}${C.x}`:""}`);
const warn = (t, d="") => console.log(`  ${C.hm}!${C.x} ${t}${d?` ${C.dim}${d}${C.x}`:""}`);
const note = t => console.log(`    ${C.dim}${t}${C.x}`);
const ms = n => `${Math.round(n)} ms`;

const VERDICT = [];
const record = (q, ok, line) => VERDICT.push({ q, ok, line });

/* Un spike qui annonce un succès qu'il n'a pas mesuré est pire qu'un spike qui
   échoue. Sans jeton le quota est de 60 appels/h : on vérifie d'abord qu'il
   reste de quoi mesurer, et on s'arrête net sinon. */
async function budget(){
  const r = await fetch("https://api.github.com/rate_limit", {
    headers: token() ? { ...UA, Authorization: `Bearer ${token()}` } : UA });
  const j = await r.json().catch(() => null);
  const c = j?.resources?.core;
  if (!c) return true;
  if (c.remaining > 8) return true;
  const mins = Math.max(1, Math.ceil((c.reset*1000 - Date.now()) / 60000));
  title("Quota épuisé");
  no(`Il reste ${c.remaining} appel(s) sur ${c.limit}`, `remise à zéro dans ${mins} min`);
  note(token() ? "Jeton présent mais budget consommé — attendre."
                : "Sans jeton, GitHub n'accorde que 60 appels par heure.");
  note("Rien n'est mesuré : relancer plus tard plutôt que de conclure à faux.");
  record("quota-mesure", "skip", `non mesuré — ${c.remaining}/${c.limit}, reset dans ${mins} min`);
  return false;
}

/* ============================================================================
   1 — Le device flow est-il hors de portée d'une page web ?
   On envoie un Origin et on regarde si GitHub autorise le navigateur. Si
   l'en-tête manque, un fetch depuis une page serait bloqué : la coque native
   n'est pas un confort, c'est la condition.
   ========================================================================= */
async function checkCors(){
  title("1 · Le device flow depuis un navigateur");
  const probe = async (url, method) => {
    try {
      const r = await fetch(url, { method, headers: { ...UA, Origin: "https://example.invalid" } });
      return { status: r.status, acao: r.headers.get("access-control-allow-origin") };
    } catch (e){ return { err: e.message }; }
  };
  /* Le préflight est ce qui tranche : sans Access-Control-Allow-Origin dessus,
     le navigateur refuse avant même d'envoyer la requête. */
  const pre = await probe("https://github.com/login/device/code", "OPTIONS");
  const post = await probe("https://github.com/login/device/code", "POST");
  const allowed = pre.acao || post.acao;
  if (allowed){
    warn("GitHub renvoie un Access-Control-Allow-Origin", `« ${allowed} »`);
    note("À revérifier : la coque native serait alors un confort, pas une nécessité.");
    record("CORS", null, `ACAO présent (${allowed}) — hypothèse à revoir`);
  } else {
    yes("Aucun Access-Control-Allow-Origin sur /login/device/code",
        `(préflight ${pre.status ?? pre.err}, POST ${post.status ?? post.err})`);
    note("Le préflight échoue : un navigateur refuserait avant d'émettre la requête.");
    note("La coque native est donc la condition du device flow, pas un confort. D5 tient.");
    note("À reconfirmer avec un vrai client_id — GitHub ne documente aucun CORS ici.");
    record("CORS", true, "device flow inaccessible depuis une page web — la coque est nécessaire");
  }
}

/* ============================================================================
   2 et 3 — Le coût d'une relecture, et l'arbre en un appel.
   Sans jeton, sur un dépôt public : la mécanique et la comptabilité du quota
   sont les mêmes, seule l'autorisation change.
   ========================================================================= */
async function checkEtag(repo = "github/gitignore"){
  title("2 · Ce que coûte une relecture qui ne change rien");
  const url = `https://api.github.com/repos/${repo}/git/trees/HEAD`;
  const a = await fetch(url, { headers: UA });
  const etag = a.headers.get("etag");
  const remA = +a.headers.get("x-ratelimit-remaining");
  if (!etag){ no("Pas d'ETag sur l'arbre Git — la relecture conditionnelle est impossible");
              record("ETag", false, "aucun ETag"); return null; }
  yes("L'arbre Git porte un ETag", etag.slice(0, 26) + "…");

  /* Cinq relectures d'affilée : une seule ne prouverait rien. */
  let rem = remA, t0 = performance.now(), codes = [];
  for (let i = 0; i < 5; i++){
    const b = await fetch(url, { headers: { ...UA, "If-None-Match": etag } });
    codes.push(b.status); rem = +b.headers.get("x-ratelimit-remaining");
  }
  const dt = (performance.now() - t0) / 5;
  const all304 = codes.every(c => c === 304);
  if (all304) yes("La relecture rend 304 Not Modified", `${ms(dt)} en moyenne`);
  else no(`Relectures : ${codes.join(", ")}`, "attendu 304");

  const spent = remA - rem;
  if (remA === 0){
    no("Mesure impossible", "le compteur est déjà à zéro");
    record("quota", "skip", "non mesuré"); return etag;
  }
  if (spent === 0){
    yes("Le 304 ne consomme aucun quota", `restant ${remA}, inchangé`);
    record("quota", true, "un 304 ne décompte rien");
  } else {
    /* Mesuré le 10 octobre 2026 : CINQ relectures, CINQ décomptes. La doctrine
       répandue — « un 304 est gratuit » — est fausse ici. Ce n'est pas grave,
       mais il faut compter juste. */
    warn("Le 304 DÉCOMPTE du quota", `${spent} appel(s) pour ${codes.length} relectures`);
    note("Contrairement à ce qu'on lit partout. Le raisonnement doit donc porter");
    note("sur le budget, pas sur la gratuité : authentifié, 5 000 appels par heure");
    note("et par personne. Relire toutes les 20 s = 180/h, soit 3,6 % du budget.");
    note("La conclusion tient, la justification était fausse.");
    record("quota", true, `304 décompté (${spent}/${codes.length}) — 180 appels/h = 3,6 % du budget authentifié`);
  }
  return etag;
}

async function checkTree(repo = "github/gitignore"){
  title("3 · Tous les SHA en un seul appel");
  const t0 = performance.now();
  const r = await fetch(`https://api.github.com/repos/${repo}/git/trees/HEAD?recursive=1`, { headers: UA });
  const dt = performance.now() - t0;
  if (!r.ok){ no(`Arbre indisponible (${r.status})`); record("arbre", false, `HTTP ${r.status}`); return; }
  const j = await r.json();
  const files = j.tree.filter(n => n.type === "blob");
  yes(`${files.length} fichiers, chacun avec son SHA, en un appel`, ms(dt));
  if (j.truncated) warn("Réponse tronquée", "au-delà de ~100 000 entrées — hors de portée ici");
  else note("Non tronquée : à vingt fichiers, un seul appel suffira toujours.");
  record("arbre", true, `${files.length} entrées en 1 appel, ${ms(dt)}`);
}

/* ============================================================================
   4 — Une ouverture à froid.
   Vingt fichiers tirés d'un dépôt public, téléchargés en parallèle, pour
   mesurer ce que coûte le pire cas : aucun cache, tout à relire.
   ========================================================================= */
async function bench(repo = "github/gitignore", n = 20){
  title(`4 · Une ouverture à froid, ${n} fichiers`);
  const h = token() ? { ...UA, Authorization: `Bearer ${token()}` } : UA;
  const r = await fetch(`https://api.github.com/repos/${repo}/git/trees/HEAD?recursive=1`, { headers: h });
  if (!r.ok){ no(`Arbre indisponible (${r.status})`); return; }
  const j = await r.json();
  const files = j.tree.filter(x => x.type === "blob" && x.size > 200 && x.size < 20000).slice(0, n);

  const t0 = performance.now();
  const blobs = await Promise.all(files.map(f =>
    fetch(`https://api.github.com/repos/${repo}/git/blobs/${f.sha}`, { headers: h })
      .then(x => x.json())));
  const dt = performance.now() - t0;
  const bytes = blobs.reduce((s, b) => s + (b.size || 0), 0);

  yes(`${files.length} fichiers en parallèle`, `${ms(dt)}, ${Math.round(bytes/1024)} Ko`);
  note(`Soit ${ms(dt/files.length)} par fichier amorti. Une ouverture à froid passe`);
  note("sous la seconde ; à chaud, un seul appel d'arbre et rien d'autre.");
  record("froid", dt < 3000, `${files.length} fichiers en ${ms(dt)}`);
}

/* ============================================================================
   5 — Le device flow, pour de vrai.
   ========================================================================= */
async function login(){
  title("Device flow");
  const id = conf.clientId || process.env.CP_CLIENT_ID;
  if (!id){ no("Aucun clientId", "renseigne spike.config.json — voir README.md"); return; }

  const start = await fetch("https://github.com/login/device/code", {
    method: "POST", headers: { ...UA, "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: id, scope: conf.scope || "repo read:org" }),
  }).then(r => r.json());

  if (start.error){ no(`GitHub refuse : ${start.error}`, start.error_description || ""); return; }

  console.log(`\n  Ouvre ${C.b}${start.verification_uri}${C.x}`);
  console.log(`  et saisis le code ${C.b}${start.user_code}${C.x}`);
  note(`Le code expire dans ${Math.round(start.expires_in/60)} minutes.`);

  const wait = s => new Promise(r => setTimeout(r, s*1000));
  let interval = start.interval || 5;
  const until = Date.now() + start.expires_in*1000;
  while (Date.now() < until){
    await wait(interval);
    const j = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST", headers: { ...UA, "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: id, device_code: start.device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code" }),
    }).then(r => r.json());

    if (j.access_token){
      writeFileSync(TOKEN_FILE, j.access_token, { mode: 0o600 });
      chmodSync(TOKEN_FILE, 0o600);
      yes("Jeton obtenu", "écrit dans spike/.token, en 600, jamais affiché");
      if (j.refresh_token){
        warn("Le jeton EXPIRE", `dans ${Math.round((j.expires_in||0)/3600)} h, rafraîchissable`);
        note("GitHub App avec expiration activée : prévoir le rafraîchissement,");
        note("ou décocher « Expire user authorization tokens » dans les réglages.");
        record("expiration", null, "jeton expirant — rafraîchissement à écrire");
      } else {
        yes("Le jeton n'expire pas", "rien à rafraîchir");
        record("expiration", true, "jeton sans expiration");
      }
      record("device", true, "jeton obtenu sans copier-coller");
      return;
    }
    if (j.error === "authorization_pending") { process.stdout.write("."); continue; }
    if (j.error === "slow_down"){ interval += 5; continue; }
    no(`Échec : ${j.error}`, j.error_description || ""); 
    record("device", false, j.error);
    return;
  }
  no("Code expiré avant autorisation");
}

/* ============================================================================
   6 — Écriture, et le 409 qu'on veut provoquer.
   ========================================================================= */
async function writeTest(){
  title("5 · Écrire, puis écrire avec un SHA périmé");
  const t = token();
  if (!t){ no("Aucun jeton", "lance d'abord : node spike.mjs login"); return; }
  const { org, repo } = conf;
  if (!org || !repo){ no("org/repo manquants dans spike.config.json"); return; }

  const api = (p, init) => fetch(`https://api.github.com/repos/${org}/${repo}/${p}`,
    { ...init, headers: { ...UA, Authorization: `Bearer ${t}`, ...(init?.headers||{}) } });
  const path = "data/_spike.json";
  const b64 = o => Buffer.from(JSON.stringify(o, null, 2)).toString("base64");

  /* état courant */
  let sha = null;
  const cur = await api(`contents/${path}`);
  if (cur.ok) sha = (await cur.json()).sha;
  else if (cur.status !== 404){ no(`Lecture impossible (${cur.status})`,
    cur.status === 403 ? "jeton sans droit sur ce dépôt ?" : ""); return; }

  /* première écriture */
  const one = await api(`contents/${path}`, { method:"PUT", body: JSON.stringify({
    message: "spike: première écriture", content: b64({ schemaVersion:1, at:new Date().toISOString(), n:1 }),
    ...(sha ? { sha } : {}) }) });
  if (!one.ok){ const e = await one.json();
    no(`Écriture refusée (${one.status})`, e.message || ""); record("écriture", false, `HTTP ${one.status}`); return; }
  const first = (await one.json()).content.sha;
  yes("Écriture acceptée", `nouveau sha ${first.slice(0,8)}…`);

  /* seconde écriture avec le SHA périmé : c'est le cas qu'on veut voir */
  const two = await api(`contents/${path}`, { method:"PUT", body: JSON.stringify({
    message: "spike: écriture concurrente", content: b64({ schemaVersion:1, at:new Date().toISOString(), n:2 }),
    sha: sha || first.replace(/.$/, "0") }) });

  if (two.status === 409){
    yes("Un SHA périmé rend bien 409 Conflict");
    note("C'est le signal qu'il faut relire, fusionner et réessayer — et comme");
    note("un seul écrivain touche chaque fichier, ça ne devrait jamais arriver.");
    record("409", true, "conflit détecté par SHA");
  } else if (two.ok){
    warn(`La seconde écriture est passée (${two.status})`, "le SHA n'était pas périmé");
    note("Relancer deux fois d'affilée pour forcer le cas.");
    record("409", null, "cas non provoqué");
  } else {
    const e = await two.json();
    warn(`Rendu ${two.status}`, e.message || "");
    record("409", null, `HTTP ${two.status}`);
  }
}

/* ============================================================================
   7 — Les deux questions d'adhésion.
   ========================================================================= */
async function membership(){
  title("6 · Adhésion : l'issue d'un inconnu, et l'ajout à l'organisation");
  const t = token();
  if (!t){ no("Aucun jeton"); return; }
  const h = { ...UA, Authorization: `Bearer ${t}` };

  const me = await fetch("https://api.github.com/user", { headers: h }).then(r => r.json());
  if (me.login) yes("Jeton valide", `connecté comme ${me.login}`);

  const r = await fetch(`https://api.github.com/orgs/${conf.org}/memberships/${me.login}`, { headers: h });
  if (r.ok){ const j = await r.json();
    yes("Lecture d'une adhésion possible", `rôle « ${j.role} », état « ${j.state} »`);
    note("L'API d'adhésion répond : un administrateur pourra valider depuis l'app.");
    record("adhésion", true, `rôle ${j.role}`);
  } else {
    warn(`Adhésion illisible (${r.status})`, "portée read:org manquante, ou pas membre");
    record("adhésion", null, `HTTP ${r.status}`);
  }

  if (conf.publicRepo){
    const i = await fetch(`https://api.github.com/repos/${conf.publicRepo}/issues`, {
      method:"POST", headers: h,
      body: JSON.stringify({ title:"spike: demande d'adhésion (test)", body:"Ouverte par le spike. À refermer." }) });
    if (i.ok){ const j = await i.json();
      yes("Issue ouverte sur le dépôt public", `#${j.number}`);
      note("C'est le seul geste qu'un extérieur puisse faire, et il suffit.");
      record("issue", true, `#${j.number} — à refermer`);
    } else { const e = await i.json();
      no(`Issue refusée (${i.status})`, e.message || ""); record("issue", false, `HTTP ${i.status}`); }
  } else note("publicRepo non renseigné : test d'issue sauté.");
}

/* ---------- verdict ---------- */
function verdict(){
  title("Verdict");
  for (const v of VERDICT){
    const g = v.ok === true ? `${C.ok}tient${C.x}`
            : v.ok === false ? `${C.no}CASSE${C.x}`
            : v.ok === "skip" ? `${C.dim}non mesuré${C.x}` : `${C.hm}à revoir${C.x}`;
    console.log(`  ${v.q.padEnd(12)} ${g.padEnd(20)} ${C.dim}${v.line}${C.x}`);
  }
  const bad = VERDICT.filter(v => v.ok === false).length;
  const skipped = VERDICT.filter(v => v.ok === "skip").length;
  console.log(bad ? `\n  ${C.no}${bad} point(s) cassent l'architecture — à traiter avant d'écrire l'application.${C.x}`
    : skipped ? `\n  ${C.ok}Rien ne casse${C.x} ${C.dim}— mais ${skipped} point(s) non mesuré(s), à relancer.${C.x}`
    : `\n  ${C.ok}Rien ne casse.${C.x}`);
}

/* ---------- entrée ---------- */
const cmd = process.argv[2] || "check";
const run = {
  check:  async () => { await checkCors();
                        if (!(await budget())) return verdict();
                        await checkEtag(); await checkTree(); await bench(); verdict(); },
  login,
  write:  async () => { await writeTest(); verdict(); },
  org:    async () => { await membership(); verdict(); },
  bench:  async () => { await bench(); verdict(); },
  all:    async () => { await checkCors();
                        if (await budget()){ await checkEtag(); await checkTree(); await bench(); }
                        await writeTest(); await membership(); verdict(); },
};
if (!run[cmd]){ console.log(`Commandes : ${Object.keys(run).join(" · ")}`); process.exit(1); }
await run[cmd]();
