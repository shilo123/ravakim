// השתקת אזהרת AWS SDK v2
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";

const express = require("express");
const app = express();
const cors = require("cors");
let mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const bodyParser = require("body-parser");
const fs = require("fs");
const axios = require("axios");
const mailjetModule = require("node-mailjet");
const path = require("path");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const AWS = require("aws-sdk");
const puppeteer = require("puppeteer");
const PORT = process.env.PORT || 3006;

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these environment variables before starting the server.');
  process.exit(1);
}

app.use("/UpFile", express.static("UpFile"));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client")));

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});
const URL = process.env.APP_URL || "https://server-ravakim-10c1effbda77.herokuapp.com";
let collection = null;
(async () => {
  const url = process.env.MONGO_URI;
  const connection = await mongo.connect(url);
  const db = connection.db("Project-ravakim");
  collection = db.collection("Users-Ravakim");
})();
let collectionP = null;
(async () => {
  const url = process.env.MONGO_URI;
  const connection = await mongo.connect(url);
  const db = connection.db("Project-ravakim");

  collectionP = db.collection("potentzial");
})();
function random(min, max) {
  if (min > max) {
    throw new Error("אחי אך המינימלי גדול מהמקמילי אחיי");
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// app.get("/", async (req, res) => {
//   res.json({ stuts: "shcoyeh" });
// });
function GetAge(data) {
  const calculateAge = (obj) => {
    let Age = null;

    if (obj && obj.BirthDate) {
      const birth =
        obj.BirthDate instanceof Date ? obj.BirthDate : new Date(obj.BirthDate);

      if (!isNaN(birth.getTime())) {
        const today = new Date();
        // חישוב גיל עם עשרוניים
        const diffTime = today.getTime() - birth.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        // 365.25 ימים לשנה (כולל שנים מעוברות)
        Age = Math.round((diffDays / 365.25) * 10) / 10; // עיגול לספרה אחת אחרי הנקודה
      }
    }

    return {
      ...obj,
      Age,
    };
  };

  // ✅ אם זה מערך
  if (Array.isArray(data)) {
    return data.map((item) => calculateAge(item));
  }

  // ✅ אם זה אובייקט יחיד
  if (typeof data === "object" && data !== null) {
    return calculateAge(data);
  }

  // ✅ אם הגיע משהו לא צפוי
  return data;
}
function calcAge(birthDate) {
  if (!birthDate) return null;

  const d = new Date(birthDate); // עובד גם על Date וגם על string תקין

  if (isNaN(d.getTime())) return null;

  const today = new Date();
  // חישוב גיל עם עשרוניים
  const diffTime = today.getTime() - d.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  // 365.25 ימים לשנה (כולל שנים מעוברות)
  const age = Math.round((diffDays / 365.25) * 10) / 10; // עיגול לספרה אחת אחרי הנקודה
  return age;
}
function ageToBirthDate(age) {
  if (!age || age < 0) return null;

  const today = new Date();
  const birthYear = today.getFullYear() - age;

  const birthDate = new Date(birthYear, today.getMonth(), today.getDate());

  return birthDate;
}

app.post("/postFilee", upload.single("file"), async (req, res) => {
  const params = {
    Bucket: "dagmusht",
    Key: req.file.originalname,
    Body: req.file.buffer, // גוף הבקשה אמור להכיל את הקובץ עצמו
  };
  s3.upload(params, (err, data) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "שגיאה בהעלאת הקובץ ל-S3.", error: err.message });
    }
    const publicUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    res.send(publicUrl);
  });
});
//
app.post("/ADDForm", async (req, res) => {
  try {
    // req.body.Age = parseInt(req.body.Age);
    await collection.insertOne(req.body);
    res.json(true);
  } catch (error) {
    res.json(false);
  }
});
//
app.get("/GetRavakim", async (req, res) => {
  try {
    let data = await collection.find({}).toArray();

    data = GetAge(data);
    res.json(data);
  } catch (error) {
    res.json(false);
  }
});
app.post("/FilterData", async (req, res) => {
  try {
    let { Name, AgeStart, AgeEnd, Gender, RamaDatit, Address, Status } =
      req.body;

    const ContentQuery = {};

    if (Name && Name.trim() !== "") {
      ContentQuery.Name = { $regex: `^${Name}`, $options: "i" };
    }

    if (RamaDatit && RamaDatit.trim() !== "") {
      ContentQuery.RamaDatit = { $regex: `^${RamaDatit}`, $options: "i" };
    }

    if (Address && Address.trim() !== "") {
      ContentQuery.Address = { $regex: `^${Address}`, $options: "i" };
    }

    if (Gender && Gender.trim() !== "") {
      ContentQuery.Gender = Gender;
    }

    if (Status && Status.trim() !== "") {
      ContentQuery.Status = { $regex: `^${Status}`, $options: "i" };
    }

    // ✅ פה בכוונה אין BirthDate בכלל

    let data = await collection.find(ContentQuery).toArray();

    // ✅ סינון גיל אך ורק בצד שרת
    if (
      AgeStart != null &&
      AgeEnd != null &&
      AgeStart !== "" &&
      AgeEnd !== ""
    ) {
      AgeStart = +AgeStart;
      AgeEnd = +AgeEnd;

      data = data.filter((doc) => {
        const age = calcAge(doc.BirthDate);
        return age != null && age >= AgeStart && age <= AgeEnd;
      });
    }
    data = GetAge(data);

    res.json(data);
  } catch (error) {
    res.json(false);
  }
});
app.get("/GetDetalis/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let data = await collection.find({ _id: new ObjectId(id) }).toArray();
    data = GetAge(data[0]);

    res.json(data);
  } catch (error) {
    res.json(false);
  }
});
app.get("/GetShiduhim", async (req, res) => {
  if (!collection) {
    while (!collection) {}
  }
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
});
app.get("/GetShoduh", async (req, res) => {
  let data = await collectionP
    .aggregate([
      {
        $lookup: {
          from: "Users-Ravakim", // שם הקולקשיין שממנו לצרף
          let: { potentzialIds: "$Potentzial" }, // הגדרת משתנים לשימוש בפייפליין של ה-lookup
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
                  ], // השוואה בין ה-id של המשתמש למערך של ids שהומרו ל-ObjectId
                },
              },
            },
          ],
          as: "Shiduh", // שם השדה שבו יאוחסנו התוצאות
        },
      },
    ])
    .toArray();
  data = GetAge(data);

  res.json(data);
});
app.put("/EditZog", async (req, res) => {
  try {
    const { newPoten, ID } = req.body;
    await collectionP.updateOne(
      {
        _id: new ObjectId(ID),
      },
      {
        $set: { Potentzial: newPoten },
      }
    );

    let data = await collectionP
      .aggregate([
        {
          $lookup: {
            from: "Users-Ravakim", // שם הקולקשיין שממנו לצרף
            let: { potentzialIds: "$Potentzial" }, // הגדרת משתנים לשימוש בפייפליין של ה-lookup
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
                    ], // השוואה בין ה-id של המשתמש למערך של ids שהומרו ל-ObjectId
                  },
                },
              },
            ],
            as: "Shiduh", // שם השדה שבו יאוחסנו התוצאות
          },
        },
      ])
      .toArray();
    data = GetAge(data);

    res.json(data);
  } catch (error) {
    res.json(null);
  }
});
app.post("/InsertShiduh", async (req, res) => {
  try {
    let Potentzial = req.body;
    await collectionP.insertOne({ Potentzial });
    res.json(true);
  } catch (error) {
    res.json(false);
  }
});
app.delete("/DeleteShiduh/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await collectionP.deleteOne({ _id: new ObjectId(id) });
    res.json(true);
  } catch (error) {
    res.json(false);
  }
});
app.post("/AddNoteT", async (req, res) => {
  try {
    const { id, note } = req.body;
    // res.json({ requ: req.body });
    await collectionP.updateOne(
      { _id: new ObjectId(id) },
      { $set: { Note: note } }
    );

    res.json(true);
  } catch (error) {
    res.json(false);
  }
});
app.get("/DeleteUser/:id", async (req, res) => {
  try {
    const ID = req.params.id;
    const result = await collection.deleteOne({ _id: new ObjectId(ID) });
    if (result.deletedCount === 1) {
      let data = await collection.find({}).toArray();
      data = GetAge(data);
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (error) {}
});
app.put("/UpdateNote/:id", async (req, res) => {
  const { id } = req.params;
  const { Note } = req.body;
  // console.log({ id, Note });
  try {
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { Note } });
    res.json(true);
  } catch (error) {
    res.json(false);
  }
  res.json(true);
});
app.put("/EditUser", async (req, res) => {
  const { id, field, value } = req.body;
  try {
    if (field !== "Age") {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { [field]: value } }
      );
    } else {
      let valueAge = ageToBirthDate(value);
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { BirthDate: valueAge } }
      );
    }
    res.json(true);
  } catch (error) {
    res.json(false);
  }
});

