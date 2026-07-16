import json

LIB = "desktop/src-tauri/src/lib.rs"

# read/insert/map helpers -> testFile
tested = [
    ("read_briefing_latest", "Reads the most-recent daily briefing row (ordered by date), or None when empty.", ["db-read", "dashboard", "timeline"]),
    ("read_briefings_all", "Reads all daily briefing rows for the timeline.", ["db-read", "timeline"]),
    ("read_goals", "Reads all goal rows in display order (ord ASC, id ASC).", ["db-read", "goals"]),
    ("read_moods", "Reads all mood rows, most recent first (backs timeline and check-in).", ["db-read", "checkin", "timeline"]),
    ("read_recovery_actions", "Reads a recovery read's suggested-action rows, ordered by ord.", ["db-read", "recovery"]),
    ("read_recovery_factors", "Reads a recovery read's contributing-factor rows, ordered by ord.", ["db-read", "recovery"]),
    ("read_recovery_latest", "Reads the latest recovery read row (ordered by date), or None when empty.", ["db-read", "recovery"]),
    ("read_trend_metrics", "Reads all trend metric rows ordered by range then ord.", ["db-read", "trends"]),
    ("read_trend_points", "Reads all trend point rows ordered by ord.", ["db-read", "trends"]),
    ("read_vitals", "Reads all vital rows ordered by ord.", ["db-read", "dashboard"]),
    ("read_weights", "Reads all weight rows for the timeline.", ["db-read", "timeline"]),
    ("read_workout_latest", "Reads the latest workout row (ordered by id), or None when empty.", ["db-read", "dashboard"]),
    ("read_workouts_all", "Reads all workout rows for the timeline.", ["db-read", "timeline"]),
    ("insert_goal", "Inserts a new goal appended at the list end (ord = current count), mirroring dueLabel from cadence.", ["db-write", "goals"]),
    ("insert_mood", "Inserts a new mood (check-in) row from an already-validated draft.", ["db-write", "checkin"]),
    ("map_briefing", "Maps a SQLite row to a DailyBriefing struct.", ["row-mapper", "dashboard", "timeline"]),
    ("map_workout", "Maps a SQLite row to a Workout struct.", ["row-mapper", "dashboard", "timeline"]),
]

# platform-glue: (name, filePath, description, tags, justification)
glue = [
    ("app_info", LIB, "Tauri command returning native runtime details (name, version, tauri version, OS) so the shell can prove the React-Rust IPC bridge is live.", ["tauri-command", "app-info"], "Tauri command exposing native runtime info; not unit-testable without the runtime."),
    ("create_goal", LIB, "Write command: opens the app-data DB and persists an already-validated new goal.", ["tauri-command", "db-write", "goals"], "Tauri command that opens the app-data SQLite DB."),
    ("submit_checkin", LIB, "Write command: opens the app-data DB and persists an already-validated check-in (mood) row.", ["tauri-command", "db-write", "checkin"], "Tauri command that opens the app-data SQLite DB."),
    ("open_db", LIB, "Opens (creating the app-data dir) the wellframe.db SQLite database and applies the schema, returning a Connection.", ["db-open"], "Opens the app-data SQLite DB via the Tauri path resolver; needs the runtime."),
    ("run", LIB, "Tauri builder entrypoint: registers the invoke handlers and runs the app.", ["entrypoint", "tauri"], "Builds and runs the Tauri app."),
    ("main", "desktop/src-tauri/build.rs", "Build-script entrypoint invoking tauri_build::build().", ["entrypoint", "build"], "binary/build entrypoint"),
    ("main", "desktop/src-tauri/src/main.rs", "Desktop binary entrypoint delegating to the library run().", ["entrypoint", "binary"], "binary/build entrypoint"),
]

BASE_TAGS = ["desktop", "rust"]
out = []
for name, desc, tags in tested:
    out.append({
        "name": name,
        "filePath": LIB,
        "description": desc,
        "tags": BASE_TAGS + tags,
        "testFile": LIB,
    })
for name, fp, desc, tags, just in glue:
    out.append({
        "name": name,
        "filePath": fp,
        "description": desc,
        "tags": BASE_TAGS + tags,
        "untestabilityReason": {"kind": "platform-glue", "justification": just},
    })

json.dump(out, open("/workspace/.codeyam/tmp/gloss-rust.json", "w"), indent=2)
print("entries:", len(out))
