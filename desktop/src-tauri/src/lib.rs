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

// ── Models ──────────────────────────────────────────────────────────────────
// Raw table rows, serialized camelCase to match the frontend `models.ts` types.
// The Rust side owns SQLite reads; the TS data layer derives each console's view
// shape (grouping, dateLabel, defaults) from these rows. Production starts empty
// (codeyam model): empty tables → empty payloads → the day-one states.

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
#[serde(rename_all = "camelCase")]
struct Mood {
    id: i64,
    occurred_at: String,
    part_of_day: String,
    energy: Option<i64>,
    mood: Option<String>,
    sleep_quality: Option<i64>,
    soreness: Option<i64>,
    stress: Option<i64>,
    note: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Weight {
    id: i64,
    occurred_at: String,
    value: String,
    unit: String,
    delta: Option<String>,
    positive: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TrendMetric {
    id: i64,
    order: i64,
    metric_key: String,
    label: String,
    unit: Option<String>,
    range: String,
    latest: String,
    delta: Option<String>,
    positive: bool,
    summary: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TrendPoint {
    id: i64,
    metric_id: i64,
    order: i64,
    bucket_label: String,
    value: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RecoveryRead {
    id: i64,
    date: String,
    date_label: String,
    score: Option<i64>,
    label: Option<String>,
    headline: Option<String>,
    status_line: Option<String>,
    summary: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RecoveryFactor {
    id: i64,
    recovery_id: i64,
    order: i64,
    label: String,
    value: String,
    state: String,
    track_pct: i64,
    positive: bool,
    detail: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RecoveryAction {
    id: i64,
    recovery_id: i64,
    order: i64,
    title: String,
    kind: String,
    duration_label: Option<String>,
    detail: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Goal {
    id: i64,
    order: i64,
    title: String,
    category: String,
    metric: String,
    target: f64,
    current: f64,
    unit: Option<String>,
    cadence: Option<String>,
    due_label: Option<String>,
    note: Option<String>,
    created_at: String,
}

// ── Payloads (raw rows the TS layer derives from) ───────────────────────────

#[derive(Serialize)]
struct DashboardData {
    briefing: Option<DailyBriefing>,
    vitals: Vec<Vital>,
    workout: Option<Workout>,
}

#[derive(Serialize)]
struct TimelinePayload {
    workouts: Vec<Workout>,
    briefings: Vec<DailyBriefing>,
    moods: Vec<Mood>,
    weights: Vec<Weight>,
}

#[derive(Serialize)]
struct TrendsPayload {
    metrics: Vec<TrendMetric>,
    points: Vec<TrendPoint>,
}

#[derive(Serialize)]
struct RecoveryPayload {
    read: Option<RecoveryRead>,
    factors: Vec<RecoveryFactor>,
    actions: Vec<RecoveryAction>,
}

const SCHEMA: &str = "
CREATE TABLE IF NOT EXISTS daily_briefing (
  id INTEGER PRIMARY KEY, date TEXT NOT NULL, date_label TEXT NOT NULL,
  readiness_score INTEGER, readiness_label TEXT, readiness_delta INTEGER,
  headline TEXT, status_line TEXT, elevation TEXT, wind TEXT, window_label TEXT,
  suggested_workout TEXT, coach_message TEXT, coach_directive TEXT, coach_signature TEXT
);
CREATE TABLE IF NOT EXISTS vital (
  id INTEGER PRIMARY KEY, ord INTEGER NOT NULL DEFAULT 0, label TEXT NOT NULL,
  value TEXT NOT NULL, unit TEXT, delta TEXT, track_pct INTEGER NOT NULL DEFAULT 0,
  positive INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS workout (
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, type_label TEXT, photo_url TEXT,
  distance TEXT, pace TEXT, vertical TEXT, duration TEXT, occurred_at TEXT, kind TEXT
);
CREATE TABLE IF NOT EXISTS mood (
  id INTEGER PRIMARY KEY, occurred_at TEXT NOT NULL, part_of_day TEXT NOT NULL,
  energy INTEGER, mood TEXT, sleep_quality INTEGER, soreness INTEGER, stress INTEGER, note TEXT
);
CREATE TABLE IF NOT EXISTS weight (
  id INTEGER PRIMARY KEY, occurred_at TEXT NOT NULL, value TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'lb', delta TEXT, positive INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS trend_metric (
  id INTEGER PRIMARY KEY, ord INTEGER NOT NULL DEFAULT 0, metric_key TEXT NOT NULL,
  label TEXT NOT NULL, unit TEXT, range TEXT NOT NULL, latest TEXT NOT NULL,
  delta TEXT, positive INTEGER NOT NULL DEFAULT 0, summary TEXT
);
CREATE TABLE IF NOT EXISTS trend_point (
  id INTEGER PRIMARY KEY, metric_id INTEGER NOT NULL, ord INTEGER NOT NULL DEFAULT 0,
  bucket_label TEXT NOT NULL, value REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS recovery_read (
  id INTEGER PRIMARY KEY, date TEXT NOT NULL, date_label TEXT NOT NULL, score INTEGER,
  label TEXT, headline TEXT, status_line TEXT, summary TEXT
);
CREATE TABLE IF NOT EXISTS recovery_factor (
  id INTEGER PRIMARY KEY, recovery_id INTEGER NOT NULL, ord INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL, value TEXT NOT NULL, state TEXT NOT NULL,
  track_pct INTEGER NOT NULL DEFAULT 0, positive INTEGER NOT NULL DEFAULT 0, detail TEXT
);
CREATE TABLE IF NOT EXISTS recovery_action (
  id INTEGER PRIMARY KEY, recovery_id INTEGER NOT NULL, ord INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL, kind TEXT NOT NULL, duration_label TEXT, detail TEXT
);
CREATE TABLE IF NOT EXISTS goal (
  id INTEGER PRIMARY KEY, ord INTEGER NOT NULL DEFAULT 0, title TEXT NOT NULL,
  category TEXT NOT NULL, metric TEXT NOT NULL, target REAL NOT NULL,
  current REAL NOT NULL DEFAULT 0, unit TEXT, cadence TEXT, due_label TEXT, note TEXT,
  created_at TEXT NOT NULL
);
";

fn open_db(app: &tauri::AppHandle) -> rusqlite::Result<Connection> {
    let dir = app.path().app_data_dir().expect("resolvable app data dir");
    std::fs::create_dir_all(&dir).ok();
    let conn = Connection::open(dir.join("wellframe.db"))?;
    conn.execute_batch(SCHEMA)?;
    Ok(conn)
}

// ── Row readers (take &Connection so they're unit-testable off an in-memory DB) ─

fn read_briefing_latest(conn: &Connection) -> rusqlite::Result<Option<DailyBriefing>> {
    conn.query_row(
        "SELECT id, date, date_label, readiness_score, readiness_label, readiness_delta, \
         headline, status_line, elevation, wind, window_label, suggested_workout, \
         coach_message, coach_directive, coach_signature FROM daily_briefing \
         ORDER BY date DESC LIMIT 1",
        [],
        map_briefing,
    )
    .optional()
}

fn read_briefings_all(conn: &Connection) -> rusqlite::Result<Vec<DailyBriefing>> {
    let mut stmt = conn.prepare(
        "SELECT id, date, date_label, readiness_score, readiness_label, readiness_delta, \
         headline, status_line, elevation, wind, window_label, suggested_workout, \
         coach_message, coach_directive, coach_signature FROM daily_briefing",
    )?;
    let rows = stmt.query_map([], map_briefing)?;
    rows.collect()
}

fn map_briefing(r: &rusqlite::Row) -> rusqlite::Result<DailyBriefing> {
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
}

fn read_vitals(conn: &Connection) -> rusqlite::Result<Vec<Vital>> {
    let mut stmt = conn.prepare(
        "SELECT id, ord, label, value, unit, delta, track_pct, positive FROM vital ORDER BY ord ASC",
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

fn map_workout(r: &rusqlite::Row) -> rusqlite::Result<Workout> {
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
}

const WORKOUT_COLS: &str =
    "id, title, type_label, photo_url, distance, pace, vertical, duration, occurred_at, kind";

fn read_workout_latest(conn: &Connection) -> rusqlite::Result<Option<Workout>> {
    conn.query_row(
        &format!("SELECT {WORKOUT_COLS} FROM workout ORDER BY id DESC LIMIT 1"),
        [],
        map_workout,
    )
    .optional()
}

fn read_workouts_all(conn: &Connection) -> rusqlite::Result<Vec<Workout>> {
    let mut stmt = conn.prepare(&format!("SELECT {WORKOUT_COLS} FROM workout"))?;
    let rows = stmt.query_map([], map_workout)?;
    rows.collect()
}

fn read_moods(conn: &Connection) -> rusqlite::Result<Vec<Mood>> {
    let mut stmt = conn.prepare(
        "SELECT id, occurred_at, part_of_day, energy, mood, sleep_quality, soreness, stress, note \
         FROM mood ORDER BY occurred_at DESC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(Mood {
            id: r.get(0)?,
            occurred_at: r.get(1)?,
            part_of_day: r.get(2)?,
            energy: r.get(3)?,
            mood: r.get(4)?,
            sleep_quality: r.get(5)?,
            soreness: r.get(6)?,
            stress: r.get(7)?,
            note: r.get(8)?,
        })
    })?;
    rows.collect()
}

fn read_weights(conn: &Connection) -> rusqlite::Result<Vec<Weight>> {
    let mut stmt = conn
        .prepare("SELECT id, occurred_at, value, unit, delta, positive FROM weight")?;
    let rows = stmt.query_map([], |r| {
        Ok(Weight {
            id: r.get(0)?,
            occurred_at: r.get(1)?,
            value: r.get(2)?,
            unit: r.get(3)?,
            delta: r.get(4)?,
            positive: r.get::<_, i64>(5)? != 0,
        })
    })?;
    rows.collect()
}

fn read_trend_metrics(conn: &Connection) -> rusqlite::Result<Vec<TrendMetric>> {
    let mut stmt = conn.prepare(
        "SELECT id, ord, metric_key, label, unit, range, latest, delta, positive, summary \
         FROM trend_metric ORDER BY range ASC, ord ASC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(TrendMetric {
            id: r.get(0)?,
            order: r.get(1)?,
            metric_key: r.get(2)?,
            label: r.get(3)?,
            unit: r.get(4)?,
            range: r.get(5)?,
            latest: r.get(6)?,
            delta: r.get(7)?,
            positive: r.get::<_, i64>(8)? != 0,
            summary: r.get(9)?,
        })
    })?;
    rows.collect()
}

fn read_trend_points(conn: &Connection) -> rusqlite::Result<Vec<TrendPoint>> {
    let mut stmt = conn.prepare(
        "SELECT id, metric_id, ord, bucket_label, value FROM trend_point ORDER BY ord ASC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(TrendPoint {
            id: r.get(0)?,
            metric_id: r.get(1)?,
            order: r.get(2)?,
            bucket_label: r.get(3)?,
            value: r.get(4)?,
        })
    })?;
    rows.collect()
}

fn read_recovery_latest(conn: &Connection) -> rusqlite::Result<Option<RecoveryRead>> {
    conn.query_row(
        "SELECT id, date, date_label, score, label, headline, status_line, summary \
         FROM recovery_read ORDER BY date DESC LIMIT 1",
        [],
        |r| {
            Ok(RecoveryRead {
                id: r.get(0)?,
                date: r.get(1)?,
                date_label: r.get(2)?,
                score: r.get(3)?,
                label: r.get(4)?,
                headline: r.get(5)?,
                status_line: r.get(6)?,
                summary: r.get(7)?,
            })
        },
    )
    .optional()
}

fn read_recovery_factors(conn: &Connection, recovery_id: i64) -> rusqlite::Result<Vec<RecoveryFactor>> {
    let mut stmt = conn.prepare(
        "SELECT id, recovery_id, ord, label, value, state, track_pct, positive, detail \
         FROM recovery_factor WHERE recovery_id = ?1 ORDER BY ord ASC",
    )?;
    let rows = stmt.query_map([recovery_id], |r| {
        Ok(RecoveryFactor {
            id: r.get(0)?,
            recovery_id: r.get(1)?,
            order: r.get(2)?,
            label: r.get(3)?,
            value: r.get(4)?,
            state: r.get(5)?,
            track_pct: r.get(6)?,
            positive: r.get::<_, i64>(7)? != 0,
            detail: r.get(8)?,
        })
    })?;
    rows.collect()
}

fn read_recovery_actions(conn: &Connection, recovery_id: i64) -> rusqlite::Result<Vec<RecoveryAction>> {
    let mut stmt = conn.prepare(
        "SELECT id, recovery_id, ord, title, kind, duration_label, detail \
         FROM recovery_action WHERE recovery_id = ?1 ORDER BY ord ASC",
    )?;
    let rows = stmt.query_map([recovery_id], |r| {
        Ok(RecoveryAction {
            id: r.get(0)?,
            recovery_id: r.get(1)?,
            order: r.get(2)?,
            title: r.get(3)?,
            kind: r.get(4)?,
            duration_label: r.get(5)?,
            detail: r.get(6)?,
        })
    })?;
    rows.collect()
}

fn read_goals(conn: &Connection) -> rusqlite::Result<Vec<Goal>> {
    let mut stmt = conn.prepare(
        "SELECT id, ord, title, category, metric, target, current, unit, cadence, due_label, note, created_at \
         FROM goal ORDER BY ord ASC, id ASC",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(Goal {
            id: r.get(0)?,
            order: r.get(1)?,
            title: r.get(2)?,
            category: r.get(3)?,
            metric: r.get(4)?,
            target: r.get(5)?,
            current: r.get(6)?,
            unit: r.get(7)?,
            cadence: r.get(8)?,
            due_label: r.get(9)?,
            note: r.get(10)?,
            created_at: r.get(11)?,
        })
    })?;
    rows.collect()
}

// ── Commands ────────────────────────────────────────────────────────────────

/// Dashboard: most-recent briefing + its ordered overnight vitals + latest workout.
#[tauri::command]
fn get_dashboard(app: tauri::AppHandle) -> Result<DashboardData, String> {
    let conn = open_db(&app).map_err(|e| e.to_string())?;
    Ok(DashboardData {
        briefing: read_briefing_latest(&conn).map_err(|e| e.to_string())?,
        vitals: read_vitals(&conn).map_err(|e| e.to_string())?,
        workout: read_workout_latest(&conn).map_err(|e| e.to_string())?,
    })
}

/// Timeline: the four activity sources; the TS layer groups them into days.
#[tauri::command]
fn get_timeline(app: tauri::AppHandle) -> Result<TimelinePayload, String> {
    let conn = open_db(&app).map_err(|e| e.to_string())?;
    Ok(TimelinePayload {
        workouts: read_workouts_all(&conn).map_err(|e| e.to_string())?,
        briefings: read_briefings_all(&conn).map_err(|e| e.to_string())?,
        moods: read_moods(&conn).map_err(|e| e.to_string())?,
        weights: read_weights(&conn).map_err(|e| e.to_string())?,
    })
}

/// Trends: every metric chart + its points; the TS layer stitches points on.
#[tauri::command]
fn get_trends(app: tauri::AppHandle) -> Result<TrendsPayload, String> {
    let conn = open_db(&app).map_err(|e| e.to_string())?;
    Ok(TrendsPayload {
        metrics: read_trend_metrics(&conn).map_err(|e| e.to_string())?,
        points: read_trend_points(&conn).map_err(|e| e.to_string())?,
    })
}

/// Recovery: the latest read plus its contributing factors and suggested actions.
#[tauri::command]
fn get_recovery(app: tauri::AppHandle) -> Result<RecoveryPayload, String> {
    let conn = open_db(&app).map_err(|e| e.to_string())?;
    let read = read_recovery_latest(&conn).map_err(|e| e.to_string())?;
    let (factors, actions) = match &read {
        Some(r) => (
            read_recovery_factors(&conn, r.id).map_err(|e| e.to_string())?,
            read_recovery_actions(&conn, r.id).map_err(|e| e.to_string())?,
        ),
        None => (Vec::new(), Vec::new()),
    };
    Ok(RecoveryPayload { read, factors, actions })
}

/// Goals: every goal in display order.
#[tauri::command]
fn get_goals(app: tauri::AppHandle) -> Result<Vec<Goal>, String> {
    let conn = open_db(&app).map_err(|e| e.to_string())?;
    read_goals(&conn).map_err(|e| e.to_string())
}

/// Check-in: recent Mood rows (most recent first).
#[tauri::command]
fn get_checkin(app: tauri::AppHandle) -> Result<Vec<Mood>, String> {
    let conn = open_db(&app).map_err(|e| e.to_string())?;
    read_moods(&conn).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            app_info,
            get_dashboard,
            get_timeline,
            get_trends,
            get_recovery,
            get_goals,
            get_checkin
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn mem() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(SCHEMA).unwrap();
        conn
    }

    #[test]
    fn empty_db_yields_empty_reads() {
        let conn = mem();
        assert!(read_briefing_latest(&conn).unwrap().is_none());
        assert!(read_workouts_all(&conn).unwrap().is_empty());
        assert!(read_goals(&conn).unwrap().is_empty());
        assert!(read_moods(&conn).unwrap().is_empty());
        assert!(read_recovery_latest(&conn).unwrap().is_none());
    }

    #[test]
    fn goals_read_maps_and_orders() {
        let conn = mem();
        conn.execute(
            "INSERT INTO goal (id, ord, title, category, metric, target, current, unit, cadence, due_label, note, created_at) \
             VALUES (1, 1, 'Run 500 mi', 'distance', 'Miles', 500.0, 312.0, 'mi', 'This year', 'Dec 31', NULL, '2026-01-01')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO goal (id, ord, title, category, metric, target, current, created_at) \
             VALUES (2, 0, 'Sleep 8h', 'sleep', 'Nights', 20.0, 11.0, '2026-01-02')",
            [],
        )
        .unwrap();
        let goals = read_goals(&conn).unwrap();
        assert_eq!(goals.len(), 2);
        assert_eq!(goals[0].title, "Sleep 8h"); // ord 0 first
        assert_eq!(goals[1].current, 312.0);
        assert_eq!(goals[1].unit.as_deref(), Some("mi"));
    }

    #[test]
    fn recovery_stitches_children_by_id() {
        let conn = mem();
        conn.execute(
            "INSERT INTO recovery_read (id, date, date_label, score, label) \
             VALUES (7, '2026-07-07', '07 Jul', 64, 'Recovering')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO recovery_factor (id, recovery_id, ord, label, value, state, track_pct, positive) \
             VALUES (1, 7, 0, 'Sleep', '6:41', 'steady', 60, 0)",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO recovery_action (id, recovery_id, ord, title, kind) \
             VALUES (1, 7, 0, 'Easy recovery run', 'run')",
            [],
        )
        .unwrap();
        let read = read_recovery_latest(&conn).unwrap().unwrap();
        assert_eq!(read.score, Some(64));
        let factors = read_recovery_factors(&conn, read.id).unwrap();
        let actions = read_recovery_actions(&conn, read.id).unwrap();
        assert_eq!(factors.len(), 1);
        assert_eq!(factors[0].label, "Sleep");
        assert_eq!(actions[0].kind, "run");
    }

    #[test]
    fn trends_reads_metrics_and_points() {
        let conn = mem();
        conn.execute(
            "INSERT INTO trend_metric (id, ord, metric_key, label, range, latest, positive) \
             VALUES (1, 0, 'sleep', 'Sleep', 'weekly', '7:24', 1)",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO trend_point (id, metric_id, ord, bucket_label, value) VALUES (1, 1, 0, 'Mon', 7.1)",
            [],
        )
        .unwrap();
        let metrics = read_trend_metrics(&conn).unwrap();
        let points = read_trend_points(&conn).unwrap();
        assert_eq!(metrics.len(), 1);
        assert!(metrics[0].positive);
        assert_eq!(points[0].value, 7.1);
        assert_eq!(points[0].metric_id, 1);
    }
}
