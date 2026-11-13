import pg from "pg";
import {
  randomUUID,
  randomBytes,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
export const id = () => randomUUID();
export const token = () => randomBytes(32).toString("base64url");
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const now = () => new Date().toISOString();
export function passwordHash(value) {
  const salt = token();
  return `${salt}:${scryptSync(value, salt, 64).toString("hex")}`;
}
export function passwordMatches(value, encoded) {
  try {
    const [salt, expected] = encoded.split(":");
    return timingSafeEqual(
      scryptSync(value, salt, 64),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}
export function createStore(connectionString, schema = "homework") {
  if (!/^[a-z][a-z0-9_]*$/.test(schema))
    throw new Error("Invalid database schema");
  const pool = new pg.Pool({
    connectionString,
    ...(process.env.HOMEWORK_DB_TLS_CERT ? {ssl:{
      ca:Buffer.from(process.env.HOMEWORK_DB_TLS_CERT,'base64').toString(),
      rejectUnauthorized:true,
      checkServerIdentity:(_host,cert)=>cert.fingerprint256===process.env.HOMEWORK_DB_TLS_FINGERPRINT?undefined:new Error('Database TLS certificate changed; connection refused'),
    }} : {}),
    max: 8,
    connectionTimeoutMillis: 10000,
  });
  const table = `${schema}.records`,
    jobs = `${schema}.jobs`;
  const query = (sql, params = []) => pool.query(sql, params);
  const api = {
    pool,
    query,
    table,
    jobs,
    async get(key, client = pool) {
      return (
        await client.query(`SELECT data FROM ${table} WHERE id=$1`, [key])
      ).rows[0]?.data;
    },
    async list(kind, client = pool, unitId) {
      return (
        await client.query(
          `SELECT data FROM ${table} WHERE kind=$1 ${unitId ? "AND data->>'unitId'=$2" : ""} ORDER BY created DESC`,
          unitId ? [kind, unitId] : [kind],
        )
      ).rows.map((r) => r.data);
    },
    async put(kind, data, client = pool) {
      await client.query(
        `INSERT INTO ${table}(id,kind,data) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data WHERE ${table}.kind=EXCLUDED.kind`,
        [data.id, kind, data],
      );
      return data;
    },
    async remove(key, client = pool) {
      await client.query(`DELETE FROM ${table} WHERE id=$1`, [key]);
    },
    async tx(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
          schema,
        ]);
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    },
    async init() {
      await query(
        `CREATE SCHEMA IF NOT EXISTS ${schema}; CREATE TABLE IF NOT EXISTS ${table}(id text PRIMARY KEY,kind text NOT NULL,data jsonb NOT NULL,created timestamptz NOT NULL DEFAULT now()); CREATE INDEX IF NOT EXISTS records_kind ON ${table}(kind); CREATE TABLE IF NOT EXISTS ${jobs}(id text PRIMARY KEY,kind text NOT NULL,target text NOT NULL,payload jsonb NOT NULL,status text NOT NULL DEFAULT 'queued',lease text,lease_until timestamptz,attempts integer NOT NULL DEFAULT 0,created timestamptz NOT NULL DEFAULT now(),finished timestamptz,result jsonb,error text); CREATE INDEX IF NOT EXISTS jobs_queue ON ${jobs}(status,created);`,
      );
      if (process.env.HOMEWORK_TEACHER_PASSWORD)
        await api.tx(async (c) => {
          if (!(await api.list("user", c)).some((u) => u.role === "teacher"))
            await api.put(
              "user",
              {
                id: id(),
                role: "teacher",
                username: "mike",
                name: "Mike",
                password: passwordHash(process.env.HOMEWORK_TEACHER_PASSWORD),
                createdAt: now(),
              },
              c,
            );
        });
      if (process.env.HOMEWORK_WORKER_SECRET && !(await api.get("device")))
        await api.put("device", {
          id: "device",
          name: "Mike 的 MacBook Pro",
          secretHash: hash(process.env.HOMEWORK_WORKER_SECRET),
          lastSeen: null,
          revoked: false,
        });
      if (!(await api.get("model-settings")))
        await api.put("settings", {
          id: "model-settings",
          provider: "ollama",
          baseUrl: "http://127.0.0.1:11434",
          model: "qwen3-vl:8b-instruct",
        });
    },
    async enqueue(kind, target, payload, c = pool) {
      const jobId = id();
      await c.query(
        `INSERT INTO ${jobs}(id,kind,target,payload) VALUES($1,$2,$3,$4)`,
        [jobId, kind, target, payload],
      );
      return jobId;
    },
    async audit(actor, action, target, c = pool) {
      await api.put("audit", { id: id(), actor, action, target, at: now() }, c);
    },
  };
  return api;
}
