const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const DB_NAME = process.env.DB_NAME || "railway";

/**
 * データベースを作成（存在しない場合）
 */
const createDatabaseIfNotExists = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`✅ データベース '${DB_NAME}' を確認/作成しました`);
  } catch (err) {
    console.error("❌ データベース作成エラー:", err.message);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

/**
 * 接続プールを先に作成
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * サーバー起動時の初期化処理
 */
const initializeDatabase = async () => {
  try {
    // まずデータベースを作成
    await createDatabaseIfNotExists();

    // 接続テスト
    await pool.query("SELECT 1");
    console.log(`✅ MySQLに接続成功: DB=${DB_NAME}`);

    // 1. users テーブルの作成
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        user_name VARCHAR(50),
        family_id VARCHAR(50),
        invite_code VARCHAR(20) UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. families テーブルの作成
    await pool.query(`
      CREATE TABLE IF NOT EXISTS families (
        id INT AUTO_INCREMENT PRIMARY KEY,
        family_id VARCHAR(50) NOT NULL UNIQUE,
        family_name VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. messages テーブルの作成
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(50),
        emotion VARCHAR(20),
        comment TEXT,
        family_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. schedules テーブルの作成
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        family_id VARCHAR(50) NOT NULL,
        sender_name VARCHAR(50) NOT NULL,
        sender_id INT,
        meetup_type VARCHAR(20) NOT NULL,
        time_ranges JSON NOT NULL,
        final_schedule JSON,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. schedule_responses テーブルの作成
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedule_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        schedule_id INT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(50),
        selected_time_slots JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_response (schedule_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // テーブル一覧の表示（デバッグ用）
    const [tables] = await pool.query("SHOW TABLES");
    console.log(
      "✅ 稼働中のテーブル:",
      tables.map((t) => Object.values(t)[0]),
    );

    // 登録ユーザー数の確認（データ永続化の確認用）
    const [userCount] = await pool.query("SELECT COUNT(*) as count FROM users");
    console.log(`📊 現在の登録ユーザー数: ${userCount[0].count}`);

    console.log(
      "🎉 データベースの全ての初期化が完了しました。データは安全に保持されます。",
    );
  } catch (err) {
    console.error(
      "❌ データベース初期化中に致命的なエラーが発生しました:",
      err.message,
    );
    console.error(err);
    process.exit(1);
  }
};

initializeDatabase();

module.exports = pool;