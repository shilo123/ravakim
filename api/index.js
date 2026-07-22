// API של הפרויקט – רץ כפונקציית Serverless אחת ב-Vercel.
// DB: Neon Postgres (jsonb), קבצים: Vercel Blob.
const express = require("express");
const crypto = require("crypto");
const { neon } = require("@neondatabase/serverless");
const { handleUpload } = require("@vercel/blob/client");

const sql = neon(process.env.DATABASE_URL);
const app = express();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

// ב-Vercel הגוף כבר עשוי להיות מפוענח (req.body). בריצה מקומית רגילה נפענח לבד.
app.use((req, res, next) => {
  try {
    if (req.body !== undefined) return next();
  } catch (e) {
    req.body = {};
    return next();
  }
  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    try {
      req.body = raw ? JSON.parse(raw) : {};
    } catch (e) {
      req.body = {};
    }
    next();
  });
});

// יצירת הטבלאות בעליה קרה ראשונה
let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id text PRIMARY KEY,
          data jsonb NOT NULL DEFAULT '{}'::jsonb,
          created_at timestamptz NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS shiduchim (
          id text PRIMARY KEY,
          potentzial jsonb NOT NULL DEFAULT '[]'::jsonb,
          note text,
          created_at timestamptz NOT NULL DEFAULT now()
        )`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

app.use(async (req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (err) {
    console.error("DB init error:", err.message);
    res.status(503).json({
      error: "מסד הנתונים לא מוכן",
      message: "השרת לא הצליח להתחבר למסד הנתונים, נסה שוב בעוד כמה שניות",
    });
  }
});

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return next();
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "אין הרשאה" });
  }
  next();
}

// Helpers ---------------------------------------------------------------
function validId(id) {
  return typeof id === "string" && /^[A-Za-z0-9-]{8,64}$/.test(id);
}

function calcAge(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return null;
  const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  return Math.round((diffDays / 365.25) * 10) / 10;
}

function ageToBirthDate(age) {
  const n = Number(age);
  if (!Number.isFinite(n) || n < 0 || n > 150) return null;
  const today = new Date();
  return new Date(today.getFullYear() - n, today.getMonth(), today.getDate());
}

// שורה מה-DB -> אובייקט בצורה שהפרונט מכיר (_id + כל השדות + Age)
function toUserDoc(row) {
  return { _id: row.id, ...row.data, Age: calcAge(row.data.BirthDate) };
}

async function getAllUsers() {
  const rows = await sql`SELECT id, data FROM users ORDER BY created_at DESC`;
  return rows.map(toUserDoc);
}

function startsWithHe(value, search) {
  if (typeof value !== "string") return false;
  return value.trim().toLowerCase().startsWith(search.trim().toLowerCase());
}

async function getAllShiduchim() {
  const [shRows, users] = await Promise.all([
    sql`SELECT id, potentzial, note FROM shiduchim ORDER BY created_at DESC`,
    getAllUsers(),
  ]);
  const byId = new Map(users.map((u) => [u._id, u]));
  return shRows.map((row) => {
    const ids = Array.isArray(row.potentzial) ? row.potentzial : [];
    return {
      _id: row.id,
      Potentzial: ids,
      Note: row.note || undefined,
      Shiduh: ids.map((id) => byId.get(id)).filter(Boolean),
    };
  });
}

// Routes ----------------------------------------------------------------
const router = express.Router();

// העלאת קבצים ישירות מהדפדפן ל-Vercel Blob (טוקן חתום מהשרת)
router.post("/upload", async (req, res) => {
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/*", "video/*"],
        maximumSizeInBytes: 200 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    res.json(jsonResponse);
  } catch (err) {
    console.error("upload error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

router.post("/ADDForm", async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json(false);
    }
    delete body._id;
    delete body.Age;
    const id = crypto.randomUUID();
    await sql`INSERT INTO users (id, data) VALUES (${id}, ${JSON.stringify(body)}::jsonb)`;
    res.json(true);
  } catch (error) {
    console.error("ADDForm error:", error.message);
    res.json(false);
  }
});

router.get("/GetRavakim", async (req, res) => {
  try {
    res.json(await getAllUsers());
  } catch (error) {
    console.error("GetRavakim error:", error.message);
    res.json(false);
  }
});

router.post("/FilterData", async (req, res) => {
  try {
    const { Name, AgeStart, AgeEnd, Gender, RamaDatit, Address, Status } =
      req.body || {};
    let data = await getAllUsers();

    if (typeof Name === "string" && Name.trim() !== "") {
      data = data.filter((d) => startsWithHe(d.Name, Name));
    }
    if (typeof RamaDatit === "string" && RamaDatit.trim() !== "") {
      data = data.filter((d) => startsWithHe(d.RamaDatit, RamaDatit));
    }
    if (typeof Address === "string" && Address.trim() !== "") {
      data = data.filter((d) => startsWithHe(d.Address, Address));
    }
    if (typeof Status === "string" && Status.trim() !== "") {
      data = data.filter((d) => startsWithHe(d.Status, Status));
    }
    if (typeof Gender === "string" && Gender.trim() !== "") {
      data = data.filter((d) => d.Gender === Gender);
    }
    if (AgeStart != null && AgeEnd != null && AgeStart !== "" && AgeEnd !== "") {
      const aS = +AgeStart;
      const aE = +AgeEnd;
      if (Number.isFinite(aS) && Number.isFinite(aE)) {
        data = data.filter((d) => d.Age != null && d.Age >= aS && d.Age <= aE);
      }
    }
    res.json(data);
  } catch (error) {
    console.error("FilterData error:", error.message);
    res.json(false);
  }
});

router.get("/GetDetalis/:id", async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json(false);
    const rows = await sql`SELECT id, data FROM users WHERE id = ${req.params.id}`;
    res.json(rows.length ? toUserDoc(rows[0]) : null);
  } catch (error) {
    console.error("GetDetalis error:", error.message);
    res.json(false);
  }
});

router.get("/GetShiduhim", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      man: users.filter((u) => u.Gender === "זכר"),
      woman: users.filter((u) => u.Gender === "נקבה"),
    });
  } catch (error) {
    console.error("GetShiduhim error:", error.message);
    res.status(500).json({ error: "שגיאה בשליפת נתונים" });
  }
});

router.get("/GetShoduh", async (req, res) => {
  try {
    res.json(await getAllShiduchim());
  } catch (error) {
    console.error("GetShoduh error:", error.message);
    res.json(false);
  }
});

router.put("/EditZog", requireAdmin, async (req, res) => {
  try {
    const { newPoten, ID } = req.body || {};
    if (!validId(ID) || !Array.isArray(newPoten)) {
      return res.status(400).json(null);
    }
    await sql`UPDATE shiduchim SET potentzial = ${JSON.stringify(newPoten)}::jsonb WHERE id = ${ID}`;
    res.json(await getAllShiduchim());
  } catch (error) {
    console.error("EditZog error:", error.message);
    res.json(null);
  }
});

router.post("/InsertShiduh", requireAdmin, async (req, res) => {
  try {
    const Potentzial = req.body;
    if (!Array.isArray(Potentzial)) return res.status(400).json(false);
    const id = crypto.randomUUID();
    await sql`INSERT INTO shiduchim (id, potentzial) VALUES (${id}, ${JSON.stringify(Potentzial)}::jsonb)`;
    res.json(true);
  } catch (error) {
    console.error("InsertShiduh error:", error.message);
    res.json(false);
  }
});

router.delete("/DeleteShiduh/:id", requireAdmin, async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json(false);
    await sql`DELETE FROM shiduchim WHERE id = ${req.params.id}`;
    res.json(true);
  } catch (error) {
    console.error("DeleteShiduh error:", error.message);
    res.json(false);
  }
});

router.post("/AddNoteT", requireAdmin, async (req, res) => {
  try {
    const { id, note } = req.body || {};
    if (!validId(id) || typeof note !== "string") {
      return res.status(400).json(false);
    }
    await sql`UPDATE shiduchim SET note = ${note} WHERE id = ${id}`;
    res.json(true);
  } catch (error) {
    console.error("AddNoteT error:", error.message);
    res.json(false);
  }
});

// נשאר GET לתאימות עם הפרונט הקיים
router.get("/DeleteUser/:id", requireAdmin, async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json(false);
    const rows = await sql`DELETE FROM users WHERE id = ${req.params.id} RETURNING id`;
    res.json(rows.length === 1);
  } catch (error) {
    console.error("DeleteUser error:", error.message);
    res.json(false);
  }
});

router.put("/UpdateNote/:id", requireAdmin, async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json(false);
    const { Note } = req.body || {};
    if (typeof Note !== "string") return res.status(400).json(false);
    await sql`
      UPDATE users
      SET data = data || jsonb_build_object('Note', ${Note}::text)
      WHERE id = ${req.params.id}`;
    res.json(true);
  } catch (error) {
    console.error("UpdateNote error:", error.message);
    res.json(false);
  }
});

const ALLOWED_EDIT_FIELDS = new Set([
  "Name",
  "Gender",
  "RamaDatit",
  "Address",
  "Status",
  "BirthDate",
  "Age",
  "Note",
  "Phone",
  "phone",
  "Email",
  "Image",
  "Height",
  "picURL",
  "videoURL",
  "IsuckOrMosadLimudim",
  "Ofi",
  "Hobits",
  "MaMehapes",
  "KavimClalim",
]);

router.put("/EditUser", requireAdmin, async (req, res) => {
  try {
    const { id, field, value } = req.body || {};
    if (
      !validId(id) ||
      typeof field !== "string" ||
      !ALLOWED_EDIT_FIELDS.has(field)
    ) {
      return res.status(400).json(false);
    }
    if (field === "Age") {
      const birth = ageToBirthDate(value);
      if (!birth) return res.status(400).json(false);
      await sql`
        UPDATE users
        SET data = data || jsonb_build_object('BirthDate', ${birth.toISOString()}::text)
        WHERE id = ${id}`;
    } else {
      await sql`
        UPDATE users
        SET data = data || jsonb_build_object(${field}::text, ${String(value)}::text)
        WHERE id = ${id}`;
    }
    res.json(true);
  } catch (error) {
    console.error("EditUser error:", error.message);
    res.json(false);
  }
});

router.get("/healthz", async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({ ok: true, dbConnected: true, message: "מסד נתונים מחובר" });
  } catch (e) {
    res.json({ ok: true, dbConnected: false, message: "מסד נתונים לא מחובר" });
  }
});

app.use("/api", router);
app.use("/", router);

module.exports = app;
