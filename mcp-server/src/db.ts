// Read-only access to the Wellframe desktop app's local SQLite database. Uses
// sql.js (WASM) so the packed .mcpb is a single portable bundle with no native
// module to compile per-OS. The DB file is re-read per query so the coach always
// sees the latest data the desktop app has written (the file is small — a
// personal health history).

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The desktop app writes to <app-data>/wellframe.db under its bundle identifier.
// Mirror Tauri v2's app_data_dir resolution per platform.
export function defaultDbPath(): string {
  const id = 'com.codeyam.wellframe';
  const home = homedir();
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', id, 'wellframe.db');
  }
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(home, 'AppData', 'Roaming');
    return path.join(appData, id, 'wellframe.db');
  }
  const xdg = process.env.XDG_DATA_HOME ?? path.join(home, '.local', 'share');
  return path.join(xdg, id, 'wellframe.db');
}

// `||` (not `??`) so an empty WELLFRAME_DB — which mcpb substitutes when the
// optional db_path user-config is left blank — falls through to the default.
export const DB_PATH = process.env.WELLFRAME_DB || defaultDbPath();

let SQL: SqlJsStatic | null = null;
async function sql(): Promise<SqlJsStatic> {
  if (!SQL) {
    // sql-wasm.wasm ships in the sql.js package, bundled into the .mcpb.
    SQL = await initSqlJs({
      locateFile: (f) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', f),
    });
  }
  return SQL;
}

export class DbMissingError extends Error {
  constructor(public readonly dbPath: string) {
    super(
      `No Wellframe database at ${dbPath}. Open the Wellframe desktop app and log some data first, ` +
        `or set WELLFRAME_DB to your database path.`,
    );
    this.name = 'DbMissingError';
  }
}

async function open(): Promise<Database> {
  if (!existsSync(DB_PATH)) throw new DbMissingError(DB_PATH);
  const bytes = readFileSync(DB_PATH);
  const S = await sql();
  return new S.Database(bytes);
}

// Run a read query and return rows as plain objects. Opens + closes a fresh
// in-memory copy each call so results reflect the current file.
export async function query<T = Record<string, unknown>>(
  sqlText: string,
  params: unknown[] = [],
): Promise<T[]> {
  const db = await open();
  try {
    const stmt = db.prepare(sqlText);
    stmt.bind(params as never);
    const rows: T[] = [];
    while (stmt.step()) rows.push(stmt.getAsObject() as T);
    stmt.free();
    return rows;
  } finally {
    db.close();
  }
}

export async function queryOne<T = Record<string, unknown>>(
  sqlText: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sqlText, params);
  return rows[0] ?? null;
}