// יצירת PDF עם שמות הרווקים באמצעות puppeteer
app.get("/GeneratePDF", async (req, res) => {
  let browser = null;
  try {
    if (!collection) {
      return res.status(500).json({ error: "מסד הנתונים לא מוכן" });
    }

    let data = await collection.find({}).toArray();

    const names = data
      .map((user) => user.Name)
      .filter((name) => name && name.trim());

    if (names.length === 0) {
      return res.status(400).json({ error: "אין שמות להצגה" });
    }

    // יצירת HTML עם עיצוב נחמד
    const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>לזיווג הגון</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Assistant', 'Arial', sans-serif;
      direction: rtl;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 50px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 3px solid #667eea;
    }
    
    .header h1 {
      font-size: 48px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header p {
      font-size: 18px;
      color: #666;
      margin-top: 10px;
    }
    
    .names-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 30px;
    }
    
    .name-item {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      border: 2px solid transparent;
    }
    
    .name-item:hover {
      transform: translateY(-2px);
      border-color: #667eea;
    }
    
    .name-item:nth-child(even) {
      background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
    }
    
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #eee;
      color: #999;
      font-size: 14px;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 30px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📿 לזיווג הגון</h1>
      <p>רשימת שמות לתפילה</p>
    </div>
    <div class="names-grid">
      ${names
        .map(
          (name) => `
        <div class="name-item">${name}</div>
      `
        )
        .join("")}
    </div>
    <div class="footer">
      <p>יהי רצון שכל אחד ואחת ימצאו את זיווגם הגון במהרה</p>
    </div>
  </div>
</body>
</html>
    `;

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // הגדרת CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // הגדרת headers
    res.setHeader("Content-Type", "application/pdf");
    const filename = "לזיווג הגון.pdf";
    const encodedFilename = encodeURIComponent(filename);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodedFilename}`
    );

    // יצירת PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await browser.close();
    browser = null;

    res.send(pdfBuffer);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    if (!res.headersSent) {
      res.status(500).json({
        error: "שגיאה ביצירת PDF",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    } else {
      res.end();
    }
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});
