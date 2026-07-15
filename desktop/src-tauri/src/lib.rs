use rusqlite::{Connection, OptionalExtension};
use serde::Serialize;
use tauri::Manager;

/// Native runtime details surfaced to the frontend so the shell can prove the
/// React↔Rust IPC bridge is live.
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

// ── Dashboard data ──────────────────────────────────────────────────────────
// Mirrors the web app's DailyBriefing / Vital / Workout models. camelCase
// serialization matches the TypeScript `models.ts` shape so one type serves the
// native and browser-preview data sources. Production starts empty (codeyam
// model): an empty DB yields a null briefing → the day-one onboarding state.

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DailyBriefing {
    id: i64,
    date: String,
    date_label: String,
    readiness_score: Option<i64>,
    readiness_label: Option<String>,
    readiness_delta: Option<i64>,
    headline: Option<String>,
    status_line: Option<String>,
    elevation: Option<String>,
    wind: Option<String>,
    window_label: Option<String>,
    suggested_workout: Option<String>,
    coach_message: Option<String>,
    coach_directive: Option<String>,
    coach_signature: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Vital {
    id: i64,
    order: i64,
    label: String,
    value: String,
    unit: Option<String>,
    delta: Option<String>,
    track_pct: i64,
    positive: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Workout {
    id: i64,
    title: String,
    type_label: Option<String>,
    photo_url: Option<String>,
    distance: Option<String>,
    pace: Option<String>,
    vertical: Option<String>,
    duration: Option<String>,
    occurred_at: Option<String>,
    kind: Option<String>,
}

#[derive(Serialize)]
struct DashboardData {
    briefing: Option<DailyBriefing>,
    vitals: Vec<Vital>,
    workout: Option<Workout>,
}

const SCHEMA: &str = "
CREATE TABLE IF NOT EXISTS daily_briefing (
  id INTEGER PRIMARY KEY,
  date TEXT NOT NULL,
  date_label TEXT NOT NULL,
  readiness_score INTEGER,
  readiness_label TEXT,
  readiness_delta INTEGER,
  headline TEXT,
  status_line TEXT,
  elevation TEXT,
  wind TEXT,
  window_label TEXT,
  suggested_workout TEXT,
  coach_message TEXT,
  coach_directive TEXT,
  coach_signature TEXT
);
CREATE TABLE IF NOT EXISTS vital (
  id INTEGER PRIMARY KEY,
  ord INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  delta TEXT,
  track_pct INTEGER NOT NULL DEFAULT 0,
  positive INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS workout (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  type_label TEXT,
  photo_url TEXT,
  distance TEXT,
  pace TEXT,
  vertical TEXT,
  duration TEXT,
  occurred_at TEXT,
  kind TEXT
);
";

fn open_db(app: &tauri::AppHandle) -> rusqlite::Result<Connection> {
    let dir = app
        .path()
        .app_data_dir()
        .expect("resolvable app data dir");
    std::fs::create_dir_all(&dir).ok();
    let conn = Connection::open(dir.join("wellframe.db"))?;
    conn.execute_batch(SCHEMA)?;
    Ok(conn)
}

fn read_briefing(conn: &Connection) -> rusqlite::Result<Option<DailyBriefing>> {
    conn.query_row(
        "SELECT id, date, date_label, readiness_score, readiness_label, readiness_delta, \
         headline, status_line, elevation, wind, window_label, suggested_workout, \
         coach_message, coach_directive, coach_signature \
         FROM daily_briefing ORDER BY date DESC LIMIT 1",
        [],
        |r| {
            Ok(DailyBriefing {
                id: r.get(0)?,
                date: r.get(1)?,
                date_label: r.get(2)?,
                readiness_score: r.get(3)?,
                readiness_label: r.get(4)?,
                readiness_delta: r.get(5)?,
                headline: r.get(6)?,
                status_line: r.get(7)?,
                elevation: r.get(8)?,
                wind: r.get(9)?,
                window_label: r.get(10)?,
                suggested_workout: r.get(11)?,
                coach_message: r.get(12)?,
                coach_directive: r.get(13)?,
                coach_signature: r.get(14)?,
            })
        },
    )
    .optional()
}

fn read_vitals(conn: &Connection) -> rusqlite::Result<Vec<Vital>> {
    let mut stmt = conn.prepare(
        "SELECT id, ord, label, value, unit, delta, track_pct, positive \
         FROM vital ORDER BY ord ASC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(Vital {
            id: r.get(0)?,
            order: r.get(1)?,
            label: r.get(2)?,
            value: r.get(3)?,
            unit: r.get(4)?,
            delta: r.get(5)?,
            track_pct: r.get(6)?,
            positive: r.get::<_, i64>(7)? != 0,
        })
    })?;
    rows.collect()
}

fn read_workout(conn: &Connection) -> rusqlite::Result<Option<Workout>> {
    conn.query_row(
        "SELECT id, title, type_label, photo_url, distance, pace, vertical, \
         duration, occurred_at, kind FROM workout ORDER BY id DESC LIMIT 1",
        [],
        |r| {
            Ok(Workout {
                id: r.get(0)?,
                title: r.get(1)?,
                type_label: r.get(2)?,
                photo_url: r.get(3)?,
                distance: r.get(4)?,
                pace: r.get(5)?,
                vertical: r.get(6)?,
                duration: r.get(7)?,
                occurred_at: r.get(8)?,
                kind: r.get(9)?,
            })
        },
    )
    .optional()
}

/// Reads the current briefing state from the local SQLite database. The console
/// renders a single day's state: the most-recent DailyBriefing plus its ordered
/// overnight Vitals and yesterday's Workout.
#[tauri::command]
fn get_dashboard(app: tauri::AppHandle) -> Result<DashboardData, String> {
    let conn = open_db(&app).map_err(|e| e.to_string())?;
    Ok(DashboardData {
        briefing: read_briefing(&conn).map_err(|e| e.to_string())?,
        vitals: read_vitals(&conn).map_err(|e| e.to_string())?,
        workout: read_workout(&conn).map_err(|e| e.to_string())?,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![app_info, get_dashboard])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
