import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import pg from "pg";
import bcrypt from "bcrypt";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const saltRounds = 11;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "project",
  password: "admin123",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
  secret: "1111_ABCD",
  resave: false,
  saveUninitialized: false,
}));

function requiredLogin(req, res, next) {
  if (req.session.userId) next();
  else res.redirect("/login");
}

function requiredAdmin(req, res, next) {
  if (req.session.adminId) next();
  else res.redirect("/admin");
}

app.get("/", (req, res) => {
  res.render("index", { user: req.session.username });
});

app.get("/register", (req, res) => {
  res.render("register", { error: null, user: req.session.username });
});

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const existing = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.render("register", { error: "⚠️ Username already taken.", user: null });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    await db.query("INSERT INTO users(username, password) VALUES ($1, $2)", [username, hash]);
    res.redirect("/login"); 

  } catch (err) {
    console.error("Registration Error:", err.message);
    res.render("register", { error: "Internal DB error occurred.", user: null });
  }
});

app.get("/login", (req, res) => {
  res.render("login", { error: null, user: req.session.username });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length > 0 && await bcrypt.compare(password, result.rows[0].password)) {
      req.session.userId = result.rows[0].id;
      req.session.username = result.rows[0].username;
      res.redirect("/vote");
    } else {
      res.render("login", { error: "Wrong username or password!", user: null });
    }
  } catch (err) {
    console.error("Login Error:", err.message);
    res.render("login", { error: "Internal Server Error", user: null });
  }
});

app.get("/vote", requiredLogin, async (req, res) => {
  try {
    const feedback = await db.query("SELECT * FROM feedback WHERE user_id = $1", [req.session.userId]);
    res.render("vote", {
      username: req.session.username,
      user: req.session.username,
      feedback: feedback.rows
    });
  } catch (err) {
    console.error("GET /vote error:", err.message);
    res.render("message", { message: "Something went wrong loading the vote page.", user: req.session.username });
  }
});

app.post("/vote", requiredLogin, async (req, res) => {
  try {
    let { type, name, rating, feedback } = req.body;

    type = [].concat(type);
    name = [].concat(name);
    rating = [].concat(rating);
    feedback = [].concat(feedback);

    await db.query("DELETE FROM feedback WHERE user_id = $1", [req.session.userId]);

    for (let i = 0; i < type.length; i++) {
      if (!type[i] || !name[i] || !rating[i] || !feedback[i]) continue;

      await db.query(
        "INSERT INTO feedback (user_id, type, name, rating, feedback) VALUES ($1, $2, $3, $4, $5)",
        [req.session.userId, type[i], name[i], rating[i], feedback[i]]
      );
    }

    res.render("message", {
      message: "✅ Feedback submitted successfully!",
      user: req.session.username
    });
  } catch (err) {
    console.error("POST /vote error:", err.message);
    res.render("message", {
      message: "❌ Error submitting feedback.",
      user: req.session.username
    });
  }
});

app.post("/reset", requiredLogin, async (req, res) => {
  try {
    await db.query("DELETE FROM feedback WHERE user_id = $1", [req.session.userId]);
    res.redirect("/vote");
  } catch (err) {
    console.error("POST /reset error:", err.message);
    res.render("message", { message: "Couldn't reset feedback.", user: req.session.username });
  }
});

app.post("/remove", requiredLogin, async (req, res) => {
  try {
    await db.query("DELETE FROM feedback WHERE user_id = $1", [req.session.userId]);
    res.redirect("/vote");
  } catch (err) {
    console.error("POST /remove error:", err.message);
    res.render("message", { message: "Couldn't remove feedback.", user: req.session.username });
  }
});

app.get("/download", requiredLogin, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM feedback WHERE user_id = $1", [req.session.userId]);
    if (result.rows.length === 0) {
      return res.render("message", { message: "No feedback found, Try Again", user: req.session.username });
    }

    let content = `Username: ${req.session.username}\n\n`;
    result.rows.forEach((row, i) => {
      content += `[${i + 1}] ${row.type.toUpperCase()}\nName: ${row.name}\nRating: ${row.rating}\nFeedback: ${row.feedback}\n\n`;
    });

    const filePath = path.join(__dirname, "public", `${req.session.username}_feedback.txt`);
    fs.writeFileSync(filePath, content);
    res.download(filePath);
  } catch (err) {
    console.error("GET /download error:", err.message);
    res.render("message", { message: "Error generating download file.", user: req.session.username });
  }
});

app.get("/admin", (req, res) => {
  res.render("admin-login", { error: null, user: null });
});

app.post("/admin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM admins WHERE username = $1", [username]);
    if (result.rows.length > 0 && await bcrypt.compare(password, result.rows[0].password)) {
      req.session.adminId = result.rows[0].id;
      req.session.adminName = result.rows[0].username;
      res.redirect("/admin/dashboard");
    } else {
      res.render("message", { message: "Skill Issue, Try again.", user: null });
    }
  } catch (err) {
    console.error("POST /admin error:", err.message);
    res.render("message", { message: "Internal error during admin login.", user: null });
  }
});

app.get("/admin-register", (req, res) => {
  res.render("admin-register", { error: null });
});

app.post("/admin-register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await db.query("SELECT * FROM admins WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.render("admin-register", { error: "Admin already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.query("INSERT INTO admins (username, password) VALUES ($1, $2)", [username, hashedPassword]);
    res.redirect("/admin");
  } catch (err) {
    console.error("Admin Registration Error:", err.message);
    res.render("admin-register", { error: "Registration failed. Try again." });
  }
});

app.get("/admin/dashboard", requiredAdmin, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM feedback");
    res.render("admin-dashboard", { feedback: result.rows, admin: req.session.adminName, user: null  });
  } catch (err) {
    console.error("GET /admin/dashboard error:", err.message);
    res.render("message", { message: "Couldn't load admin dashboard.", user: null });
  }
});

app.get("/admin/download", requiredAdmin, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM feedback");
    let content = "";

    result.rows.forEach((row, i) => {
      content += `User ID: ${row.user_id}\nType: ${row.type}\nName: ${row.name}\nRating: ${row.rating}\nFeedback: ${row.feedback}\n\n`;
    });

    const filePath = path.join(__dirname, "public", "all_feedback.txt");
    fs.writeFileSync(filePath, content);
    res.download(filePath);
  } catch (err) {
    console.error("Admin download error:", err.message);
    res.render("message", { message: "Error downloading admin data.", user: null });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Logout error:", err);
    }
    res.redirect("/");
  });
});
const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log("IT WORKS!");
});
