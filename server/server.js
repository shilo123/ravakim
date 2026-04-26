// השתקת אזהרת AWS SDK v2
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";

// טעינת משתני סביבה מקובץ .env
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const AWS = require("aws-sdk");

const PORT = process.env.PORT || 3006;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

if (!ADMIN_TOKEN) {
  console.warn(
    "⚠️  ADMIN_TOKEN not set – destructive endpoints are unauthenticated. " +
      "Set ADMIN_TOKEN in your environment to enable protection."
  );
}

// Trust proxy (Heroku) so rate limiter sees the real client IP
app.set("trust proxy", 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Body size limits to prevent DoS via large JSON payloads
app.use(bodyParser.json({ limit: "100kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100kb" }));

// Strip MongoDB operator injection ($, .) from req.body / params / query
app.use(mongoSanitize());

// Global rate limiter – blunt protection against bots
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "יותר מדי בקשות, נסה שוב בעוד דקה" },
});
app.use(globalLimiter);

// Stricter limiter for write/destructive endpoints
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "יותר מדי בקשות כתיבה, נסה שוב בעוד דקה" },
});

// Optional admin auth – only enforced if ADMIN_TOKEN is set in env
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return next();
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "אין הרשאה" });
  }
  next();
}

// CORS – explicit allowlist
const corsOptions = {
  origin: [
    "https://server-ravakim-10c1effbda77.herokuapp.com",
    "http://localhost:3006",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use("/UpFile", express.static(path.join(__dirname, "UpFile")));
app.use(express.static(path.join(__dirname, "client")));

// File uploads – 5MB cap, image mime types only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) {
      return cb(new Error("רק קובצי תמונה מותרים"));
    }
    cb(null, true);
  },
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

let collection = null;
let collectionP = null;
let mongoClient = null;

// Helpers ---------------------------------------------------------------
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toObjectId(id) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

function dbReady(res) {
  if (!collection || !collectionP) {
    res.status(503).json({
      error: "מסד הנתונים לא מוכן",
      message: "השרת עדיין מתחבר למסד הנתונים, נסה שוב בעוד כמה שניות",
    });
    return false;
  }
  return true;
}

function GetAge(data) {
  const calculateAge = (obj) => {
    let Age = null;
    if (obj && obj.BirthDate) {
      const birth =
        obj.BirthDate instanceof Date ? obj.BirthDate : new Date(obj.BirthDate);
      if (!isNaN(birth.getTime())) {
        const today = new Date();
        const diffTime = today.getTime() - birth.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        Age = Math.round((diffDays / 365.25) * 10) / 10;
      }
    }
    return { ...obj, Age };
  };
  if (Array.isArray(data)) return data.map(calculateAge);
  if (typeof data === "object" && data !== null) return calculateAge(data);
  return data;
}

function calcAge(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  const diffTime = today.getTime() - d.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return Math.round((diffDays / 365.25) * 10) / 10;
}

function ageToBirthDate(age) {
  const n = Number(age);
  if (!Number.isFinite(n) || n < 0 || n > 150) return null;
  const today = new Date();
  return new Date(today.getFullYear() - n, today.getMonth(), today.getDate());
}

// MongoDB connection ----------------------------------------------------
async function init() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI לא מוגדר");
  } else {
    try {
      console.log("🔄 מתחבר ל-MongoDB...");
      mongoClient = new MongoClient(uri);
      await mongoClient.connect();
      const db = mongoClient.db("Project-ravakim");
      collection = db.collection("Users-Ravakim");
      collectionP = db.collection("potentzial");
      console.log("✅ MongoDB מחובר");
    } catch (err) {
      console.error("❌ שגיאת התחברות ל-MongoDB:", err?.message || err);
    }
  }
  app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}/`);
  });
}

// Routes ----------------------------------------------------------------
app.post(
  "/postFilee",
  writeLimiter,
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "לא נשלח קובץ" });
    }
    const safeKey = `${Date.now()}-${path.basename(req.file.originalname)}`;
    const params = {
      Bucket: "dagmusht",
      Key: safeKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    s3.upload(params, (err) => {
      if (err) {
        console.error("S3 upload error:", err.message);
        return res.status(500).json({ error: "שגיאה בהעלאת הקובץ" });
      }
      const publicUrl = `https://${params.Bucket}.s3.amazonaws.com/${encodeURIComponent(safeKey)}`;
      res.send(publicUrl);
    });
  }
);

