//! Le seul chemin par lequel l'application parle à GitHub.
//!
//! **Une seule commande générique, mais pas un passe-partout** : `path` est
//! concaténé à `https://api.github.com`, donc l'interface web ne peut pas
//! désigner un autre hôte. Si la page était un jour compromise, elle ne
//! pourrait pas faire voyager le jeton ailleurs.
//!
//! Le jeton est ajouté **ici**. L'interface ne l'a jamais eu et ne l'aura
//! jamais — voir `secrets`.

use serde::Serialize;
use tauri::AppHandle;

use crate::secrets;

const API: &str = "https://api.github.com";
const UA: &str = "Checkpoint";

#[derive(Serialize)]
pub struct Reply {
    pub status: u16,
    pub body: String,
    /// Rendu pour les lectures conditionnelles. ⚠️ Un `304` **décompte du
    /// quota** — mesuré, contrairement à ce qu'on lit partout. L'ETag
    /// économise la bande passante et le temps, pas le budget d'appels.
    pub etag: Option<String>,
    /// Ce qui reste du quota horaire, tel que GitHub le rend. Utile pour
    /// l'établi, et pour ne pas raisonner sur une gratuité imaginaire.
    pub remaining: Option<u32>,
}

fn client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .user_agent(UA)
        .build()
        .map_err(|e| e.to_string())
}

/// La requête elle-même, sans Tauri : c'est ce qui permet de la vérifier
/// contre le vrai dépôt dans un test, au lieu de la croire sur parole.
pub async fn request(
    token: &str,
    method: &str,
    path: &str,
    body: Option<serde_json::Value>,
    etag: Option<String>,
) -> Result<Reply, String> {
    if !path.starts_with('/') {
        return Err("un chemin d'API commence par /".into());
    }

    let m = reqwest::Method::from_bytes(method.as_bytes()).map_err(|e| e.to_string())?;
    let mut req = client()?
        .request(m, format!("{API}{path}"))
        .header("Accept", "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .bearer_auth(token);
    if let Some(tag) = etag {
        req = req.header("If-None-Match", tag);
    }
    if let Some(b) = body {
        req = req.json(&b);
    }

    let res = req.send().await.map_err(|e| e.to_string())?;
    let status = res.status().as_u16();
    let head = |k: &str| res.headers().get(k).and_then(|v| v.to_str().ok()).map(str::to_string);
    let etag = head("etag");
    let remaining = head("x-ratelimit-remaining").and_then(|v| v.parse().ok());
    let body = res.text().await.unwrap_or_default();
    Ok(Reply { status, body, etag, remaining })
}

/// La commande n'est qu'une enveloppe : elle va chercher le jeton, et c'est
/// tout ce qu'elle ajoute. Le jeton ne traverse jamais le pont.
#[tauri::command]
pub async fn gh(
    app: AppHandle,
    method: String,
    path: String,
    body: Option<serde_json::Value>,
    etag: Option<String>,
) -> Result<Reply, String> {
    let token = secrets::read(&app).ok_or("aucun jeton — il faut se connecter")?;
    request(&token, &method, &path, body, etag).await
}

/// Le jeton existe-t-il ? La seule question que l'interface a le droit de
/// poser à son sujet.
#[tauri::command]
pub fn gh_has_token(app: AppHandle) -> bool {
    secrets::read(&app).is_some()
}

#[tauri::command]
pub fn gh_forget(app: AppHandle) -> Result<(), String> {
    secrets::clear(&app)
}
