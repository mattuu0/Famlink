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
  connectionLimit: 10,
  queueLimit: 0
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // 5. 既存の users テーブルに invite_code カラムがない場合の補完 (互換性のため)
    const [columns] = await pool.query("SHOW COLUMNS FROM users LIKE 'invite_code'");
    if (columns.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN invite_code VARCHAR(20) UNIQUE");
      console.log('users テーブルに invite_code カラムを追加しました');
    }

    // テーブル一覧の表示（デバッグ用）
    const [tables] = await pool.query('SHOW TABLES');
    console.log('稼働中のテーブル:', tables.map(t => Object.values(t)[0]));

    console.log('データベースの全ての初期化が完了しました。データは安全に保持されます。');
  } catch (err) {
    console.error('データベース初期化中に致命的なエラーが発生しました:', err.message);
  }
};

initializeDatabase();

module.exports = pool;
