//! Les coordonnées du cercle. Elles ne sont pas des secrets : le `client_id`
//! d'une GitHub App voyage dans tout binaire distribué, c'est prévu ainsi par
//! le device flow. Le vrai secret — le jeton d'une personne — n'est jamais
//! ici : il est obtenu à l'exécution et rangé par `secrets`.
//!
//! Chaque valeur se laisse remplacer par une variable d'environnement, pour
//! qu'un essai ne demande pas de recompiler.

pub struct Config {
    pub client_id: String,
    pub org: String,
    pub repo: String,
    pub public_repo: String,
}

fn var(key: &str, fallback: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| fallback.to_string())
}

impl Config {
    pub fn load() -> Self {
        Self {
            client_id: var("CHECKPOINT_CLIENT_ID", "Iv23livgN0tyCS8XncFd"),
            org: var("CHECKPOINT_ORG", "checkpoint-circlecodex"),
            repo: var("CHECKPOINT_REPO", "tracker-data"),
            public_repo: var("CHECKPOINT_PUBLIC_REPO", "checkpoint-circlecodex/checkpoint"),
        }
    }
}
