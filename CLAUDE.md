# Checkpoint — note mère

> **À lire en premier, à chaque session.** Ce fichier contient ce qui ne change pas.
> L'état d'avancement vit dans `docs/ETAT.md` — **lis-le juste après celui-ci.**

## Le projet en quatre lignes

Une application de bureau (Mac, Windows, Linux) qui sert de tracker de jeux vidéo
partagé au sein d'un groupe d'une vingtaine de personnes. Elle lit un dépôt GitHub
privé et en tire une bibliothèque commune, avec des vues de comparaison soignées.
Le binaire se distribue librement ; l'accès aux données passe par une demande
d'adhésion qu'un administrateur valide. **L'application est ouverte, les données
sont fermées.** Pas de serveur, pas de base à administrer.

**Critère de la V1 :** une personne extérieure au projet peut installer
l'application, entrer dans le groupe et suivre ses jeux sans qu'on lui explique
quoi que ce soit. Détail dans la spec §10 et dans le parcours §5.

La valeur ajoutée est **entièrement collective** : le tracker solo existe déjà
(Backloggd, Grouvee). Toute fonctionnalité qui ne sert pas la comparaison entre
amis est du poids mort.

## Statut

⚠️ **Révisé le 11 octobre.** La ligne disait : *« Le concept est provisoire.
Nathan fournira un cahier des charges UX/UI plus complet. Ne pas figer
d'interface avant de l'avoir reçu. »* **Ce cahier n'arrivera pas**, et il était
déjà contredit par les faits : trois jours de décisions d'interface ont été
prises, mesurées et consignées.

**Le prototype est la référence.** `docs/prototype.html` fait foi pour tout ce
qui touche à l'interface ; `docs/ux.html` dit le parcours et les principes,
cette note dit ce qui ne change pas. Une interface se décide désormais **ici**,
une passe à la fois, et une décision prise se consigne au lieu d'attendre un
document qui l'arbitrerait. Ce qui ne bouge pas pour autant : **ni le modèle
de données, ni l'architecture, ni la plateforme** — ce sont les invariants
ci-dessous qui les tiennent, pas un cahier à venir.

## Documents

| Fichier | Rôle | Fréquence de mise à jour |
|---|---|---|
| `CLAUDE.md` | Cette note. Invariants et protocole. | Rare — seulement si un invariant change |
| `docs/ETAT.md` | Où on en est, prochaine action, journal | **Chaque session** |
| `docs/conception.html` | La spec technique (§1–§12) | À chaque décision structurante |
| `docs/ux.html` | Le parcours, les états, les principes d'interface | À chaque apport UX de Nathan |
| `docs/prototype.html` | Le prototype cliquable, un seul fichier édité par scripts | À chaque passe d'interface |
| `spike/` | Le banc d'essai de l'architecture ⚠️ *jetable* | Jusqu'à ce que les six questions aient leur réponse |

Les documents sont publiés comme Artifacts. **Chacun a deux URL pour la même
chose** — la forme courte et la forme UUID ; publier sur l'une ou l'autre met à
jour le même artifact, mais la réponse rend toujours la forme courte :

| | Forme courte (canonique) | Forme UUID |
|---|---|---|
| Conception | <https://claude.ai/artifact/9prYELzUWYgSUboQSdfFcN> | `4777987a-d464-4692-8f92-2d2f2b3d338b` |
| Parcours | <https://claude.ai/artifact/1HTKUw87cDdD9QHvmKrwvr> | `024c1ea8-cf91-4f88-b2c5-1b341bd4e053` |
| Prototype | <https://claude.ai/artifact/Eg3JmfHJxLcSmRvX8WEEPC> | — |

Ils se citent l'un l'autre par ces URL absolues, pas par des chemins relatifs —
un lien relatif est mort une fois publié. Republier **le même chemin de fichier**
conserve l'URL. Ne jamais publier
depuis un autre chemin — ça créerait un second artifact et le lien deviendrait
périmé. Marquer les sections modifiées avec `<span class="rev">révisé vN</span>`
ou `<span class="rev new">nouveau vN</span>`, et incrémenter la version en
en-tête et en pied de page.

## Plusieurs sessions écrivent ici

`docs/ETAT.md`, `CLAUDE.md` et les artifacts sont partagés entre sessions
parallèles. Deux collisions réelles le 10 octobre : un artifact republié
ailleurs, et un journal réécrit qui a effacé les entrées d'une autre session.

- **Avant de republier un artifact**, lire la version en ligne et fusionner.
- **Avant d'écrire dans `ETAT.md`**, relire la section visée : son contenu peut
  avoir changé depuis le début de la session.
- **N'employer que des remplacements qui échouent bruyamment** si l'ancrage
  manque. Un `replace` silencieux donne l'illusion d'avoir consigné.
- **Une décision écartée se marque, elle ne se supprime pas** — sinon une
  session future la ressuscite. Voir D10, où le registre « porcelaine » est
  conservé barré plutôt qu'effacé.

## Garde-fous d'édition

Le prototype est un seul fichier de 150 Ko édité par scripts. Deux précautions,
nées d'incidents réels :

- **Après un remplacement par découpe entre deux index, vérifier la taille du
  fragment retiré** et recompter les symboles attendus. Du code écrit entre deux
  repères lors d'un patch précédent peut s'être intercalé depuis.
- **Et quand la borne proteste, ne pas l'élargir.** Le 11 octobre, un fragment
  est sorti à 2 777 caractères pour 2 600 attendus ; j'ai relevé le plafond au
  lieu de regarder — il débordait sur deux sections voisines. **Élargir une
  garde qui se plaint, c'est la désarmer.** On recompte les symboles interdits
  dans le fragment, et on reprend l'ancre de fin.
- **Un contrôle de syntaxe ne voit pas les fonctions manquantes.** Valider avec
  `new Function(...)` ne prouve rien d'autre que la syntaxe ; compter les
  définitions attendues et charger la page sont les seuls vrais contrôles.
- **Ce que l'hôte fournit, le fichier doit le porter.** L'enveloppe des Artifacts
  pose un `<!doctype>`, un charset, un viewport *et* `[hidden]{display:none
  !important}`. Trois bugs déjà, tous invisibles dans l'Artifact et tous
  cassants ailleurs — dont les formulaires de checkpoint qui s'ouvraient tous
  seuls, `hidden` ne tenant pas face à une règle de classe. **Servir le fichier
  hors Artifact fait partie des contrôles.**

## Protocole de session

1. **Au démarrage** — lire `docs/ETAT.md`. La section « Prochaine action » dit
   quoi faire ; elle ne contient jamais plus d'une chose.
2. **Pendant** — si une décision structurante est prise, la consigner dans la
   spec (§4) *et* republier l'artifact.
3. **À la fin** — mettre à jour `docs/ETAT.md` : cocher ce qui est fait, réécrire
   « Prochaine action », ajouter une entrée datée au journal. Une entrée dit ce
   qui a été fait et ce qui a été **appris**, pas ce qui a été tenté.

