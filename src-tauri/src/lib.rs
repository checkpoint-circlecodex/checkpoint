//! La part native, et elle reste petite : HTTP vers GitHub, le jeton, le
//! cache de blobs, le device flow. Tout le reste est au-dessus.

mod auth;
mod browse;
mod cache;
mod config;
pub mod github;   // public pour que les essais d'intégration y accèdent
mod secrets;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            /* La mise à jour vérifie **sa propre signature**, gratuite et
               indépendante de celle d'Apple ou de Microsoft : un binaire non
               signé par la clé du projet n'est jamais installé. Bureau
               seulement — Android a le bandeau. */
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
                app.handle().plugin(tauri_plugin_process::init())?;
            }
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            auth::auth_start,
            auth::auth_poll,
            auth::whereabouts,
            browse::open_github,
            github::gh,
            github::gh_has_token,
            github::gh_forget,
            cache::cache_get,
            cache::cache_set,
            cache::cache_clear,
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
