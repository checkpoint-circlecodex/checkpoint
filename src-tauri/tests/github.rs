//! Vérification de la couche GitHub **contre le vrai dépôt**.
//!
//! Ces essais ne tournent que si un jeton est posé dans `CHECKPOINT_TOKEN` —
//! sinon ils s'abstiennent au lieu d'échouer, pour que la CI reste verte sans
//! secret. On ne met jamais de jeton dans la CI : elle n'a rien à écrire.
//!
//! ```
//! CHECKPOINT_TOKEN=$(cat ../spike/.token) cargo test -- --nocapture
//! ```

use checkpoint_lib::github;

fn token() -> Option<String> {
    std::env::var("CHECKPOINT_TOKEN").ok().filter(|t| !t.trim().is_empty())
}
const ORG: &str = "checkpoint-circlecodex";
const REPO: &str = "tracker-data";

#[tokio::test]
async fn l_arbre_rend_tout_en_un_appel() {
    let Some(t) = token() else { return eprintln!("· pas de jeton, essai sauté") };
    let r = github::request(&t, "GET", &format!("/repos/{ORG}/{REPO}/git/trees/HEAD?recursive=1"), None, None)
        .await
        .expect("requête");
    assert_eq!(r.status, 200, "{}", r.body);
    let v: serde_json::Value = serde_json::from_str(&r.body).unwrap();
    assert_eq!(v["truncated"], false, "l'arbre ne doit pas être tronqué à cette échelle");
    eprintln!("  ✓ arbre : {} entrées, quota restant {:?}", v["tree"].as_array().unwrap().len(), r.remaining);
}

#[tokio::test]
async fn un_sha_perime_rend_409() {
    let Some(t) = token() else { return eprintln!("· pas de jeton, essai sauté") };
    let path = format!("/repos/{ORG}/{REPO}/contents/data/_essai.json");

    // 1. écrire
    let first = github::request(&t, "PUT", &path, Some(serde_json::json!({
        "message": "essai : première écriture",
        "content": "eyJ2IjoxfQ==",
    })), None).await.expect("écriture");
    assert!(first.status == 200 || first.status == 201, "{}", first.body);
    let v: serde_json::Value = serde_json::from_str(&first.body).unwrap();
    let sha = v["content"]["sha"].as_str().unwrap().to_string();

    // 2. réécrire avec le bon SHA : accepté
    let second = github::request(&t, "PUT", &path, Some(serde_json::json!({
        "message": "essai : deuxième écriture",
        "content": "eyJ2IjoyfQ==",
        "sha": sha,
    })), None).await.expect("réécriture");
    assert!(second.status == 200 || second.status == 201, "{}", second.body);

    // 3. réécrire avec le SHA d'avant : c'est le conflit qu'on veut voir
    let stale = github::request(&t, "PUT", &path, Some(serde_json::json!({
        "message": "essai : SHA périmé",
        "content": "eyJ2IjozfQ==",
        "sha": sha,
    })), None).await.expect("écriture périmée");
    assert_eq!(stale.status, 409, "un SHA périmé doit rendre 409 — {}", stale.body);
    eprintln!("  ✓ conflit : 409 sur SHA périmé");

    // 4. nettoyer derrière soi
    let cur: serde_json::Value = serde_json::from_str(&second.body).unwrap();
    let del = github::request(&t, "DELETE", &path, Some(serde_json::json!({
        "message": "essai : retrait",
        "sha": cur["content"]["sha"].as_str().unwrap(),
    })), None).await.expect("retrait");
    assert_eq!(del.status, 200, "{}", del.body);
    eprintln!("  ✓ nettoyé");
}

#[tokio::test]
async fn le_role_se_lit_dans_l_organisation() {
    let Some(t) = token() else { return eprintln!("· pas de jeton, essai sauté") };
    let me = github::request(&t, "GET", "/user", None, None).await.expect("qui suis-je");
    let who: serde_json::Value = serde_json::from_str(&me.body).unwrap();
    let login = who["login"].as_str().unwrap();

    let r = github::request(&t, "GET", &format!("/orgs/{ORG}/memberships/{login}"), None, None)
        .await
        .expect("rôle");
    assert_eq!(r.status, 200, "{}", r.body);
    let m: serde_json::Value = serde_json::from_str(&r.body).unwrap();
    eprintln!("  ✓ {login} : rôle « {} », état « {} »", m["role"], m["state"]);
}

