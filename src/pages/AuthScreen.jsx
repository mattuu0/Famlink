import React from 'react';
import './AuthScreen.css';
import LogoImage from '../assets/titleIcon.png';

/**
 * AuthScreen (認証画面) コンポーネント
 * 役割: ユーザーがアプリケーションの利用を開始するための、
 * ログインまたは新規登録の選択肢を提供する画面です。
 */
const AuthScreen = () => {
  /**
   * ログインボタンがクリックされたときの処理
   * TODO: 実際のログイン処理を実装
   */
  const handleLogin = () => {
    console.log('ログインボタンがクリックされました');
    // ここにログイン処理を追加
  };

  /**
   * 新規登録ボタンがクリックされたときの処理
   * TODO: 実際の新規登録処理を実装
   */
  const handleRegister = () => {
    console.log('新規登録ボタンがクリックされました');
    // ここに新規登録処理を追加
  };

  return (
    // 画面全体のコンテナ
    <div className="auth-container">
      {/* ロゴエリア：ロゴ画像を配置する場所 */}
      <div className="logo-section">
        {/* ロゴ画像のプレースホルダー */}
        <div className="logo-placeholder">
          { <img src={LogoImage} alt="FamLink Logo" />}
          {/* 上のコメントを外して、srcにロゴ画像のパスを指定してください */}
        </div>
        
      </div>

      {/* ボタンエリア：ログインと新規登録のボタンを配置 */}
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
      </div>
    </div>
  );
};

export default AuthScreen;