use serde::Serialize;

/// Native runtime details surfaced to the frontend so the shell can prove the
/// React↔Rust IPC bridge is live. Expands into real data commands (dashboard,
/// vitals, workouts) once the SQLite layer lands in the next cycle.
#[derive(Serialize)]
struct AppInfo {
    name: String,
    version: String,
    tauri_version: String,
    os: String,
}

#[tauri::command]
fn app_info() -> AppInfo {
    AppInfo {
        name: "Wellframe".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        tauri_version: tauri::VERSION.to_string(),
        os: std::env::consts::OS.to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![app_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