/// ⚠️ **Le point sur lequel je me suis trompé deux fois.** Le spike du
/// 10 octobre avait mesuré qu'un `304` décompte du quota — mais **sans
/// jeton**, et il l'avait lui-même signalé : « à refaire authentifié ».
/// Authentifié, c'est l'inverse : six relectures conditionnelles, aucun
/// décompte. La leçon tient en une ligne — **mesurer dans la condition où
/// l'on sera**, pas dans celle qui se mesure facilement.
///
/// Cet essai existe pour que le jour où GitHub changerait d'avis, ce soit la
/// machine qui le dise et pas une supposition.
#[tokio::test]
async fn un_304_ne_decompte_pas_du_quota_authentifie() {
    let Some(t) = token() else { return eprintln!("· pas de jeton, essai sauté") };
    let path = format!("/repos/{ORG}/{REPO}/git/trees/HEAD");
    let first = github::request(&t, "GET", &path, None, None).await.expect("première lecture");
    let etag = first.etag.clone().expect("GitHub doit rendre un ETag");

    /* Trois relectures : une seule ne distinguerait pas « gratuit » d'un
       décompte qui arrive avec un temps de retard. */
    let mut last = first.remaining.expect("quota restant");
    for i in 1..=3 {
        let again = github::request(&t, "GET", &path, None, Some(etag.clone()))
            .await
            .expect("relecture");
        assert_eq!(again.status, 304, "la relecture conditionnelle doit rendre 304");
        let now = again.remaining.expect("quota restant");
        assert_eq!(now, last, "relecture {i} : un 304 authentifié ne doit rien décompter ({last} → {now})");
        last = now;
    }
    eprintln!("  ✓ 304 authentifié : quota inchangé à {last} sur trois relectures");
}

/// Le Greffe lit qui tient la charge **dans l'organisation**. Lecture seule :
/// un essai qui admettrait quelqu'un inviterait une vraie personne.
#[tokio::test]
async fn les_greffiers_se_lisent_dans_l_organisation() {
    let Some(t) = token() else { return eprintln!("· pas de jeton, essai sauté") };
    let r = github::request(&t, "GET", &format!("/orgs/{ORG}/members?role=admin&per_page=100"), None, None)
        .await
        .expect("requête");
    assert_eq!(r.status, 200, "{}", r.body);
    let v: serde_json::Value = serde_json::from_str(&r.body).unwrap();
    let who: Vec<&str> = v.as_array().unwrap().iter().filter_map(|m| m["login"].as_str()).collect();
    assert!(!who.is_empty(), "une organisation sans greffier ne pourrait admettre personne");
    eprintln!("  ✓ greffiers : {}", who.join(", "));
}

/// Les demandes sont les issues ouvertes du dépôt public. La lecture doit
/// passer avec les droits de l'application, sans étiquette ni filtre.
#[tokio::test]
async fn les_demandes_se_lisent_sur_le_depot_public() {
    let Some(t) = token() else { return eprintln!("· pas de jeton, essai sauté") };
    let r = github::request(&t, "GET", "/repos/checkpoint-circlecodex/checkpoint/issues?state=open&per_page=100", None, None)
        .await
        .expect("requête");
    assert_eq!(r.status, 200, "{}", r.body);
    let v: serde_json::Value = serde_json::from_str(&r.body).unwrap();
    let n = v.as_array().unwrap().iter()
        .filter(|i| i["body"].as_str().unwrap_or("").contains("<!-- checkpoint:knock v1 -->"))
        .count();
    eprintln!("  ✓ issues ouvertes : {}, dont {} demande(s)", v.as_array().unwrap().len(), n);
}