## Invariants — ne pas casser sans décision explicite

Chacun protège contre un mode de défaillance identifié. Si une tâche semble
exiger d'en enfreindre un, **c'est un signal d'alarme : s'arrêter et en parler**,
pas contourner.

### Données

1. **Un fichier par personne, un seul écrivain par fichier.** Élimine le conflit
   d'écriture par construction. Rien ne doit jamais écrire dans le fichier d'un
   autre participant.
2. **On ne stocke que des faits, jamais des agrégats.** Catalogue, moyennes,
   classements, compteurs : tout se recalcule au chargement, à chaque fois. Un
   agrégat stocké devient faux, puis irrécupérable.
3. **`schemaVersion` dans chaque fichier, migrations côté client.** Il n'y a pas
   de serveur pour migrer quoi que ce soit rétroactivement.
4. **Ne jamais supprimer un champ du schéma — seulement en ajouter.**
5. **Le champ `mediaType` reste présent partout** : `game`, `film`, `series`,
   `book`. C'est lui qui a permis d'ajouter films, séries et livres sans une
   seule migration.
6. **La section d'œuvres d'un fragment s'appelle `works`, jamais `games`.**
   Une jaquette de film ou de livre n'a rien à faire dans une section nommée
   d'après les jeux. Un nom de champ qui ment est un piège à retardement.
7. **Le dépôt de données appartient à une organisation GitHub**, pas à un compte
   personnel : les permissions par dépôt se déclarent au niveau d'une organisation.
8. **L'identifiant d'une personne est son compte GitHub, jamais son pseudo**, et
   c'est lui qui nomme son fichier. Un pseudo se change ; si le fichier suivait,
   le renommer orphelinerait tout l'historique.
9. **L'identité d'une œuvre est son identifiant de source, jamais son titre.**
   Une œuvre porte `title` (version originale) et `titleFr`. Lequel s'affiche est
   une préférence de personne (`user.prefs.titles`), rangée dans son fragment.
   **La recherche interroge toujours les deux**, quelle que soit la préférence.
10. **Est administrateur qui a ce rôle dans l'organisation GitHub.** Jamais une
   liste maison : elle divergerait des droits réels et créerait une autorité
   fictive.
24. **Un favori n'est pas une note.** `favorites[]` est une liste *déclarée*,
   ordonnée, plafonnée à douze, rangée dans le fragment de la personne. On ne
   la dérive jamais d'un classement de notes — sinon elle n'ajoute rien. On
   peut distinguer une œuvre qu'on n'a pas finie ou qu'on a jugée moyenne ; on
   ne distingue pas ce qu'on convoite sans l'avoir fréquenté.
25. **Les messages de la Loge vivent dans le fragment de leur auteur.**
   `loge[]` porte `order` : un message reste dans l'Ordre où il a été dit, même
   si son auteur en change. Il en découle que **nul n'efface le message d'un
   autre**. **On n'entre dans une Loge que si on est de l'Ordre** — les autres
   trouvent porte close. ⚠️ *C'est une règle d'usage, pas une clôture : tout le
   monde lit le même dépôt, l'application fait respecter la convention et ne
   garantit pas le secret. Ne jamais écrire ni laisser croire le contraire.*
26. **Un surlignage est une marque personnelle rangée chez soi.** `marks[]`
   dans son propre fragment. Un message est surligné dès qu'une personne l'a
   marqué, et le compte dit combien ; on ne retire que sa propre marque. Replié,
   le fil ne garde que les surlignés, et chacun ramène à l'endroit exact d'où il
   vient. **Les deux faits collectifs de l'application — magnum opus et
   surlignages — sont des déclarations rangées chez soi et sommées à la
   lecture.** C'est la forme qu'impose « un seul écrivain par fichier », et elle
   se répétera pour tout fait collectif à venir.
27. **Écrire dans la Loge se groupe, ça ne se commite pas message par message.**
   Un fil bavard sans regroupement noierait l'historique du dépôt — l'historique
   est ce qui rend les données réparables, c'est lui qu'on protège.
   ⚠️ **Corrigé deux fois. Lire la deuxième correction, pas la première.**
   Le 10 octobre, le spike a mesuré qu'un `304 Not Modified` décompte du
   quota — **mais sans jeton**, et il l'avait lui-même signalé : « à refaire
   authentifié ». Le 11 octobre, authentifié, **c'est l'inverse : trois
   relectures conditionnelles, aucun décompte** (4 976 → 4 976 → 4 976).
   Un essai d'intégration le tient désormais (`src-tauri/tests/github.rs`),
   pour que ce soit une machine qui le dise si GitHub change d'avis.
   **La leçon est méthodologique et elle vaut plus que le fait :
   on mesure dans la condition où l'on sera, pas dans celle qui se mesure
   facilement.** Un chiffre juste pris dans le mauvais régime est un faux.
   Le raisonnement reste prudent pour autant : relire l'arbre toutes les 20 s
   coûterait 180 appels/h sur 5 000 **si rien n'était conditionnel**, soit
   3,6 % — c'est le plafond, et il tient même si la gratuité disparaissait.
28. *(Données)* **Une quête vit dans le fragment de qui l'ouvre ; son
   accomplissement ne se stocke jamais.** `quests[]` porte un nom, une ligne et
   des **épreuves** — un palier atteint sur un groupe d'œuvres. Qui l'a
   accomplie se **recalcule** à chaque lecture, comme tout agrégat.
   **Les paliers sont monotones, et c'est ce qui fonde tout le reste :**
   `convoiter < entreprendre < achever`. Renoncer ou accomplir, c'est avoir
   entrepris ; accompli vaut achevé. **« Suspendu » n'est donc pas un palier**
   — on en sort, et une quête qui se désaccomplirait parce qu'on a changé un
   statut serait cruelle. Si un palier non monotone est demandé un jour, c'est
   là qu'il faut s'arrêter et en parler.
29. *(Données)* **Une parenté n'existe que déclarée des deux côtés.** `kin[]`
   porte `{ id, rel }` dans le fragment de chacun ; un lien ne compte que si les
   deux déclarations s'accordent en sens — « mon fils » appelle « mon père »,
   « ma sœur » appelle « mon frère ». La **maisonnée** est la composante connexe
   des liens confirmés : personne ne la crée, personne ne la détient, et elle se
   recalcule comme tout le reste. Le mot employé est libre, seul son sens est
   contraint.
30. *(Interface)* **Un bouton carré ne centre pas son glyphe tout seul.**
   L'interlettrage hérité d'une règle de groupe pose une gouttière *après* le
   caractère, et un glyphe pleine chasse (`＋`, U+FF0B) porte ses propres
   approches : les deux décalent vers la gauche. Pour une commande carrée —
   `display:grid; place-items:center; letter-spacing:0; line-height:1`, et la
   chasse normale. **Et ça se mesure** : l'écart entre le centre du bouton et
   celui de son contenu, jamais à l'œil.

