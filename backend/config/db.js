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
    const [rows] = await pool.query('SELECT 1');
    console.log(`MySQLに接続成功（Pool経由）: DB=${process.env.DB_NAME}`);

    // 招待コードカラムの存在確認
    const [columns] = await pool.query("SHOW COLUMNS FROM users LIKE 'invite_code'");
    
    if (columns.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN invite_code VARCHAR(20) UNIQUE");
      console.log('invite_code カラムを新しく追加しました');
    }

    // テーブル一覧の表示（デバッグ用）
    const [tables] = await pool.query('SHOW TABLES');
    console.log('存在するテーブル:', tables.map(t => Object.values(t)[0]));

    console.log('データベースの初期化が完了しました');
  } catch (err) {
    console.error('データベース初期化エラー:', err.message);
  }
};

initializeDatabase();

module.exports = pool;
