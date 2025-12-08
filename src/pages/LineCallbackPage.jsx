import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LineCallbackPage.css';

/**
 * LineCallbackPage (LINEログインコールバック画面)
 * 役割: LINEログイン後にリダイレクトされる画面
 * 認証コードを受け取り、アクセストークンを取得してログイン処理を完了
 */
const LineCallbackPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    /**
     * LINEログインのコールバック処理
     * URLパラメータから認証コードを取得し、アクセストークンと交換
     */
    const handleLineCallback = async () => {
      try {
        // URLパラメータを取得
        const params = new URLSearchParams(location.search);
        const code = params.get('code'); // 認証コード
        const state = params.get('state'); // CSRF対策用のstate
        const errorParam = params.get('error'); // エラー
        const errorDescription = params.get('error_description');

        // エラーチェック
        if (errorParam) {
          throw new Error(errorDescription || 'LINEログインがキャンセルされました');
        }

        // 認証コードの存在チェック
        if (!code) {
          throw new Error('認証コードが取得できませんでした');
        }

        // stateの検証（CSRF対策）
        const savedState = sessionStorage.getItem('line_login_state');
        if (state !== savedState) {
          throw new Error('不正なリクエストです');
        }

        // セッションストレージをクリーンアップ
        sessionStorage.removeItem('line_login_state');

        // バックエンドAPIにcodeを送信してアクセストークンを取得
        // ※実際の実装では、バックエンドサーバーでトークン交換を行う必要があります
        const response = await fetch('/api/auth/line/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('ログイン処理に失敗しました');
        }

        const data = await response.json();
        const { token, user } = data;

        console.log('LINEログイン成功:', user);

        // ログイン成功をApp.jsxに通知
        if (onLoginSuccess) {
          onLoginSuccess(token);
        } else {
          // onLoginSuccessが渡されていない場合は直接トークンを保存
          localStorage.setItem('authToken', token);
          navigate('/home');
        }
      } catch (err) {
        console.error('LINEログインエラー:', err);
        setError(err.message);
        setIsProcessing(false);
      }
    };

    handleLineCallback();
  }, [location, navigate, onLoginSuccess]);

  /**
   * エラー時に認証画面に戻る処理
   */
  const handleBackToAuth = () => {
    navigate('/auth');
  };

  return (
    <div className="line-callback-container">
      <div className="line-callback-content">
        {isProcessing && !error && (
          <>
            {/* ローディング表示 */}
            <div className="loading-spinner"></div>
            <h2 className="callback-title">LINEログイン処理中...</h2>
            <p className="callback-message">しばらくお待ちください</p>
          </>
        )}

        {error && (
          <>
            {/* エラー表示 */}
            <div className="error-icon">⚠️</div>
            <h2 className="callback-title error">ログインに失敗しました</h2>
            <p className="callback-message error">{error}</p>
            <button className="back-button" onClick={handleBackToAuth}>
              認証画面に戻る
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LineCallbackPage;