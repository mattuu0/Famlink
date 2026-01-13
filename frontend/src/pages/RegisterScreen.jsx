import React, { useState } from 'react';
import './RegisterScreen.css';
import LogoImage from '../assets/titleIcon.png';
import { useNavigate } from 'react-router-dom';

/**
 * RegisterScreen (新規登録画面) コンポーネント
 * 役割: ユーザーが新規アカウントを作成する画面
 */
const RegisterScreen = ({ onRegisterSuccess, onBackToAuth }) => {
  // メールアドレスの状態管理
  const [email, setEmail] = useState('');
  
  // パスワードの状態管理
  const [password, setPassword] = useState('');
  
  // パスワード確認の状態管理
  const [confirmPassword, setConfirmPassword] = useState('');

  // navigate 取得
  const navigate = useNavigate();

  /**
   * 新規登録ボタンがクリックされたときの処理
   */
  const handleRegister = (e) => {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ
    
    // パスワードの一致チェック
    if (password !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }
    
    console.log('新規登録:', { email, password });
    
    // 仮のトークンを生成（実際はAPIレスポンスのトークンを使用）
    const dummyToken = 'dummy-auth-token-' + Date.now();
    
    // App.jsxから渡されたonRegisterSuccessを呼ぶ
    // これによりhandleLoginSuccessが実行され、/family-selectに遷移
    if (onRegisterSuccess) {
      onRegisterSuccess(dummyToken);
    }
  };

  /**
   * 「アカウントをお持ちの方はこちら」リンクのクリック処理
   */
  const handleGoToLogin = () => {
    console.log('ログイン画面へ遷移');
    navigate("/login");
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
            <img src={LogoImage} alt="FamLink Logo" />
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
              minLength={6}
            />
          </div>

          {/* パスワード確認入力欄 */}
          <div className="register-form-group">
            <label htmlFor="confirmPassword" className="register-label">
              パスワード（確認）
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="register-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* 新規登録ボタン */}
          <button type="submit" className="register-submit-button">
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