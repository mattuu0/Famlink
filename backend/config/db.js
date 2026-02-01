const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * データベース接続プールの設定
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20, // 10 -> 20 に増やす
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  initSql: "SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED" // ロック競合を減らす
});

/**
 * サーバー起動時の初期化処理
 */
const initializeDatabase = async () => {
  try {
    // 接続テスト
    await pool.query('SELECT 1');
    console.log(`MySQLに接続成功: DB=${process.env.DB_NAME}`);

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
        meetup_type VARCHAR(20) NOT NULL,
        time_ranges JSON NOT NULL,
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

    // 6. 既存の users テーブルに invite_code カラムがない場合の補完 (互換性のため)
    const [columns] = await pool.query("SHOW COLUMNS FROM users LIKE 'invite_code'");
    if (columns.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN invite_code VARCHAR(20) UNIQUE");
      console.log('users テーブルに invite_code カラムを追加しました');
    }

    const [messages_user_id] = await pool.query("SHOW COLUMNS FROM messages LIKE 'user_id'");
    if (messages_user_id.length === 0) {
      await pool.query("ALTER TABLE messages ADD COLUMN user_id INT");
      console.log('messages テーブルに user_id カラムを追加しました');
    }

    const [schedules_sender_id] = await pool.query("SHOW COLUMNS FROM schedules LIKE 'sender_id'");
    if (schedules_sender_id.length === 0) {
      await pool.query("ALTER TABLE schedules ADD COLUMN sender_id INT");
      console.log('schedules テーブルに sender_id カラムを追加しました');
    }

    const [schedules_final_schedule] = await pool.query("SHOW COLUMNS FROM schedules LIKE 'final_schedule'");
    if (schedules_final_schedule.length === 0) {
      await pool.query("ALTER TABLE schedules ADD COLUMN final_schedule JSON");
      console.log('schedules テーブルに final_schedule カラムを追加しました');
    }

    // テーブル一覧の表示（デバッグ用）
    const [tables] = await pool.query('SHOW TABLES');
    console.log('稼働中のテーブル:', tables.map(t => Object.values(t)[0]));

    // 登録ユーザー数の確認（データ永続化の確認用）
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`現在の登録ユーザー数: ${userCount[0].count}`);

    console.log('データベースの全ての初期化が完了しました。データは安全に保持されます。');
  } catch (err) {
    console.error('データベース初期化中に致命的なエラーが発生しました:', err.message);
  }
};

initializeDatabase();

module.exports = pool;