app.post("/ADDForm", writeLimiter, async (req, res) => {
  if (!dbReady(res)) return;
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json(false);
    }
    await collection.insertOne(req.body);
    res.json(true);
  } catch (error) {
    console.error("ADDForm error:", error.message);
    res.json(false);
  }
});

app.get("/GetRavakim", async (req, res) => {
  if (!dbReady(res)) return;
  try {
    let data = await collection.find({}).toArray();
    data = GetAge(data);
    res.json(data);
  } catch (error) {
    console.error("GetRavakim error:", error.message);
    res.json(false);
  }
});

app.post("/FilterData", async (req, res) => {
  if (!dbReady(res)) return;
  try {
    let { Name, AgeStart, AgeEnd, Gender, RamaDatit, Address, Status } =
      req.body || {};

    const ContentQuery = {};
    if (typeof Name === "string" && Name.trim() !== "") {
      ContentQuery.Name = { $regex: `^${escapeRegex(Name)}`, $options: "i" };
    }
    if (typeof RamaDatit === "string" && RamaDatit.trim() !== "") {
      ContentQuery.RamaDatit = {
        $regex: `^${escapeRegex(RamaDatit)}`,
        $options: "i",
      };
    }
    if (typeof Address === "string" && Address.trim() !== "") {
      ContentQuery.Address = {
        $regex: `^${escapeRegex(Address)}`,
        $options: "i",
      };
    }
    if (typeof Gender === "string" && Gender.trim() !== "") {
      ContentQuery.Gender = Gender;
    }
    if (typeof Status === "string" && Status.trim() !== "") {
      ContentQuery.Status = {
        $regex: `^${escapeRegex(Status)}`,
        $options: "i",
      };
    }

    let data = await collection.find(ContentQuery).toArray();

    if (
      AgeStart != null &&
      AgeEnd != null &&
      AgeStart !== "" &&
      AgeEnd !== ""
    ) {
      const aS = +AgeStart;
      const aE = +AgeEnd;
      if (Number.isFinite(aS) && Number.isFinite(aE)) {
        data = data.filter((doc) => {
          const age = calcAge(doc.BirthDate);
          return age != null && age >= aS && age <= aE;
        });
      }
    }
    data = GetAge(data);
    res.json(data);
  } catch (error) {
    console.error("FilterData error:", error.message);
    res.json(false);
  }
});

app.get("/GetDetalis/:id", async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const oid = toObjectId(req.params.id);
    if (!oid) return res.status(400).json(false);
    const doc = await collection.findOne({ _id: oid });
    res.json(doc ? GetAge(doc) : null);
  } catch (error) {
    console.error("GetDetalis error:", error.message);
    res.json(false);
  }
});

app.get("/GetShiduhim", async (req, res) => {
  if (!dbReady(res)) return;
  try {
    let data = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            man: {
              $push: {
                $cond: [{ $eq: ["$Gender", "זכר"] }, "$$ROOT", "$$REMOVE"],
              },
            },
            woman: {
              $push: {
                $cond: [{ $eq: ["$Gender", "נקבה"] }, "$$ROOT", "$$REMOVE"],
              },
            },
          },
        },
      ])
      .toArray();
    data = GetAge(data[0]);
    res.json(data);
  } catch (error) {
    console.error("GetShiduhim error:", error.message);
    res.status(500).json({ error: "שגיאה בשליפת נתונים" });
  }
});

app.get("/GetShoduh", async (req, res) => {
  if (!dbReady(res)) return;
  try {
    let data = await collectionP
      .aggregate([
        {
          $lookup: {
            from: "Users-Ravakim",
            let: { potentzialIds: "$Potentzial" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [
                      "$_id",
                      {
                        $map: {
                          input: "$$potentzialIds",
                          as: "potId",
                          in: { $toObjectId: "$$potId" },
                        },
                      },
                    ],
                  },
                },
              },
            ],
            as: "Shiduh",
          },
        },
      ])
      .toArray();
    data = GetAge(data);
    res.json(data);
  } catch (error) {
    console.error("GetShoduh error:", error.message);
    res.json(false);
  }
});

