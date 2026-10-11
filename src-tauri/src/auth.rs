//! Le device flow, et la raison d'être de la coque native.
//!
//! Mesuré le 10 octobre : `https://github.com/login/device/code` n'expose
//! **aucun en-tête CORS**, préflight compris. Depuis une page web le
//! navigateur refuserait avant même d'émettre la requête. C'est ce qui fait
//! de la coque une condition et non un confort (D5).
//!
//! Mesuré le 11 octobre : avec « Expire user authorization tokens » décoché
//! sur la GitHub App, le jeton ne périme pas — il n'y a aucun renouvellement
//! à écrire.

use serde::{Deserialize, Serialize};
use tauri::AppHandle;

use crate::{config::Config, secrets};

const DEVICE: &str = "https://github.com/login/device/code";
const TOKEN: &str = "https://github.com/login/oauth/access_token";
const GRANT: &str = "urn:ietf:params:oauth:grant-type:device_code";

#[derive(Serialize, Deserialize, Clone)]
pub struct Knock {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub expires_in: u64,
    pub interval: u64,
}

#[derive(Serialize)]
#[serde(tag = "state", rename_all = "lowercase")]
pub enum Step {
    /// La personne n'a pas encore validé le code. Rien à faire qu'attendre.
    Pending { interval: u64 },
    /// Jeton obtenu et rangé. Il n'est pas rendu ici — il ne sort jamais.
    Ok { login: String },
    Error { message: String },
}

fn client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .user_agent("Checkpoint")
        .build()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn auth_start() -> Result<Knock, String> {
    let cfg = Config::load();
    let res = client()?
        .post(DEVICE)
        .header("Accept", "application/json")
        .form(&[("client_id", cfg.client_id.as_str())])
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let text = res.text().await.map_err(|e| e.to_string())?;
    serde_json::from_str::<Knock>(&text).map_err(|_| format!("réponse inattendue de GitHub : {text}"))
}

#[tauri::command]
pub async fn auth_poll(app: AppHandle, device_code: String) -> Result<Step, String> {
    let cfg = Config::load();
    let res = client()?
        .post(TOKEN)
        .header("Accept", "application/json")
        .form(&[
            ("client_id", cfg.client_id.as_str()),
            ("device_code", device_code.as_str()),
            ("grant_type", GRANT),
        ])
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let v: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    if let Some(err) = v.get("error").and_then(|x| x.as_str()) {
        return Ok(match err {
            /* `slow_down` n'est pas une erreur : GitHub demande d'espacer. On
               rend le nouvel intervalle plutôt que d'insister au même rythme. */
            "authorization_pending" => Step::Pending { interval: 5 },
            "slow_down" => Step::Pending {
                interval: v.get("interval").and_then(|x| x.as_u64()).unwrap_or(10),
            },
            "expired_token" => Step::Error { message: "Le code a expiré. Recommence.".into() },
            "access_denied" => Step::Error { message: "Demande refusée depuis GitHub.".into() },
            other => Step::Error { message: format!("GitHub répond : {other}") },
        });
    }

    let token = v
        .get("access_token")
        .and_then(|x| x.as_str())
        .ok_or("réponse sans jeton")?;
    secrets::write(&app, token)?;

    /* On relit tout de suite qui l'on est : c'est l'identifiant GitHub qui
       nomme le fragment (invariant 8), et le demander à la personne serait
       une occasion de se tromper. */
    let me = client()?
        .get("https://api.github.com/user")
        .header("Accept", "application/vnd.github+json")
        .bearer_auth(token)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let who: serde_json::Value = me.json().await.map_err(|e| e.to_string())?;
    let login = who
        .get("login")
        .and_then(|x| x.as_str())
        .ok_or("compte illisible")?
        .to_string();

    Ok(Step::Ok { login })
}

/// Les coordonnées du cercle, pour que l'interface compose ses chemins d'API
/// sans les recopier. Rien de secret ici.
#[derive(Serialize)]
pub struct Where {
    pub org: String,
    pub repo: String,
    pub public_repo: String,
}

#[tauri::command]
pub fn whereabouts() -> Where {
    let c = Config::load();
    Where { org: c.org, repo: c.repo, public_repo: c.public_repo }
}
