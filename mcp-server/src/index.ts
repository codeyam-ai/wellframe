// Wellframe Coach — MCP server. Exposes the coach's structured tools over the
// user's LOCAL Wellframe database (read-only). Nothing leaves the machine except
// what the AI host chooses to send; the server only reads local SQLite.
//
// Tools mirror the PRD's coach architecture: readiness, workouts, sleep, training
// load, recovery, goals, check-ins. Each returns structured JSON the model can
// reason over rather than free-form prose.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { query, queryOne, DB_PATH, DbMissingError } from './db.js';

const server = new McpServer({ name: 'wellframe-coach', version: '0.1.0' });

type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

// Wrap a tool body so a missing DB (or any read error) returns a clean, useful
// message instead of crashing the server.
async function run(fn: () => Promise<unknown>): Promise<ToolResult> {
  try {
    const data = await fn();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (e) {
    const msg = e instanceof DbMissingError ? e.message : `Wellframe read failed: ${String(e)}`;
    return { content: [{ type: 'text', text: msg }], isError: true };
  }
}

server.tool(
  'get_readiness',
  "Today's readiness briefing: the latest score, label, verdict headline, and the coach's note.",
  {},
  () =>
    run(() =>
      queryOne(
        `SELECT date_label, readiness_score, readiness_label, readiness_delta, headline,
                status_line, suggested_workout, coach_message, coach_directive
         FROM daily_briefing ORDER BY date DESC LIMIT 1`,
      ),
    ),
);

server.tool(
  'list_workouts',
  'Recent logged workouts (runs, rides, strength, etc.), most recent first.',
  { limit: z.number().int().positive().max(100).default(10) },
  ({ limit }) =>
    run(() =>
      query(
        `SELECT title, kind, distance, pace, vertical, duration, occurred_at
         FROM workout ORDER BY COALESCE(occurred_at, '') DESC, id DESC LIMIT ?`,
        [limit],
      ),
    ),
);

server.tool(
  'analyze_sleep',
  'Recent sleep signals: nightly sleep-quality self-ratings and any sleep trend series.',
  { nights: z.number().int().positive().max(60).default(14) },
  ({ nights }) =>
    run(async () => ({
      checkinSleepQuality: await query(
        `SELECT occurred_at, part_of_day, sleep_quality
         FROM mood WHERE sleep_quality IS NOT NULL ORDER BY occurred_at DESC LIMIT ?`,
        [nights],
      ),
      sleepTrends: await query(
        `SELECT m.range, m.latest, m.delta, m.summary
         FROM trend_metric m WHERE lower(m.metric_key) = 'sleep' OR lower(m.label) = 'sleep'`,
      ),
    })),
);

server.tool(
  'compute_training_load',
  'Current training load: the training-load trend metric plus a count of recent workouts by type.',
  {},
  () =>
    run(async () => ({
      trainingLoadMetric: await query(
        `SELECT range, latest, delta, summary FROM trend_metric
         WHERE lower(metric_key) IN ('training_load','load') OR lower(label) LIKE 'training%'`,
      ),
      workoutCountsByKind: await query(
        `SELECT COALESCE(kind, 'unknown') AS kind, COUNT(*) AS count FROM workout GROUP BY kind`,
      ),
    })),
);

server.tool(
  'recommend_recovery',
  'The current recovery read: score, contributing factors (sleep/HRV/RHR/load/stress), and suggested recovery actions.',
  {},
  () =>
    run(async () => {
      const read = await queryOne<{ id: number }>(
        `SELECT id, date_label, score, label, headline, status_line, summary
         FROM recovery_read ORDER BY date DESC LIMIT 1`,
      );
      if (!read) return { recovery: null };
      return {
        recovery: read,
        factors: await query(
          `SELECT label, value, state, detail FROM recovery_factor WHERE recovery_id = ? ORDER BY ord`,
          [read.id],
        ),
        suggestedActions: await query(
          `SELECT title, kind, duration_label, detail FROM recovery_action WHERE recovery_id = ? ORDER BY ord`,
          [read.id],
        ),
      };
    }),
);

server.tool(
  'list_goals',
  'Tracked goals with current progress toward each target.',
  {},
  () =>
    run(() =>
      query(
        `SELECT title, category, metric, target, current, unit, cadence, due_label,
                CASE WHEN target > 0 THEN ROUND(100.0 * current / target, 1) ELSE NULL END AS percent
         FROM goal ORDER BY ord, id`,
      ),
    ),
);

server.tool(
  'recent_checkins',
  'Recent daily check-ins (morning/evening) with energy, mood, sleep, soreness, stress, and reflection notes.',
  { limit: z.number().int().positive().max(60).default(14) },
  ({ limit }) =>
    run(() =>
      query(
        `SELECT occurred_at, part_of_day, energy, mood, sleep_quality, soreness, stress, note
         FROM mood ORDER BY occurred_at DESC LIMIT ?`,
        [limit],
      ),
    ),
);

const transport = new StdioServerTransport();
await server.connect(transport);
// stderr is safe for logs (stdout is the MCP transport).
console.error(`wellframe-coach MCP server ready · db: ${DB_PATH}`);