app.put("/EditZog", writeLimiter, requireAdmin, async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const { newPoten, ID } = req.body || {};
    const oid = toObjectId(ID);
    if (!oid || !Array.isArray(newPoten)) {
      return res.status(400).json(null);
    }
    await collectionP.updateOne(
      { _id: oid },
      { $set: { Potentzial: newPoten } }
    );

    let data = await collectionP
      .aggregate([
        {
          $lookup: {
            from: "Users-Ravakim",
            let: { potentzialIds: "$Potentzial" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [
                      "$_id",
                      {
                        $map: {
                          input: "$$potentzialIds",
                          as: "potId",
                          in: { $toObjectId: "$$potId" },
                        },
                      },
                    ],
                  },
                },
              },
            ],
            as: "Shiduh",
          },
        },
      ])
      .toArray();
    data = GetAge(data);
    res.json(data);
  } catch (error) {
    console.error("EditZog error:", error.message);
    res.json(null);
  }
});

app.post("/InsertShiduh", writeLimiter, requireAdmin, async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const Potentzial = req.body;
    if (!Array.isArray(Potentzial)) return res.status(400).json(false);
    await collectionP.insertOne({ Potentzial });
    res.json(true);
  } catch (error) {
    console.error("InsertShiduh error:", error.message);
    res.json(false);
  }
});

app.delete(
  "/DeleteShiduh/:id",
  writeLimiter,
  requireAdmin,
  async (req, res) => {
    if (!dbReady(res)) return;
    try {
      const oid = toObjectId(req.params.id);
      if (!oid) return res.status(400).json(false);
      await collectionP.deleteOne({ _id: oid });
      res.json(true);
    } catch (error) {
      console.error("DeleteShiduh error:", error.message);
      res.json(false);
    }
  }
);

app.post("/AddNoteT", writeLimiter, requireAdmin, async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const { id, note } = req.body || {};
    const oid = toObjectId(id);
    if (!oid || typeof note !== "string") return res.status(400).json(false);
    await collectionP.updateOne({ _id: oid }, { $set: { Note: note } });
    res.json(true);
  } catch (error) {
    console.error("AddNoteT error:", error.message);
    res.json(false);
  }
});

// Kept as GET to remain compatible with existing frontend, but rate-limited
// and admin-gated. Bots crawling links will not be able to delete users.
app.get("/DeleteUser/:id", writeLimiter, requireAdmin, async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const oid = toObjectId(req.params.id);
    if (!oid) return res.status(400).json(false);
    const result = await collection.deleteOne({ _id: oid });
    res.json(result.deletedCount === 1);
  } catch (error) {
    console.error("DeleteUser error:", error.message);
    res.json(false);
  }
});

app.put("/UpdateNote/:id", writeLimiter, requireAdmin, async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const oid = toObjectId(req.params.id);
    if (!oid) return res.status(400).json(false);
    const { Note } = req.body || {};
    if (typeof Note !== "string") return res.status(400).json(false);
    await collection.updateOne({ _id: oid }, { $set: { Note } });
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
  "Email",
  "Image",
  "Height",
]);

app.put("/EditUser", writeLimiter, requireAdmin, async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const { id, field, value } = req.body || {};
    const oid = toObjectId(id);
    if (!oid || typeof field !== "string" || !ALLOWED_EDIT_FIELDS.has(field)) {
      return res.status(400).json(false);
    }
    if (field !== "Age") {
      await collection.updateOne({ _id: oid }, { $set: { [field]: value } });
    } else {
      const valueAge = ageToBirthDate(value);
      if (!valueAge) return res.status(400).json(false);
      await collection.updateOne(
        { _id: oid },
        { $set: { BirthDate: valueAge } }
      );
    }
    res.json(true);
  } catch (error) {
    console.error("EditUser error:", error.message);
    res.json(false);
  }
});

app.get("/healthz", (req, res) => {
  const dbConnected = collection !== null && collectionP !== null;
  res.json({
    ok: true,
    dbConnected,
    message: dbConnected ? "מסד נתונים מחובר" : "מסד נתונים לא מחובר",
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Generic error handler – catches multer errors, etc.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(400).json({ error: err.message || "שגיאה בבקשה" });
});

init();
