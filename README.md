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
(HTTP, trousseau, cache fichier).

## État

En cours de portage depuis le prototype. Rien n'est encore livrable.

## Droits

Code visible, **tous droits réservés** — aucune licence d'utilisation n'est
accordée pour l'instant. Si tu veux en reprendre quelque chose, demande.
