import "server-only";
import postgres from "postgres";
import { randomUUID } from "node:crypto";
import type { DayType, Phase } from "./plan";
import type { SetLog, User, WorkoutSession } from "./types";

const CONNECTION = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

/** Ohne Connection-String läuft die App auf einem flüchtigen Speicher im Prozess. */
export const hasDatabase = CONNECTION.length > 0;

export type StoredUser = User & { passwordHash: string };
export type UserData = { sessions: WorkoutSession[]; sets: SetLog[] };

type Store = {
  findUserByEmail(email: string): Promise<StoredUser | null>;
  createUser(email: string, passwordHash: string, startDate: string): Promise<StoredUser>;
  findUserByToken(token: string): Promise<User | null>;
  createToken(token: string, userId: string, expiresAt: Date): Promise<void>;
  deleteToken(token: string): Promise<void>;
  setStartDate(userId: string, startDate: string): Promise<void>;
  loadUserData(userId: string): Promise<UserData>;
  ensureSession(userId: string, date: string, dayType: DayType, weekNumber: number, phase: Phase): Promise<WorkoutSession>;
  addSet(input: Omit<SetLog, "id">): Promise<SetLog>;
  deleteSet(userId: string, setId: string): Promise<void>;
  deleteAllData(userId: string): Promise<void>;
};

// ---------------------------------------------------------------- Postgres

const sql = hasDatabase
  ? postgres(CONNECTION, { ssl: "require", max: 3, idle_timeout: 20, prepare: false })
  : null;

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!sql) return Promise.resolve();
  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id            text PRIMARY KEY,
        email         text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        start_date    date NOT NULL,
        created_at    timestamptz NOT NULL DEFAULT now()
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        token      text PRIMARY KEY,
        user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id          text PRIMARY KEY,
        user_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date        date NOT NULL,
        day_type    text NOT NULL,
        week_number int  NOT NULL,
        phase       text NOT NULL,
        UNIQUE (user_id, date, day_type)
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS set_logs (
        id          text PRIMARY KEY,
        session_id  text NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
        exercise_id text NOT NULL,
        set_number  int  NOT NULL,
        reps        int  NOT NULL,
        weight_kg   numeric(6,2) NOT NULL,
        rpe         int,
        notes       text,
        is_drop_set boolean NOT NULL DEFAULT false,
        created_at  timestamptz NOT NULL DEFAULT now()
      )`;
    await sql`CREATE INDEX IF NOT EXISTS set_logs_session_idx ON set_logs (session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS sessions_user_idx ON workout_sessions (user_id, date)`;
    await sql`DELETE FROM auth_tokens WHERE expires_at < now()`;
  })().catch((err) => {
    schemaReady = null;
    throw err;
  });
  return schemaReady;
}

function rowToSession(r: Record<string, unknown>): WorkoutSession {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    date: toDateString(r.date),
    dayType: r.day_type as DayType,
    weekNumber: Number(r.week_number),
    phase: r.phase as Phase,
  };
}

function rowToSet(r: Record<string, unknown>): SetLog {
  return {
    id: String(r.id),
    sessionId: String(r.session_id),
    exerciseId: String(r.exercise_id),
    setNumber: Number(r.set_number),
    reps: Number(r.reps),
    weightKg: Number(r.weight_kg),
    rpe: r.rpe === null || r.rpe === undefined ? null : Number(r.rpe),
    notes: (r.notes as string | null) ?? null,
    isDropSet: Boolean(r.is_drop_set),
  };
}

function toDateString(value: unknown): string {
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  return String(value).slice(0, 10);
}

const pgStore: Store = {
  async findUserByEmail(email) {
    await ensureSchema();
    const rows = await sql!`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
    if (rows.length === 0) return null;
    const r = rows[0];
    return { id: String(r.id), email: String(r.email), startDate: toDateString(r.start_date), passwordHash: String(r.password_hash) };
  },
  async createUser(email, passwordHash, startDate) {
    await ensureSchema();
    const id = randomUUID();
    await sql!`INSERT INTO users (id, email, password_hash, start_date) VALUES (${id}, ${email.toLowerCase()}, ${passwordHash}, ${startDate})`;
    return { id, email: email.toLowerCase(), startDate, passwordHash };
  },
  async findUserByToken(token) {
    await ensureSchema();
    const rows = await sql!`
      SELECT u.id, u.email, u.start_date FROM auth_tokens t
      JOIN users u ON u.id = t.user_id
      WHERE t.token = ${token} AND t.expires_at > now() LIMIT 1`;
    if (rows.length === 0) return null;
    const r = rows[0];
    return { id: String(r.id), email: String(r.email), startDate: toDateString(r.start_date) };
  },
  async createToken(token, userId, expiresAt) {
    await ensureSchema();
    await sql!`INSERT INTO auth_tokens (token, user_id, expires_at) VALUES (${token}, ${userId}, ${expiresAt})`;
  },
  async deleteToken(token) {
    await ensureSchema();
    await sql!`DELETE FROM auth_tokens WHERE token = ${token}`;
  },
  async setStartDate(userId, startDate) {
    await ensureSchema();
    await sql!`UPDATE users SET start_date = ${startDate} WHERE id = ${userId}`;
  },
  async loadUserData(userId) {
    await ensureSchema();
    const sessionRows = await sql!`SELECT * FROM workout_sessions WHERE user_id = ${userId} ORDER BY date ASC`;
    const sessions = sessionRows.map(rowToSession);
    if (sessions.length === 0) return { sessions, sets: [] };
    const setRows = await sql!`
      SELECT s.* FROM set_logs s
      JOIN workout_sessions ws ON ws.id = s.session_id
      WHERE ws.user_id = ${userId}
      ORDER BY s.created_at ASC`;
    return { sessions, sets: setRows.map(rowToSet) };
  },
  async ensureSession(userId, date, dayType, weekNumber, phase) {
    await ensureSchema();
    const existing = await sql!`SELECT * FROM workout_sessions WHERE user_id = ${userId} AND date = ${date} AND day_type = ${dayType} LIMIT 1`;
    if (existing.length > 0) return rowToSession(existing[0]);
    const id = randomUUID();
    const rows = await sql!`
      INSERT INTO workout_sessions (id, user_id, date, day_type, week_number, phase)
      VALUES (${id}, ${userId}, ${date}, ${dayType}, ${weekNumber}, ${phase})
      ON CONFLICT (user_id, date, day_type) DO UPDATE SET week_number = EXCLUDED.week_number
      RETURNING *`;
    return rowToSession(rows[0]);
  },
  async addSet(input) {
    await ensureSchema();
    const id = randomUUID();
    await sql!`
      INSERT INTO set_logs (id, session_id, exercise_id, set_number, reps, weight_kg, rpe, notes, is_drop_set)
      VALUES (${id}, ${input.sessionId}, ${input.exerciseId}, ${input.setNumber}, ${input.reps}, ${input.weightKg}, ${input.rpe}, ${input.notes}, ${input.isDropSet})`;
    return { ...input, id };
  },
  async deleteSet(userId, setId) {
    await ensureSchema();
    await sql!`
      DELETE FROM set_logs
      WHERE id = ${setId}
        AND session_id IN (SELECT id FROM workout_sessions WHERE user_id = ${userId})`;
  },
  async deleteAllData(userId) {
    await ensureSchema();
    await sql!`DELETE FROM workout_sessions WHERE user_id = ${userId}`;
  },
};

