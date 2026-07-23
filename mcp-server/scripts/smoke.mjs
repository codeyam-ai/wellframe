// Smoke-test the PACKED .mcpb, not the working tree.
//
// The failure this exists to catch: the bundle unpacks fine and the manifest
// validates, but the server dies on first query because a runtime file (most
// likely sql.js's WASM, which db.ts resolves via a relative path) was pruned
// out of the archive. Only running the unpacked bundle proves that path.
//
// Runs every tool against three database states — missing, empty, populated —
// because "no database yet" is the state a fresh install actually starts in,
// and it must produce a readable message rather than a crashed server.
//
// Usage: npm run smoke  [path/to/bundle.mcpb]

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import initSqlJs from 'sql.js';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { desktopSchemaFrom } from '../dist/bundle.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BUNDLE = process.argv[2] ?? path.join(ROOT, 'build', 'wellframe-coach.mcpb');
const WORK = path.join(ROOT, 'build', 'smoke');
const UNPACKED = path.join(WORK, 'unpacked');

// Read the schema from the desktop app's own source so the fixture can never
// drift from what Wellframe actually writes.
function desktopSchema() {
  return desktopSchemaFrom(
    readFileSync(path.join(ROOT, '..', 'desktop', 'src-tauri', 'src', 'lib.rs'), 'utf8'),
  );
}

async function makeDb(file, populate) {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(desktopSchema());
  if (populate) {
    db.run(`
      INSERT INTO daily_briefing (date, date_label, readiness_score, readiness_label,
        readiness_delta, headline, status_line, suggested_workout, coach_message, coach_directive)
      VALUES ('2026-07-22','Wednesday, July 22',82,'Primed',4,'Ready to work',
        'Sleep steady, HRV up','Threshold intervals','Your last three easy days paid off.','Go');
      INSERT INTO workout (title, kind, distance, pace, vertical, duration, occurred_at) VALUES
        ('Morning run','run','6.2 mi','8:12 /mi','410 ft','51:00','2026-07-22T06:40:00'),
        ('Evening ride','ride','18.4 mi','16.2 mph','980 ft','1:08:00','2026-07-21T17:05:00'),
        ('Lifting','strength',NULL,NULL,NULL,'45:00','2026-07-20T12:00:00');
      INSERT INTO mood (occurred_at, part_of_day, energy, mood, sleep_quality, soreness, stress, note) VALUES
        ('2026-07-22T07:00:00','morning',4,'good',4,2,2,'Legs fresh'),
        ('2026-07-21T07:00:00','morning',3,'ok',3,3,3,'Slept short'),
        ('2026-07-20T21:00:00','evening',3,'ok',3,3,4,'Long day');
      INSERT INTO trend_metric (metric_key, label, unit, range, latest, delta, summary) VALUES
        ('sleep','Sleep','h','30d','7.4','+0.3','Trending up'),
        ('training_load','Training load',NULL,'30d','62','+5','Building');
      INSERT INTO recovery_read (date, date_label, score, label, headline, status_line, summary)
        VALUES ('2026-07-22','Wednesday, July 22',74,'Recovered','Good to go','HRV above baseline','Solid overnight recovery.');
      INSERT INTO recovery_factor (recovery_id, ord, label, value, state, detail) VALUES
        (1,0,'Sleep','7h 22m','good','Above your 30-day average'),
        (1,1,'HRV','68 ms','good','+6 vs baseline');
      INSERT INTO recovery_action (recovery_id, ord, title, kind, duration_label, detail) VALUES
        (1,0,'Easy shakeout','run','20 min','Keep it conversational'),
        (1,1,'Hip mobility','mobility','10 min','Post-run');
      INSERT INTO goal (ord, title, category, metric, target, current, unit, cadence, due_label, created_at) VALUES
        (0,'Run 500 miles','volume','distance',500,318,'mi','yearly','Dec 31','2026-01-01'),
        (1,'Strength 3x/week','strength','sessions',3,2,'sessions','weekly','Sunday','2026-01-01');
    `);
  }
  writeFileSync(file, Buffer.from(db.export()));
  db.close();
}

// Every tool with arguments that exercise its default path.
const CALLS = [
  ['get_readiness', {}],
  ['list_workouts', { limit: 5 }],
  ['analyze_sleep', { nights: 7 }],
  ['compute_training_load', {}],
  ['recommend_recovery', {}],
  ['list_goals', {}],
  ['recent_checkins', { limit: 7 }],
  ['estimate_fatigue', {}],
  ['generate_plan', { days: 3 }],
];

async function withServer(dbPath, fn) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(UNPACKED, 'dist', 'index.js')],
    env: { ...process.env, WELLFRAME_DB: dbPath },
  });
  const client = new Client({ name: 'wellframe-smoke', version: '1.0.0' });
  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

const failures = [];
function check(label, ok, detail = '') {
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
}

// ---

rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

console.log(`→ unpacking ${path.relative(ROOT, BUNDLE)}`);
execFileSync('npx', ['--yes', '@anthropic-ai/mcpb', 'unpack', BUNDLE, UNPACKED], {
  stdio: ['ignore', 'ignore', 'inherit'],
});

const emptyDb = path.join(WORK, 'empty.db');
const fullDb = path.join(WORK, 'populated.db');
await makeDb(emptyDb, false);
await makeDb(fullDb, true);

console.log('\n→ populated database');
await withServer(fullDb, async (client) => {
  const { tools } = await client.listTools();
  check(`lists ${CALLS.length} tools`, tools.length === CALLS.length, `got ${tools.length}`);
  const declared = new Set(tools.map((t) => t.name));
  for (const [name, args] of CALLS) {
    if (!declared.has(name)) {
      check(`${name} declared`, false);
      continue;
    }
    const res = await client.callTool({ name, arguments: args });
    const text = res.content?.[0]?.text ?? '';
    check(`${name}`, !res.isError && text.length > 0, res.isError ? text.slice(0, 90) : '');
  }
  // The WASM actually loaded and read rows, not just returned an empty shape.
  const readiness = await client.callTool({ name: 'get_readiness', arguments: {} });
  check(
    'reads real rows through sql.js WASM',
    JSON.parse(readiness.content[0].text)?.readiness_score === 82,
  );
});

console.log('\n→ empty database (fresh install, app never run)');
await withServer(emptyDb, async (client) => {
  for (const [name, args] of CALLS) {
    const res = await client.callTool({ name, arguments: args });
    check(`${name} handles empty`, !res.isError, res.isError ? res.content[0].text.slice(0, 90) : '');
  }
});

console.log('\n→ missing database');
await withServer(path.join(WORK, 'does-not-exist.db'), async (client) => {
  const res = await client.callTool({ name: 'get_readiness', arguments: {} });
  const text = res.content?.[0]?.text ?? '';
  check('reports a readable error instead of crashing', res.isError === true && /No Wellframe database at/.test(text));
});

console.log(
  failures.length ? `\nFAILED (${failures.length}): ${failures.join(', ')}` : '\nAll smoke checks passed.',
);
process.exit(failures.length ? 1 : 0);
