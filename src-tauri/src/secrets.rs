//! Le jeton d'une personne, rangé sur sa machine.
//!
//! **Ce que l'interface ne fait pas, et c'est voulu : elle ne rend jamais la
//! valeur à l'interface web.** Le jeton est écrit ici par le device flow, lu
//! ici par le client GitHub, et ne traverse jamais le pont. Une commande
//! `secrets_get` aurait suffi à le mettre dans le DOM un jour de fatigue.
//!
//! **Implémentation portable, pas un trousseau de bureau** (invariant 15, et
//! la pile technique le dit : une bibliothèque de trousseau propre au bureau
//! est le seul choix qui rendrait l'APK coûteux). D'où un fichier dans le
//! dossier de configuration de l'application, en 0600.
//!
//! ⚠️ **Ce que ça protège, dit honnêtement** : un autre compte sur la même
//! machine, et une lecture accidentelle. **Ce que ça ne protège pas** : un
//! programme qui tourne déjà sous ton compte. Pour aller plus loin il faudrait
//! un coffre à mot de passe (Stronghold), c'est-à-dire un mot de passe à
//! saisir à chaque ouverture — refusé : « comptes et mots de passe maison »
//! est hors périmètre, et un tracker entre amis ne le mérite pas.

use std::fs;
use std::io::Write;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

fn file(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("dossier de configuration introuvable : {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("token"))
}

pub fn read(app: &AppHandle) -> Option<String> {
    let p = file(app).ok()?;
    let s = fs::read_to_string(p).ok()?;
    let s = s.trim().to_string();
    if s.is_empty() { None } else { Some(s) }
}

pub fn write(app: &AppHandle, token: &str) -> Result<(), String> {
    let p = file(app)?;
    let mut f = fs::File::create(&p).map_err(|e| e.to_string())?;
    /* Les droits se posent sur le descripteur déjà ouvert, pas après coup :
       entre la création et un chmod, le fichier serait lisible. */
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        f.set_permissions(fs::Permissions::from_mode(0o600))
            .map_err(|e| e.to_string())?;
    }
    f.write_all(token.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn clear(app: &AppHandle) -> Result<(), String> {
    let p = file(app)?;
    if p.exists() {
        fs::remove_file(p).map_err(|e| e.to_string())?;
    }
    Ok(())
}