31. *(Données)* **Un doublon du catalogue se résout par un alias déclaré, jamais
   par une réécriture.** Deux personnes inscrivent la même œuvre à la main, le
   catalogue en porte deux — et leurs fragments sont hors d'atteinte
   (invariant 1). Le greffier déclare `{ from, to }` **dans le sien**, et le
   repli se fait **à la lecture**, dans `merge()`. Il en découle trois choses :
   une œuvre fondue garde son titre (on ne supprime rien), **l'alias se
   retire** — c'est la seule garantie qui tienne quand on s'est trompé —, et
   si une même personne tenait les deux entrées, elle n'en garde qu'une, la
   plus récente. C'est encore la grammaire de l'invariant 26 : *une
   déclaration rangée chez soi, sommée à la lecture.*
32. *(Interface)* **Une porte qu'on n'a pas la charge d'ouvrir ne se grise pas :
   elle n'existe pas.** Le Greffe n'apparaît dans la barre que pour qui a le
   rôle dans l'organisation ; pour les autres il n'y a rien, pas un bouton
   éteint. **Et une fonction rare se range, elle ne se dissimule pas** : un
   raccourci secret serait encore moins découvrable qu'un survol, que
   l'invariant 19 interdit déjà. Qui tape l'adresse sans la charge reçoit une
   phrase qui le dit, et qui ne ment pas : *ce n'est pas une pièce fermée,
   c'est une charge.*

33. *(Code)* **Une écriture est une intention, pas un instantané.** Tout ce
   qu'on inscrit passe par un seul chemin (`core/model/write.ts`), qui garde
   des **fonctions** `(shard) => void` et non l'état qu'elles produisent.
   C'est ce qui permet, sur un `409`, de **relire le dépôt et de rejouer les
   intentions sur la version fraîche** : renvoyer un instantané périmé
   écraserait l'écriture de l'autre appareil. Il en découle trois règles :
   une rafale fait **un seul commit** (invariant 27) ; ce qui arrive pendant
   l'envoi appartient au tour suivant ; et **ce qui n'est pas parti retourne
   dans la file** plutôt que d'être perdu. Le message de commit dit ce qui
   s'est passé — « pose un checkpoint », jamais « mise à jour ».
34. *(Code)* **Un dérivé ne retombe jamais dans le fichier.** `circleRef`, les
   moyennes, les compteurs sont calculés à la lecture ; les réécrire dans un
   fragment en ferait des agrégats stockés (invariant 2), et ils
   deviendraient faux le jour où leur source change. Quand on compose un
   fragment depuis un objet de vue, on **énumère les champs**, on ne répand
   jamais l'objet entier.

35. *(Code)* **Un effet qui déclenche un travail ne doit pas suivre ce que ce
   travail lit.** Un `$effect` Svelte s'abonne à tout état lu pendant son
   exécution. Le 12 octobre, l'ouverture du registre lisait `phase`, qu'elle
   modifie : l'effet qui l'appelait s'est mis à la relancer lui-même,
   plusieurs fois, en parallèle — deux scribes, deux visites, et l'encart du
   guetteur vide **sans un message**. D'où deux règles : un effet qui lance
   une action l'enveloppe dans `untrack`, et une action longue est
   **non réentrante** (un second appel attend le premier). *Le symptôme
   était loin de la cause ; c'est la marque de ce genre de bug.*

