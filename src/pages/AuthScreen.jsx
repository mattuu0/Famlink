import React from 'react';
import './AuthScreen.css';
import LogoImage from '../assets/titleIcon.png';
import LineIcon from '../assets/line-icon.png'; // LINEアイコン画像

/**
 * AuthScreen (認証画面) コンポーネント
 * 役割: ユーザーがアプリケーションの利用を開始するための、
 * ログインまたは新規登録の選択肢を提供する画面です。
 */
const AuthScreen = ({ onGoToLogin, onGoToRegister }) => {
  /**
   * ログインボタンがクリックされたときの処理
   */
  const handleLogin = () => {
    console.log('ログインボタンがクリックされました');
    // App.jsxに定義された画面遷移関数を呼び出す
    if (onGoToLogin) {
      onGoToLogin();
    }
  };

  /**
   * 新規登録ボタンがクリックされたときの処理
   */
  const handleRegister = () => {
    console.log('新規登録ボタンがクリックされました');
    // App.jsxに定義された画面遷移関数を呼び出す
    if (onGoToRegister) {
      onGoToRegister();
    }
  };

  /**
   * LINEログインボタンがクリックされたときの処理
   * LINE OAuth 2.0を使用したログイン処理
   */
  const handleLineLogin = () => {
    console.log('LINEログインボタンがクリックされました');
    
    // LINE Login設定（実際の値に置き換えてください）
    const LINE_CLIENT_ID = '2008651452'; // LINE Developersで取得したChannel ID
    const REDIRECT_URI = encodeURIComponent(window.location.origin + '/line-callback'); // コールバックURL
    const STATE = Math.random().toString(36).substring(7); // CSRF対策用のランダムな文字列
    const NONCE = Math.random().toString(36).substring(7); // リプレイ攻撃対策用
    
    // stateをセッションストレージに保存（検証用）
    sessionStorage.setItem('line_login_state', STATE);
    
    // LINE Login URL（Web Login）
    const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
      `response_type=code&` +
      `client_id=${LINE_CLIENT_ID}&` +
      `redirect_uri=${REDIRECT_URI}&` +
      `state=${STATE}&` +
      `scope=profile%20openid%20email&` +
      `nonce=${NONCE}`;
    
    // LINEログイン画面へリダイレクト
    window.location.href = lineLoginUrl;
  };

  return (
    // 画面全体のコンテナ
    <div className="auth-container">
      {/* タブレット・PC版の装飾：左上の静止した丸（768px以上で表示） */}
      <div className="auth-decoration auth-decoration-top-left">
        <div className="auth-blob auth-blob-1"></div>
        <div className="auth-blob auth-blob-2"></div>
      </div>

      {/* タブレット・PC版の装飾：右下の静止した丸（768px以上で表示） */}
      <div className="auth-decoration auth-decoration-bottom-right">
        <div className="auth-blob auth-blob-3"></div>
        <div className="auth-blob auth-blob-4"></div>
      </div>

      {/* ロゴエリア：ロゴ画像を配置する場所 */}
      <div className="logo-section">
        {/* ロゴ画像のプレースホルダー */}
        <div className="logo-placeholder">
          {<img src={LogoImage} alt="FamLink Logo" />}
        </div>
      </div>

      {/* ボタンエリア：ログイン、新規登録、LINEログインのボタンを配置 */}
      <div className="button-section">
        {/* ログインボタン：枠線のみのデザイン */}
        <button 
          className="auth-button login-button"
          onClick={handleLogin}
        >
          ログイン
        </button>

        {/* 新規登録ボタン：塗りつぶしのデザイン */}
        <button 
          className="auth-button register-button"
          onClick={handleRegister}
        >
          新規登録
        </button>

        {/* LINEログインボタン：LINEカラーの緑 */}
        <button 
          className="auth-button line-login-button"
          onClick={handleLineLogin}
        >
          <span className="line-icon-wrapper">
            <img src={LineIcon} alt="LINE" className="line-icon-image" />
          </span>
          LINEでログイン
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;