/* מיגרציה חד-פעמית: MongoDB + S3  ->  Neon Postgres + Vercel Blob.
   הרצה:  node scripts/migrate.js
   דורש: server/.env (MONGO_URI) + .env.local (DATABASE_URL, BLOB_READ_WRITE_TOKEN) */
const fs = require("fs");
const path = require("path");

// ה-DNS המקומי במכונה הזו לא פותר את הדומיינים של Atlas – עוקפים עם Google DNS
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const resolver = new dns.promises.Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);
const origLookup = dns.lookup.bind(dns);
dns.lookup = (hostname, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  resolver
    .resolve4(hostname)
    .then((addrs) => {
      if (!addrs.length) throw new Error("empty");
      if (options && options.all) {
        callback(null, addrs.map((address) => ({ address, family: 4 })));
      } else {
        callback(null, addrs[0], 4);
      }
    })
    .catch(() => origLookup(hostname, options, callback));
};

function loadEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
  return out;
}

const serverEnv = loadEnv(path.join(__dirname, "..", "server", ".env"));
const localEnv = loadEnv(path.join(__dirname, "..", ".env.local"));

const MONGO_URI = serverEnv.MONGO_URI;
const DATABASE_URL = localEnv.DATABASE_URL;
const BLOB_TOKEN = localEnv.BLOB_READ_WRITE_TOKEN;

if (!MONGO_URI || !DATABASE_URL || !BLOB_TOKEN) {
  console.error("חסרים משתני סביבה:", {
    MONGO_URI: !!MONGO_URI,
    DATABASE_URL: !!DATABASE_URL,
    BLOB_TOKEN: !!BLOB_TOKEN,
  });
  process.exit(1);
}

const { MongoClient } = require(path.join(
  __dirname,
  "..",
  "server",
  "node_modules",
  "mongodb"
));
const { neon } = require("@neondatabase/serverless");
const { put } = require("@vercel/blob");

const sql = neon(DATABASE_URL);

async function migrateFile(url, folder) {
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) return url;
  if (url.includes("blob.vercel-storage.com")) return url; // כבר הועבר
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || undefined;
    const base = decodeURIComponent(url.split("/").pop() || "file").replace(
      /[^\w.\-]+/g,
      "_"
    );
    const blob = await put(`${folder}/${base}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: true,
      token: BLOB_TOKEN,
    });
    console.log(`  📦 ${url.slice(0, 70)}... -> ${blob.url.slice(0, 70)}...`);
    return blob.url;
  } catch (err) {
    console.warn(`  ⚠️ לא הצלחתי להעביר קובץ (${err.message}) - נשאר URL ישן: ${url}`);
    return url;
  }
}

async function main() {
  console.log("🔄 מתחבר ל-MongoDB...");
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("Project-ravakim");
  const users = await db.collection("Users-Ravakim").find({}).toArray();
  const shiduchim = await db.collection("potentzial").find({}).toArray();
  console.log(`✅ נמצאו ${users.length} משתמשים ו-${shiduchim.length} שידוכים`);

  console.log("🔄 מכין טבלאות ב-Postgres...");
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

  let done = 0;
  for (const doc of users) {
    const id = String(doc._id);
    const data = { ...doc };
    delete data._id;
    delete data.Age;

    console.log(`👤 (${++done}/${users.length}) ${data.Name || id}`);
    data.picURL = await migrateFile(data.picURL, "images");
    data.videoURL = await migrateFile(data.videoURL, "videos");
    if (data.BirthDate instanceof Date) {
      data.BirthDate = data.BirthDate.toISOString();
    }

    await sql`
      INSERT INTO users (id, data) VALUES (${id}, ${JSON.stringify(data)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
  }

  for (const doc of shiduchim) {
    const id = String(doc._id);
    const poten = (Array.isArray(doc.Potentzial) ? doc.Potentzial : []).map(
      String
    );
    await sql`
      INSERT INTO shiduchim (id, potentzial, note)
      VALUES (${id}, ${JSON.stringify(poten)}::jsonb, ${doc.Note || null})
      ON CONFLICT (id) DO UPDATE
      SET potentzial = EXCLUDED.potentzial, note = EXCLUDED.note`;
  }

  const [{ count: uCount }] = await sql`SELECT count(*)::int AS count FROM users`;
  const [{ count: sCount }] =
    await sql`SELECT count(*)::int AS count FROM shiduchim`;
  console.log(`\n🎉 סיום! ב-Postgres יש כעת ${uCount} משתמשים ו-${sCount} שידוכים`);

  await client.close();
}

main().catch((err) => {
  console.error("❌ שגיאת מיגרציה:", err);
  process.exit(1);
});