36. *(Données)* **Le fonds propose, il ne compte pas.** Des œuvres peuvent
   exister dans le dépôt avant que quiconque les suive : elles sont
   **versées au fonds**, `fonds/<compte>.json` — un fichier par personne qui
   verse, un seul écrivain, sommé à la lecture (invariant 26, encore). Elles
   sont au *catalogue* — on les ouvre, on les cherche, on les met dans une
   quête — mais **pas au corpus** : le corpus reste ce que les gens suivent,
   et rien du fonds n'entre dans un compte, une moyenne, un « déjà plein ».
   Sur la page des Œuvres, elles ont leur propre section, « Au fonds —
   personne ne les suit encore ». Trois règles en découlent : **inscrire une
   œuvre du fonds en copie la description dans son fragment** (le fonds peut
   changer sans faire d'orphelin) ; **une description portée par quelqu'un
   l'emporte sur celle du fonds** ; et **les identifiants sont ceux des
   sources** — `tmdb:movie:<n>`, `tmdb:tv:<n>`, `igdb:<slug>`,
   `ol:<œuvre Open Library>`. ⚠️ *Pour IGDB, c'est le* slug *et non le
   numéro* : sans clé d'API, seul le slug se vérifie (via Wikidata), et
   l'API le rend aussi. Le jour où IGDB est branché, il faudra **garder le
   slug comme identité**, sinon chaque jeu du fonds devient un doublon.
   Décidé avec Nathan le 12 octobre ; les livres prennent l'identifiant
   gratuit d'Open Library, à sa demande.

37. *(Données)* **La fiche d'une œuvre se somme à la lecture, comme le
   reste.** Chacun porte sa copie de l'œuvre dans son fragment ; l'identité
   (titres, année, nature) est la première contribution, mais **les
   catégories s'additionnent** et **la jaquette la plus récente l'emporte**
   (`coverAt`), pour tout le monde. Une jaquette est **une adresse, jamais
   des octets** ; une adresse vide la retire. Il en découle une règle de
   copie, apprise le 12 octobre par un essai qui a échoué : **on ne recopie
   jamais la fiche du catalogue dans son fragment**, seulement son identité
   (`identity`), et jamais par référence — la fiche sommée porte les
   catégories des autres, et un objet partagé se modifiait des deux côtés à
   la fois (invariant 34).
   **Le titre et l'année, eux, ne se corrigent que par un greffier**
   (13 octobre, accepté par Nathan) : `corrections[]` dans son fragment,
   appliquées à la lecture, la plus récente l'emportant champ par champ, et
   une ligne au journal. Même grammaire que l'alias (invariant 31) — le
   fichier de qui a mal saisi n'est jamais touché. La porte « Corriger la
   fiche » n'existe que pour qui tient la charge (invariant 32).

*(La numérotation est en ajout seul, comme les champs du schéma : des documents
citent ces numéros, on n'en renumérote aucun.)*

### Code

11. **Trois couches, dépendances à sens unique.** Fonctions → Noyau → Plateforme.
   Jamais l'inverse, et **jamais entre deux fonctions**. Vérifié par une règle de
    lint, pas par la discipline.
12. **Un seul modèle de données partagé, un sélecteur par fonction.** Une nouvelle
   fonction, c'est un sélecteur et une vue ; les autres ne bougent pas.
13. **Règle de promotion.** Un composant reste dans son bloc tant qu'un seul bloc
   l'utilise. Dès qu'un *deuxième* en a besoin, il monte dans le noyau. Pas
   avant, jamais deux fois.
14. **Les surfaces sont dans le noyau.** Panneaux, superpositions, tiroirs et
    leurs effets visuels forment un vocabulaire partagé. Un bloc ne réinvente
    jamais les siens.
15. **Aucun secret dans le code de l'interface.** Les clés d'API tierces vivent
    dans la partie Rust ; le jeton utilisateur passe par l'interface `secrets`.

### Interface

16. **Après chaque règle d'état réduit, vérifier ce qui subsiste**, pas seulement
    ce qui disparaît. Deux bugs identiques déjà : un bouton de bascule et des
    icônes de navigation effacés par un sélecteur de repli trop large.
17. **Les surfaces s'empilent, elles ne se remplacent jamais.** Une surface
    ouverte depuis une autre doit la retrouver intacte en se fermant — sinon on
    détruit une saisie en cours. Celle du dessous se défocalise.
    ⚠️ *Précisé le 12 octobre, à la demande de Nathan* : la règle vaut pour
    une surface ouverte **depuis une surface**. Un geste de **la barre** (ou
    de l'en-tête en étroit) est une nouvelle destination : il **remplace** ce
    qui était ouvert (`pile.swap`), comme une navigation le fait déjà — et
    une saisie en cours dans le panneau remplacé est perdue, c'est assumé.
18. **Jamais de mesure de mise en page pendant une animation de transformation.**
    `getBoundingClientRect()` inclut les transformations ; employer
    `offsetWidth` / `offsetHeight`, et mesurer après la mise en page.
19. **Aucune action accessible par le seul survol.** Le survol peut confirmer,
    jamais découvrir. C'est la règle la plus facile à enfreindre sans s'en
    apercevoir, et la seule dont la réparation impose de rouvrir chaque vue.
20. **Mobile d'abord sur les primitives de mise en page.** Une colonne est la
    base ; les colonnes supplémentaires sont un bonus quand la place existe.
    Cibles tactiles d'au moins 44 px partout, bureau compris.
21. **Les composants interrogent leur conteneur, pas la fenêtre.** Une carte dans
    un panneau latéral est dans la même situation qu'une carte pleine largeur sur
    téléphone : un seul comportement à écrire.
22. **Chaque surface a une forme large et une forme étroite**, décidées dans le
    noyau. Un bloc demande une surface, jamais une disposition.
23. **Chaque vue déclare comment elle dégrade en étroit**, dans le registre, au
    même endroit que son nom. Une vue qui ne sait pas répondre n'est pas finie.

## L'entrée dans le groupe — l'ordre des écrans

**Quatre tuiles**, précédées d'une ouverture où le nom paraît lettre à lettre
puis recule. ⚠️ *Révisé le 12 octobre, à la demande de Nathan* : **l'ouverture
se joue à chaque lancement**, pas seulement à l'entrée. Le même rideau
couvre l'examen de la porte et la lecture du registre ; pour un membre il ne
se lève pas sur des tuiles, il **s'efface sur l'accueil** déjà prêt dessous.
Il couvre un chargement réel sans l'allonger, et **un clic le passe**. Ce qui fixe l'ordre n'est pas le goût, c'est une contrainte
technique : **le profil ne peut pas s'écrire avant l'admission**, puisqu'on n'a
pas les droits sur le dépôt de données. D'où :

**Ouverture · Le seuil · L'atelier · L'Ordre · L'entrée**

**Frapper, attendre et se composer un visage sont un seul geste** — on demande
à entrer, et on se présente pendant qu'on attend. Les séparer faisait trois
clics pour une seule idée. D'où **l'atelier** : une feuille plus large, le
portrait en vue à gauche pendant qu'on remplit à droite. *C'est le maintien du
résultat sous les yeux qui fait une création de personnage et non un
formulaire.*

- **L'attente est le pivot**, pas un accident : la demande est une issue, un
  administrateur la verra en ouvrant l'application, et **personne ne sera
  averti**. C'est là que vit le défilé des principes — il remplit un temps mort
  au lieu d'être un péage avant l'entrée. Le champ Discord s'y demande, parce
  que c'est le seul canal de relance qui existe.
- **Le portrait ne vient plus de GitHub.** Un fond pris dans une palette fermée,
  un emblème, un prénom. Les tons proposés évitent les cinq teintes d'Ordre :
  un visage est personnel, une teinte d'Ordre est collective, et les confondre
  créerait un faux signal. GitHub n'identifie plus que le compte.
- **Le dernier écran dit que le corpus est déjà plein.** C'est le meilleur
  premier écran possible : on n'arrive pas devant une bibliothèque vide, on
  arrive au milieu d'une conversation. Puis l'onde porte **« BIENVENUE DANS LE
  CODEX »**, en capitales et sans un mot de plus — un mot qui naît avec elle et
  meurt avec elle, jamais un écran de plus. **Elle ne nomme personne.** Le
  prénom y avait été mis, et il fallait une tournure de repli quand il manquait
  (« âme nouvelle ») : c'est là qu'on voit que l'adresse était fausse. Le seuil
  salue l'arrivée, il ne salue pas quelqu'un — les capitales font une
  inscription, l'apostrophe faisait une effusion.
- **Le défilé sort de la tuile.** Il est plus large qu'elle, avec ses flèches et
  sa règle de progression : c'est à la largeur qu'on voit que c'est un moment et
  non un paragraphe. Chaque principe porte une **vignette dessinée au trait**,
  plate et monochrome — un principe illustré se retient, un principe écrit se
  saute.
- **Les pastilles d'Ordre y sont exactement celles de la racine** : pleine
  couleur, halo, dérive, et la même rafale de couleur au choix. On les verra
  tous les jours — autant les reconnaître dès le premier soir.
- **La cité du Registre passe en contrebas**, et **changer d'étape glisse
  latéralement** : même profondeur, donc jamais de zoom.
- **Le nom ne se fond pas, il tombe lettre à lettre** — chacune un peu après la
  précédente, avec un léger dépassement, puis le mot recule et un trait se tire
  dessous. Et **des étoiles filantes traversent le fond** : pas la trame d'un
  Ordre, on n'en a pas encore, donc tout est à l'encre. ⚠️ *Le 12 octobre,
  Nathan a vu dans l'application Mac « de gros points très flous » derrière
  le nom* : la chute ne floute plus les lettres, et les poussières fixes du
  ciel sont retirées — les deux suspects. **Rien de flou dans l'ouverture.**
- **L'entrée finit sur une onde — la même que celle des pastilles d'Ordre**,
  simplement plus ample et plus lente. Elle reste **translucide d'un bout à
  l'autre** : on voit l'accueil se former au travers, et c'est ce qui la rend
  douce plutôt que brutale. Un volet de couleur opaque avait été essayé et
  écarté : *couvrir, c'est fermer une porte ; traverser, c'est en ouvrir une.*
  C'est le seul écran de la séquence qui porte une couleur, et c'est ce qui en
  fait un aboutissement.
- ~~⚠️ **Le banc d'essai (`V.onboard`, `openOnboarding`, onglet « Onboarding »)
  est temporaire.** À retirer au portage~~ — ✅ **Il n'a pas été porté**
  (12 octobre). La vraie séquence (`features/entry`) se joue avant que
  l'application ait la moindre donnée, et **rien dans la barre n'y mène**.
  Pour la voir en développement, l'adresse **`?dehors`** joue quelqu'un du
  dehors sur le faux — hors de la coque, jamais dans le binaire. Le
  prototype garde son onglet : il est la référence, pas l'application.
- **L'attente accepte l'invitation à la place de la personne.** Admettre
  envoie une *invitation* GitHub ; un inconnu ne sait pas qu'un courriel
  l'attend, et le critère de la V1 tomberait dessus. L'écran regarde toutes
  les trente secondes et à chaque retour dans la fenêtre, et accepte dès
  qu'elle paraît. **Si GitHub refuse que l'application accepte**, ou si
  l'invitation a expiré (sept jours), l'écran le dit et ouvre la page de
  l'invitation — il ne boucle pas en silence. ⚠️ *Le cas « invité mais pas
  encore entré » n'a pas pu être essayé contre le vrai GitHub : il faudrait
  inviter une vraie personne. Le premier arrivant réel est l'essai.*
- **Le fragment naît à l'entrée, pas à l'admission** — avec l'identité qu'on
  s'est composée, champ par champ, et la visite datée du même geste : un
  arrivant n'a rien manqué, l'encart du guetteur n'a rien à lui dire.
  L'onde ne part **qu'une fois l'écriture faite** : on ne salue pas
  quelqu'un dont le fichier n'existe pas.
- **Une panne n'est pas une déconnexion.** Seul un `401` fait oublier le
  jeton ; toute autre erreur de GitHub se dit et propose de réessayer.

## Hors périmètre — refuser, ne pas discuter

Temps réel · notifications push · comptes et mots de passe maison · rôles
multiples et permissions fines · fils arborescents · commentaires attachés à
une œuvre — la chronique est le seul écrit qu'une œuvre porte.

⚠️ **Révisé le 10 octobre.** La ligne disait « commentaires et fils de
discussion », sans distinguer. Ce qui les excluait, c'était le conflit
d'écriture et la modération. Or **la Grande Loge** — un message board par Ordre
— ne pose ni l'un ni l'autre : chacun n'écrit que dans son propre fragment, le
modèle tient sans un mot de code en plus, et la modération n'est pas une
fonction qu'on refuse mais une chose **non représentable** (on n'a pas accès en
écriture au fichier d'un autre). Ce qui reste exclu est ci-dessus, et le prix
est dit dans l'interface : aucun message n'est poussé, il paraît à la
synchronisation suivante, personne n'est averti.

Conséquence assumée de l'absence de notifications : **une demande d'adhésion en
attente ne peut pas être signalée.** L'écran d'attente doit le dire franchement et
proposer une relance par Discord — c'est la raison d'être de ce champ.

Reportés, pas exclus :

- **Administration** — ⚠️ **révisé le 11 octobre, et scindé.** Le *guichet des
  admissions* est **V1** : le critère de la V1 est qu'un inconnu entre sans
  qu'on lui explique rien, et il n'entre pas si personne ne peut l'admettre.
  Le reste du Greffe — doublons, journal, passation — reste **V2**. Pas un
  back-office dans les deux cas : à vingt personnes, ça suffit.
- **Android** — pas un palier de la trajectoire, une production secondaire. Les
  invariants 19 à 23 la maintiennent à ~2 jours de plomberie (chaîne de
  compilation, adaptateur de secret portable, signature, intégration continue).
  Les enfreindre la transforme en réécriture de toutes les vues. **iOS est hors
  sujet** : la distribution exige un compte Apple et un passage par l'App Store.
- **Steam et succès** — beaucoup plus tard, et seulement si l'envie tient. Le
  champ `links` est réservé dans le modèle, absent de l'interface.

## Pile technique

- **Tauri 2** — coque native, binaire d'une dizaine de Mo, trois OS.
  Repli : Electron, si la chaîne Rust devient un obstacle. Même architecture.
- **Svelte + TypeScript + Vite** — Svelte et non React : la bascule de mise au
  point anime `filter: blur()` et `transform` sur des couches entières, et veut
  un contrôle direct du DOM qu'aucune réconciliation ne vienne interrompre en
  cours de transition. `flip` et `crossfade` sont natifs, le CSS est scopé sans
  outil. Le typage reste une pièce de l'invariant 11, pas une préférence.
- **Rust** — surface réduite : HTTP, secrets, cache fichier.

Deux adaptateurs de la couche plateforme changent entre bureau et Android, et les
deux se règlent par un choix fait maintenant :

- **Secrets** — une implémentation portable, jamais une bibliothèque de trousseau
  propre au bureau. C'est le seul choix technique qui rendrait l'APK coûteux.
- **Mise à jour** — l'updater Tauri ne couvre pas Android. Un bandeau « nouvelle
  version disponible » le complète, et il marche partout.

**Aucune signature payante** — décidé par Nathan le 12 octobre. Le Mac est
signé *ad hoc* (gratuit ; c'est ce qui évite « l'application est
endommagée » sur Apple Silicon), Windows ne l'est pas. Conséquence assumée :
**un avertissement au premier lancement**, et la page des versions dit
comment le passer — c'est elle, pas l'application, qui parle à quelqu'un qui
n'a encore rien ouvert.

**La mise à jour intégrée a sa propre signature, gratuite**, et elle est
vérifiée avant toute installation. ⚠️ **Perdre la clé privée, c'est ne plus
jamais pouvoir mettre à jour personne** : chacun devrait réinstaller à la
main. Elle vit dans `~/.tauri/checkpoint.key` sur la machine de Nathan et
dans le secret `TAURI_SIGNING_PRIVATE_KEY` du dépôt — **jamais dans le
dépôt**, et elle se sauvegarde ailleurs.

**Une version sort en brouillon.** Pousser `vX.Y.Z` construit les trois
systèmes ; c'est un humain qui publie, d'un clic. L'étiquette doit dire la
version de `package.json` — seule source de version, que `tauri.conf.json`
lit — et la CI refuse sinon.

Structure des dossiers : voir §6 de la spec (`src/features`, `src/core`,
`src/platform`, `src/shell`, `src-tauri`).

## Identité — décidée, à ne pas diluer

**Registre en monde clair, plat, sans matière.** Blanc cassé, grain fin uniforme,
aucun biseau, aucune ombre portée, aucun reflet spéculaire. Le registre
« porcelaine émaillée » de la v1 est **abandonné** : il contredisait le plat.

**Cinq Ordres** : Mages, Guerriers, Rangers, Soigneurs, Bardes. En français —
« Healer » ne tient pas dans le registre. Chaque chambre porte une trame animée
dans sa couleur : étoiles et comètes, **une forêt de lances qui défile**,
feuillages, ondes concentriques, lignes ondulantes. Un seul moteur, cinq
comportements, très faible opacité.

**Noir et blanc, quatre exceptions et pas une de plus.** Les visages — avatars
GitHub dans des cercles ; les écrans d'Ordre, où la couleur baigne la chambre en
halo flou ; les jaquettes au survol ; et **les feuilles de personnage, qui
portent la trame de leur Ordre à présence réduite** — touchées par lui, sans
être la chambre. La **lignée** relève de cette quatrième : chaque visage y porte
le halo de son propre Ordre, flottant comme les disques de la racine. Ce n'est
pas une exception de plus parce que **chacun a le sien** — aucune teinte n'est
choisie contre une autre. C'est précisément l'argument qui l'autorise là et qui
l'interdit au **point d'entrée**, forcément unique, donc forcément neutre.

**Deux textures ne se distinguent jamais par leur couleur, mais par leur
mouvement.** Les Mages sont un ciel fixe traversé de comètes ; les Guerriers
sont **une forêt de lances qui défile** — des hampes longues, le pied hors
champ, qui dérivent très lentement d'un bord à l'autre en ondulant comme un
pas. Une troupe en marche, vue au-dessus des rangs.

**Trois états de cette trame ont été écartés, et jamais pour le mécanisme —
toujours pour l'image.** Les braises qui montaient ne disaient que « feu » :
*une trame doit nommer son Ordre, pas décrire un élément.* Les gerbes
d'étincelles, rouges et projetées, **se lisaient comme du sang**, et leur
vitesse rendait la page illisible. D'où la règle qui vaut pour les cinq :
**une trame est un fond — si elle se remarque, elle a déjà échoué.** On ne la
juge ni au code ni à l'intention, mais à l'image, et à sa discrétion : la
troupe met une minute à traverser l'écran, et ne dépasse pas ~1 % d'encre.
⚠️ Dans une couleur chaude, tout ce qui est projeté devient une éclaboussure.
Avant d'animer quoi que ce soit dans la chambre des Guerriers, se demander ce
que la forme dira une fois teintée de rouge.

**Les cinq gestes sont mutuellement exclusifs, et c'est une contrainte, pas un
constat.** Le mage est continu et immobile, le ranger tombe lentement en
tournoyant, le soigneur s'ouvre en cercles, le barde ondule à l'horizontale, le
guerrier est **le seul discontinu et le seul balistique**. D'où un interdit
concret : pas d'onde circulaire à l'impact du guerrier, elle emprunterait au
soigneur. Avant d'ajouter un comportement, vérifier qu'il n'est le voisin
d'aucun autre.

**Ce qui lit sous le contenu, c'est le trait long.** Les panneaux d'une chambre
masquent la plus grande part du canevas : une trame faite de points s'y perd,
une trame faite de traits traverse les intervalles. C'est pour ça que les
comètes marchaient et que les braises ne marchaient pas. Partout ailleurs, y compris la barre latérale et
les feuilles de personnage, il n'y a aucune couleur. Un point coloré à côté d'un
nom dilue l'exception : c'est interdit.

**Profondeur de champ.** Le flou gaussien n'est pas un effet, c'est la seule
profondeur disponible une fois la matière retirée. La zone de contenu est un
viseur avec un plan focal ; la barre latérale est le corps de la console et
reste toujours nette.

**Rien n'est flou au repos.** Le flou est un événement, jamais un état. On ne
défocalise jamais un texte que quelqu'un est peut-être en train de lire.
*C'est cette règle qui a fait écarter une trame animée et floutée en haut de
l'accueil : elle aurait fait du flou un décor permanent. Et une ambiance en
mouvement hors d'une chambre d'Ordre diluerait la seule chose que le mouvement
y signifie.*

**L'accueil tient deux régimes, et ils doivent se voir.** Au-dessus, ce qu'on
vous apporte — la chronique du moment, le hasard du Sort, ce qui a bougé depuis
la dernière visite : **une feuille posée**, un ton plus claire que le bureau,
fermée par un filet d'encre. En dessous, le papier nu : **l'instrument**, qu'on
vient consulter. Un seul ton d'écart et un seul filet — assez pour qu'on voie
la différence au passage de l'un à l'autre, trop peu pour qu'on la remarque en
lisant. **On sépare comme le ferait du papier, pas comme le ferait un écran.**
La feuille **respire** : trois halos très larges dérivent lentement dessous et
la font onduler entre son blanc et un blanc à peine plus clair, sur vingt-six
secondes. **Ce n'est pas une trame** — rien n'y a de forme, rien ne la traverse,
c'est le papier qui prend la lumière ; c'est ce qui l'autorise là où une trame
animée serait interdite. Et **jamais de blanc pur**, même au sommet du
souffle : le monde reste cassé.

**Deux gestes, et ils ne se confondent jamais.** Le **zoom** — deux couches se
croisent, celle qu'on quitte se défocalise et recule — dit un **changement de
profondeur** : on entre dans quelque chose. Le **glissement latéral**, sans
aucun flou, dit un **déplacement à profondeur égale** : on change d'onglet sans
descendre nulle part. Pas de morphing d'élément partagé.

**Une feuille doit dire qui on lit, pas seulement comment il s'appelle.** Sous
le nom, **une ligne de caractère** engendrée des faits — et chaque trait y porte
une *saillance*, son écart à la norme, de sorte que seuls les plus marquants
sortent. Réciter les mêmes trois traits pour tout le monde produirait des
feuilles interchangeables, ce qui est l'exact contraire du but. Pas de pronom :
on ne connaît pas le genre, et on n'a pas à le demander. À droite du nom,
**son magnum opus**, en jaquette.

**« En cours » est un tableau de bord, pas une lecture.** Titre et commandes sur
la même ligne, dernier checkpoint sur l'autre, tronqué. On vient y agir, pas s'y
attarder. Et **le panneau d'accès rapide montre aussi ce qu'on a mis de côté**,
avec de quoi le reprendre : suspendre était facile, reprendre ne l'était pas —
l'œuvre tombait dans le registre général et il fallait l'y retrouver.

**Les pensées prises en chemin s'appellent des checkpoints.** Pas des stations :
le contenu signature de l'application porte son nom. Un checkpoint n'est pas une
chronique en plus court — pensée datée contre jugement rédigé, deux champs, deux
endroits où on les pose, deux endroits où on les lit.

**Instrument partout.** Dense et compact, petite typographie, chiffres tabulaires,
filets d'un pixel. Pas de cartes arrondies, pas de gélules. La une de l'accueil
est l'afficheur principal d'un tableau de bord, pas une couverture de magazine.

**Le pixel art est la seule imagerie dessinée.** Monochrome, quatre valeurs de
gris, jamais lissé, toujours **engendré par code avec une graine fixe** — jamais
dessiné à la main, jamais importé. Cinq règles apprises à l'usage :

- **Deux pixels par point, pas trois.** À trois, aucun détail ne tient.
- **La rampe entière reste claire**, du gris moyen au gris pâle : `#6E6E64`
  `#929187` `#B2B1A7` `#D6D5CC`. Jamais de noir — il tamponnerait le papier au
  lieu de le dessiner, et c'est le défaut le plus tenace de mes premiers jets.
- **Une scène se compose, elle ne se tire pas au sort.** Il lui faut un parti,
  pas une densité : masse dense d'un côté, dispersion, puis campagne.
- **Le tramage donne l'air** — nuages, rais de lumière, versants. Mais un
  tramage sans ligne de crête ne lit que comme une hachure : toute masse a
  besoin d'un bord dessiné.
- **Un générateur ne se juge qu'à l'image.** Relire le code ne dit rien de ce
  qu'on verra.
- **On anime le contenu, jamais la géométrie.** Aucune rotation ne tombe sur la
  grille : le dé du Sort « roule » en changeant le chiffre de sa face, le moulin
  est la seule exception et il redessine ses ailes point par point.
- **Animer une partie d'un dessin impose d'en garder une empreinte.** Effacer
  sa boîte englobante emporte le fond qui s'y trouve. On capture la zone *avant*
  que l'élément animé n'existe, et on la restitue à chaque image. **Et la boîte
  doit couvrir la course complète du mouvement, pas la forme au repos** —
  vérifier l'étendue par le calcul, pas à l'œil.

**Le Royaume est un monde, pas une allégorie de l'application.** Les territoires
— Hautes Dents, Plateau Brûlé, Sylve Ancienne, Marais d'Avren, Coteaux de Vèze,
Landes Grises, Mer Close — n'appartiennent à aucun Ordre et ne doivent jamais
être recalqués sur eux. Les Ordres y auront peut-être une ville ; ils n'y ont
pas de fief. Un décor qui illustre l'application se périme avec elle ; un décor
qui existe pour lui-même tient.

Deux usages : la ville de
profil en tête du Registre, et la carte du Royaume. Il ne remplace rien, il
habille.

**La lignée est la seule page de l'application qui parle de gens, et elle doit
en avoir le ton.** Visages flottants et halos qui respirent ; les noms en
Instrument Serif, les parentés en italique ; les courbes plutôt que l'équerre —
une maisonnée n'est pas un organigramme. Et **les chiffres s'y disent en
phrase** : quatre cases de statistiques feraient un tableau de bord, « XIII
œuvres fréquentées sous ce toit, CCLXXXVIII heures de jeu, IV chroniques » fait
une maison. Le romain tient le ton sans refroidir.

**Une maisonnée se lit toujours pareil, quel que soit celui par qui on y
entre** — l'aîné d'abord, puis l'ordre des noms. Sinon le même foyer change de
nom selon la porte, et ce n'est plus un foyer.

**La lignée est une section, jamais un onglet.** Une parenté dépasse la
personne : elle ne peut pas être une facette de sa feuille. On y entre par un
**point discret** dans la ligne d'identité — l'astérisme et le nombre de
membres — et l'on en ressort là où l'on va. **Le point est neutre, et il doit
l'être** : les membres d'une maisonnée ne sont pas du même Ordre, une marque
colorée obligerait à en trahir un et ferait une cinquième exception.

**Une parenté se déclare des deux côtés, et le mot est toujours celui de
l'autre.** Chacun n'écrit que dans son fragment : le lien n'existe que si les
deux l'ont posé, ce qui interdit de s'inventer une famille. Et c'est l'enfant
qui dit « mon père », donc l'écran écrit « père de » — *personne ne se nomme
soi-même dans une famille.* La maisonnée n'est pas un objet qu'on possède :
c'est la composante connexe des liens confirmés, elle n'a ni propriétaire ni
création. **C'est le premier lien de l'application qui traverse les Ordres** —
on choisit son Ordre, on ne choisit pas sa maisonnée.

**Une seule chose sur l'accueil porte une couleur : l'encart du guetteur**, et
c'est celle de ton Ordre. Il dit ce que la synchronisation vient de révéler —
paroles nouvelles dans ta Loge, quête que tu viens de sceller, planche à toi
qu'un autre a accomplie. **Une annonce par ligne, un fanion en guise de tiret**,
et sa place est **entre Le Sort et Les inscriptions** : pas en tête de page,
parce qu'on n'ouvre pas l'application pour des annonces, mais juste avant le
fil, là où le regard descend déjà. **Ce n'est pas une notification** : il n'y en a pas, et
il n'y en aura pas. Elle ne se ferme pas et ne se compte pas, elle disparaît
d'elle-même à la visite suivante — elle ne décrit que l'écart avec la
précédente. Une quête n'ayant pas de date d'accomplissement, on la date par la
dernière inscription qui l'a scellée.

**Le Greffe — et la distinction qui le fonde.** Deux besoins se ressemblent et
ne sont pas le même : **ce qui demande une autorité** (admettre, écarter,
fondre un doublon, passer la charge) et **ce qui demande seulement de la
discrétion** (resynchroniser, lire son fragment brut, régler l'affichage des
titres). *Une autorité n'est pas une discrétion.* Les réunir donnerait un
panneau où une préférence anodine côtoie une exclusion. L'autorité tient dans
**le Greffe**, troisième zone de la barre sous sa propre règle — ni *agir*, ni
*parcourir* : **tenir**. La discrétion vit **au pied de sa propre feuille**, où
le visage mène déjà.

Trois choses que le Greffe impose, et qu'il dit à l'écran :

- **Rien n'y est en coulisse.** Tout le monde lit le même dépôt : un acte de
  greffier paraît dans l'historique de chacun. L'écran l'écrit au lieu de
  feindre une arrière-salle — même honnêteté que pour la Loge (invariant 25).
- **Il n'y a pas de modération, et il n'y en aura pas.** Ce n'est pas une
  fonction qu'on refuse, c'est une chose **non représentable** : on n'a pas
  accès en écriture au fichier d'un autre.
- **Rien ne s'y efface.** Admettre, écarter, fondre, défaire sont tous des
  actes inscrits ; un alias se retire, une exclusion n'ouvre aucune liste
  noire. Et *passer la charge change un rôle dans l'organisation* — jamais une
  liste maison, invariant 10.

Et puisque personne n'est averti de rien, **une demande qui attend paraît dans
l'encart du guetteur**, pour qui tient la charge seulement : c'est le seul
moment où quelqu'un regarde.

**L'établi — et le seul geste caché de l'application.** Les diagnostics
d'atelier (quota, coût de la dernière ouverture, fragments illisibles, file
d'écriture, cache, versions) s'ouvrent par **cinq clics sur deux boutons
invisibles**, dans le coin bas-droit de la zone floutée quand le volet est
déplié : **gauche, droite, gauche, droite, gauche**, sans pause de plus
d'une seconde et demie. C'est une **entorse délibérée** aux invariants 19 et
32, demandée par Nathan le 11 octobre, et **bornée** : elle ne mène qu'à
l'atelier, jamais à une autorité. *Un panneau d'atelier a le droit d'être
introuvable ; une porte d'admission non.* Rien de ce qu'il contient n'est
nécessaire pour se servir de Checkpoint — c'est la condition qui l'autorise.

**Une porte par pièce.** La barre latérale sépare **agir** — inscrire une
œuvre, voir ses en cours, ouvrir une quête — de **parcourir** : les Ordres, les
Œuvres, les Quêtes. Une règle les sépare, et elle subsiste quand la barre est
repliée. « Ma Feuille » n'y figure pas : le visage en bas y mène déjà, et deux
portes pour la même pièce, c'est une porte de trop. En étroit, où la barre
n'existe pas, le visage passe dans l'en-tête — jamais dans la barre basse, qui
reste à quatre entrées.

**Une quête est une pancarte, pas une jaquette.** Une œuvre a une image ; une
quête n'a qu'un nom et une promesse. D'où la planche : un panneau cloué sur un
piquet, légèrement de travers, qui se redresse quand on s'en approche. **On la
lit de loin, on ne voit ses conditions qu'en entrant.** Accomplie, la planche
**s'inverse** — encre pleine, texte en papier : le plus fort contraste
disponible sans couleur, et il ne sert qu'à ça.

**Nul ne valide une quête.** Elle s'accomplit d'elle-même, à mesure que les
registres avancent. C'est ce qui la distingue d'un trophée décerné : il n'y a
personne à convaincre, et donc rien à administrer.

**Le volet déplié est un lanceur.** Le contenu passe au flou gaussien et le
volet prend la main : on y cherche, les résultats s'affichent **en jaquettes**
au-dessus du flou, et **choisir referme le volet sur la page atteinte**.
L'état replié est l'état de travail, et c'est lui par défaut.

Trois gestes s'y distinguent, et la distinction est la règle :

- **Choisir une destination referme** — un lien de navigation, une jaquette.
- **Déplier une section ne referme pas** — le chevron n'est pas un choix.
- **Cliquer dans le champ de recherche ne referme pas** — c'est le contraire
  d'un choix, c'est le début d'un.

⚠️ **La carte du Royaume est en sommeil.** Jugée ratée ; le code reste entier et
se rallume par `mountKingdom(host)`. Ne pas la remonter sans décision.

**Les catégories reprennent le vocabulaire des sources.** IGDB pour les jeux,
TMDb pour les films et les séries — puisque c'est de là que viendra l'identité
des œuvres, les genres arriveront **déjà mappés**, sans table de correspondance
à maintenir. IGDB distingue deux axes et la distinction est juste : « tir » ou
« simulation » dit **la forme**, « horreur » ou « romance » dit **le sujet** ;
les livres n'ont aucune autorité unique, leur liste est la nôtre et assumée.
**Un choix qu'on ne voit pas n'existe pas** : les familles s'affichent en entier,
jamais dans une boîte à défilement interne. Et **toute valeur déjà consignée
hors liste reste choisissable**, sinon une simple édition l'efface.
**Les catégories se décrivent au moment où l'on décrit l'œuvre**, pas une étape
plus tard : elles suivent la nature choisie, et changer de nature les vide — un
genre de jeu ne veut rien dire pour un livre, et le garder en silence serait pire.

**Une liste déroulante de cent entrées n'est pas un choix, c'est une épreuve.**
Partout où l'on désigne une œuvre — citer dans la Loge, distinguer, bâtir une
quête — on cherche, on voit la jaquette, on retire d'un geste. Et le choix met
à jour **ses seuls résultats** : on ne redessine jamais sous les doigts de
quelqu'un qui écrit.

**Une jaquette donne sa couleur au haut de sa fiche** — floutée, étalée, très
diluée — et **s'éteint avant les chiffres**. Ce n'est pas une cinquième
exception au noir et blanc : c'est la troisième, rendue en ambiance au lieu
d'être rendue en image. Au-delà du titre la page est un instrument, et un
instrument ne se colore pas.

**Catalogue typographique, jaquettes en exception.** Le Répertoire a deux vues :
un registre dense sans aucune image, et une grille de jaquettes en noir et blanc
qui reprennent leur couleur au survol. **Quand une œuvre n'a pas de jaquette, le
cadre porte son titre.** Hors de ces deux cas, les seules images de
l'application sont les visages.

**Jamais d'octets d'image dans le dépôt de données.** On stocke l'URL d'une
jaquette, pas le fichier : Git n'efface jamais un binaire remplacé, et chaque
membre le retélécharge à chaque clone. Un import manuel est redimensionné côté
natif et plafonné — voir spec §7.

**Le cadre est cérémonieux, la parole ne l'est pas.** La Grande Loge est le
seul endroit où l'application se tait : elle fournit le meuble — « Prendre la
parole », « en réponse à », les rangs en chiffres romains — et laisse les gens
écrire comme ils parlent. Un message n'engage rien et ne vaut pas chronique.

**La Loge est un fil, pas une pile de blocs.** Dense, dans le sens du temps,
avec son propre défilement, ouvert en bas — c'est là qu'est le présent. Les
messages consécutifs d'une même personne à moins d'un quart d'heure se groupent
sous un seul nom : c'est ce groupement qui fait la différence entre un fil et
un forum. Séparateurs de jour, heure à la minute, et **les commandes restent
visibles** — dans un fil dense la tentation du survol est à son maximum, et
c'est là qu'il faut y résister. Un signe qu'on n'a jamais lu n'est pas
découvrable : les glyphes sont nommés une fois en tête du fil.

**Replier un fil, c'est le réduire à ce que quelqu'un a voulu pouvoir
retrouver.** Le surlignage n'est pas une décoration, c'est un index construit à
la main par ceux qui lisent. Replié, chaque passage dit qui l'a dit, quand, et
qui l'a surligné — et **le rouvrir ramène à l'endroit exact d'où il vient**,
jamais en haut ni en bas.

**Le vouvoiement de la porte close.** L'application tutoie partout. Une seule
phrase vouvoie — « Vous ne faites pas partie de la grande loge. Ses secrets
vous sont interdits. » C'est volontaire : la porte ne te connaît pas. Un écran
de refus n'a pas à être aimable, il a à être net.

**Une distinction se montre, un jugement se lit.** Les favoris sont le
troisième endroit où la jaquette prime sur le titre, après le Répertoire et la
fiche. Sur une feuille, le premier rang s'appelle **Magnum opus** ; dans la
chambre d'un Ordre, l'onglet du même nom somme les distinctions de ses membres.
C'est **le seul accord de l'application qui se déclare au lieu d'être calculé**
— et quand aucune œuvre ne réunit deux voix, on le dit plutôt que de feindre
l'unanimité.

**Ton cérémonieux, tenu partout.** « Achevé », « Renoncement », « Jugement
moyen », « Annales de l'Ordre », chiffres romains. Le lexique est **accordé par
nature d'œuvre** : une série est achevée, un film contemplé. Une seule
formulation neutre au milieu et tout sonne faux.

Typographie : Instrument Serif (titres d'œuvres, chiffres cérémonieux), Spectral
(chroniques, texte à lire), Archivo (interface, étiquettes).

Écrire en français dans l'interface. Identifiants et code en anglais.
