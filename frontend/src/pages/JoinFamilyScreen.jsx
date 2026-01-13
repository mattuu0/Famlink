import React, { useState } from 'react';
import './JoinFamilyScreen.css';
import LogoImage from '../assets/titleIcon.png';
import { useNavigate } from 'react-router-dom';

/**
 * JoinFamilyScreen (家族参加画面) コンポーネント
 * 役割: 既存の家族グループに招待コードを入力して参加する画面
 */
const JoinFamilyScreen = () => {
  const navigate = useNavigate();
  
  // 招待コードの状態管理
  const [inviteCode, setInviteCode] = useState('');

  /**
   * 参加ボタンがクリックされたときの処理
   */
  const handleJoin = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem('authToken'); // トークン（email）を取得
    
    try {
      const response = await fetch('http://127.0.0.1:3001/api/families/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          family_id: inviteCode.trim(), 
          email: email 
        })
      });

      if (response.ok) {
        console.log('家族に参加成功');
        // ホーム画面に遷移
        navigate('/home');
      } else {
        const errorData = await response.json();
        alert('参加失敗: ' + (errorData.message || 'コードが正しくありません'));
      }
    } catch (error) {
      console.error('通信エラー:', error);
      alert('サーバーに接続できませんでした');
    }
  };

  /**
   * 戻るボタンがクリックされたときの処理
   */
  const handleGoBack = () => {
    navigate('/family-select');
  };

  return (
    <div className="join-family-container">
      {/* 装飾 */}
      <div className="join-family-decoration join-family-decoration-top-left">
        <div className="join-family-blob join-family-blob-1"></div>
        <div className="join-family-blob join-family-blob-2"></div>
      </div>

      <div className="join-family-decoration join-family-decoration-bottom-right">
        <div className="join-family-blob join-family-blob-3"></div>
        <div className="join-family-blob join-family-blob-4"></div>
      </div>

      {/* コンテンツ */}
      <div className="join-family-content">
        {/* ロゴ */}
        <div className="join-family-logo-section">
          <div className="join-family-logo-placeholder">
            <img src={LogoImage} alt="FamLink Logo" />
          </div>
        </div>

        {/* 説明 */}
        <div className="join-family-description">
          <h2 className="join-family-title">家族に入る</h2>
          <p className="join-family-description-text">
            家族から送られてきた
            <br />
            招待コードを入力してください
          </p>
        </div>

        {/* フォーム */}
        <form className="join-family-form" onSubmit={handleJoin}>
          <div className="join-family-form-group">
            <label htmlFor="inviteCode" className="join-family-label">
              招待コード
            </label>
            <input
              type="text"
              id="inviteCode"
              className="join-family-input"
              placeholder="例: ABC123XYZ"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
          </div>

          {/* 参加ボタン */}
          <button type="submit" className="join-family-submit-button">
            参加する
          </button>
        </form>

        {/* 戻るボタン */}
        <button
          type="button"
          className="join-family-back-link"
          onClick={handleGoBack}
        >
          ← 戻る
        </button>
      </div>
    </div>
  );
};

export default JoinFamilyScreen;