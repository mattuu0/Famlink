import React, { useState } from 'react';
import './LoginScreen.css';
import LogoImage from '../assets/titleIcon.png';
import { useNavigate } from 'react-router-dom';

/**
 * LoginScreen (ログイン画面) コンポーネント
 * 役割: ユーザーがメールアドレスとパスワードを入力してログインする画面
 */
const LoginScreen = ({ onLoginSuccess, onGoToRegister }) => {
  // メールアドレスの状態管理
  const [email, setEmail] = useState('');
  
  // パスワードの状態管理
  const [password, setPassword] = useState('');

  // navigate 取得
  const navigate = useNavigate();

  /**
   * ログインボタンがクリックされたときの処理
   */
  const handleLogin = (e) => {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ
    console.log('ログイン:', { email, password });
    
    // 仮のトークンでログイン成功を通知（実際はAPIレスポンスのトークンを使用）
    const dummyToken = 'dummy-auth-token-' + Date.now();
    
    if (onLoginSuccess) {
      onLoginSuccess(dummyToken);
    }
  };

  /**
   * 「パスワードをお忘れの方はこちら」リンクのクリック処理
   */
  const handleForgotPassword = () => {
    console.log('パスワードリセット画面へ遷移');
    // パスワードリセット画面への遷移処理を追加
  };

  /**
   * 「アカウントをお持ちでない方はこちら」リンクのクリック処理
   */
  const handleGoToRegister = () => {
    console.log('新規登録画面へ遷移');
    // AuthScreenに戻ってから新規登録画面へ遷移
    // または直接新規登録画面へ遷移する処理を追加
    // if (onGoToRegister) {
    //   onGotoRegister();
    // }

    navigate("/register");
  };

  return (
    // 画面全体のコンテナ
    <div className="login-container">
      {/* タブレット・PC版の装飾：左上の静止した丸（768px以上で表示） */}
      <div className="login-decoration login-decoration-top-left">
        <div className="login-blob login-blob-1"></div>
        <div className="login-blob login-blob-2"></div>
      </div>

      {/* タブレット・PC版の装飾：右下の静止した丸（768px以上で表示） */}
      <div className="login-decoration login-decoration-bottom-right">
        <div className="login-blob login-blob-3"></div>
        <div className="login-blob login-blob-4"></div>
      </div>

      {/* ログインフォーム全体 */}
      <div className="login-content">
        {/* ロゴエリア */}
        <div className="login-logo-section">
          <div className="login-logo-placeholder">
            {<img src={LogoImage} alt="FamLink Logo" />}
            {/* 上のコメントを外して、srcにロゴ画像のパスを指定してください */}
          </div>
        </div>

        {/* ログインフォーム */}
        <form className="login-form" onSubmit={handleLogin}>
          {/* メールアドレス入力欄 */}
          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              className="login-input"
              placeholder="sample@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* パスワード入力欄 */}
          <div className="login-form-group">
            <div className="login-label-row">
              <label htmlFor="password" className="login-label">
                パスワード
              </label>
              <span className="login-password-hint">
                半角英数と記号を含む6文字以上
              </span>
            </div>
            <input
              type="password"
              id="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* パスワードを忘れた場合のリンク */}
            <button
              type="button"
              className="login-forgot-link"
              onClick={handleForgotPassword}
            >
              パスワードをお忘れの方はこちら
            </button>
          </div>

          {/* ログインボタン */}
          <button type="submit" className="login-submit-button">
            ログイン
          </button>
        </form>

        {/* 新規登録へのリンク */}
        <button
          type="button"
          className="login-register-link"
          onClick={handleGoToRegister}
        >
          アカウントをお持ちでない方はこちら
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;