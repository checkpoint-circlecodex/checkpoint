//! Ouvrir une page dans le navigateur de la personne — **et seulement une
//! page de GitHub**. Trois usages : saisir le code du device flow, accepter
//! une invitation que l'application n'a pas pu accepter d'ici, relire sa
//! demande. Aucun ne demande un autre hôte, donc aucun n'est permis : la
//! page web ne peut pas s'en servir pour envoyer quelqu'un ailleurs.

use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

/// Vrai seulement pour `https://github.com/…`. On analyse l'adresse plutôt
/// que de comparer un préfixe : `https://github.com.ailleurs.net` commence
/// presque pareil.
pub fn allowed(url: &str) -> bool {
    match reqwest::Url::parse(url) {
        Ok(u) => u.scheme() == "https" && u.host_str() == Some("github.com") && u.port().is_none(),
        Err(_) => false,
    }
}

#[tauri::command]
pub fn open_github(app: AppHandle, url: String) -> Result<(), String> {
    if !allowed(&url) {
        return Err(format!("adresse refusée : {url}"));
    }
    app.opener().open_url(url, None::<&str>).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::allowed;

    #[test]
    fn seul_github_s_ouvre() {
        assert!(allowed("https://github.com/login/device"));
        assert!(allowed("https://github.com/orgs/checkpoint-circlecodex/invitation"));
        assert!(!allowed("https://github.com.ailleurs.net/login"));
        assert!(!allowed("http://github.com/login/device"));
        assert!(!allowed("https://gist.github.com/x"));
        assert!(!allowed("https://github.com:8443/x"));
        assert!(!allowed("javascript:alert(1)"));
        assert!(!allowed("file:///etc/passwd"));
    }
}
