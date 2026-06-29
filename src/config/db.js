import { createPool } from "mysql2/promise";


const isLocal =
  process.env.DB_HOST === "localhost" ||
  process.env.DB_HOST === "127.0.0.1";

const pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: isLocal
    ? false
    : {
      rejectUnauthorized: false,
    },
});

async function connectDB() {
  try {
    const conn = await pool.getConnection();
    console.log("MySQL connected successfully");
    conn.release();
    await createTable();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1);
  }
}

async function createTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS github_profiles (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      username        VARCHAR(100)  NOT NULL UNIQUE,
      name            VARCHAR(200),
      bio             TEXT,
      location        VARCHAR(200),
      email           VARCHAR(200),
      company         VARCHAR(200),
      blog            VARCHAR(500),
      avatar_url      VARCHAR(500),
      profile_url     VARCHAR(500),
      public_repos    INT DEFAULT 0,
      public_gists    INT DEFAULT 0,
      followers       INT DEFAULT 0,
      following       INT DEFAULT 0,
      top_languages   TEXT,
      most_starred_repo VARCHAR(200),
      most_starred_count INT DEFAULT 0,
      total_stars     INT DEFAULT 0,
      total_forks     INT DEFAULT 0,
      account_age_days INT DEFAULT 0,
      hireable        TINYINT(1),
      twitter_handle  VARCHAR(100),
      analyzed_at     TIMESTAMP NULL,
      updated_at      TIMESTAMP NULL
    )
  `;
  await pool.query(sql);
  console.log("Table ready");
}

export { pool, connectDB };
