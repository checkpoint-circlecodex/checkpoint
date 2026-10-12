# Checkpoint

Un tracker d'œuvres — jeux, films, séries, livres — **partagé au sein d'un
cercle d'une vingtaine de personnes**. Une application de bureau (Mac, Windows,
Linux) qui lit un dépôt GitHub privé et en tire une bibliothèque commune.

**L'application est ouverte, les données sont fermées.** Le binaire se
distribue librement ; l'accès aux données passe par une demande d'adhésion
qu'un administrateur valide. Pas de serveur, pas de base à administrer.

Le tracker solo existe déjà. **La valeur ajoutée est entièrement collective** :
savoir qui a fini quoi, sur quoi on n'est pas d'accord, ce qu'un ami a adoré et
qui traîne dans ta liste d'envies.

## Installer

Les paquets sont sur la [page des versions](https://github.com/checkpoint-circlecodex/checkpoint/releases/latest).

- **Mac** — le `.dmg`, un seul pour Intel et Apple Silicon. Glisser
  Checkpoint dans Applications, puis l'ouvrir : **macOS refuse la première
  fois**, parce que l'application n'est pas signée par Apple. Ouvrir alors
  *Réglages Système › Confidentialité et sécurité*, et cliquer
  **Ouvrir quand même** en bas de la page. Une seule fois.
- **Windows** — le `-setup.exe`. Windows affiche « Windows a protégé votre
  ordinateur » : *Informations complémentaires*, puis **Exécuter quand
  même**. Une seule fois, et sans droit d'administrateur.
- **Linux** — l'`.AppImage` (à rendre exécutable), ou le `.deb`.

Pourquoi ces avertissements : la signature d'Apple coûte 99 $ par an, et
le projet ne la paie pas. **Les mises à jour, elles, sont signées** — par
une clé propre au projet, vérifiée par l'application avant d'installer quoi
que ce soit. Elles se proposent d'elles-mêmes, dans un bandeau.

Ensuite, il faut un compte GitHub : l'application vous fait frapper à la
porte, et un administrateur du groupe vous admet. Rien d'autre à savoir.

## Comment ça tient debout

- **Un fichier par personne, un seul écrivain par fichier.** Le conflit
  d'écriture est éliminé par construction, pas géré après coup.
- **On ne stocke que des faits, jamais des agrégats.** Catalogue, moyennes,
  classements : tout se recalcule au chargement.
- **Chaque écriture est un commit.** Face au vrai risque — la corruption — une
  bêtise se répare en une commande.
- **Pas de temps réel, pas de notifications.** C'est dit dans l'interface au
  lieu d'être caché : un message paraît à la synchronisation suivante.

## Les documents

| Fichier | Ce qu'il contient |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Les invariants — ce qui ne change pas, et pourquoi |
| [`docs/conception.html`](docs/conception.html) | La spécification technique |
| [`docs/ux.html`](docs/ux.html) | Le parcours et les principes d'interface |
| [`docs/prototype.html`](docs/prototype.html) | Le prototype cliquable — il fait foi pour l'interface |
| [`docs/ETAT.md`](docs/ETAT.md) | Où en est le projet, et le journal de bord |
| [`spike/`](spike/) | Le banc d'essai de l'architecture — **jetable**, il a répondu à ses six questions |

Le prototype se lit en ouvrant le fichier, ou servi localement :

```bash
cd docs && python3 -m http.server 8731
```

## Pile

Tauri 2 · Svelte · TypeScript · Vite · Rust pour la surface native
(HTTP, jeton, cache fichier, ouverture des pages de GitHub).

Pour travailler dessus :

```bash
npm ci && npm run dev
```

Le serveur de développement tourne sur un **faux dépôt** garni d'un jeu
d'essai ; `?dehors` y joue quelqu'un qui arrive, `?maj=9.9.9` une version
publiée. `npm run verify` vérifie les couches, les types et les essais ;
`npm run tauri dev` lance la vraie coque, sur le vrai dépôt.

## État

Porté depuis le prototype, entrée dans le groupe comprise. Une version se
livre en poussant une étiquette `vX.Y.Z` : GitHub construit les trois
systèmes et prépare un brouillon de version, qu'un humain publie.

## Droits

Code visible, **tous droits réservés** — aucune licence d'utilisation n'est
accordée pour l'instant. Si tu veux en reprendre quelque chose, demande.
