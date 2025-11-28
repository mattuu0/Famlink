import React, { useState } from 'react';
import './RegisterScreen.css';

/**
 * RegisterScreen (新規登録画面) コンポーネント
 * 役割: ユーザーがメールアドレスとパスワードを入力して新規登録する画面
 */
const RegisterScreen = () => {
  // メールアドレスの状態管理
  const [email, setEmail] = useState('');
  
  // パスワードの状態管理
  const [password, setPassword] = useState('');
  
  // 利用規約とプライバシーポリシーへの同意状態
  const [isAgreed, setIsAgreed] = useState(false);

  /**
   * 新規登録ボタンがクリックされたときの処理
   * TODO: 実際の新規登録処理を実装
   */
  const handleRegister = (e) => {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ
    
    if (!isAgreed) {
      alert('利用規約とプライバシーポリシーに同意してください');
      return;
    }
    
    console.log('新規登録:', { email, password, isAgreed });
    // ここに実際の新規登録処理を追加
  };

  /**
   * 「アカウントをお持ちの方はこちら」リンクのクリック処理
   */
  const handleGoToLogin = () => {
    console.log('ログイン画面へ遷移');
    // ログイン画面への遷移処理を追加
  };

  return (
    // 画面全体のコンテナ
    <div className="register-container">
      {/* タブレット・PC版の装飾：左上の静止した丸（768px以上で表示） */}
      <div className="register-decoration register-decoration-top-left">
        <div className="register-blob register-blob-1"></div>
        <div className="register-blob register-blob-2"></div>
      </div>

      {/* タブレット・PC版の装飾：右下の静止した丸（768px以上で表示） */}
      <div className="register-decoration register-decoration-bottom-right">
        <div className="register-blob register-blob-3"></div>
        <div className="register-blob register-blob-4"></div>
      </div>

      {/* 新規登録フォーム全体 */}
      <div className="register-content">
        {/* ロゴエリア */}
        <div className="register-logo-section">
          <div className="register-logo-placeholder">
            {/* <img src="/path/to/your/logo.png" alt="FamLink Logo" /> */}
            {/* 上のコメントを外して、srcにロゴ画像のパスを指定してください */}
          </div>
        </div>

        {/* 新規登録フォーム */}
        <form className="register-form" onSubmit={handleRegister}>
          {/* メールアドレス入力欄 */}
          <div className="register-form-group">
            <label htmlFor="email" className="register-label">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              className="register-input"
              placeholder="sample@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* パスワード入力欄 */}
          <div className="register-form-group">
            <div className="register-label-row">
              <label htmlFor="password" className="register-label">
                パスワード
              </label>
              <span className="register-password-hint">
                半角英数と記号を含む6文字以上
              </span>
            </div>
            <input
              type="password"
              id="password"
              className="register-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* 利用規約とプライバシーポリシーへの同意チェックボックス */}
          <div className="register-checkbox-group">
            <label className="register-checkbox-label">
              <input
                type="checkbox"
                className="register-checkbox-input"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
              />
              <span className={`register-checkbox-custom ${isAgreed ? 'checked' : ''}`}>
                {isAgreed && (
                  <svg className="register-checkbox-icon" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
                  </svg>
                )}
              </span>
              <span className="register-checkbox-text">
                利用規約とプライバシーポリシーに同意します
              </span>
            </label>
          </div>

          {/* 新規登録ボタン（同意していない場合は無効化） */}
          <button
            type="submit"
            className={`register-submit-button ${isAgreed ? 'active' : 'disabled'}`}
            disabled={!isAgreed}
          >
            新規登録
          </button>
        </form>

        {/* ログインへのリンク */}
        <button
          type="button"
          className="register-login-link"
          onClick={handleGoToLogin}
        >
          アカウントをお持ちの方はこちら
        </button>
      </div>
    </div>
  );
};

export default RegisterScreen;