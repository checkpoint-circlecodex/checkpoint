# État d'avancement

> Mis à jour à la fin de chaque session. Lire `../CLAUDE.md` d'abord.

**Dernière mise à jour :** 12 octobre 2026 (le fonds)
**Palier en cours :** V0 — identité visuelle arrêtée, pas encore portée en Svelte

---

## Prochaine action

**Livrer la v0.1.0 — deux gestes de Nathan, puis le premier arrivant réel.**
1. ~~Poser la clé comme secret du dépôt~~ ✅ fait le 12 octobre, avec
   l'accord de Nathan. ⚠️ **Reste à la sauvegarder ailleurs**
   (`~/.tauri/checkpoint.key`) : perdue, plus aucune mise à jour possible.
2. ~~Pousser `v0.1.0`~~ ✅ — le brouillon porte les trois systèmes et un
   `latest.json` qui les couvre tous. **Reste à le publier**, d'un clic,
   sur la page des versions.
3. Nathan ouvre l'application : déjà membre, dépôt vide — il passe par
   « La porte est ouverte », se compose un visage, entre **le premier**.
4. Le premier arrivant extérieur tranche la seule chose non essayée :
   accepter une invitation en attente avec le jeton de l'application.

Fait (12 octobre) : **les douze lignes du découpage.** L'entrée dans le
groupe en dur (10-11), puis **la livraison** (12) — workflow des trois
systèmes, mise à jour signée, bandeau, icône, README d'installation.

Ce que Nathan seul peut débloquer : **la clé IGDB** — gratuite, il faut un
compte développeur Twitch avec la double authentification.

---

## Défauts signalés — à corriger par lots, une zone à la fois

> Nathan les relève en se servant de l'application ; on les **consigne
> d'abord**, on les corrige ensuite **par zone** (toute la barre en une
> passe, puis la zone suivante) : la vérification — les deux largeurs, le
> balayage des cibles, l'image — se paie une fois par zone, pas une fois par
> défaut. Chaque ligne dit ce qui a été vu, et ce qu'en dit le prototype.

### La barre latérale repliée — signalé le 12 octobre (application Mac, v0.1.0)

- [ ] **Elle ne se déplie plus par un bouton à elle.** Le bouton de bascule
      est masqué à l'état replié (`.collapsed .tgl { display: none }`) ; seule
      la loupe la déplie, et Nathan l'a trouvé par hasard. **Décidé par
      Nathan le 12 octobre : un bouton « déplier » entre le sceau « C » et la
      loupe**, toujours visible replié. (Le prototype le gardait aussi, tourné
      de 180°, sous le sceau — c'est le portage qui l'avait perdu.)
- [ ] **Les glyphes ne sont pas sur le même axe.** Ceux d'*Agir* (+ ◈ ⚑) et
      du Greffe sont centrés ; ceux de *Parcourir* (≡ ◎ ❧ ❖) sont collés à
      gauche ; le visage du pied aussi. Le prototype centre tout
      (`.nrow a{justify-content:center}`, `.foot a{justify-content:center}`).
- [ ] **Le sceau « C » est coupé au bord gauche** : sa marge négative
      (pensée pour la barre dépliée) le pousse hors du cadre une fois replié.
- [ ] **Deux filets à chaque séparation** au lieu d'un : la règle `.sep` et
      la bordure que prend l'étiquette repliée (`.collapsed .lbl`) se
      cumulent.
- ⚠️ *Pourquoi ça n'a pas été vu* : l'état replié a été balayé pour la
  taille des cibles (44 px), pas pour l'alignement ni pour la bascule — le
  lanceur était toujours ouvert par la loupe ou ⌘K pendant les essais.

### Les panneaux d'*Agir* s'empilent — signalé le 12 octobre

- [ ] « Inscrire une œuvre », puis « Ce que tu mènes » ou « Planter une
      quête » : les panneaux se superposent. **Décidé par Nathan : le
      précédent se ferme, sans rien garder** — une saisie en cours est
      perdue, c'est assumé (on lui a proposé le brouillon ou la
      confirmation, il a choisi le plus simple).
