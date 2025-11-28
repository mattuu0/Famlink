import React, { useState, useEffect } from 'react';
import Title from "./pages/Title.jsx";           // アプリ起動時のローディング画面
import HomePage from "./pages/HomePage.jsx";     // 認証済み（ログイン後）のメインコンテンツ
import AuthScreen from "./pages/AuthScreen.jsx"; // 未認証（ログイン前）の画面
import LoginScreen from "./pages/LoginScreen.jsx"; // ログイン画面
import RegisterScreen from "./pages/RegisterScreen.jsx"; // 新規登録画面（後で追加）

function App() {
  // === 状態管理 (State Hooks) ===
  
  // 画面の表示を制御する主要な状態
  const [isLoading, setIsLoading] = useState(true);          // ① 初期ロード・認証チェック中か？
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ② ユーザーはログイン済みか？
  
  // 現在表示する画面を管理
  // 'auth': 初期認証画面（ログイン/新規登録選択）
  // 'login': ログイン画面
  // 'register': 新規登録画面（後で追加）
  const [currentScreen, setCurrentScreen] = useState('auth');

  // === 副作用 (Effect Hook) ===
  // アプリ起動時に一度だけ実行される初期化処理
  useEffect(() => {
    // 1. 認証トークンの確認
    // ブラウザに前回のログイン情報（authToken）が残っているかチェックする
    const userToken = localStorage.getItem('authToken'); 
    
    if (userToken) {
        // トークンがあれば認証済みとみなし、状態を更新する
        setIsAuthenticated(true); 
        // ※ 実際はここでサーバーにトークンの有効性を確認する
    }
    
    // 2. ローディング完了タイマー
    // スプラッシュ/タイトル画面を3秒間表示するための時間差処理
    const timer = setTimeout(() => {
      setIsLoading(false); // 3秒後、ローディングを完了（画面切り替えを許可）
    }, 3000); 

    // クリーンアップ処理
    // コンポーネントが破棄される際にタイマーを確実に解除する
    return () => clearTimeout(timer);
    
  }, []); // [] により、コンポーネントの初回マウント時に一度だけ実行される

  // === 画面遷移ハンドラー ===
  
  /**
   * AuthScreen（ログイン/新規登録選択画面）からログイン画面への遷移
   */
  const handleGoToLogin = () => {
    setCurrentScreen('login');
  };

  /**
   * AuthScreen（ログイン/新規登録選択画面）から新規登録画面への遷移
   */
  const handleGoToRegister = () => {
    setCurrentScreen('register');
  };

  /**
   * ログイン画面から初期画面（AuthScreen）に戻る
   */
  const handleBackToAuth = () => {
    setCurrentScreen('auth');
  };

  /**
   * ログイン成功時の処理
   * @param {string} token - 認証トークン
   */
  const handleLoginSuccess = (token) => {
    // トークンをローカルストレージに保存
    localStorage.setItem('authToken', token);
    // 認証済み状態に変更
    setIsAuthenticated(true);
  };

  /**
   * ログアウト処理
   */
  const handleLogout = () => {
    // トークンを削除
    localStorage.removeItem('authToken');
    // 未認証状態に変更
    setIsAuthenticated(false);
    // 初期画面に戻る
    setCurrentScreen('auth');
  };

  // === 条件付きレンダリング (画面の振り分け) ===

  // 最優先: ローディングが完了するまで Title 画面を表示
  if (isLoading) {
    return <Title />;
  }

  // ローディング完了後: 認証状態に基づいて画面を切り替える
  
  // 1. 認証済みの場合 → ホーム画面を表示
  if (isAuthenticated) {
    return <HomePage onLogout={handleLogout} />;
  }

  // 2. 未認証の場合 → 現在の画面状態に応じて表示を切り替える
  
  // 2-1. ログイン画面
  if (currentScreen === 'login') {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess}
        onBackToAuth={handleBackToAuth}
      />
    );
  }

  // 2-2. 新規登録画面（後で実装）
  if (currentScreen === 'register') {
    RegisterScreenコンポーネントが作成されたらコメントを外す
    return (
      <RegisterScreen 
        onRegisterSuccess={handleLoginSuccess}
        onBackToAuth={handleBackToAuth}
      />
    );
    
  
  }

  // 2-3. 初期画面（ログイン/新規登録選択）
  return (
    <AuthScreen 
      onGoToLogin={handleGoToLogin}
      onGoToRegister={handleGoToRegister}
    />
  );
}

export default App;