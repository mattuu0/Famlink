const mysql = require('mysql2');

/**
 * データベース接続プールの設定
 * createPool を使用することで、複数の同時接続を効率的に管理し、
 * 切断時の自動再接続も行われます。
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

// Promiseベースの操作用
const db = pool.promise();

/**
 * サーバー起動時の初期化処理
 */
const initializeDatabase = async () => {
  try {
    // 接続テスト
    await db.query('SELECT 1');
    console.log('MySQLに接続成功（Pool経由）');

    // 招待コードカラムの存在確認
    const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'invite_code'");
    
    if (columns.length === 0) {
      await db.query("ALTER TABLE users ADD COLUMN invite_code VARCHAR(20) UNIQUE");
      console.log('invite_code カラムを新しく追加しました');
    }
    console.log('データベースの初期化が完了しました');
  } catch (err) {
    console.error('データベース初期化エラー:', err.message);
    // 致命的なエラー（DB接続不可など）の場合はプロセスを終了せず、ログを残す
  }
};

initializeDatabase();

module.exports = db;