- ⚠️ **Ce n'est pas une entorse à l'invariant 17, mais il faudra l'écrire.**
  L'invariant protège une surface ouverte *depuis une autre* (on doit la
  retrouver intacte en revenant). Un geste de la barre n'est pas ouvert
  depuis un panneau : c'est une **nouvelle destination**, et choisir une
  destination referme ce qui était ouvert — comme une navigation le fait
  déjà (`pile.closeAll()` sur changement d'adresse). À préciser dans
  l'invariant 17 au moment de corriger : *depuis une surface, on empile ;
  depuis la barre, on remplace.*

### L'ouverture à chaque lancement — demandé le 12 octobre

- [ ] Aujourd'hui l'ouverture (le nom qui tombe lettre à lettre, les étoiles,
      la cité) ne se joue que **dans l'entrée**, donc une seule fois dans la
      vie d'un compte. **Décidé par Nathan : elle se joue à chaque
      lancement** — nom, étoiles et cité, pendant que le registre se charge
      (~1,7 s), puis elle s'efface sur l'accueil. **Un clic la passe.**
- ⚠️ Change une ligne de `CLAUDE.md` (§ « L'entrée dans le groupe ») : à
  réviser *et marquer*, pas effacer. Et la garder honnête : elle couvre un
  chargement réel, elle ne l'allonge pas — si le registre est prêt avant,
  elle finit son geste ; s'il ne l'est pas, elle attend sans boucler.

### Ce qu'on ne peut pas encore faire — signalé le 12 octobre

Ce ne sont pas des défauts de code mais des **gestes manquants**. Plusieurs
demandent une décision avant d'être écrits, parce qu'ils touchent au modèle.

- [ ] **Modifier une fiche d'œuvre** (titre, année, genres, jaquette) :
      impossible. Le prototype permettait au moins les genres et la jaquette
      sur la fiche. ⚠️ *À décider avant d'écrire* : la description d'une
      œuvre vit **dans le fragment de chaque personne qui la porte**, et la
      fusion retient la première contribution. Corriger sa propre copie ne
      changerait donc rien à l'écran si quelqu'un l'a portée avant. Qui fait
      foi — le premier, le plus récent, ou une correction déclarée par un
      greffier et appliquée à la lecture, comme les alias (invariant 31) ?
- [ ] **Supprimer une œuvre** : impossible. Dans ce modèle, c'est *retirer
      son inscription* de son propre fragment ; l'œuvre reste au corpus tant
      que quelqu'un d'autre la suit (le corpus est dérivé). Le mot à
      l'écran devra le dire — « retirer de mon registre », pas « supprimer ».
- [ ] **Ajouter une jaquette**, ni à la création ni après. Le prototype
      avait le dépôt et le recadrage (`openCrop`). ⚠️ *À décider* : coller une
      adresse d'image est simple (on stocke l'URL) ; **importer un fichier**
      bute sur la règle « jamais d'octets d'image dans le dépôt de données »
      et sur la question ouverte des jaquettes importées (plafond, dépôt
      séparé). Avec IGDB et TMDb branchés, la plupart des jaquettes
      arriveront seules.
- [ ] **Modifier une quête** : impossible. **La retirer existe** —
      « Arracher cette planche », en bas de la planche, pour son auteur
      seulement — mais Nathan ne l'a pas trouvé : à rendre visible, ou à
      placer là où l'on cherche (au même endroit que « modifier »).

### Le bandeau de version ne regarde qu'au lancement — relevé le 12 octobre

- [ ] Il vérifie au démarrage puis toutes les six heures : une application
      restée ouverte ne voit pas une version publiée entre-temps. Ajouter
      une vérification **au retour dans la fenêtre** (un appel, comme la
      porte le fait déjà pendant l'attente).

### Des points flous derrière le nom — signalé le 12 octobre

- [ ] Nathan voit, **dans l'application Mac**, de gros points très flous
      derrière « Checkpoint » pendant l'ouverture, et ne les aime pas : **à
      retirer.** Dans Chromium on ne voit que des poussières minuscules : le
      rendu de WebKit diffère, ou bien ce sont autre chose. Deux suspects :
      les **84 poussières fixes qui respirent** du ciel qui tombe
      (`entry/falling.ts`, seuls « points » de l'arrière-plan), ou les
      **lettres en pleine chute** (flou de 7 px, agrandies à 128 %). Le
      premier est le plus probable — on retire les poussières et on garde
      les étoiles filantes. ⚠️ *À vérifier dans l'application Mac, pas
      dans le navigateur* : c'est là qu'il a été vu.

---

## Pour ensuite — idées déposées, pas encore conçues

### Signaler un défaut depuis l'application — demandé par Nathan le 12 octobre

Une place dans la barre latérale qui ouvre une fenêtre pour signaler ce qui
ne va pas. **Pas encore conçu** ; ce que l'architecture suggère déjà :

- **Le signalement devient une issue du dépôt public**, comme une demande
  d'adhésion — c'est le seul geste d'écriture hors des fragments, il existe
  déjà (`platform/knock.ts`), et un marqueur `checkpoint:defaut v1` le
  distinguerait. Version de l'application et système joints d'office : ce
  sont les deux choses qu'on oublie toujours de dire.
- ⚠️ **Une issue est publique** : l'écran doit le dire avant l'envoi, comme
  la demande d'adhésion le dit.
- Où dans la barre : à trancher — ni *agir* ni *parcourir* ; peut-être au
  pied, près du visage, ou sous *Tenir*. Une capture d'écran jointe serait
  utile mais pose la question des octets d'image (jamais dans le dépôt de
  données — une issue n'y est pas, c'est donc ouvert).
- Les défauts déjà consignés plus haut dans ce fichier y seraient alors
  saisis par Nathan lui-même.

### ~~Les genres, refondus sur les vraies taxonomies~~ — ✅ faite le 11 octobre

Les listes sont posées : **44 catégories pour un jeu** (23 genres IGDB vérifiés
en « Forme », 21 thèmes en « Thème »), **19 pour un film** et **18 pour une
série** (vocabulaires TMDb, qui diffèrent entre les deux), **24 pour un livre**
en deux axes. Le sélecteur affiche les familles en entier, et les valeurs déjà
consignées hors liste paraissent sous « Déjà consigné » pour ne pas être
effacées à la première édition. ⚠️ *Les thèmes IGDB restent à confirmer sur
igdb.com/themes — ils ont été écrits de mémoire, la recherche ayant été coupée.*

<details><summary>Le détail de la recherche, conservé</summary>

Le sélecteur de genres **existe déjà** dans l'inscription d'une œuvre
(`GENRES`, `genresFor`, le bloc « Genres » de `openInscribe`). Ce qui manque,
c'est la **fidélité aux vocabulaires sources** : les listes actuelles sont de
mon invention et très courtes côté films (4 entrées) et livres (5).

**Le principe à tenir :** l'identité d'une œuvre viendra d'IGDB et de TMDb — les
genres doivent donc *mirroiter leur vocabulaire*, pour qu'au branchement réel
ils arrivent déjà mappés, sans table de correspondance à maintenir.

**Jeux — les 23 genres IGDB** (vérifiés sur igdb.com/genres) :
Point-and-click · Combat *(Fighting)* · Tir *(Shooter)* · Musique · Plateforme ·
Réflexion *(Puzzle)* · Course · Stratégie temps réel · Jeu de rôle · Simulation ·
Sport · Stratégie · Stratégie au tour par tour · Tactique ·
Hack'n'slash *(Hack and slash/Beat 'em up)* · Quiz · Flipper · Aventure ·
Indépendant · Arcade · Visual novel · Cartes et plateau · MOBA

**Jeux — les thèmes IGDB**, axe distinct du genre (⚠️ *de mémoire, non vérifié :
la recherche a été coupée. À confirmer sur igdb.com/themes avant d'écrire*) :
Action · Fantasy · Science-fiction · Horreur · Thriller · Survie · Historique ·
Infiltration · Comédie · Gestion · Drame · Documentaire · Bac à sable ·
Éducatif · Enfants · Monde ouvert · Guerre · Entre amis · 4X · Mystère · Romance
— *Érotique existe chez IGDB et est volontairement écarté ici.*

**Films — les 19 genres TMDb** : Action · Aventure · Animation · Comédie ·
Crime · Documentaire · Drame · Familial · Fantastique · Histoire · Horreur ·
Musique · Mystère · Romance · Science-fiction · Téléfilm · Thriller · Guerre ·
Western

**Séries — les genres TMDb TV**, qui ne sont pas ceux des films (TMDb en
regroupe certains) : Action & aventure · Animation · Comédie · Crime ·
Documentaire · Drame · Familial · Enfants · Mystère · Actualités · Téléréalité ·
Science-fiction & fantastique · Feuilleton · Talk-show · Guerre & politique ·
Western — plus une **forme** propre : Mini-série, Anthologie.

**Livres — aucune autorité unique** (BISAC est commercial et énorme). Liste à
assumer comme nôtre, en deux axes :
*Genre* — Roman · Science-fiction · Fantasy · Horreur · Policier · Thriller ·
Romance · Historique · Aventure · Littérature générale · Satire · Conte ·
*Forme* — Essai · Récit · Biographie · Autobiographie · Poésie · Nouvelles ·
Théâtre · Roman graphique · Bande dessinée · Manga · Correspondance

**Ce qu'il reste à écrire :**
1. `GENRES` passe de listes plates à des **groupes** `{ g, l }` par nature
   d'œuvre ; `genresFor` reste plat (validation), `genreGroups` sert l'interface.
2. Le sélecteur affiche les familles, comme la grille d'emblèmes de l'entrée.
3. ⚠️ **Préserver les valeurs déjà consignées** : le corpus de démonstration
   porte « Action-RPG », « Enquête », « Procès », absents des nouvelles listes.
   Les afficher dans un groupe « Déjà consigné », sinon une simple édition les
   efface.

</details>



### ~~Les liens de parenté~~ — ✅ faite le 10 octobre

Déposée et construite le même jour. Le cahier des charges de Nathan a été tenu
à la lettre : **pas d'onglet de plus**, un **point discret** dans la ligne
d'identité, une **section indépendante** au clic. Voir D23, et le journal.

Ce qui reste à trancher si on y revient : le vocabulaire au-delà de
père/mère/fils/fille/frère/sœur, ce qu'un enfant mineur peut voir ou écrire,
et si la maisonnée mérite un nom à elle.

---

## Avancement

### Conception — terminée pour ce tour
- [x] Contraintes posées et induites (spec §3)
- [x] Architecture des données, un fichier par personne (spec §5)
- [x] Architecture logicielle en trois couches, quatre règles (spec §6)
- [x] Modèle de données, six états, champs de profil (spec §7)
- [x] Parcours d'entrée à deux couloirs (parcours §2)
- [x] Les sept états critiques de l'expérience (parcours §4)
- [x] Frontière de la V1 tracée dans le parcours (parcours §5, spec §10)
- [x] Cinq principes d'interface (parcours §6)
- [x] Hors périmètre écrit noir sur blanc (spec §11)
- [x] Deux documents publiés comme Artifacts

### V0 — en cours
- [x] Prototype cliquable des quatre vues, publié
- [x] Jeu de données fictives réaliste (6 personnes, 25 média, 11 critiques)
- [x] Fusion des fragments et catalogue dérivé (dans le prototype)
- [x] Vocabulaire d'état par type de média, et les verbes du fil d'activité
- [x] Pastilles façon LiveArea, barre latérale rétractable, barre basse en étroit
- [x] 2e passe : direction visuelle claire, pastilles rondes, suivi de souris,
      accueil réorganisé, cercles en orbes, sous-menus dépliables
- [x] 3e passe : identité propre — ⚠️ *registre porcelaine, depuis écarté*
- [x] 4e passe : **refonte complète** — plat, noir et blanc, grain, profondeur de champ
- [x] Pages approfondies : une « depuis ta dernière visite », corpus triable avec
      ta position, forme du désaccord, caractère des Ordres, tempérament
- [x] Jaquettes (vue grille + sur la fiche, agrandissement), Le Sort, Livres
- [x] Inscription d'une œuvre et gestion de sa fiche, titres VO/FR
- [x] Checkpoints, bloc « En cours » pilotable, dépôt et recadrage de jaquette
- [x] Feuille en volets à glissement latéral, profil relationnel « Toi et X »
- [x] Pixel art : cité en tête du Registre, carte du Royaume derrière le flou
- [x] Genres, compagnons `with[]`, compteur `plays`, dé à douze faces
- [x] **Favoris et Magnum opus** — distinctions déclarées, indépendantes des notes
- [x] **La Grande Loge** — un fil fermé par Ordre, écrit dans son propre fragment,
      surlignages personnels et fil repliable sur ses passages retenus
- [x] **Les Quêtes** — paliers monotones sur des groupes d'œuvres, pancartes,
      volets sur la feuille et dans la chambre, barre latérale réorganisée
- [x] **La trame des Guerriers** refaite — une forêt de lances qui défile
- [x] **La lignée** — parentés déclarées des deux côtés, point discret, maisonnée
- [x] **La ligne du guetteur** sur l'accueil, à la couleur de son Ordre
- [x] **Banc d'essai de l'entrée dans le groupe** — quatre tuiles ⚠️ *temporaire*
- [x] **Le Greffe** — admissions, doublons fondus par alias, journal, passation ;
      la porte n'existe que pour qui tient la charge ⚠️ *banc d'essai temporaire*
- [ ] **Validation du look par Nathan** — en cours, itération par itération
- [x] Installer Node et Rust
- [ ] Porter en **Svelte** + TypeScript, les trois couches, le registre
- [ ] Script de vérification des dépendances entre couches

### Mise en place
- [x] **Chaîne d'outils installée** — node, npm, rustup + stable, gh *(10 oct.)*
- [x] **Spike écrit** (`spike/`), **quatre vérifications sur six passées** *(10 oct.)*
- [x] **Organisation GitHub `checkpoint-circlecodex`** *(11 oct.)*
- [x] **`tracker-data`** en privé dans l'organisation *(11 oct.)*
- [x] **`checkpoint`** public, issues activées *(11 oct.)*
- [x] `gh` authentifié, `spike/spike.config.json` écrit *(11 oct.)*
- [x] **GitHub App « Checkpoint circlecodex »**, device flow activé *(11 oct.)*
- [x] **Spike terminé — six questions sur six** *(11 oct.)* ⚠️ `spike/` est jetable

### V1 — le groupe existe et vit
- [ ] Device flow et trousseau du système
- [ ] Demande d'adhésion, écran d'attente, validation par un administrateur
- [ ] Création du profil : prénom, pseudo, classe, couleur, Discord optionnel
- [ ] Stockage GitHub réel, cache par SHA, gestion du `409`
- [ ] Recherche externe, jaquettes, saisie manuelle en repli
- [ ] Édition d'une entrée : statut, note, progression, plateforme, commentaire
- [ ] Fil d'activité
- [ ] Mise à jour automatique de l'application
- [ ] Les sept états de parcours §4

### V2 — le collectif et l'administration
- [ ] Matrice amis × jeux
- [ ] Consensus et désaccord
- [ ] Recommandations croisées
- [ ] Le mur de la honte
- [ ] Onglet d'administration : doublons du catalogue, membres

### Android — sans date, sur un coup de tête
- [ ] Chaîne de compilation Android + signature du keystore
- [ ] Adaptateur `secrets` portable (à choisir dès la V1, pas au moment de l'APK)
- [ ] Bandeau « nouvelle version » en remplacement de l'updater
- [ ] Barre basse de navigation, quatre entrées

### V3 — confort et ouvertures
- [ ] Thème, hors ligne complet, export, année en revue
- [ ] Films (`mediaType` les attend déjà)
- [ ] Groupes appuyés sur les classes
- [ ] Lien Steam et succès — sans date

---

## Décisions actées

Détail et justification dans la spec, §4.

| | Décision |
|---|---|
| **D1** | Données dans un dépôt GitHub privé — pour l'historique et le rollback |
| **D2** | Le dépôt appartient à une organisation, pas à un compte personnel |
| **D3** | Jeux vidéo, modèle extensible aux films (`mediaType`, `progress{unit,value}`) |
| **D4** | Données privées : une authentification est requise même pour lire |
| **D5** | Application de bureau en Tauri — *interface : voir D11, qui remplace React par Svelte* |
| **D6** | Trois couches, dépendances à sens unique, vérifiées par lint |
| **D7** | Adhésion sur demande depuis l'application ; admin = rôle GitHub, pas une liste maison |
| **D8** | Responsive dès l'origine — garde Android à ~2 jours de plomberie au lieu d'une réécriture |
| **D9** | Pile : Tauri + TypeScript + Vite, Zod, Zustand. Pas de Tailwind, pas de routeur, pas de bibliothèque de composants |
| **D10** | Identité : **plat, noir et blanc sur blanc cassé**, grain fin, **profondeur de champ** pour toute profondeur. Un seul thème clair, ton cérémonieux. ⚠️ *Remplace le registre « porcelaine émaillée » d'une version antérieure de cette ligne : Nathan l'a explicitement écarté. Ni biseau, ni ombre portée, ni reflet spéculaire.* |
| **D11** | **Svelte plutôt que React** — la bascule de mise au point anime `filter: blur()` et `transform` sur des couches entières et veut un contrôle direct du DOM qu'aucune réconciliation n'interrompe |
| **D12** | **Quatre exceptions au noir et blanc, pas une de plus** : les visages (avatars GitHub), les chambres d'Ordre, les jaquettes au survol, les feuilles de personnage (trame de leur Ordre, à présence réduite) |
| **D13** | **Pixel art engendré par code**, graine fixe, quatre gris clairs, deux pixels par point : la cité en tête du Registre et la carte du Royaume. Jamais dessiné à la main, jamais importé |
| **D14** | **Checkpoint ≠ chronique** : `reflections[]` (pensée datée, prise en chemin) contre `review{title,body}` (jugement rédigé). Deux champs, deux gestes, deux lectures |
| **D15** | **Titres VO + FR**, préférence rangée dans le fragment de la personne ; **la recherche interroge toujours les deux** |
| **D16** | La section d'œuvres d'un fragment s'appelle **`works`**, jamais `games` |
| **D17** | **Un favori n'est pas une note.** `favorites[]` déclarée, ordonnée, plafonnée à douze, dans le fragment de la personne. Jamais dérivée d'un classement : le premier rang est son magnum opus, et l'onglet Magnum opus d'un Ordre somme celles de ses membres |
| **D24** | **L'entrée se joue en ~~six~~ quatre tuiles**, et c'est une contrainte technique qui fixe l'ordre : le profil ne peut pas s'écrire avant l'admission. ⚠️ *Révisé le 11 octobre — frapper, attendre et se composer un visage sont un seul geste.* D'où **Ouverture · Seuil · Atelier · Ordre · Entrée**, le défilé des principes logé **dans l'atelier** plutôt qu'en péage |
| **D26** | **Le Greffe.** Ce qui demande une **autorité** (admettre, écarter, fondre un doublon, passer la charge) se range dans une troisième zone de la barre — ni agir ni parcourir : **tenir** — et **la porte n'existe que pour qui a le rôle** dans l'organisation ; elle n'est pas grisée. Ce qui demande seulement de la **discrétion** (resynchroniser, lire son fragment, régler les titres) vit au pied de sa propre feuille. *Une autorité n'est pas une discrétion.* Aucune modération : elle est **non représentable**, on n'écrit pas dans le fichier d'un autre |
| **D27** | **Un doublon se fond par un alias déclaré, appliqué à la lecture** — `{from,to}` dans le fragment du greffier, repli dans `merge()`. Rien n'est réécrit, rien n'est supprimé, **l'alias se retire**. Si une même personne tenait les deux entrées, elle n'en garde que la plus récente |
| **D25** | **Le portrait ne vient plus de GitHub** : fond pris dans une palette fermée + emblème + prénom. Les tons proposés évitent les cinq teintes d'Ordre — un visage est personnel, une teinte d'Ordre est collective. GitHub n'identifie plus que le compte |
| **D23** | **La lignée.** `kin[]` dans le fragment de chacun ; un lien n'existe que **déclaré des deux côtés**, et les deux déclarations doivent s'accorder en sens. La **maisonnée** est la composante connexe des liens confirmés — ni propriétaire, ni objet. Entrée par un **point neutre**, jamais par un onglet : les membres ne sont pas du même Ordre, une marque colorée ferait une cinquième exception |
| **D21** | **Les Quêtes.** Un nom et des **épreuves** — un palier atteint sur un groupe d'œuvres. Rangées dans le fragment de qui les ouvre ; **l'accomplissement se recalcule, jamais ne se stocke**. Paliers **monotones** : `convoiter < entreprendre < achever`, renoncer ou accomplir valent entrepris, accompli vaut achevé. ⚠️ *« Suspendu » n'est pas un palier — on en sort, et une quête qui se désaccomplit serait cruelle* |
| **D22** | **Une porte par pièce.** « Ma Feuille » quitte la barre latérale : le visage en bas y mène déjà. La barre sépare **agir** (inscrire, en cours, ouvrir une quête) de **parcourir** (Ordres, Œuvres, Quêtes). En étroit le visage passe dans l'en-tête, la barre basse reste à quatre entrées |
| **D19** | **La Loge est un fil fermé.** On n'y entre que si on est de l'Ordre ; les autres trouvent porte close. ⚠️ *Règle d'usage, pas clôture : tout le monde lit le même dépôt. Une vraie clôture demanderait un dépôt par Ordre, ce qui briserait « un fichier par personne ».* Surligner est une marque personnelle (`marks[]`) ; replié, le fil ne garde que les surlignés |
| **D20** | **Git reste la plateforme**, la Loge ne la remet pas en cause. Deux règles de client suffisent : **grouper les écritures** (jamais un commit par message) et **relire par requêtes conditionnelles**. ⚠️ *Corrigé le 10 octobre par la mesure : un `304` **décompte** du quota. L'argument porte sur le budget — 180 appels/h sur 5 000, soit 3,6 % — et non sur une gratuité.* ⚠️⚠️ ***Recorrigé le 11 octobre** — la mesure du 10 était faite sans jeton ; authentifié, **un `304` ne décompte pas** (invariant 27, tenu par un essai d'intégration). Le budget de 3,6 % reste le plafond si la gratuité disparaissait.* Le seul coût réel est la latence — quinze à trente secondes, plancher indépassable. Si le direct devenait nécessaire : un canal de réveil qui ne stocke rien, jamais une base temps réel hébergée |
| **D18** | **La Grande Loge entre au périmètre** — un message board par Ordre, `loge[]` dans le fragment de l'auteur. ⚠️ *Révise la ligne « commentaires et fils de discussion » du hors-périmètre : ce qui les excluait était le conflit d'écriture et la modération, or un seul écrivain par fichier règle le premier et rend la seconde non représentable. Restent exclus les fils arborescents, les commentaires attachés à une œuvre, et toute notification* |

## Questions ouvertes

Aucune ne bloque le spike.

| Sujet | Question | Quand trancher |
|---|---|---|
| Organisation | Qui la crée, qui la possède, qui sont les premiers admins ? | **Avant le spike** |
| Device flow | Issue ouvrable par un extérieur ? Expiration désactivable ? | Pendant le spike |
| UX / UI | Cahier des charges attendu de Nathan. | Avant la V0 |
| Catalogue | IGDB dès la V0, ou saisie manuelle pour commencer ? | V0 |
| Classes | Tank / Guerrier / Mage — liste ouverte ou figée ? | V2 |
| Signature | ~~Compte développeur Apple à 99 $/an ?~~ **Non** — Nathan ne paie pas. Conséquence assumée : un avertissement au premier lancement sur Mac (« Ouvrir quand même » dans Réglages › Confidentialité et sécurité) et sur Windows (SmartScreen › « Exécuter quand même »). La page de téléchargement le dit ; la mise à jour intégrée, elle, a sa propre signature, gratuite | ✅ 12 oct. |
| Jaquettes importées | Plafond de taille et de poids, et faut-il un dépôt séparé pour les images ? Git n'efface jamais un binaire remplacé. | ⚠️ *Était « cahier des charges » — à trancher dans une passe, il n'y aura pas de cahier* |
| Barre basse | Quatre entrées maximum en étroit — lesquelles ? **Tranché par l'usage :** Registre, Ordres, Œuvres, Quêtes ; le visage passe dans l'en-tête, et le Greffe aussi | ✅ 11 oct. |
| Nom | « Checkpoint » est un nom de travail. | Sans urgence |

---

## Journal

> ⚠️ **Ce fichier est écrit par plusieurs sessions.** Le 10 octobre, une session
> a réécrit le journal et effacé les entrées d'une autre ; des correctifs
> ultérieurs ont échoué en silence faute d'ancrage. **Avant d'écrire ici, relire
> la section visée, et n'employer que des remplacements qui échouent bruyamment
> si l'ancrage manque.** Même règle que pour republier un artifact partagé.

### 12 octobre 2026 — la première mise à jour, pour de vrai

- **Nathan a publié la v0.1.1, le bandeau l'a proposée, l'installation et
  la relance ont marché** sur son Mac. La chaîne entière est donc éprouvée
  hors du banc d'essai : signature de la clé du projet, `latest.json`,
  greffon de mise à jour, relance.
- La première fois, rien n'est apparu : **les deux versions étaient encore
  des brouillons**, et le bandeau ne lit que la dernière version *publiée*
  (GitHub rend 404 sinon — vérifié avec le jeton de l'application). Le
  silence était juste ; il ne disait pas pourquoi.
- À faire, déposé : vérifier aussi **au retour dans la fenêtre**, pas
  seulement au lancement et toutes les six heures — une application restée
  ouverte ne voyait pas la version publiée entre-temps.

### 12 octobre 2026 — le fonds

- **Nathan voulait « ajouter des œuvres à la base » ; le modèle n'a pas de
  catalogue tenu.** Une œuvre est au corpus parce que quelqu'un la suit. Les
  inscrire dans son fragment en « convoité » aurait mis un faux fait à son
  nom. D'où **le fonds** (invariant 36) : des œuvres versées, choisissables,
  hors du corpus — sa propre idée, une fois le modèle expliqué (« qu'elles
  existent dans la base sans que personne ait agi »).
- **Quarante-trois œuvres, vérifiées aux sources, pas à la mémoire** — la
  leçon des thèmes IGDB écrits de tête. Wikidata pour les identifiants TMDb
  et les slugs IGDB, Open Library pour les livres. Les six films de Jackson
  en Terre du Milieu, les quatre livres (Le Hobbit et les trois volumes),
  les dix-huit longs métrages de cinéma de Carpenter (sans son court
  d'étudiant, ses téléfilms ni ses *Masters of Horror*), et quinze jeux
  FromSoftware depuis *Demon's Souls* — sans les quatre restés japonais, ni
  les extensions et rééditions. *The Duskbloods* n'a qu'une année (2026),
  pas de date : versé quand même, on peut le convoiter.
- **Open Library donnait 1950 pour *Le Retour du Roi*** : faux, c'est 1955.
  Une source se recoupe, même ouverte.
- **IGDB refuse d'être lu sans clé** (403) : pas de numéro d'identifiant
  vérifiable. Le slug est devenu l'identité des jeux — et ça engage le
  branchement futur d'IGDB (voir l'invariant).
- **Un piège évité dans le registre** : la refusion qui suit chaque
  écriture ne connaissait que les fragments. Sans garder le fonds à côté,
  la première inscription aurait fait disparaître du catalogue tout ce que
  personne ne suit encore.
- Le jeu d'essai porte aussi *Elden Ring* (`g-elden`) : en développement, le
  Greffe le signale désormais comme doublon de `igdb:elden-ring`. C'est le
  jeu d'essai qui ment, pas le fonds — et ça montre que le guichet des
  doublons sait déjà trancher en faveur de l'identifiant de source.

### 12 octobre 2026 — la livraison

- **Pas de signature payante** (Nathan, 12 octobre). Le Mac est signé
  *ad hoc* — vérifié : `Signature=adhoc`, runtime durci —, ce qui évite
  « l'application est endommagée » sur Apple Silicon. L'avertissement du
  premier lancement est dit **sur la page des versions et dans le README**,
  parce que c'est là qu'est quelqu'un qui n'a encore rien ouvert. Et le
  contournement a changé depuis la spec : plus de clic droit › Ouvrir sur
  les macOS récents, mais *Réglages › Confidentialité et sécurité*.
- **La mise à jour a sa propre signature, gratuite.** Clé générée dans
  `~/.tauri/checkpoint.key` (0600, hors du dépôt, `*.key` ignoré par Git
  au cas où). Construction locale complète : `.dmg` de 4,9 Mo, paquet de
  mise à jour **et sa signature**. ⚠️ La perdre, c'est ne plus pouvoir
  mettre à jour personne.
- **Une seule source de version** : `package.json`, que `tauri.conf.json`
  lit. Le workflow refuse une étiquette qui ne la dit pas, vérifie tout
  avant de construire, et sort la version **en brouillon** — un humain
  publie.
- **Le bandeau** lit la dernière version *publiée*, propose « Installer et
  relancer » (après avoir vidé la file d'écriture — relancer la tuerait),
  ou la page de la version là où la mise à jour n'existe pas. Une
  vérification qui échoue se tait : l'absence de nouvelle n'est pas une
  nouvelle. `?maj=0.2.0` le montre en développement.
- **L'icône n'était pas la nôtre** : celle de Tauri, livrée par défaut.
  Remplacée par le sceau de la barre — le C en Instrument Serif dans son
  cadre d'encre, sur le papier —, dessiné dans le navigateur où la police
  est chargée, toutes tailles tirées d'une seule image. Lisible à 32 px.
- **Ce que le cas réel a appris, et que le jeu d'essai cachait.** Le dépôt
  de données est vide : Nathan entrera **le premier**. Le dernier écran lui
  aurait dit « le corpus est déjà plein : — œuvres » ; l'atelier lui aurait
  fait « frapper à la porte » d'une organisation dont il est déjà
  administrateur ; et l'accueil vide ne disait rien du tout. Trois textes
  pour ce cas, et `?vide` pour le jouer. *Un jeu d'essai riche fait croire
  que l'application marche ; c'est le dépôt vide qui dit si elle sait
  commencer.*
- **Deux trous du portage, en étroit seulement** : le visage manquait dans
  l'en-tête (le prototype l'y mettait) — personne n'atteignait sa feuille ni
  « se déconnecter » sur un téléphone ; et « Inscrire » n'existait que dans
  la barre latérale, qui n'existe pas en étroit. Le second demandait qu'un
  bloc offre un geste d'un autre : **`core/ui/gestes.ts`**, un registre que
  la coque remplit et que les blocs appellent sans savoir qui répond.
- **La première construction Windows a échoué, et c'était mon script.** La
  vérification des couches découpait les chemins sur `/` ; sous Windows ils
  ont des `\`, et chaque importation passait pour une faute. Mac et Linux
  ne pouvaient pas le voir. Corrigé à la racine (une seule forme de chemin),
  et **un job Windows vérifie désormais à chaque poussée** — on mesure là
  où l'on construira, pas le jour d'une version. L'étiquette a été déplacée
  sur la correction ; le brouillon n'avait jamais été visible.
- **La barre basse est rentrée dans le flux.** Fixée, on soustrayait sa
  hauteur à la main, avec 10 px de retard : la dernière ligne de chaque page
  passait dessous. Dans une colonne, le débordement est impossible par
  construction — mesuré au pixel, avec et sans bandeau.

### 12 octobre 2026 — l'entrée dans le groupe, en dur

- **Les quatre tuiles, portées du prototype, et branchées sur le vrai.** Le
  seuil lance le device flow (code en grand, page de GitHub ouverte par le
  natif) ; l'atelier frappe — une issue publique au format de `knock.ts` —
  puis attend ; l'Ordre ; l'entrée écrit le premier fragment, et l'onde
  passe **après** l'écriture. Parcourue de bout en bout dans le navigateur
  sur le faux, et en neuf essais du seuil au fragment.
- **La logique de la porte est pure** (`entry/door.ts`), sans une rune :
  c'est ce qui permet aux essais de la franchir comme une personne. Les
  runes ne tiennent que l'état d'écran (`gate.svelte.ts`).
- **Le natif n'ouvre que GitHub.** `open_github` analyse l'adresse et refuse
  tout autre hôte — `github.com.ailleurs.net` compris, essai à l'appui. La
  page ne peut envoyer personne ailleurs, comme `gh` ne peut appeler
  qu'`api.github.com`.
- **Une panne n'est plus une déconnexion.** `me()` rendait `null` sur toute
  réponse autre que 200 : un soir d'incident chez GitHub aurait fait oublier
  le jeton de tout le monde. Seul un `401` fait oublier ; le reste se dit,
  avec « Réessayer ».
- **Le faux n'agit pas sur le vrai** : il note ce qu'il aurait ouvert au lieu
  de lancer des onglets vers GitHub, et un compte qui n'est pas membre n'y
  lit pas le dépôt — exactement comme le 404 de GitHub.
- **Un bug ancien, révélé par l'arrivant.** `#app` n'avait pas de hauteur :
  l'application prenait celle de sa barre latérale. Pour qui tient le
  Greffe la barre est longue et rien ne se voyait ; pour un arrivant, sans
  Greffe, l'accueil se coupait à 584 px sur 820. *Un défaut de mise en page
  peut dépendre de qui regarde* — d'où l'intérêt d'avoir regardé avec les
  yeux d'un autre.
- **Ce que l'image a trouvé et que le code ne disait pas** : « Sachade la
  Forge ». En tête d'un bloc `{#if}`, Svelte retire l'espace nue ; il faut
  `{" "}`.
- **Le prototype nommait une animation qu'il ne définissait pas** (`rise`,
  sur les cartes du défilé) : elles y paraissent sans entrée. C'est ce qui a
  été vu et validé, c'est donc ce qui a été gardé.
- **Le glissement latéral est promu** dans `core/ui/slide.ts` : les volets
  et les tuiles en sont les deux usagers (invariant 13). Le fantôme se pose
  par `offset*`, à l'endroit exact de l'ancien.
- **Un essai d'intégration a échoué, puis passé neuf fois seul.** Celui qui
  tient « un 304 ne décompte pas » : en série, le décompte *des requêtes de
  l'essai précédent* tombait pendant la mesure. On laisse le compteur
  retomber trois secondes avant de mesurer — **l'assertion n'a pas été
  assouplie**, elle exige toujours zéro. Deux essais nouveaux tiennent ce
  dont l'attente dépend : lire sa propre adhésion et retrouver sa demande
  avec un jeton d'application.
- ⚠️ **Ce qui n'a pas pu être essayé** : accepter une invitation *en
  attente* avec le jeton d'une GitHub App. Il faudrait inviter une vraie
  personne. Si GitHub refuse, l'écran le dit et ouvre la page de
  l'invitation — le premier arrivant réel tranchera.

### 12 octobre 2026 — la cité, au pixel près

- **J'avais annoncé cette ligne comme imprévisible, et elle ne l'était pas.**
  Elle l'aurait été si j'avais redessiné la cité ; or elle existait, jugée à
  l'image dans le prototype. Portée telle quelle, comme la trame et le dé.
- **Et vérifiée au pixel près, pas à l'œil.** Le dessin statique ne dépend
  que d'une graine fixe : j'ai dessiné la cité du prototype et la mienne sur
  des canevas de même taille, à trois largeurs, et comparé leurs empreintes
  SHA-256. **Identiques aux trois tailles.** Puis regardée quand même,
  parce qu'une empreinte juste ne dit pas qu'une image est bonne — seulement
  qu'elle n'a pas changé.
- **Le contrôle de types est coupé pour ce seul fichier, et c'est dit en
  tête** : trois cents lignes de primitives où chaque paramètre est un nombre
  de points. Les annoter n'attraperait rien ; réécrire pour le vérificateur
  reviendrait à rejuger l'image sans la regarder. La fonction exportée,
  elle, est typée.
- **La rampe et le générateur sont promus** dans `core/ui/pixel.ts` : la
  cité est le deuxième dessin à en avoir besoin, après le dé (invariant 13).
- **Elle se redessine quand la largeur change** — vérifié en passant de
  1 280 à 375 px — et sa vie (le moulin, les lampes) passe seule par
  l'horloge d'animation : le dessin se fait d'un coup, à l'appel.
- La première mesure sur la page a rendu un canevas vide : **la fenêtre du
  navigateur était repliée, `innerWidth` valait zéro**. L'action a fait ce
  qu'elle devait — réessayer, puis abandonner proprement. Encore un artefact
  de mesure, reconnu avant d'être pris pour un défaut.

### 12 octobre 2026 — le pied de feuille, l'établi, et un effet qui se relançait

- **Le partage tient sans doublon** : le pied de feuille porte ce dont une
  personne a besoin sans autorité (titres, relire, son fragment, se
  déconnecter) ; l'établi, les diagnostics de l'atelier. *Une autorité n'est
  pas une discrétion, et une discrétion n'est pas un diagnostic.*
- **Son fragment se lit, il ne s'édite pas** : un éditeur de texte brut
  contournerait le scribe, ses regroupements et sa reprise sur conflit.
  Vérifié au passage : aucun `circleRef` dans le fichier — l'invariant 34
  tient dans la donnée réelle, pas seulement dans le code.
- **Le geste caché est borné et nommé.** Gauche, droite, gauche, droite,
  gauche ; cinq essais en fixent la logique — une pause trop longue remet à
  zéro, un bon départ après une erreur compte comme départ, toujours le même
  bouton n'ouvre rien. Les boutons n'existent que volet déplié, hors de
  l'ordre de tabulation et des lecteurs d'écran, 44 px quand même. Consigné
  dans la note mère comme l'entorse délibérée qu'il est.
- ⚠️ **Relire démontait la page.** La phase « ouverture » remplace toute la
  vue par un message d'attente ; y repasser à chaque relecture détruisait la
  page et tout état local — y compris une saisie en cours. Ne sert plus qu'à
  la première ouverture.
- ⚠️ **Et relire comptait comme une visite**, ce qui effaçait l'encart du
  guetteur. *Une relecture n'est pas une visite.*
- ⚠️ **L'ouverture se relançait elle-même**, et c'est le plus instructif de
  la journée. Pour distinguer première ouverture et relecture, j'ai lu
  `phase` au début d'`open()` — appelé depuis un `$effect`, qui s'abonne à
  tout ce qu'on lit. L'effet dépendait désormais de ce qu'il modifiait :
  ouvertures concurrentes, deux scribes, et **l'encart vide sans un
  message**. Diagnostic gêné par une seconde panne de mesure — le module que
  j'interrogeait depuis la console n'était pas celui de l'application après
  remplacement à chaud. Correction : `untrack` dans l'effet, et `open()` non
  réentrante. **Invariant 35.**

### 12 octobre 2026 — l'accueil complet

- ⚠️ **La visite se date à l'ouverture, plus à la fermeture.** Le prototype
  disait « écrite à la fermeture » ; mais une application qu'on ferme peut
  mourir avant que l'écriture parte, et l'encart raconterait alors deux fois
  la même chose. À l'ouverture, on **retient la visite précédente** pour
  l'encart, puis on inscrit celle-ci. Rien ne dépend d'une fermeture propre.
  Et un compte qui n'est pas encore admis n'écrit rien : on ne crée pas un
  fichier pour y ranger une date.
- **L'encart dit mot pour mot ce que disait le prototype** — *« II paroles
  nouvelles dans ta Loge, de Marion »*, la quête scellée, celle qu'un autre a
  accomplie, les demandes au greffe — dans le bleu des Mages, à l'intérieur
  de la feuille posée, avant les inscriptions. Huit essais tiennent ses
  règles : ses propres paroles ne s'annoncent pas, la Loge d'un autre Ordre
  non plus, une quête se date par l'inscription qui l'a scellée, et **sans
  visite précédente l'encart se tait** — il ne décrit qu'un écart.
- **Le dé du Sort est repris tel quel**, comme la trame : jugé à l'image.
  Mesuré : 4 364 pixels dessinés, **aucun noir** — la rampe reste claire. Il
  roule en changeant de face, jamais par rotation.
- **Le Sort préfère ce dont tu n'as rien dit**, et le hasard est injecté
  dans le sélecteur pour qu'un essai puisse le fixer. Le premier tirage se
  fait à l'arrivée et seulement lui : re-tirer à chaque mise à jour du monde
  ferait changer l'œuvre sous les yeux de qui la lit.
- **Une convoitise que d'autres ont achevée *depuis*** — l'essai vérifie que
  celle achevée avant n'apparaît pas : ce n'est pas nouveau, c'est déjà su.
- Le tirage a mis 5 s au lieu d'1,5 dans la fenêtre masquée : les minuteries
  y sont ralenties à une par seconde. **Il est arrivé quand même** — c'est
  pour ça qu'il tourne par minuterie et pas par image d'animation.

### 12 octobre 2026 — le volet-lanceur

- **Les trois gestes, vérifiés un par un** : choisir une jaquette ou un lien
  referme le volet sur la page atteinte ; déplier une section ne referme pas
  — le chevron n'est pas un choix ; cliquer dans le champ ne referme pas —
  c'est le début d'un choix. La règle tient parce que **seuls les liens
  appellent `chose()`** : la distinction est dans le code, pas dans la
  vigilance.
- ⚠️ **Écart volontaire au prototype : le volet ne se retient plus.** Le
  prototype gardait le volet ouvert d'une ouverture à l'autre ; une
  application qui démarre floutée a fait du flou un état de repos, et
  l'identité l'interdit. On démarre toujours replié.
- **Ce qui subsiste à l'état replié** (invariant 16) : la loupe, les
  actions, les trois règles — *agir*, *parcourir*, *tenir* — et le visage.
  Vérifié, pas supposé.
- **La loupe ouvre et donne la main au champ** : on ouvre un lanceur pour
  chercher, pas pour le regarder. ⌘K fait de même et Échap referme — des
  **raccourcis**, pas des portes : le bouton fait la même chose, en vue.
- **La jaquette est une primitive du noyau dès sa première utilisation**, et
  ce n'est pas une entorse à la règle de promotion : le lanceur vit dans la
  coque, le Répertoire dans un bloc, et les deux ne peuvent rien partager
  autrement que par le noyau. Sans image, **le cadre porte son titre**.
- ⚠️ **L'animation d'entrée du lanceur partait d'une opacité nulle** — le
  piège de la passe précédente sous une autre forme. Elle part maintenant
  d'un décalage de 6 px, lisible même figé. *La première image d'une
  animation doit toujours être montrable.*
- ⚠️ **La barre n'avait jamais été mesurée.** Le balayage des cibles tournait
  à une largeur où elle était masquée : trois liens de sections à 22 px
  dormaient dedans. Le balayage mesure désormais la barre repliée **et**
  dépliée, et dit quand il ne peut pas la voir. *Un contrôle qui ne voit pas
  un élément ne dit pas qu'il est bon — il ne dit rien.*
- Le flou lu à « 0 px » dans la fenêtre masquée était la transition figée,
  pas l'absence de flou : la cible, lue sans transition, est bien 13 px.

### 12 octobre 2026 — le Greffe, sur l'organisation réelle

- **Le prototype simulait tout ; il a fallu décider d'où viennent les
  choses.** Une demande est une issue ouverte du dépôt public portant un
  marqueur en commentaire HTML — invisible sur GitHub, sans ambiguïté pour
  l'application. **Pas d'étiquette** : un compte extérieur n'a pas le droit
  d'en poser. Et **l'auteur d'une demande est celui que GitHub atteste**, jamais
  ce que le corps prétend — un essai fixe qu'aucun champ du corps ne
  s'appelle `login`.
- **Le format d'une demande est écrit une seule fois** (`platform/knock.ts`) :
  l'écran d'entrée le composera, le Greffe le relit. Deux endroits qui
  écriraient chacun leur version finiraient par diverger.
- **Admettre, c'est inviter.** GitHub ne fait entrer personne de force dans
  une organisation ; l'écran le dit, et l'étape 5 devra accepter l'invitation
  pour la personne — sinon le critère de la V1 tombe sur un courriel.
- **Le journal se déclare chez chaque greffier et se somme à la lecture**,
  comme tout fait collectif. **Défaire un alias ajoute une ligne, n'en retire
  aucune** : la fonte et sa défaite restent. Et un acte qui échoue côté
  GitHub n'écrit rien au journal — *les trois, ou aucun*.
- **Le banc d'essai du prototype n'a pas été porté** : il simulait le rôle,
  que l'application lit maintenant dans l'organisation. La porte disparaît
  bien de la barre quand le rôle tombe à « membre », et l'adresse tapée donne
  la phrase.
- **« Se réclame de Alice »** : l'élision fait partie du ton, corrigée.
- **Vérifié contre l'organisation réelle**, en lecture seule : les greffiers
  se lisent (Gluenathazam), les issues aussi. Pas d'admission dans un essai :
  elle inviterait une vraie personne.
- ⚠️ **Un débordement de 238 px observé une fois, non reproduit** — ni à 375,
  800, 900 ou 1280 px, ni à travers toute la série d'actes, ni en rejouant la
  bascule de rôle. 238 ≈ la largeur de la barre (236) : probablement une
  mesure prise pendant que le volet du navigateur changeait de taille.
  **Consigné comme tel, pas comme corrigé.**

### 12 octobre 2026 — la lignée, et répondre à une parenté

- **Le prototype n'avait aucun moyen de déclarer une parenté** : les liens du
  jeu d'essai étaient écrits à la main. Conçu dans la grammaire existante —
  chacun déclare chez soi — avec une pièce que le modèle rendait
  obligatoire : **ce que les autres ont déclaré à ton sujet et que tu n'as
  pas rendu**. *Une déclaration qu'on ne voit pas ne peut pas être rendue* :
  sans cette liste, une parenté posée d'un seul côté n'existerait jamais.
  Elle paraît sur ta propre feuille seulement — c'est à toi de répondre, à
  personne d'autre de le savoir.
- **On répond avec son propre mot, pris dans le bon sens.** « Mon fils »
  appelle « mon père », « ma mère » ou « mon parent » : la surface ne
  propose que les mots qui répondent, et range les autres par ce qu'ils
  disent de la place de l'autre — au-dessus, à côté, au-dessous.
- ⚠️ **Le dessin inventait une parenté.** Le prototype tirait une courbe vers
  chaque personne de la génération suivante : dans une maisonnée où Marion
  est la sœur de Nathan et Sam le père de Nathan seul, Sam devenait le père
  de Marion. Une courbe ne relie plus que ce qui est déclaré. *Le dessin ne
  doit pas inventer ce que les données refusent* — c'est l'invariant 29
  appliqué à l'image.
- Vérifié de bout en bout, sur le faux dépôt : Nathan déclare Marion
  « sœur », Marion le déclare « frère » — le lien se confirme seul ; Sam
  déclare Nathan « fils », la demande paraît, Nathan répond « père », et la
  maisonnée se recompose en *Sam, Marion et Nathan*. La maisonnée Faure se
  lit mot pour mot comme dans le prototype : *« XIII œuvres fréquentées sous
  ce toit, CCLXXXVIII heures de jeu, IV chroniques. »*
- **Quatre passes d'affilée ont trouvé une cible oubliée par la précédente.**
  Le balayage est maintenant un outil du dépôt (`scripts/cibles.js`) : toutes
  les routes, tous les volets, en large et en étroit. Passé ce soir : aucune
  cible sous 44 px, aucun débordement. *Ce qui dépend de ma mémoire finit
  par manquer ; ce qui vit dans le dépôt se relance.*

### 12 octobre 2026 — mes en cours, et planter une quête

- **Suspendre n'est pas renoncer, et le panneau le montre.** Mettre
  *Severance* de côté la fait passer dans « Mis de côté », juste dessous,
  avec « Reprendre » en tête de ligne ; la reprendre la remonte. C'était le
  défaut du prototype d'origine : l'œuvre suspendue tombait dans le registre
  général et il fallait l'y retrouver.
- **Une planche sans œuvre ne se plante pas.** Elle ne s'accomplirait
  jamais — ou toujours, selon la façon de compter zéro sur zéro. Le bouton
  dit pourquoi il est éteint : *il lui faut un nom*, puis *chaque épreuve
  demande au moins une œuvre*. **Un bouton désactivé sans raison donnée est
  une devinette.**
- **Arracher se confirme.** C'est le seul geste de cette passe qui retire
  quelque chose **à tout le monde** — la planche vit dans mon fragment, et
  sa disparition se lit chez chacun. Vérifié dans le dépôt : présente après
  la plantation, absente après l'arrachage.
- **Les titres-liens ne faisaient que 20 px.** Un lien est une cible : il
  occupe maintenant toute la hauteur de sa ligne. Troisième fois que la
  mesure des cibles attrape ce que l'œil laissait passer — elle fait
  désormais partie de chaque passe, pas d'une revue de fin.
- Le « + » du panneau : 44 × 44, centré à 0,01 px près horizontalement,
  0,5 px verticalement — l'arrondi des métriques de la police, pas un
  décalage.

### 12 octobre 2026 — parler, surligner, chroniquer

- **Un seul commit pour deux gestes, dans l'interface réelle.** Surligner
  puis prendre la parole dans la foulée : le SHA du fragment passe de
  `…00000c` à `…00000d`, pas à `…00000e`. Le regroupement n'était prouvé que
  par l'essai ; il l'est maintenant par l'usage.
- **Citer une œuvre ne propose que ce que l'Ordre fréquente.** On cite ce
  dont on parle ensemble, pas le catalogue entier — et la recherche
  remplace la liste déroulante, comme partout.
- **Les commandes du fil sont visibles et font 44 px**, avec des marges
  négatives qui rendent à la ligne sa hauteur : *la densité est une affaire
  de mise en page, pas de taille de cible.* Deux cibles de la passe
  précédente — la citation (17 px) et le « en réponse à » (34 px) —
  n'avaient jamais été mesurées. **Une vue en lecture seule a aussi des
  cibles** ; je ne mesurais que celles que je venais d'ajouter.
- ⚠️ **Une animation figée garde sa première image.** Fenêtre masquée :
  l'entrée du volet restait à son image de départ — **opacité zéro**,
  décalée de 20 px. Le fantôme avait son filet ; l'entrée n'en avait pas.
  La Scène et les volets **annulent leur animation d'entrée après sa
  durée** : si elle a fini, ça ne change rien ; si elle est figée, l'élément
  retrouve son état de repos. C'est la cinquième rencontre avec ce piège,
  et la première côté *entrée* — *un rappel d'animation anime, il ne met
  jamais en place* vaut dans les deux sens.
- **Une chronique se réécrit, elle ne s'empile pas** : une par personne et
  par œuvre, et son formulaire ne s'ouvre que si on le demande — on n'écrit
  pas un jugement en passant.

### 11 octobre 2026 — inscrire, et une garde de plus

- **Un bloc n'a qu'un point de contact, et c'est maintenant vérifié.** La
  coque importait un composant *à l'intérieur* d'un bloc. Le vérificateur
  interdit désormais tout ce qui n'est pas `features/<x>/index.ts` — et je
  l'ai **mis en défaut exprès** avant de le garder : une garde qu'on n'a pas
  vue refuser quelque chose n'est pas une garde, c'est une intention.
- **Changer la nature d'une œuvre vide ses genres.** Un genre de jeu ne veut
  rien dire pour un livre, et le garder en silence serait pire que le
  perdre. Vérifié : 44 étiquettes en Forme/Thème pour un jeu, 24 en
  Genre/Forme pour un livre, et la sélection repart à zéro.
- **Le corpus ne propose pas ce qu'on a déjà.** Chercher « dune » ne rend
  rien pour Nathan — il tient les deux. L'écran le dit au lieu de laisser
  croire à une absence.
- **Et il dit aussi ce qui n'existe pas encore** : la recherche IGDB et TMDb
  n'est pas branchée, donc une œuvre nouvelle passe par « hors du fonds ».
  *Mieux vaut un manque annoncé qu'un champ qui fait semblant de chercher.*
- Vérifié de bout en bout : inscrire *Hades* depuis la barre, le retrouver
  « Convoité » sur sa fiche parmi six témoins, et le relire dans le fragment
  du dépôt trois secondes plus tard.

### 11 octobre 2026 — l'écriture

- **Une écriture est une intention, pas un instantané.** Le scribe garde des
  fonctions `(shard) => void`, pas l'état qu'elles produisent. C'est
  exactement ce qui permet, sur un conflit, de **relire et rejouer** :
  renvoyer un instantané périmé écraserait l'écriture de l'autre appareil.
  **Éprouvé** : un essai provoque une écriture concurrente juste avant la
  nôtre, et vérifie que les deux survivent. Invariants 33 et 34 ajoutés.
- **Une rafale fait un seul commit** — quatre intentions, un commit, vérifié
  en comptant les appels. Et le message dit ce qui s'est passé : « pose un
  checkpoint », jamais « mise à jour ».
- **Ce qui n'est pas parti n'est pas perdu** : l'intention retourne en tête
  de file et part au coup suivant. **Ce qui arrive pendant l'envoi appartient
  au tour suivant** — ni perdu, ni envoyé deux fois.
- ⚠️ **L'alias `$` n'existait que pour Vite.** Node ne le connaissait pas, et
  il ne l'a dit que le jour où un module du noyau a importé une **valeur** de
  la plateforme et non un type — les types étant effacés, le chemin n'était
  jamais résolu. Les alias passent en `#`, que le champ `imports` de
  `package.json` fait comprendre à Node, à Vite et à TypeScript à la fois.
  *Un chemin qui ne marche que dans un outil est une dette qui attend le
  mauvais moment.*
- ⚠️ **Mon essai bouclait, pas le code.** Le leurre qui simulait « quelqu'un
  écrit pendant l'envoi » repoussait une intention **à chaque** écriture,
  donc indéfiniment. Les six essais passaient ; c'est le processus qui ne
  rendait pas la main. *Quand un essai ne finit pas, soupçonner l'essai.*
- **La preuve de bout en bout** : noter VIII sur Elden Ring fait passer la
  moyenne du groupe de 7,7 à 7,8 **à l'instant** — rien n'est stocké. Et la
  relecture du fragment dans le dépôt montre les trois gestes arrivés :
  statut, note, et le quatrième checkpoint.

### 11 octobre 2026 — les Quêtes et la Grande Loge

- ⚠️ **Deux intentions se disputaient le même défilement.** « Le fil s'ouvre
  en bas » et « rouvrir ramène à l'endroit exact d'où l'on vient » visaient
  tous deux `scrollTop`, et le défaut écrasait l'explicite : le retour visait
  juste, puis sautait en fin de fil sans que rien ne le dise. **L'intention
  explicite doit gagner sur le défaut** — un drapeau le dit maintenant.
  Mesuré : les trois surlignés reviennent à 143 px, soit exactement le tiers
  de la vue, à chaque fois.
- **`offsetTop` se mesure depuis le premier ancêtre positionné.** Le fil
  n'était pas positionné, donc le retour partait de 400 px trop haut. Et
  c'est bien `offsetTop` qu'il faut, pas `getBoundingClientRect` : le volet
  est peut-être en train de glisser, et une mesure prise pendant une
  transformation inclut la transformation (invariant 18).
- **La chambre a repris ses cinq volets** — chambre, annales, magnum opus,
  quêtes, Grande Loge — à glissement latéral. Le compteur de la Loge affiche
  **zéro** pour qui n'est pas de l'Ordre : on ne révèle pas même le nombre.
- **La porte close vouvoie**, seule de toute l'application. Vérifié depuis un
  Mage dans la Loge des Guerriers.
- **L'inclinaison d'une planche est tirée de son nom**, pas du hasard : une
  pancarte doit pencher pareil à chaque ouverture, sinon ce n'est plus la
  même pancarte.
- Vérifié : 12 messages, 7 séparateurs de jour, 1 groupement, 3 surlignés,
  le fil ouvert en bas ; VII planches, I accomplie, IV en chemin.

### 11 octobre 2026 — la feuille, et la ligne de caractère

- **La saillance tient ses promesses.** Sept feuilles, sept lignes
  différentes : *« N'a jamais rien lâché, écrit sur presque tout, CCI heures
  au compteur »*, *« IV œuvres laissées en chemin, CDIX heures au compteur,
  juge plus durement que l'Ordre »*, *« Surtout des jeux, se lasse plus
  souvent que les autres »*. C'était tout l'enjeu : réciter les mêmes trois
  traits pour tout le monde aurait produit des feuilles interchangeables.
  **Vérifié sur sept personnes, pas sur une.**
- **Les volets glissent, ils ne zooment pas.** Un composant de noyau
  (`Panes`) porte le geste une fois pour toutes, avec le même filet que la
  Scène : clone du volet sortant, minuteur qui l'emporte. Mesuré : un seul
  volet après trois changements.
- **Le HMR a encore menti.** Deuxième fois dans la même soirée : la feuille
  rendait le Répertoire. Recharger avant de conclure est désormais un réflexe
  — et c'est moins cher qu'une demi-heure à débuguer du code juste.
- La feuille **porte la trame de son Ordre à présence réduite** (45 %) :
  touchée par lui, sans être la chambre.

### 11 octobre 2026 — la fiche, les Ordres, et les cinq trames

- **La trame est reprise telle quelle**, à la typographie des signatures près.
  Ce n'est pas de la paresse : *un générateur ne se juge qu'à l'image*, et
  celle-ci a été jugée — la réécrire « plus proprement » reviendrait à la
  rejuger sans la regarder.
- **Le type a imposé de déclarer la profondeur route par route.** En ajoutant
  `depth` au type `Route`, le vérificateur a refusé les cinq routes
  existantes jusqu'à ce que chacune dise à quelle profondeur elle se trouve.
  *Une route qui ne sait pas sa profondeur produit un geste au hasard, donc un
  geste qui ne veut plus rien dire.*
- **La trame ne couvrait que le premier écran.** `height:100%` sur la chambre
  arrêtait le canevas au bas de la fenêtre, et la page continuait sur du
  papier nu dès qu'on défilait. `min-height` règle ça.
- ⚠️ **L'encre ne se mesure pas dans une fenêtre masquée.** Le volet du
  navigateur ne composait pas : `document.hidden` vrai, aucune image, donc
  zéro pixel dessiné — et ce n'était **pas** un défaut du moteur. Mesure
  refaite en remplaçant l'horloge d'animation par une minuterie, le temps de
  quelques images : **mage 0,25 % · ranger 0,72 % · guerrier 1,19 % ·
  soigneur 1,71 % · barde 2,13 %.** Le guerrier retombe exactement sur le
  1,2 % visé. *Encore la même règle qu'au 304 : on mesure dans la condition
  où l'on sera, et quand on ne peut pas, on le dit.*
- **Le HMR m'a menti pendant dix minutes.** La chambre rendait l'accueil
  parce que le module de routes avait été remplacé à chaud sans que la coque
  s'en aperçoive. **Un état incohérent après remplacement à chaud n'est pas un
  bug du code** — recharger avant de conclure fait partie de la mesure.
- La fiche porte la **couleur de la jaquette en ambiance**, qui s'éteint avant
  les chiffres, et **la forme du désaccord** : un trait par jugement sur une
  réglette de I à X, aucune couleur. Vérifié sur Elden Ring — V témoins,
  moyenne 7,7, discorde V, deux chroniques dépliables.

### 11 octobre 2026 — la coque et les deux premières vues

- **Le jeu de données du prototype est repris tel quel**, extrait en évaluant
  sa région de données sous Node plutôt qu'en le recopiant à la main : douze
  fragments, trente-quatre œuvres. Et il est **chargé à la demande** — 43 Ko
  qui n'ont rien à faire dans le binaire livré, donc un morceau séparé que la
  coque ne demande jamais.
- ⚠️ **Les couches s'empilaient sans se retirer, pour la quatrième fois.**
  Les transitions de Svelte sont pilotées par l'horloge d'animation, et dans
  un onglet qui ne rend pas, l'horloge s'arrête : la couche sortante n'était
  jamais retirée. Trois, puis quatre, en silence. *Un rappel d'animation
  anime, il ne met jamais en place.* La Scène clone désormais la couche qui
  part, l'anime, et **un minuteur la retire quoi qu'il arrive**. Mesuré :
  une seule couche après cinq navigations.
  **La leçon était déjà écrite dans la note mère — je l'ai quand même
  rejouée en changeant d'outil.** Un invariant ne se transporte pas tout
  seul d'une technique à l'autre.
- **`forward` est décidé par la coque**, qui seule connaît la route qu'on
  quitte. Déduit dans un effet, il avait un cran de retard : la première
  bascule annonçait la profondeur de la précédente.
- **Une règle `:global` perd contre un style scopé, en silence.** La barre
  latérale refusait de disparaître en étroit parce que la coque la masquait
  de l'extérieur — `.rail.svelte-xxx` l'emporte sur `:global(.rail)`. La
  règle est repartie dans le composant qui la connaît, ce qui est de toute
  façon où elle devait être (invariant 23).
- **Six cibles sous 44 px**, trouvées par la mesure et non à l'œil : le
  sigle, la bascule, les rangées, le chevron. Corrigées en gardant le cadre
  visible petit et en agrandissant **la zone qu'on vise**, avec des marges
  négatives pour que la mise en page ne s'écarte pas (invariant 20).
- Vérifié : une seule couche après cinq navigations, aucun débordement
  horizontal à 375 px, la barre absente en étroit, quatre entrées en bas,
  aucune erreur de console.

### 11 octobre 2026 — le noyau

- **Le noyau est une fonction pure de ce qu'on lui donne**, et c'est ce qui
  rend les essais possibles : aucun sélecteur ne lit de variable globale, tous
  prennent le monde en premier argument. Dix-sept essais tournent **sans
  réseau, sans jeton, sans navigateur**, en 170 ms.
- **Les alias se collectent avant tout le reste.** Ils changent la lecture de
  *tous* les fragments, y compris de ceux lus avant eux — les ramasser au fil
  de l'eau aurait donné un repli dépendant de l'ordre des fichiers.
- **Les essais disent les règles, pas le code.** « une parenté déclarée à
  contresens des deux côtés n'existe pas non plus », « renoncer compte comme
  entrepris », « le magnum opus somme des déclarations, pas des notes » : un
  essai qui nomme l'invariant se relit dans six mois, un essai qui nomme la
  fonction ne se relit pas.
- **Node refuse les propriétés de paramètre** (`constructor(public x)`) : il
  efface les types, il ne les compile pas. Contrainte acceptée volontiers —
  **ce qui tourne sous Node tel quel est ce qui ne dépend d'aucune
  transformation**, donc pas d'enums, pas de namespaces, pas de décorateurs.
  Et les imports relatifs portent désormais leur extension, ce qui est de
  toute façon la règle des modules ES.
- **Un fragment cassé n'emporte pas les autres** — la propriété qu'achète « un
  fichier par personne ». Elle est maintenant essayée : trois fragments dont
  un JSON illisible, deux personnes affichées, un ennui rendu à l'appelant.
  *Une propriété qu'on n'essaie pas n'est pas achetée.*
- **La deuxième ouverture ne retélécharge rien**, et le troisième essai le
  montre finement : un seul fragment modifié, un seul blob relu.
- Les migrations sont **montantes seulement**, et un fragment plus récent que
  l'application **se refuse** au lieu de s'afficher amputé. C'est à ça que
  servira le bandeau « nouvelle version disponible ».

### 11 octobre 2026 — la plateforme réelle, et une correction de correction

- **Le jeton ne traverse jamais le pont.** L'interface `Session` n'a pas de
  `get()` : le device flow l'écrit côté Rust, le client GitHub le lit côté
  Rust, et l'interface web ne peut que demander *s'il y en a un*. **Une
  méthode qui rend un secret finit par être appelée** — mieux vaut qu'elle
  n'existe pas.
- **Une commande générique, mais pas un passe-partout.** `gh(method, path)`
  concatène `path` à `https://api.github.com` : la page ne peut désigner aucun
  autre hôte. Si elle était compromise un jour, elle ne pourrait pas faire
  voyager le jeton ailleurs.
- **Le cache est adressé par le contenu.** Un blob Git ne change jamais de
  SHA : ce cache n'a donc **aucune politique d'invalidation à tenir**, et
  c'est la seule sorte de cache qui ne peut pas mentir. Les clés sont
  vérifiées comme hexadécimales avant de devenir des noms de fichiers.
- **Un faux ment sur la source, jamais sur la forme.** Le faux stockage
  déclenche son conflit par comparaison de SHA, comme GitHub.
- **La requête HTTP a été séparée de la commande Tauri** pour être essayable
  sans coque. Quatre essais tournent maintenant contre le vrai dépôt :
  l'arbre, le 409 sur SHA périmé (provoqué puis nettoyé), le rôle dans
  l'organisation, et le quota.
- ⚠️ **Et c'est le quatrième qui a corrigé une correction.** Le spike avait
  mesuré qu'un `304` décompte du quota ; **authentifié, il ne décompte pas**
  — trois relectures, 4 976 → 4 976 → 4 976. Le spike mesurait **sans jeton**,
  faute d'en avoir un, et il avait lui-même noté « à refaire authentifié ».
  J'avais propagé le chiffre dans trois documents sans honorer la réserve.
  **On mesure dans la condition où l'on sera, pas dans celle qui se mesure
  facilement** — un chiffre juste pris dans le mauvais régime est pire qu'une
  ignorance, parce qu'on s'y appuie. Corrigé dans la note mère, la spec v17 et
  le README du spike, et **tenu par un essai** pour que la prochaine
  contradiction vienne d'une machine.

### 11 octobre 2026 — le portage commence

- **Le dépôt public existe** — `checkpoint-circlecodex/checkpoint`. Invariants,
  spec, parcours, prototype, journal, banc d'essai. ⚠️ **Sans licence** :
  Nathan a tranché, le code est visible et tous droits réservés. Le README le
  dit franchement plutôt que d'écrire « open source » en mentant.
- **Rust n'était dans aucun PATH.** Les shims de rustup sont keg-only chez
  Homebrew. Une ligne ajoutée à `~/.zshrc`.
- **Le point d'entrée a dû déménager.** `src/main.ts` à la racine de `src/`
  n'appartient à aucune couche, et le vérificateur l'a refusé à la première
  exécution. Il est passé dans `src/shell/` — ce qui est juste : **c'est la
  coque qui monte la coque.** *Un vérificateur qui proteste dès le premier
  fichier n'est pas trop strict, il rend un avis.*
- **La règle de lint ne vaut que si une machine la lance.** L'invariant 11 dit
  « vérifié par une règle de lint, pas par la discipline » — or un script
  qu'on lance quand on y pense **est** de la discipline. D'où la CI dès
  l'étape 1, verte en 10 s, et `npm run build` qui passe par le
  vérificateur.
- **Pas d'ESLint.** La règle tient en trente lignes de Node sans dépendance,
  et son message d'erreur peut dire *pourquoi* la dépendance est interdite —
  ce qu'une règle générique ne sait pas faire.
- **Deux réglages posés tout de suite parce qu'ils coûtent cher après coup** :
  l'identifiant de bundle réel (`com.circlecodex.checkpoint`, le gabarit met
  `com.tauri.dev` et le bundler le refuse) et la CSP.
- **Le faux stockage simule le conflit comme GitHub le rend** : par comparaison
  de SHA, pas de contenu. Un faux qui ment sur la forme de l'échec ne sert à
  rien.
- Vérifié : construction en 189 ms, Rust en 49 s, `svelte-check` à zéro, et la
  chaîne coque → noyau → plateforme lit un fragment de bout en bout.

### 11 octobre 2026 — le spike est fini, six sur six

- **Les trois vérifications qui demandaient un jeton sont passées.** Device
  flow : jeton obtenu sans copier-coller, et **il n'expire pas** — rien à
  rafraîchir, puisque la case *Expire user authorization tokens* a été laissée
  décochée. Écriture acceptée, puis **409 Conflict sur un SHA périmé** : le
  signal de relire, fusionner et réessayer existe bel et bien — et comme un
  seul écrivain touche chaque fichier, il ne devrait jamais se déclencher.
  Adhésion lisible (*rôle « admin », état « active »*) : **un administrateur
  pourra valider depuis l'application**, ce qui fonde le guichet du Greffe.
  Issue ouverte sur le dépôt public : **le seul geste d'un extérieur, et il
  suffit.**
- **L'infrastructure existe** : organisation `checkpoint-circlecodex`,
  `tracker-data` privé, `checkpoint` public à issues, application GitHub
  installée sur les deux dépôts.
- **Nettoyé derrière** : `data/_spike.json` retiré du dépôt de données, issue
  de test refermée. Le jeton reste dans `spike/.token` en 600 — à effacer au
  portage, l'application réelle le rangera dans le trousseau système
  (invariant 15).
- **Ce que ça clôt :** D5 (la coque native est nécessaire, pas confortable),
  D4, D7, et l'invariant 27 dans sa version corrigée. **Plus aucune question
  d'architecture n'est ouverte.** `spike/` a servi — il ne doit pas devenir du
  code de production.
- **Et le cahier des charges UX n'arrivera pas** (décidé le 11 octobre). La
  note mère disait de ne rien figer avant de l'avoir reçu, pendant qu'on
  figeait à chaque passe : la règle était morte avant d'être réécrite.
  **Le prototype fait foi.** Révision marquée, pas supprimée. Une question
  ouverte s'est refermée au passage — la barre basse en étroit, tranchée par
  l'usage.

### 11 octobre 2026 — le Greffe

- **Deux problèmes qu'on prenait pour un.** « Des fonctions qui ne doivent pas
  apparaître au premier plan » recouvre **ce qui demande une autorité** et
  **ce qui demande seulement de la discrétion**. *Une autorité n'est pas une
  discrétion* : les réunir donnerait un panneau où une préférence d'affichage
  côtoie une exclusion. L'autorité va au Greffe, la discrétion au pied de sa
  propre feuille.
- **La porte n'est pas cachée, elle est absente.** `only:() => isSteward(ME)`
  retire l'entrée de la barre au lieu de la griser. Un geste secret aurait été
  pire : moins découvrable qu'un survol, que l'invariant 19 interdit déjà.
  Qui tape l'adresse sans la charge lit *« ce n'est pas une pièce fermée,
  c'est une charge »* — et le banc d'essai permet de rendre la charge pour
  **voir l'absence** sous ses yeux, la section « Tenir » disparaissant de la
  barre sans rechargement.
- **Fondre un doublon ne peut pas être une réécriture**, et c'est l'invariant 1
  qui l'impose : le fragment d'un autre est hors d'atteinte. D'où l'alias
  déclaré chez soi et replié **dans `merge()`** — la même grammaire que les
  favoris, les surlignages et les quêtes. **Vérifié à la lecture et non sur
  parole** : l'alias semé `b-nomrose → b-rose` laisse `b-nomrose` à zéro
  inscription, et Inès paraît parmi les lecteurs du *Nom de la rose*, dont elle
  n'avait jamais tenu l'identifiant.
- **Le cas limite valait d'être écrit** : si une même personne tenait les deux
  entrées d'un doublon, le repli lui en créait deux. `merge()` n'en garde que
  la plus récente.
- **Les doublons se suggèrent, ils ne se déclarent pas.** L'application
  rapproche les titres normalisés ; le greffier tranche — *un livre et son film
  portent le même nom, et seule une personne le sait.* Le survivant est
  l'entrée qui n'a pas été inscrite à la main : elle porte un identifiant de
  source, et l'identité d'une œuvre est son identifiant (invariant 9).
- **Le parrain du vasistas est un nom tapé, pas un identifiant** — donc il peut
  ne désigner personne. Trois cas à l'écran et pas un de moins : il se résout,
  il ne se résout pas (*« aucun membre de ce nom »*), ou la case était vide.
  **C'est exactement là qu'un greffier sert à quelque chose** ; sans ces trois
  cas, le guichet n'aurait été qu'un bouton.
- **Et puisque personne n'est averti de rien**, une demande qui attend paraît
  dans l'encart du guetteur — pour qui tient la charge seulement. C'est le seul
  moment où quelqu'un regarde quelque chose. Vérifié : la ligne existe pour le
  greffier, disparaît pour le membre, et ne compte que les coups frappés depuis
  la dernière visite.
- **Une cible de 30 px attrapée par la mesure.** La porte étroite, dans
  l'en-tête, faisait 30 px parce que j'avais dessiné un cadre autour du glyphe.
  Invariant 20 : 44 px comme le visage voisin. **Le cadre d'un pictogramme ne
  doit pas rétrécir la zone qu'on vise.**

### 11 octobre 2026 — l'atelier

- **Trois tuiles fondues en une.** Frapper à la porte, attendre et se composer
  un visage ne sont pas trois étapes : c'est un seul geste — on demande à
  entrer, et on se présente pendant qu'on attend. Les séparer faisait trois
  clics pour une seule idée. Six tuiles deviennent **quatre**.
- **Ce qui fait une création de personnage, c'est le résultat sous les yeux.**
  Le portrait reste collé en haut à gauche pendant qu'on remplit à droite, et
  il se met à jour à chaque geste. Sans ça, c'est un formulaire avec des
  pastilles de couleur.
- **Les repeintes ne perdent rien** : chaque champ est rangé dans le brouillon
  à la frappe, donc cliquer un fond ou un signe redessine sans effacer ce qui
  est écrit. Vérifié sur les quatre champs.
- **Le mot d'accueil est porté par l'onde, pas par un écran.** « BIENVENUE DANS
  LE CODEX » naît avec elle et meurt avec elle — l'onde est passée de 1,36 s à
  1,9 s pour lui laisser le temps d'être lu. *Un dernier écran de plus aurait
  ajouté un clic ; un mot dans la transition n'en ajoute aucun.*
- **Il nommait la personne, il ne la nomme plus** (demande de Nathan, « c'est
  cringe »). Le signe avant-coureur était dans le code : il fallait un repli
  quand le prénom manquait, et ce repli était « âme nouvelle ». **Quand une
  adresse a besoin d'une tournure de secours, c'est qu'elle n'avait pas lieu
  d'être.** Reste une inscription en capitales, centrée — avec un
  `text-indent` égal à l'interlettrage pour rattraper la gouttière finale, le
  même défaut que l'invariant 30 : mesuré à 0,00 px d'écart, sur une ligne à
  1 024 px comme à 375 px.
- **Une erreur de portée attrapée par la console** : le mot lisait `d.firstName`
  alors que `d` n'existe que dans le rendu de la tuile — dans le gestionnaire,
  c'est `onbDraft`. L'exception avalait aussi la navigation qui suivait.

### 11 octobre 2026 — les deux régimes de l'accueil

- **Toute la page traitait l'information de la même façon.** Or il y a deux
  choses : au-dessus, ce qu'on vous apporte — une chronique, un hasard, ce qui
  a bougé ; en dessous, l'instrument qu'on vient consulter. Séparées par **une
  feuille posée sur le bureau** : un ton plus claire, fermée par un filet
  d'encre pleine largeur, la cité s'y estompant par le bas.
- **J'ai écarté la trame animée et floutée que Nathan envisageait**, et la
  raison était déjà écrite : *le flou est un événement, jamais un état* — un
  fond flou permanent en ferait un décor. Et une ambiance en mouvement hors
  d'une chambre diluerait la seule chose que le mouvement y signifie. *Quand une
  idée séduisante se heurte à une règle qu'on a posée soi-même, c'est la règle
  qui a raison — sinon elle ne servait à rien.*
- **Un seul ton d'écart suffit, parce que la frontière est nette.** Pris
  isolément, un ton contre l'autre ne se voit presque pas ; au passage de l'un
  à l'autre, sous un filet d'encre, il se voit parfaitement. *On sépare comme le
  ferait du papier, pas comme le ferait un écran.*
- **Puis la feuille s'est mise à respirer**, à la demande de Nathan : trois
  halos très larges qui dérivent dessous sur vingt-six secondes. **Ce n'est pas
  une trame**, et c'est ce qui l'autorise là où j'avais refusé une animation de
  fond : rien n'y a de forme, rien ne la traverse, c'est le papier qui prend la
  lumière. *La distinction n'est pas « animé ou non », elle est « y a-t-il une
  figure à lire ».*
- **L'amplitude s'est réglée par le calcul, pas à l'œil** : le premier essai
  faisait onduler de deux ou trois unités, invisible. En abaissant le fond et
  en élargissant la course d'opacité (0,40 → 1), la MOYENNE reste plus claire
  qu'avant tout en rendant le souffle perceptible.

### 11 octobre 2026 — les catégories, au bon endroit cette fois

- **Je m'étais trompé d'écran, et Nathan a dû le montrer en capture.** Le
  sélecteur de catégories était dans l'inscription — la deuxième étape — alors
  qu'on décrit une œuvre dans la première. J'avais vérifié le mauvais
  formulaire et conclu que tout allait bien. *Quand quelqu'un dit qu'une chose
  n'existe pas, il regarde un écran précis : il faut aller voir CET écran.*
- **Les catégories suivent la nature choisie**, et changer de nature les vide :
  un genre de jeu ne veut rien dire pour un livre, et le garder en silence
  serait pire que le perdre. Le sélecteur est promu en fonction partagée —
  deuxième usage, comme le veut la règle.
- **Huit jaquettes engendrées** pour que la teinte du haut de fiche ait des
  pages où se montrer : Elden Ring, Outer Wilds, Dune, Nos vies d'avant,
  Severance, Arcane, La Horde du Contrevent, Piranèse. ⚠️ *Échafaudage de
  prototype — rien n'est jamais engendré dans l'application.* Effet secondaire
  utile : la grille de jaquettes montre enfin l'exception de couleur.
- **Citer une œuvre dans la Loge se cherche**, au lieu d'une liste déroulante
  de tout le corpus de l'Ordre. Et le choix ne met à jour **que ses résultats** :
  le message en cours d'écriture reste intact — vérifié.
- **Le menu de mention débordait en étroit** ; il y prend toute la largeur.

### 11 octobre 2026 — les catégories, et la couleur d'une jaquette

- **Le sélecteur de catégories existait, mais il était invisible.** Enfermé dans
  une boîte de 132 px à défilement interne, sans libellés, au milieu d'un
  formulaire long : Nathan a conclu qu'on ne pouvait pas les renseigner, et il
  avait raison de le conclure. *Un choix qu'on ne voit pas n'existe pas.*
- **Les listes reprennent désormais le vocabulaire des sources** — IGDB pour les
  jeux, TMDb pour les films et les séries. L'argument n'est pas l'exhaustivité
  mais le **mappage** : c'est de là que viendra l'identité des œuvres, donc les
  genres arriveront traduits d'avance. Les livres n'ont aucune autorité unique ;
  leur liste est la nôtre, et c'est écrit comme tel.
- **IGDB sépare la forme du sujet, et cette distinction était exactement celle
  de Nathan** — « FPS, simulateur » d'un côté, « romance, horreur » de l'autre.
  Reprise telle quelle pour les jeux.
- **Et les séries n'ont pas les genres des films** : TMDb y regroupe « Action &
  aventure » et « Science-fiction & fantastique ». Les copier d'un média à
  l'autre aurait produit des catégories qui n'existent pas chez la source.
- **Une jaquette donne sa couleur au haut de sa fiche**, floutée et très diluée,
  et **s'éteint avant les chiffres**. Premier réglage trop généreux : la teinte
  tenait jusqu'aux statistiques et les étiquettes décrochaient. Au-delà du titre,
  la page est un instrument — un instrument ne se colore pas.

### 11 octobre 2026 — la feuille au premier coup d'œil

- **« En cours » prenait cinq lignes par œuvre, il en prend deux.** Titre et
  commandes sur la même ligne, dernier checkpoint tronqué sur l'autre. Le bloc
  passe de ~500 px à 213 px pour trois œuvres. *C'est un tableau de bord, pas
  une lecture : on vient y agir.*
- **Une feuille doit dire QUI on lit.** Sous le nom, une ligne engendrée des
  faits — et le premier jet les récitait dans le même ordre pour tout le monde
  (« Surtout jeux, juge comme l'ensemble… » huit fois de suite). Chaque trait
  porte maintenant une **saillance**, son écart à la norme, et seuls les plus
  marquants sortent : huit personnes, huit lignes différentes. *Un portrait
  engendré ne vaut que s'il distingue.*
- **Pas de pronom dans cette ligne** : on ne connaît pas le genre, et on n'a
  aucune raison de le demander. Les tournures télégraphiques s'en passent.
- **Le magnum opus monte dans l'en-tête**, en jaquette, à droite du nom. C'est
  la chose la plus personnelle qu'on puisse montrer d'emblée.
- **Reprendre ce qu'on a mis de côté était impossible sans détour.** Le panneau
  d'accès rapide montre désormais les deux listes — ce qu'on mène, et ce qu'on
  a suspendu avec de quoi le relancer. *Une action facile à faire doit être
  aussi facile à défaire.*
- ⚠️ **Troisième bug masqué par l'enveloppe des Artifacts.** Après le charset
  et le viewport : `[hidden]{display:none !important}`. Sans lui, `hidden` ne
  tient pas face à `.lv-form{display:flex}` et **tous les formulaires de
  checkpoint s'affichaient ouverts**. Servir le fichier hors Artifact fait
  désormais partie des contrôles.
- **Le « + » du checkpoint n'était pas centré dans son carré**, et pour deux
  raisons cumulées : l'interlettrage hérité de la règle de groupe posait une
  gouttière *après* le glyphe, et le `＋` pleine chasse porte ses propres
  approches. Centrage explicite, interlettrage à zéro, chasse normale —
  **vérifié par la mesure** (écart entre le centre du bouton et celui de son
  contenu : 0,00 px dans les deux axes, aux deux largeurs). *Un alignement se
  mesure, il ne se regarde pas.* Invariant 30.
- **Et une grille qui dessinait ses cases vides** : `gap:1px` sur fond gris
  trace aussi les cellules absentes — six traits sur quatre colonnes laissaient
  un bloc gris orphelin. Les filets passent sur les cases, le conteneur reste
  papier.

### 11 octobre 2026 — l'encart du guetteur, replacé

- **Trois nouvelles sur une seule ligne, on n'en lit aucune.** Une annonce par
  ligne, séparées d'un filet, avec un **petit fanion en guise de tiret** — il
  signale l'annonce sans peser, et il porte la couleur de l'Ordre comme le
  reste de l'encart.
- **Sa place n'est pas en tête de page.** On n'ouvre pas l'application pour des
  annonces : il descend **entre Le Sort et Les inscriptions**, juste avant le
  fil, là où le regard va de toute façon. Plus dense aussi — trois lignes en
  115 px au lieu d'un bloc qui ouvrait la page.

### 11 octobre 2026 — la passe de texte

- **Les six principes étaient écrits de l'intérieur.** Fragment, palier,
  synchronisation, planche, registre : aucun de ces mots ne veut dire quoi que
  ce soit avant d'avoir servi. Nathan : *« c'est du gibberish la plupart du
  temps »*. Réécrits en français de tout le monde, avec des exemples plutôt que
  des définitions — « finir ces sept livres, commencer ces quatre jeux » dit en
  une ligne ce que « un palier atteint sur un groupe d'œuvres » n'expliquait
  pas. **Un texte d'accueil se juge sur quelqu'un qui n'a jamais ouvert
  l'application, jamais sur celui qui l'a écrite.**
- **Et il y en a cinq, plus six.** Le sixième — « rien n'est poussé » — disait
  déjà ce que l'écran d'attente dit en toutes lettres. Rien de perdu.
- **Une contradiction en haut de la première page** : « aucun compte à créer »,
  puis « il faut un compte GitHub ». Corrigé en distinguant *chez nous* et
  *chez eux* : aucun compte à créer **ici**, l'entrée se fait avec un compte
  GitHub.
- **La porte a trouvé son ton** : « Vous frappez à la porte », et *par le
  vasistas, deux yeux vous fixent et vous demandent* — qui vous connaît, et à
  quel titre (ami, père, enfant). La parenté entre donc dans l'application
  **dès la demande d'entrée**, avant même d'avoir un profil.
- **Le pseudo devient une particule de maison.** `handle` existait déjà dans le
  modèle ; on ne change pas le champ, on change ce qu'on en demande — non plus
  un nom de joueur, mais de quoi distinguer trois Thomas sans exiger de
  patronyme. *Le meilleur changement de modèle est celui qu'on n'a pas à faire.*
- **Le Discord ne se demande qu'une fois**, à l'attente, là où il sert.

### 11 octobre 2026 — l'ouverture et le lavis

- **Un nom qui se fond ne dit rien.** Celui-ci tombe **lettre à lettre**, avec
  un léger dépassement à l'arrivée, puis le mot recule et un trait se tire
  dessous. Dix lettres, soixante-deux millisecondes d'écart : c'est la cascade
  qui fait l'effet, pas la durée.
- **Des étoiles filantes, à l'encre.** Pas la trame d'un Ordre — on n'en a pas
  encore quand on ouvre l'application pour la première fois. Poussières fixes
  qui respirent, filantes en diagonale, le tout masqué vers le bas pour ne pas
  concurrencer la tuile.
- **L'entrée finit sur une onde de la couleur de son Ordre** — exactement celle
  des pastilles, en plus ample (×23 au lieu de ×13) et plus lente (1,36 s au
  lieu de 0,64). C'est le seul écran de la séquence qui porte une couleur, et
  c'est ce qui en fait un aboutissement plutôt qu'un dernier formulaire.
- **Un volet de couleur opaque avait été essayé d'abord, et écarté.** Il
  couvrait l'écran au lieu de le traverser. *Couvrir, c'est fermer une porte ;
  traverser, c'est en ouvrir une.* L'onde reste translucide d'un bout à l'autre
  et l'on voit l'accueil se former au travers — plus doux, et plus juste.
- **L'onde ne bloque jamais rien** : la fermeture et la navigation sont sur
  minuterie, pas sur la fin de l'animation. Dans un onglet qui ne compose pas,
  l'animation gèle et l'entrée se fait quand même — la dégradation était prévue
  cette fois, pas découverte.

### 11 octobre 2026 — le défilé des principes

- **Un moment à part ne peut pas tenir dans la tuile.** Le défilé en est sorti :
  plus large qu'elle, avec son en-tête, ses flèches et sa règle de progression.
  C'est à la largeur qu'on voit que c'est un moment et non un paragraphe de plus.
- **Six vignettes dessinées dans la langue de l'application** — plates, au
  trait, monochromes, sauf les cinq disques d'Ordre qui sont l'exception déjà
  consentie. Un principe illustré se retient ; un principe écrit se saute.
- **Les pastilles d'Ordre de l'entrée sont exactement celles de la racine** :
  pleine couleur, halo, dérive. On les verra tous les jours — autant les
  reconnaître dès le premier soir. Choisir déclenche la même rafale de couleur
  qu'à l'entrée d'une chambre, sans la navigation qui va avec.
- **Quatre-vingt-deux emblèmes, en quatre familles**, et seize fonds. Assez pour
  que personne ne tombe sur celui du voisin.
- **La cité du Registre passe en contrebas de l'onboarding** : on entre dans un
  endroit, pas dans un formulaire.
- **Changer d'étape glisse latéralement** — la grammaire de l'application :
  même profondeur, donc pas de zoom.
- ⚠️ **Deux pièges d'exécution, et le second est une faute de méthode.**
  *(1)* La scène est une colonne flex à hauteur contrainte : dès que le défilé
  est arrivé, **la tuile s'est fait écraser à 65 px**, contenu intact mais
  rogné. Un élément de colonne flex rétrécit par défaut ; il faut le lui
  interdire. *(2)* Une découpe entre deux index a rendu un fragment plus gros
  que prévu — **et j'ai élargi la borne au lieu de me demander pourquoi**. Le
  fragment débordait sur deux sections voisines. La garde suivante l'a attrapé,
  mais la note mère le disait déjà : *vérifier la taille retirée ET recompter
  les symboles.* Élargir une borne qui proteste, c'est désarmer le garde-fou.

### 11 octobre 2026 — le guetteur, et l'entrée dans le groupe

- **Une ligne, et surtout pas une notification.** L'accueil dit ce que la
  synchronisation vient de révéler : paroles nouvelles dans sa Loge, quête
  scellée, planche à soi accomplie par un autre. Elle porte la couleur de son
  Ordre — la seule de l'accueil. Elle ne se ferme pas et ne se compte pas :
  *elle ne décrit que l'écart avec la visite précédente, donc elle disparaît
  d'elle-même.*
- **Dater ce qui n'a pas de date.** Une quête n'a pas d'instant
  d'accomplissement, elle se recalcule. On la date donc par **la dernière
  inscription qui l'a scellée** — ce qui suffit à savoir si elle est tombée
  depuis la dernière visite. Même ruse pour « un autre a accompli ta planche ».
- **L'ordre des écrans d'entrée n'est pas une affaire de goût.** Le plan de
  départ plaçait le profil juste après la connexion. Or **le profil ne peut pas
  s'écrire avant l'admission** : on n'a pas les droits sur le dépôt de données.
  L'attente n'est donc pas un accident à masquer, c'est un écran à part entière
  — et c'est là que le défilé des principes trouve sa place. *Un temps mort
  qu'on remplit vaut mieux qu'un péage qu'on impose.*
- **Le portrait quitte GitHub.** Fond dans une palette fermée, emblème, prénom.
  La palette évite les cinq teintes d'Ordre, parce qu'un visage est personnel
  et qu'une teinte d'Ordre est collective : les confondre créerait un faux
  signal. GitHub n'identifie plus que le compte — ce qui, au passage, supprime
  une dépendance à son CDN.
- **Le dernier écran est le meilleur argument du projet** : le corpus est déjà
  plein. On n'arrive pas devant une bibliothèque vide, on arrive au milieu
  d'une conversation.
- ⚠️ **L'onglet « Onboarding » est un banc d'essai, pas une destination.** Il
  est exclu de la barre basse (qui reste à quatre entrées) par un drapeau
  `bench` sur son entrée de registre, et doit disparaître au portage.

### 10 octobre 2026 — la troupe, et la lignée

- **Trois trames écartées pour les Guerriers, et jamais pour le mécanisme.**
  Les braises ne disaient que « feu ». Les gerbes d'étincelles — rouges,
  projetées, rapides — **se lisaient comme du sang**, et Nathan a mis un moment
  à comprendre ce qu'il regardait avant de constater que la page en devenait
  illisible. *Dans une couleur chaude, tout ce qui est projeté devient une
  éclaboussure.* La leçon dépasse le cas : **avant d'animer une forme, se
  demander ce qu'elle dira une fois teintée.**
- **Une trame est un fond : si elle se remarque, elle a échoué.** La version
  retenue — une forêt de lances qui dérive, le pied hors champ — met **une
  minute à traverser** et tient sous 1 % d'encre. Premier jet à 2,5 %, soit le
  niveau du barde : mesuré, corrigé. *On ne juge pas une trame au code, on la
  mesure et on la regarde.*
- **Enfoncer la troupe sous le bord change tout.** Avec le pied visible, chaque
  hampe était un bâton flottant ; avec le pied hors champ, c'est une colonne
  qui passe en contrebas. La même géométrie, décalée de quelques pour cent.
- **La lignée, et une forme qui revient pour la quatrième fois.** Une parenté
  se déclare **des deux côtés** — chacun n'écrit que chez lui, donc le lien
  n'existe que si les deux l'ont posé. Après les favoris, les surlignages et
  les quêtes, c'est la quatrième fois que « un seul écrivain par fichier »
  impose la même solution : *déclaré chez soi, sommé à la lecture.* Ce n'est
  plus une coïncidence, c'est la grammaire du modèle.
- **La maisonnée n'est pas un objet.** C'est la composante connexe des liens
  confirmés : personne ne la crée, personne ne la détient, elle apparaît. Rien
  à administrer, donc rien à casser.
- **Le mot est toujours celui de l'autre.** C'est l'enfant qui dit « mon
  père » ; l'écran écrit donc « père de ». Personne ne se nomme soi-même dans
  une famille — et ça évite d'inventer un champ de genre qu'on n'a pas.
- **C'est le premier lien qui traverse les Ordres**, et c'est ce qui rend
  l'idée bonne : on choisit son Ordre, on ne choisit pas sa maisonnée. D'où un
  point d'entrée **neutre** — une teinte unique aurait trahi deux des trois.
  **Mais sur la page elle-même, chacun porte le halo de son Ordre** : là,
  chacun a le sien, donc rien n'est choisi contre personne. Le même raisonnement
  interdit la couleur d'un côté et l'autorise de l'autre.
- **Une page qui parle de gens doit en avoir le ton.** Quatre cases de
  statistiques faisaient un tableau de bord ; une phrase fait une maison.
  Visages flottants comme les disques de la racine, halos qui respirent, noms
  en serif, parentés en italique, et des **courbes au lieu d'une équerre** —
  une maisonnée n'est pas un organigramme.
- **Un foyer se lit pareil par toutes ses portes.** Ouvert depuis Nina, il
  s'appelait « Nina, Jules et Éliot » ; depuis Jules, autrement. Corrigé :
  l'aîné d'abord, puis l'ordre des noms. *Un objet collectif ne doit pas
  dépendre de qui le regarde.*
- **Un garde-fou qui a servi deux fois dans la même heure.** La découpe par
  index a refusé d'écrire parce qu'un fragment ne faisait pas la taille
  attendue (les compteurs avaient changé depuis), puis parce qu'une assertion
  trop large confondait le `burst` de la trame avec celui des pastilles.
  **Deux fonctions homonymes dans deux portées différentes** : ça marche, et
  c'est un piège. Le fichier n'a pas été écrit une seule fois en erreur.

### 10 octobre 2026 — le spike, et une erreur que j'avais propagée

Quatre questions sur six ont une réponse mesurée. Les deux dernières attendent
une organisation GitHub, que je ne peux pas créer à sa place.

- **Le device flow est bien hors de portée d'une page web.** Aucun
  `Access-Control-Allow-Origin` sur `/login/device/code`, **préflight compris**
  — un navigateur refuserait avant même d'émettre la requête. **D5 tient**, et
  pour la bonne raison : la coque native est la condition, pas un confort.
- **L'arbre Git rend 319 entrées en un appel, 218 ms.** Non tronqué. À vingt
  fichiers, un seul appel suffira toujours — I7 confirmé.
- **Une ouverture à froid coûte 395 ms** pour vingt fichiers en parallèle.
  Très loin d'être un problème.
- ⚠️ **J'avais tort, et je l'avais écrit partout.** J'ai affirmé — à Nathan,
  dans la spec v12 et dans l'invariant 27 — qu'un `304 Not Modified` ne compte
  pas dans le quota. **Mesuré : cinq relectures conditionnelles, cinq
  décomptes** (`34 → 29`). C'est une doctrine répandue et fausse. *La
  conclusion survit — 180 appels/h sur 5 000, soit 3,6 % du budget — mais elle
  reposait sur une gratuité imaginaire.* Corrigé dans les trois endroits.
  **Leçon : un chiffre qu'on n'a pas mesuré n'est pas un chiffre, c'est un
  souvenir.** Et il se propage vite — trois documents en deux heures.
- **Un 404 n'est pas une preuve.** Premier jet du test CORS : POST sans corps,
  404, « pas d'en-tête CORS, donc c'est prouvé ». Faux — je n'avais pas atteint
  le gestionnaire. Il a fallu une requête complète et un vrai préflight pour
  que la réponse vaille quelque chose.
- **La chaîne d'outils est posée** : node, npm, rustup + toolchain stable, gh.
  `rustup` est keg-only chez Homebrew et n'est pas dans le `PATH` ; rien n'a été
  ajouté au `~/.zshrc`.

### 10 octobre 2026 — les Quêtes

- **Une quête ne se valide pas, elle s'accomplit.** C'est ce qui la sépare d'un
  trophée décerné : il n'y a personne à convaincre, donc rien à administrer.
  L'accomplissement se **recalcule** à chaque lecture — il n'est jamais écrit
  nulle part, conformément à la règle d'or.
- **Le palier doit être monotone, et cette contrainte vient de Nathan sans
  qu'il la nomme.** Il a dit : renoncer ou accomplir comptent comme entrepris,
  et achevé vaut accompli. C'est une **échelle** : `convoiter < entreprendre <
  achever`. Et elle implique son propre interdit — **« suspendu » ne peut pas
  être un palier**, parce qu'on en sort et qu'une quête qui se désaccomplit en
  changeant un statut serait cruelle. *Quand un modèle suggère une règle, il
  suggère aussi ce qu'il faut lui refuser.*
- **Une quête est une pancarte, pas une jaquette.** Une œuvre a une image ; une
  quête n'a qu'un nom et une promesse. D'où la planche clouée sur un piquet,
  légèrement de travers, qui se redresse quand on s'en approche — et qui
  **s'inverse** une fois accomplie : encre pleine, texte en papier. Le plus
  fort contraste disponible sans couleur, et il ne sert qu'à ça.
- **Deux portes pour la même pièce, c'est une porte de trop.** « Ma Feuille »
  quitte la barre : le visage en bas y menait déjà. En étroit, où la barre
  n'existe pas, le visage passe dans l'en-tête — **une suppression dans une
  disposition oblige à vérifier l'autre**, sans quoi le profil devenait
  inaccessible sur téléphone.
- **Agir et parcourir sont deux choses.** La règle qui les sépare subsiste quand
  la barre est repliée : c'est là qu'on en a le plus besoin. Et deux glyphes
  identiques dans une barre repliée en font un de trop — planter une quête a
  pris le fanion, la section garde le losange.
- **Un formulaire ne se redessine jamais sous les doigts.** Celui des quêtes se
  repeint à chaque geste structurant — palier, œuvre ajoutée, épreuve — mais la
  frappe ne met à jour que la liste de résultats. La règle générale : *repeindre
  ce qui dépend du geste, jamais ce qui contient le curseur.*
- **« Avoir entreprendre ».** L'infinitif réemployé en participe. Rappel que le
  ton cérémonieux se tient mot par mot : un libellé réutilisé d'un contexte à
  l'autre casse la phrase.

### 10 octobre 2026 — le fer frappé

- **Une trame doit nommer son Ordre, pas décrire un élément.** Les Guerriers
  avaient un flux de braises qui montait : ça évoquait le feu, pas eux. La
  nouvelle trame est **le fer frappé** — une cadence de coups, chacun jetant une
  gerbe d'étincelles qui s'évase dans un sens, ralentit et **retombe**. Le
  guerrier devient le seul geste **discontinu** et le seul **balistique** des
  cinq.
- **Les cinq gestes doivent être mutuellement exclusifs**, et c'est une
  contrainte de conception, pas un constat. D'où un interdit concret découvert
  en chemin : pas d'onde circulaire à l'impact, elle aurait emprunté au
  Soigneur. Le premier jet en avait une ; elle est tombée avant d'être écrite.
- **Sous le contenu, seul le trait long se lit.** Première version : des points
  et de courtes étincelles — invisible. Les panneaux d'une chambre masquent la
  plus grande part du canevas ; une trame de points s'y perd, une trame de
  traits traverse les intervalles. C'est la même raison qui faisait marcher les
  comètes des Mages. Vitesse ×1,8, longueur ×2,7, durée de vie ×1,5.
- **Une gerbe qui rayonne dans toutes les directions fait un feu d'artifice.**
  Un coup part d'un angle : la gerbe s'évase dans un seul sens et l'entaille
  marque la surface frappée, en travers. Ce seul changement fait passer l'image
  de « festif » à « frappé ».
- **Troisième occurrence du même piège, corrigée à la racine.** `mountWeave`
  montait la trame dans un `requestAnimationFrame` : dans un onglet qui n'est
  pas rendu, il ne vient jamais — chambre sans trame, cité sans dessin, et rien
  pour le dire. Après les couches quittées et le fil qui s'ouvrait en haut, la
  règle est désormais générale : **un rappel d'animation anime, il ne met
  jamais en place.** `startWeave` réessaie en plus la mesure jusqu'à ce que la
  couche soit mise en page, au lieu d'abandonner en silence.
- **Une trame discontinue se mesure sur plusieurs images.** Une seule mesure ne
  dit rien : la chambre des Guerriers respire entre 0,20 % et 0,67 % de
  couverture, pour 0,33 % stable chez les Mages. Même poids, comportement
  inverse — c'est exactement ce qu'on voulait.
- **Et un piège de mesure, pas de code** : mesurer une cible pendant l'animation
  d'entrée d'un volet donne 42 px pour un bouton de 44. L'invariant 18 vaut
  aussi quand on teste.

### 10 octobre 2026 — la Loge devient un fil, et Git reste

- **« Message board » et « fil de chat » ne sont pas le même objet.** J'avais
  livré des blocs empilés du plus récent au plus ancien ; Nathan voulait un
  fil — dense, dans le sens du temps, avec son propre défilement, ouvert en
  bas. Ce qui fait la différence tient à peu de chose : **le groupement des
  messages consécutifs d'une même personne**, les séparateurs de jour et
  l'heure à la minute. Sans groupement, n'importe quel fil redevient un forum.
- **Le surlignage est un index construit à la main par ceux qui lisent.**
  Replié, le fil ne garde que ce que quelqu'un a voulu pouvoir retrouver, et
  rouvrir un passage ramène à l'endroit exact d'où il vient — ni en haut, ni
  en bas. *Un fil long sans moyen d'y revenir est une perte sèche ; c'est ce
  que cette fonction répare.*
- **Les deux faits collectifs de l'application ont la même forme.** Magnum opus
  et surlignages : des **déclarations rangées chez soi, sommées à la lecture**.
  Ce n'est pas une coïncidence, c'est la seule forme que « un seul écrivain par
  fichier » autorise. Tout fait collectif à venir la prendra aussi.
- **Une règle d'usage n'est pas une clôture, et il faut le dire.** La Loge se
  ferme aux autres Ordres — mais tout le monde lit le même dépôt. L'application
  fait respecter la convention, elle ne garantit pas le secret. *Le danger
  n'est pas la fuite, c'est qu'on croie à une confidentialité qui n'existe
  pas.* Écrit dans la spec et dans les invariants.
- **Git tient, et la question méritait des chiffres.** Ce qui sauve la lecture
  fréquente : **une requête conditionnelle qui rend `304` ne compte pas dans le
  quota** — relire toutes les vingt secondes coûte presque rien. Ce qui sauve
  l'écriture : **grouper**, jamais un commit par message, sinon on noie
  l'historique, c'est-à-dire la propriété même qui a fait choisir Git. Reste la
  latence, quinze à trente secondes, et elle est irréductible. *Si le direct
  devenait nécessaire un jour, la réponse est un canal de réveil qui ne stocke
  rien — pas une base temps réel, qui réintroduirait le magasin partagé qu'on a
  supprimé.*
- **Et si la Loge n'était qu'un salon, Discord gagnerait.** Sa raison d'être est
  d'être attachée à l'Ordre et aux œuvres. C'est le critère qui dit si elle
  mérite d'exister.
- **Deux pièges d'exécution, de la même famille.** `requestAnimationFrame` ne
  se déclenche pas dans un onglet qui n'est pas rendu : le fil s'ouvrait en
  haut sans que rien ne le signale, exactement comme les couches quittées
  s'empilaient la veille. *Ne jamais confier une correction d'état à un rappel
  d'animation.* Et `dayKey` découpait la chaîne ISO — donc lisait le jour en
  UTC — pendant que l'heure s'affichait en heure locale : deux séparateurs
  « samedi 10 octobre » dans le même fil. *Deux fonctions qui parlent du même
  instant doivent lire le même fuseau.*
- **Visible ne veut pas dire découvrable.** Les commandes de chaque message
  étaient affichées mais si pâles qu'elles valaient un survol — l'invariant
  était respecté à la lettre et trahi en pratique. Corrigé, et les glyphes sont
  nommés une fois en tête du fil.

### 10 octobre 2026 — favoris, magnum opus, la Grande Loge

- **Un hors-périmètre se révise par sa raison, pas par son libellé.** « Pas de
  fils de discussion » excluait la Loge ; en remontant au *pourquoi* — conflit
  d'écriture et modération — les deux tombent : un seul écrivain par fichier
  règle le premier, et le second n'est pas une fonction refusée mais une chose
  **non représentable**, puisqu'on n'a pas accès en écriture au fichier d'un
  autre. *Une règle dont on a gardé le motif se révise ; une règle dont on n'a
  gardé que l'énoncé se contourne ou se subit.*
- **Le prix se paie dans l'interface, pas dans le modèle.** Pas de serveur donc
  pas de temps réel : un message paraît à la synchronisation suivante et
  personne n'est averti. L'écran le dit en toutes lettres plutôt que de laisser
  croire à un salon. Même geste que l'écran d'attente d'adhésion.
- **Un favori n'est pas une note, et c'est tout l'apport.** Dériver les favoris
  d'un classement de notes n'aurait rien ajouté. Déclarés, ordonnés, plafonnés
  à douze : on peut distinguer une œuvre qu'on n'a pas finie — Elden Ring,
  « entrepris · sans jugement », au deuxième rang — et c'est précisément ce que
  la note ne peut pas dire. Le plafond fait le choix ; sans lui c'est un second
  registre.
- **Le Magnum opus est le seul accord qui se déclare au lieu d'être calculé.**
  Tout le reste de l'application déduit — sévérité, discorde, affinité. Là, deux
  personnes mettent la même œuvre dans leur liste et l'Ordre a un étendard.
  Quand aucune œuvre ne réunit deux voix, on le dit : **feindre l'unanimité
  aurait vidé le seul endroit qui ne calcule rien.**
- **Le cadre est cérémonieux, la parole ne l'est pas.** La Loge fournit le
  meuble et se tait. C'est la première fois que l'application cède la voix.
- **Au deuxième usage, le mécanisme monte dans le noyau** — la règle de
  promotion appliquée à la lettre : la chambre d'Ordre voulait des onglets à
  glissement latéral comme la feuille de personnage, donc `TABSETS` ; un bloc ne
  déclare plus que sa liste, son hôte et son corps.
- **Deux bugs trouvés par le détour.** Servir le prototype en HTTP local plutôt
  qu'en `data:` a révélé qu'il n'avait **ni `<meta charset>` ni `viewport`** :
  l'enveloppe des Artifacts les fournissait, et le fichier en était dépourvu
  depuis le premier jour — accents cassés hors Artifact, et aucune mise en page
  étroite sur un vrai téléphone. Et le retrait d'une couche quittée dépendait de
  `onfinish` : un onglet en arrière-plan gèle l'animation et les couches
  s'empilaient en silence. *Changer de contexte d'exécution est une forme de
  test.*

### 10 octobre 2026 — D12, genres, compagnons, compteur

- **Le D10 était indessinable à cette échelle, le D12 ne l'est pas.** Un losange
  facetté ne dit rien ; un dodécaèdre vu de face se construit tout seul —
  pentagone central, cinq pentagones autour, décagone en silhouette, arêtes
  radiales. *Quand une forme ne passe pas en pixel art, c'est souvent la forme
  qu'il faut changer, pas la technique.*
- **Partager l'expérience n'est pas partager le jugement.** `with[]` note avec
  qui une œuvre a été faite ; les chroniques restent individuelles. Les fondre
  aurait fait du groupe un auteur collectif, ce qu'il n'est pas.
- **Refaire est un compteur, pas une seconde entrée.** `plays` s'incrémente
  depuis sa propre ligne sur la fiche. Dupliquer l'entrée aurait faussé tous
  les décomptes — achèvements, taux, moyennes.
- **Les genres appartiennent à l'œuvre, pas à l'entrée** : ils partent dans
  `works` comme la jaquette. Tronc commun à toutes les natures plus les genres
  propres à chacune — trente-cinq choix pour un jeu.
- **« Mes en cours » accessible depuis le volet.** C'est le geste le plus
  fréquent après la lecture ; il ne doit pas imposer un détour par sa feuille.
  La même `liveBox` sert sur la feuille et dans la surface, et se rafraîchit
  sur place quand on suspend une œuvre.

### 10 octobre 2026 — le dé du Sort

- Un **D10 en pixel art** à gauche du Sort, dans la grammaire du header :
  silhouette en cerf-volant, équateur en zigzag, trois facettes hautes dont
  celle de face éclairée. Un chiffre romain y est gravé — l'application compte
  déjà en romain partout.
- **Il roule en changeant de face, pas en pivotant.** Faire tourner du pixel art
  le réduit en bouillie : aucune rotation ne tombe sur la grille. Changer le
  chiffre donne la même lecture — « ça roule » — sans rien casser. *Règle
  générale : en pixel art, on anime le contenu, pas la géométrie.*
- Deux primitives ajoutées au module : tracé de segment (Bresenham) et
  remplissage de polygone par balayage. Elles resserviront.

### 10 octobre 2026 — le volet devient un lanceur

- **La carte était une mauvaise réponse à une bonne intuition.** Nathan voulait
  que déplier le volet fasse quelque chose ; j'y ai mis un décor. Ce qu'il
  fallait, c'est **une fonction** : le volet déplié est un lanceur, la zone
  floutée accueille les résultats de recherche **en jaquettes**, et choisir
  referme le volet sur la page atteinte. Carte mise en sommeil, code conservé.
- **Un bug de couche que seul l'usage révèle** : la recherche s'affichait dans
  la vue principale, donc *sous* le flou. Elle devait vivre dans la couche qui
  passe au-dessus. Quand on floute une zone, tout ce qui doit rester lisible
  doit en sortir.
- **Trois gestes à distinguer dans un même panneau.** Choisir referme ; déplier
  une section ne referme pas ; cliquer dans le champ de recherche encore moins
  — c'est le contraire d'un choix, c'est le début d'un. Vérifié un par un.

### 10 octobre 2026 — la carte du Royaume

- **Une géographie qui n'appartient à personne.** Premier jet : cinq territoires
  calqués sur les cinq Ordres. Nathan a tranché — **c'est un monde, pas un
  découpage politique de l'application.** Les Ordres y auront peut-être une
  ville un jour ; les Hautes Dents, la Sylve Ancienne et les Marais d'Avren
  existent sans eux. La leçon vaut au-delà de la carte : un décor qui illustre
  l'application se périme avec elle ; un décor qui existe pour lui-même tient.
- **Fresque, pas semis.** La première carte échouait pour les mêmes raisons que
  la première cité : aucun parti, aucune hiérarchie. Celle-ci a des **zones
  texturées distinctes** — hachures obliques pour le plateau, terrasses pour les
  coteaux, roseaux pour les marais, semis clairsemé pour les landes — une côte
  découpée par sommes de sinusoïdes, un fleuve qui serpente des cimes à la mer,
  et des **routes sinueuses, jamais d'équerre**.
- **De l'originalité dans chaque coin**, comme demandé : rose des vents au
  large, cartouche de titre, épave au sud-est, cercle de pierres, pont rompu,
  cairns, îlots, échelle graphique.
- **Deux échelles d'étiquettes** : noms de territoires en grand serif très
  espacé et pâle, noms de lieux en petites capitales. C'est la typographie qui
  fait lire une carte comme une carte.
- Opacité remontée à 0,74 : la rampe de gris ayant été éclaircie pour la cité,
  la carte était devenue trop fantomatique sur le flou.

### 10 octobre 2026 — la journée entière, consolidée

Reconstruit après coup : les entrées détaillées de cette session ont été perdues
dans la collision. Ce qui compte, ce sont les enseignements.

**Identité.** Le registre « porcelaine émaillée » a été **écarté par Nathan** au
profit du **plat, noir et blanc, grain, profondeur de champ**. Huit questions ont
fixé la direction. Conséquences : le flou n'est pas un effet mais la seule
profondeur disponible une fois la matière retirée ; rien n'est flou au repos ;
le catalogue est typographique ; les seules images sont les visages — plus, par
exception consentie, les jaquettes.

**Trois gestes, jamais confondus.** Le zoom dit un changement de profondeur ; le
glissement latéral dit un déplacement à profondeur égale ; l'absence de mouvement
dit que rien ne s'est déplacé. Un changement d'état ne doit donc rien animer.

**Le profil doit décrire une relation, pas une personne.** Dans un tracker
collectif, « qu'est-ce qu'on partage et où diverge-t-on » prime sur « qui est-il ».
D'où le volet « Toi et X ». Et **le désaccord est un contenu, pas un défaut** :
le nommer vaut mieux que calculer une compatibilité.

**Une page de catégories n'a de valeur que si elle permet de comparer** — vrai
pour les chambres d'Ordre. Mais **une page d'entrée n'est pas un tableau de
bord** : sur la racine des Ordres, Nathan voulait du charme, pas des chiffres.
Demander plutôt que supposer ce que « améliorer » veut dire.

**Pixel art.** Deux pixels et non trois ; rampe claire, jamais de noir ; une
scène se compose et ne se tire pas au sort ; toute masse tramée a besoin d'un
bord dessiné ; animer une partie impose d'en garder une empreinte, dimensionnée
sur la **course du mouvement** et non sur la forme au repos.

**Méthode.** Un chemin non exécuté n'est pas un chemin qui marche — le recadrage
de jaquette cachait deux bugs invisibles à la lecture. Un contrôle de syntaxe ne
voit pas les fonctions manquantes. Et une découpe par index peut emporter du code
écrit entre-temps : vérifier la taille du fragment retiré.

### 10 octobre 2026 — identité propre, et abandon de React
*(entrée d'une autre session — son registre « porcelaine » a depuis été écarté,
voir D10 ; le raisonnement sur Svelte, lui, reste valable)*
Nathan : « pour le moment c'est vraiment moche ». Juste. Les deux premières
passes étaient une application web standard repeinte. Quatre réponses ont fixé
la direction (D10), et elles entraînent un changement de pile (D11).

- **Une console en monde clair, c'est rare — donc c'est une identité.** Presque
  toutes les interfaces à matière et profondeur choisissent le sombre parce que
  c'est plus facile : les reflets s'y voient sans effort. En clair, il faut le
  registre de la **porcelaine émaillée** — lèvre lumineuse en haut, assise
  sombre en bas, ombre portée, reflet spéculaire mobile. Chaque surface devient
  un objet posé, pas un rectangle.
- **L'identité ne vient pas de la palette mais du déplacement.** Le zoom
  sémantique fait que l'élément cliqué *devient* l'écran : un fantôme vole de la
  position source à la position d'arrivée pendant que la couche quittée grandit
  et s'efface. C'est ça qui distingue l'application d'un site, pas les couleurs.
- **React est hostile à ce qu'on construit.** La réconciliation combat les
  transitions d'élément partagé — il faudrait Framer Motion, soit une grosse
  dépendance pour contourner le défaut du framework. **Svelte** offre `flip` et
  `crossfade` en natif, compile vers du DOM direct (meilleur pour la lumière
  continue sur quarante objets) et scope le CSS sans outil. Les trois couches et
  le registre se transposent sans changement. Nathan avait raison de douter.
- **Le ton cérémonieux doit être tenu partout ou nulle part.** « Achevé »,
  « Renoncement », « Jugement moyen », « Annales de l'Ordre », chiffres romains
  sur la feuille de personnage. Une seule formulation neutre au milieu et tout
  l'édifice sonne faux.
- **Choisir un seul monde libère la matière.** En renonçant au thème sombre, on
  peut poser des ombres et des reflets physiquement cohérents avec une source de
  lumière unique en haut à gauche. Un thème double aurait interdit ça.

### 10 octobre 2026 — 2e passe d'interface
Retours de Nathan sur le prototype v0, avec une capture de référence (tableau de
bord très clair, radius généreux, ambre pour seule couleur vive).

- **Un bug bête et instructif** : la barre latérale se repliait mais ne se
  dépliait plus — le bouton de bascule était masqué par la règle de repli. Une
  commande qui disparaît dans l'état qu'elle sert à quitter est un cul-de-sac.
  À vérifier systématiquement sur toute bascule.
- **L'accueil était indigeste parce que les lignes n'avaient pas de hauteur
  fixe.** Chaque événement portait une pastille, un score, une progression et
  parfois l'encart d'une critique. Correction : **sortir les critiques du fil**
  et leur donner leur propre section « À lire ». Le fil redevient uniforme donc
  scannable, et les critiques gagnent le moment de lecture qu'elles méritent.
  Règle à retenir : un fil se scanne, il ne se lit pas.
- **Les couleurs de cercle sont incompatibles avec des panneaux teintés.** Avec
  « peu de couleur » comme direction, bleu/rouge/vert ne peuvent vivre que sur
  les pastilles elles-mêmes. Les grands panneaux colorés ont sauté — ce qui
  rejoignait de toute façon la demande de ne montrer que les pastilles.
- **Les pastilles suivent la souris** : inclinaison et reflet proportionnels à la
  proximité, pas un simple survol. Purement décoratif, donc sans conflit avec
  l'invariant 14 ; désactivé sur tactile et sous `prefers-reduced-motion`.
- **Un système de mouvement plutôt que des animations au cas par cas** : deux
  courbes, trois durées, trois gestes (monter, éclore, fondre), et un décalage
  en cascade de 32 ms. C'est ce qui rend les transitions « cohérentes sans être
  toujours pareilles ». Il appartient au noyau, comme les surfaces.
- **Les sous-menus de la barre latérale sont indépendants** : Média et Cercles
  peuvent être dépliés en même temps, et déplier ne navigue pas. Deux cibles
  distinctes sur la même ligne — le libellé navigue, le chevron déplie.

### 9 octobre 2026 — la pile, et le premier prototype
Pile arrêtée (D9) et prototype cliquable des quatre vues publié, à partir de la
description d'interface de Nathan : Accueil, Média, Cercles, Profil, barre
latérale rétractable, pastilles façon PS Vita.

- **Rien n'est installé sur la machine** — ni Node, ni Rust. Homebrew et Deno le
  sont. D'où le choix de prototyper en HTML autonome plutôt que d'installer une
  chaîne complète avant d'avoir validé quoi que ce soit.
- **Trois changements de modèle**, consignés en spec §7 : `class` devient
  `circle` (entité navigable, porteuse d'une couleur) ; `note` devient
  `review: { title, body }`, parce qu'une critique a un titre qui circule dans le
  fil ; et `mediaType` passe de réservé à actif — films et séries entrent en V1.
- **D3 a tenu sa promesse.** Le champ `mediaType` avait été posé en septembre
  « au cas où ». Les films arrivent un mois plus tard : zéro migration. C'est le
  meilleur argument qu'on ait pour continuer à réserver des champs bon marché.
- **Les couleurs de cercle sont des jetons du design system, pas des données.**
  Un cercle stocke son identifiant ; la couleur est décidée côté interface. Sinon
  un changement de palette imposerait de réécrire les fichiers de tout le monde.
- **Le prototype n'est pas jetable à 100 %** : il est écrit avec la fusion, les
  sélecteurs et le vocabulaire d'état déjà en place. Le portage sera mécanique.

### 6 septembre 2026 — responsive et porte Android
Ajout de D8, C9, I9, et des invariants d'interface 14 à 18. Question de Nathan :
peut-on sortir un APK sur un coup de tête sans tout refaire ?

- **Réponse : oui, mais le prix se paie maintenant, pas le jour de l'APK.** La
  plomberie Tauri coûte environ deux jours. Ce qui coûterait cher, c'est de
  découvrir que chaque vue suppose une souris et un grand écran.
- **Un seul choix technique peut rendre l'APK cher** : brancher le stockage du
  jeton directement sur une bibliothèque de trousseau de bureau. Derrière
  l'interface `secrets` avec une implémentation portable, le problème disparaît.
- **L'updater Tauri ne couvre pas Android.** Un bandeau « nouvelle version »
  le remplace — et comme il marche partout, autant le construire de toute façon.
- **La règle qui coûte le plus cher à réparer après coup est le survol.** Toutes
  les autres se rattrapent vue par vue ; celle-là impose de rouvrir chaque vue.
- **iOS reste hors sujet** : compte Apple et App Store, ce n'est pas un coup de tête.

### 6 septembre 2026 — distribution, adhésion, parcours
Le projet passe d'un cercle fermé à une **application distribuable pour une
vingtaine de personnes**, avec adhésion sur demande. Ajout de D7. Création du
document de parcours (`docs/ux.html`), publié à part.

Ce qui a été appris ou décidé en chemin :

- **Le passage de relais est la partie fragile du parcours.** Le demandeur et
  l'administrateur ne sont jamais devant leur écran en même temps, et aucune
  notification n'est possible. C'est ce qui donne sa raison d'être au champ
  Discord — pas un ornement, le seul canal de relance qui existe.
- **Les issues GitHub résolvent l'entrée d'un inconnu.** N'importe quel compte
  GitHub peut ouvrir une issue sur un dépôt public : c'est le seul geste qu'une
  personne hors de l'organisation puisse faire, et il suffit.
- **Ne jamais inventer une liste d'administrateurs.** Les rôles de l'organisation
  GitHub font autorité. Une liste maison finirait par diverger des droits réels.
- **L'identifiant est le compte GitHub, jamais le pseudo.** Un pseudo se change ;
  si le nom du fichier en dépendait, le renommer orphelinerait tout l'historique.
- **La bibliothèque vide n'existe pas ici.** Un nouveau arrive dans un catalogue
  déjà peuplé par le groupe. C'est le meilleur premier écran possible, et ça
  supprime le pire écueil des applications de suivi.
- **Le fil d'activité est du socle, pas du confort.** À usage épisodique, sans
  récit de l'entre-temps, personne ne revient. Il passe donc en V1.

### 6 septembre 2026 — application de bureau et blocs de fonction
Bascule d'une page web statique vers **Tauri**. Ajout de D5 et D6.

- **« Pas de HTML » recouvrait deux choses très différentes** : le fichier qu'on
  double-clique, à rejeter, et le HTML comme couche de rendu dans une coque
  native, qui est ce que sont VS Code ou Figma. La distinction posée, le choix
  s'est fait tout seul.
- **La coque native rouvre le device flow**, inaccessible depuis une page web
  faute d'en-têtes CORS. Elle supprime du même coup le point le plus fragile de
  la conception précédente : le jeton copié-collé à la main.
- **Tauri 2 vise aussi Android.** L'ouverture mobile ne justifiait donc pas de
  partir sur Flutter.
- **La tension « ajouter sans casser, sans tout réécrire » ne se règle pas par
  le cloisonnement** mais par un noyau partagé, un sens de dépendance unique, et
  une règle de promotion : un composant monte dans le noyau au deuxième usage,
  jamais au premier.

### 5 septembre 2026 — conception initiale
Cadrage complet à partir d'une idée de départ. D1 à D4 actées, spec publiée.

- **Le vrai risque n'est pas la sécurité, c'est la corruption de données.** C'est
  ce constat qui a fait pencher pour GitHub plutôt que Drive : chaque écriture
  est un commit, donc réparable.
- **Le conflit d'écriture se règle par le modèle, pas par du code.** Un fichier
  par personne, et le problème disparaît au lieu d'être géré.
- **Un jeton fine-grained ne peut cibler qu'un dépôt de soi-même ou d'une
  organisation.** D'où D2, qui n'était pas dans l'idée initiale.
