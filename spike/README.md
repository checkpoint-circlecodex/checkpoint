# Le spike

Ce dossier ne fait pas partie de l'application. Il sert à **savoir si
l'architecture tient**, avant d'écrire une ligne de Checkpoint.

```bash
node spike.mjs check     # sans aucun compte — déjà passé
node spike.mjs login     # device flow (demande ta préparation, ci-dessous)
node spike.mjs write     # écriture, et le 409 qu'on veut provoquer
node spike.mjs org       # adhésion : issue d'un inconnu, rôle dans l'organisation
node spike.mjs all       # tout d'affilée
```

---

## Ce qui est déjà vérifié — 10 octobre 2026

| Question | Réponse mesurée |
|---|---|
| Le device flow passe-t-il depuis une page web ? | **Non.** Aucun `Access-Control-Allow-Origin`, préflight en 404. Le navigateur refuserait avant d'émettre la requête. **La coque native est la condition, pas un confort — D5 tient.** |
| Un arbre Git donne-t-il tous les SHA en un appel ? | **Oui.** 319 entrées, non tronqué, **218 ms**. À vingt fichiers, un appel suffira toujours. |
| Que coûte une ouverture à froid ? | **395 ms** pour vingt fichiers en parallèle, 11 Ko. Sous la seconde, largement. |
| Une relecture qui ne change rien est-elle gratuite ? | **Non — et c'est une correction.** Cinq relectures conditionnelles, cinq `304`, **cinq décomptes de quota**. |

## Les trois dernières — 11 octobre 2026

| Question | Réponse mesurée |
|---|---|
| Le device flow marche-t-il depuis la coque ? | **Oui**, jeton obtenu sans copier-coller. Et **il n'expire pas** — *Expire user authorization tokens* laissée décochée : rien à rafraîchir à écrire. |
| Un conflit d'écriture se détecte-t-il ? | **Oui.** Écriture acceptée, puis **409 Conflict** sur un SHA périmé. Le signal « relis, fusionne, réessaie » existe — et un seul écrivain par fichier fait qu'il ne devrait jamais se déclencher. |
| Une adhésion se valide-t-elle depuis l'app ? | **Oui.** L'API d'adhésion répond *rôle « admin », état « active »*, et une issue d'inconnu s'ouvre sur le dépôt public — **le seul geste d'un extérieur, et il suffit.** |

**Six questions sur six. Plus aucune question d'architecture n'est ouverte.**
⚠️ Ce dossier est désormais **jetable** : il a servi, il ne doit pas devenir
du code de production. `spike/.token` est à effacer au portage — l'application
réelle rangera le jeton dans le trousseau système (invariant 15).

*Nettoyage fait le 11 octobre : `data/_spike.json` retiré, issue de test
refermée.*

### Sur ce dernier point

On lit partout qu'un `304 Not Modified` ne compte pas dans le quota. **Mesuré,
c'est faux** : `restant 34 → 33 → 32 → 31 → 30 → 29` sur cinq relectures.

La conclusion tient quand même, mais il faut la refonder sur le **budget** et
non sur une gratuité imaginaire :

- Authentifié : **5 000 appels par heure et par personne.**
- Relire l'arbre toutes les 20 s : **180 appels/h, soit 3,6 % du budget.**
- Toutes les 10 s : 7,2 %. Les téléchargements de blobs ne s'ajoutent que
  lorsque quelque chose a effectivement changé.

Donc : la Loge reste tenable, la latence de 15 à 30 s reste le seul vrai coût,
et le `304` garde tout son intérêt — il économise la **bande passante** et le
temps, pas le quota.

*(À refaire authentifié : le comportement pourrait différer. Mais on ne
construira plus l'argument sur la gratuité.)*

---

## Ce que je ne peux pas faire à ta place — 10 minutes

Créer une organisation GitHub n'est possible que depuis l'interface web, avec
ton compte. Voici la liste exacte, dans l'ordre.

**1. L'organisation**
<https://github.com/organizations/plan> → **Free**.
Un nom qui ne changera plus (il nomme le dépôt de données) — `checkpoint-cercle`,
par exemple.

**2. Le dépôt de données — privé**
Dans l'organisation : `tracker-data`, **privé**, avec un README pour l'initialiser.

**3. Le dépôt de code — public, issues activées**
Toujours dans l'organisation : `checkpoint`, **public**.
C'est la porte d'entrée des inconnus : n'importe quel compte GitHub peut y
ouvrir une issue, et c'est le seul geste qu'une personne hors de l'organisation
puisse faire.

**4. L'application GitHub**
Réglages de l'organisation → *Developer settings* → **GitHub Apps** → *New*.

- **Enable Device Flow** : ✅ **c'est la case qui décide de tout.**
- *Callback URL* : `http://localhost` (inutilisée en device flow, mais exigée).
- *Webhook* : décocher **Active**.
- Permissions **Repository** : *Contents* → **Read and write** · *Metadata* → *Read* ·
  *Issues* → **Read and write**.
- Permissions **Organization** : *Members* → **Read and write**
  (c'est ce qui permettra à un administrateur de valider une adhésion depuis l'app).
- *Where can this app be installed* : **Only on this account**.
- À trancher : **« Expire user authorization tokens »**. Décoché, le jeton ne
  périme pas et il n'y a pas de rafraîchissement à écrire. Coché, c'est plus
  propre mais il faut coder le renouvellement. Le spike te dira ce que tu as choisi.

Puis **Install App** sur l'organisation, et relève le **Client ID**
(`Iv23li…`).

**5. Me le donner**

```bash
cp spike.config.example.json spike.config.json
# puis renseigne clientId, org, repo, publicRepo
```

Ensuite : `node spike.mjs login`, `write`, `org`.

---

## Le jeton

`spike/.token`, en `600`, **jamais affiché**. C'est un fichier à effacer quand
le spike est fini — l'application réelle, elle, le rangera dans le trousseau du
système via l'interface `secrets` (invariant 15).

## Après le spike

`data/_spike.json` et l'issue de test sont à supprimer du dépôt. Le spike n'est
pas du code à garder : il est là pour répondre à six questions, pas pour durer.
