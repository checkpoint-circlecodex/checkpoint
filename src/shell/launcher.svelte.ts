/* **Le volet déplié est un lanceur.** Le contenu passe au flou et le volet
   prend la main : on y cherche, les résultats s'affichent au-dessus du flou,
   et choisir referme le volet sur la page atteinte.

   **L'état replié est l'état de travail, et c'est lui par défaut** — à
   chaque ouverture de l'application, sans exception.

   ⚠️ **Écart volontaire au prototype**, qui retenait le volet ouvert d'une
   ouverture à l'autre. Une application qui démarre floutée a fait du flou un
   état de repos, et l'identité l'interdit : *le flou est un événement, jamais
   un état.* On ne retient donc rien — ouvrir le lanceur est un geste, il se
   refait. */

class Lanceur {
  open = $state(false);
  query = $state("");
  /** Le champ de recherche, pour pouvoir lui rendre la main à l'ouverture. */
  field: HTMLInputElement | null = null;

  set(v: boolean) {
    this.open = v;
    if (!v) this.query = "";
  }

  /** Ouvrir **et** donner la main au champ : on ouvre un lanceur pour
      chercher, pas pour le regarder. Par minuterie et non par image
      d'animation — une fenêtre masquée n'en produit aucune. */
  seek() {
    this.set(true);
    setTimeout(() => this.field?.focus(), 0);
  }

  /** **Choisir une destination referme.** */
  chose() { this.set(false); }
}

export const lanceur = new Lanceur();
