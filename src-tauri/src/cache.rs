//! Le cache de blobs, sur disque.
//!
//! **Un blob Git est adressé par son contenu** : son SHA ne désignera jamais
//! autre chose. Ce cache n'a donc aucune politique d'invalidation à tenir —
//! c'est la seule sorte de cache qui ne peut pas mentir. Seule la première
//! ouverture paie ; ensuite on ne retélécharge que ce qui a bougé.

use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

fn dir(app: &AppHandle) -> Result<PathBuf, String> {
    let d = app
        .path()
        .app_cache_dir()
        .map_err(|e| format!("dossier de cache introuvable : {e}"))?
        .join("blobs");
    fs::create_dir_all(&d).map_err(|e| e.to_string())?;
    Ok(d)
}

/// Un SHA Git est quarante caractères hexadécimaux. On le vérifie avant d'en
/// faire un nom de fichier : une clé venue de l'interface ne doit jamais
/// pouvoir désigner un chemin hors du dossier de cache.
fn safe(key: &str) -> Result<&str, String> {
    let ok = key.len() >= 7
        && key.len() <= 64
        && key.bytes().all(|b| b.is_ascii_hexdigit());
    if ok { Ok(key) } else { Err("clé de cache invalide".into()) }
}

#[tauri::command]
pub fn cache_get(app: AppHandle, key: String) -> Result<Option<String>, String> {
    let k = safe(&key)?;
    let p = dir(&app)?.join(k);
    Ok(fs::read_to_string(p).ok())
}

#[tauri::command]
pub fn cache_set(app: AppHandle, key: String, value: String) -> Result<(), String> {
    let k = safe(&key)?;
    fs::write(dir(&app)?.join(k), value).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cache_clear(app: AppHandle) -> Result<u32, String> {
    let d = dir(&app)?;
    let mut n = 0;
    for e in fs::read_dir(&d).map_err(|e| e.to_string())? {
        let e = e.map_err(|e| e.to_string())?;
        if e.path().is_file() && fs::remove_file(e.path()).is_ok() {
            n += 1;
        }
    }
    Ok(n)
}