// ------------------------------------------------------- Speicher im Prozess

type MemoryDb = { users: StoredUser[]; tokens: Map<string, { userId: string; expiresAt: Date }>; sessions: WorkoutSession[]; sets: SetLog[] };

const globalForMemory = globalThis as unknown as { __trainingsplanMemory?: MemoryDb };
const mem: MemoryDb = (globalForMemory.__trainingsplanMemory ??= { users: [], tokens: new Map(), sessions: [], sets: [] });

const memoryStore: Store = {
  async findUserByEmail(email) {
    return mem.users.find((u) => u.email === email.toLowerCase()) ?? null;
  },
  async createUser(email, passwordHash, startDate) {
    const user: StoredUser = { id: randomUUID(), email: email.toLowerCase(), startDate, passwordHash };
    mem.users.push(user);
    return user;
  },
  async findUserByToken(token) {
    const entry = mem.tokens.get(token);
    if (!entry || entry.expiresAt < new Date()) return null;
    const user = mem.users.find((u) => u.id === entry.userId);
    return user ? { id: user.id, email: user.email, startDate: user.startDate } : null;
  },
  async createToken(token, userId, expiresAt) {
    mem.tokens.set(token, { userId, expiresAt });
  },
  async deleteToken(token) {
    mem.tokens.delete(token);
  },
  async setStartDate(userId, startDate) {
    const user = mem.users.find((u) => u.id === userId);
    if (user) user.startDate = startDate;
  },
  async loadUserData(userId) {
    const sessions = mem.sessions.filter((s) => s.userId === userId).sort((a, b) => a.date.localeCompare(b.date));
    const ids = new Set(sessions.map((s) => s.id));
    return { sessions, sets: mem.sets.filter((s) => ids.has(s.sessionId)) };
  },
  async ensureSession(userId, date, dayType, weekNumber, phase) {
    const found = mem.sessions.find((s) => s.userId === userId && s.date === date && s.dayType === dayType);
    if (found) return found;
    const session: WorkoutSession = { id: randomUUID(), userId, date, dayType, weekNumber, phase };
    mem.sessions.push(session);
    return session;
  },
  async addSet(input) {
    const set: SetLog = { ...input, id: randomUUID() };
    mem.sets.push(set);
    return set;
  },
  async deleteSet(userId, setId) {
    const owned = new Set(mem.sessions.filter((s) => s.userId === userId).map((s) => s.id));
    const index = mem.sets.findIndex((s) => s.id === setId && owned.has(s.sessionId));
    if (index >= 0) mem.sets.splice(index, 1);
  },
  async deleteAllData(userId) {
    const owned = new Set(mem.sessions.filter((s) => s.userId === userId).map((s) => s.id));
    mem.sets = mem.sets.filter((s) => !owned.has(s.sessionId));
    mem.sessions = mem.sessions.filter((s) => s.userId !== userId);
  },
};

export const store: Store = hasDatabase ? pgStore : memoryStore;
