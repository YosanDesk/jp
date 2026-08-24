import { env } from "cloudflare:workers";
import initialState from "../../../data/reference-state.json";

const createTableSql = `CREATE TABLE IF NOT EXISTS content_dashboard_state (
  id TEXT PRIMARY KEY NOT NULL,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

async function ensureTable() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  await env.DB.prepare(createTableSql).run();
}

export async function GET() {
  try {
    await ensureTable();
    const row = await env.DB.prepare("SELECT data FROM content_dashboard_state WHERE id = ?")
      .bind("main")
      .first<{ data: string }>();

    if (row?.data) {
      return Response.json({ data: JSON.parse(row.data) }, { headers: { "Cache-Control": "no-store" } });
    }

    await env.DB.prepare("INSERT INTO content_dashboard_state (id, data) VALUES (?, ?)")
      .bind("main", JSON.stringify(initialState))
      .run();
    return Response.json({ data: initialState }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取共享数据失败";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as { data?: unknown };
    if (!payload.data || typeof payload.data !== "object") {
      return Response.json({ error: "data is required" }, { status: 400 });
    }

    await ensureTable();
    await env.DB.prepare(`INSERT INTO content_dashboard_state (id, data, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`)
      .bind("main", JSON.stringify(payload.data))
      .run();
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存共享数据失败";
    return Response.json({ error: message }, { status: 500 });
  }
}
