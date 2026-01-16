import React, {useState, useEffect} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Title from "./pages/Title.jsx"; // アプリ起動時のローディング画面
import HomePage from "./pages/HomePage.jsx"; // 認証済み（ログイン後）のメインコンテンツ
import AuthScreen from "./pages/AuthScreen.jsx"; // 未認証（ログイン前）の画面
import LoginScreen from "./pages/LoginScreen.jsx"; // ログイン画面
import RegisterScreen from "./pages/RegisterScreen.jsx"; // 新規登録画面
import FamilySelectScreen from "./pages/FamilyselectScreen.jsx"; // 家族選択画面（修正）
import JoinFamilyScreen from "./pages/JoinFamilyScreen.jsx"; // 家族参加画面
import InviteFamilyScreen from "./pages/InviteFamilyScreen.jsx"; // 家族招待画面
import MeetupPage from "./pages/MeetupPage.jsx"; // 会いたい画面
import SchedulePage from "./pages/SchedulePage.jsx"; // 日程調整画面
import ConfirmationPage from "./pages/ConfirmationPage.jsx"; // 確認画面
import CompletePage from "./pages/CompletePage.jsx"; // 送信完了画面
import LineCallbackPage from "./pages/LineCallbackPage.jsx"; // LINEログインコールバック画面

// === プライベートルート（認証必須のルート） ===
/**
 * 認証が必要なページを保護するコンポーネント
 * 未認証の場合は自動的に初期画面にリダイレクト
 */
function PrivateRoute({children, isAuthenticated, isLoading}) {
  if (isLoading) {
    return <Title />;
  }
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

// === パブリックルート（未認証専用のルート） ===
/**
 * 未認証時のみアクセス可能なページ
 * 既にログイン済みの場合はホームにリダイレクト
 */
function PublicRoute({children, isAuthenticated, isLoading}) {
  if (isLoading) {
    return <Title />;
  }
  return !isAuthenticated ? children : <Navigate to="/home" replace />;
}

// === メインアプリケーションロジック ===
function AppContent() {
  const navigate = useNavigate();

  // === 状態管理 (State Hooks) ===

  // 画面の表示を制御する主要な状態
  const [isLoading, setIsLoading] = useState(true); // ① 初期ロード・認証チェック中か?
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ② ユーザーはログイン済みか?

  // === 副作用 (Effect Hook) ===
  // アプリ起動時に一度だけ実行される初期化処理
  useEffect(() => {
    // 1. 認証トークンの確認
    // ローカルストレージにトークンがあればログイン済みとする
    const userToken = localStorage.getItem('authToken');
    if (userToken) {
        setIsAuthenticated(true);
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
    navigate("/login");
  };

  /**
   * AuthScreen（ログイン/新規登録選択画面）から新規登録画面への遷移
   */
  const handleGoToRegister = () => {
    navigate("/register");
  };

  /**
   * ログイン画面から初期画面（AuthScreen）に戻る
   */
  const handleBackToAuth = () => {
    navigate("/auth");
  };

  /**
   * ログイン成功時の処理
   * @param {string} token - 認証トークン
   * @param {string} inviteCode - 招待コード
   * @param {string} familyId - 家族ID
   */
  const handleLoginSuccess = (token, inviteCode, familyId) => {
    console.log('handleLoginSuccess called with token:', token, 'inviteCode:', inviteCode, 'familyId:', familyId);
    // トークンと招待コード、家族IDをローカルストレージに保存
    localStorage.setItem("authToken", token);
    if (inviteCode) {
      localStorage.setItem("inviteCode", inviteCode);
    }
    if (familyId) {
      localStorage.setItem("familyId", familyId);
    }
    // 認証済み状態に変更
    setIsAuthenticated(true);
    
    // すでに家族に所属している場合はホームへ、そうでない場合は家族選択画面へ
    if (familyId) {
      console.log('Navigating to /home');
      navigate("/home");
    } else {
      console.log('Navigating to /family-select');
      navigate("/family-select");
    }
  };

  /**
   * ログアウト処理
   */
  const handleLogout = () => {
    // トークンを削除
    localStorage.removeItem("authToken");
    // 未認証状態に変更
    setIsAuthenticated(false);
    // 初期画面に遷移
    navigate("/auth");
  };

  // === ルーティング設定 ===
  return (
    <Routes>
      {/* デフォルトルート: 認証状態に応じて適切な画面にリダイレクト */}
      <Route
        path="/"
        element={
          isLoading ? (
            <Title />
          ) : isAuthenticated ? (
            // 認証済みの場合、localStorage の familyId をチェック
            localStorage.getItem('familyId') ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/family-select" replace />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      {/* ホーム画面（認証必須） */}
      <Route
        path="/home"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <HomePage onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      {/* 初期画面（ログイン/新規登録選択） */}
      <Route
        path="/auth"
        element={
          <PublicRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <AuthScreen
              onGoToLogin={handleGoToLogin}
              onGoToRegister={handleGoToRegister}
            />
          </PublicRoute>
        }
      />

      {/* ログイン画面 */}
      <Route
        path="/login"
        element={
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={handleGoToRegister}
          />
        }
      />

      {/* 新規登録画面 */}
      <Route
        path="/register"
        element={
          <RegisterScreen
            onRegisterSuccess={handleLoginSuccess}
            onBackToAuth={handleBackToAuth}
          />
        }
      />

      {/* 家族選択画面（ログイン/新規登録後）★新規追加★ */}
      <Route
        path="/family-select"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <FamilySelectScreen />
          </PrivateRoute>
        }
      />

      {/* 既存の家族に参加する画面★新規追加★ */}
      <Route
        path="/join-family"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <JoinFamilyScreen />
          </PrivateRoute>
        }
      />

      {/* 家族を招待する画面★新規追加★ */}
      <Route
        path="/invite-family"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <InviteFamilyScreen />
          </PrivateRoute>
        }
      />

      {/* 会いたい画面（認証必須） */}
      <Route
        path="/meetup"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <MeetupPage />
          </PrivateRoute>
        }
      />

      {/* 日程調整画面（認証必須） */}
      <Route
        path="/schedule"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <SchedulePage />
          </PrivateRoute>
        }
      />

      {/* 確認画面（認証必須） */}
      <Route
        path="/confirmation"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <ConfirmationPage />
          </PrivateRoute>
        }
      />

      {/* 送信完了画面（認証必須） */}
      <Route
        path="/complete"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <CompletePage />
          </PrivateRoute>
        }
      />

      {/* LINEログインコールバック画面（認証不要） */}
      <Route
        path="/line-callback"
        element={
          <LineCallbackPage onLoginSuccess={handleLoginSuccess} />
        }
      />

      {/* 404: 存在しないパスは初期画面にリダイレクト */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// === Appコンポーネント（Routerでラップ） ===
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;