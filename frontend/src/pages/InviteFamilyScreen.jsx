import React, { useState, useEffect } from 'react';
import './InviteFamilyScreen.css';
import LogoImage from '../assets/titleIcon.png';
import { useNavigate } from 'react-router-dom';

/**
 * InviteFamilyScreen (家族招待画面) コンポーネント
 * 役割: 新しい家族グループを作成して招待コードを発行し、
 * 家族メンバーを招待する画面
 */
const InviteFamilyScreen = () => {
  const navigate = useNavigate();
  
  // 招待コードの状態管理
  const [inviteCode, setInviteCode] = useState('');
  
  // コピー完了の状態
  const [copied, setCopied] = useState(false);

  /**
   * コンポーネントがマウントされたときに招待コードを読み込む
   */
  useEffect(() => {
    // localStorage から保存済みの招待コードを取得
    const savedCode = localStorage.getItem('inviteCode');
    if (savedCode) {
      setInviteCode(savedCode);
    } else {
      // 招待コードがない場合はユーザー情報を再取得するなどの対応が可能
      console.warn('招待コードが見つかりません');
    }
  }, []);

  /**
   * 招待コードをコピーする処理
   */
  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    
    // 2秒後にコピー完了表示を消す
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  /**
   * 完了ボタンがクリックされたときの処理
   */
  const handleComplete = async () => {
    const email = localStorage.getItem('authToken'); // トークン（email）を取得
    
    try {
      const response = await fetch('http://127.0.0.1:3001/api/families/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          family_id: inviteCode, 
          family_name: '我が家', 
          email: email 
        })
      });

      if (response.ok) {
        console.log('家族グループ作成完了');
        // ホーム画面に遷移
        navigate('/home');
      } else {
        const errorData = await response.json();
        alert('作成失敗: ' + (errorData.message || 'サーバーエラー'));
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
    <div className="invite-family-container">
      {/* 装飾 */}
      <div className="invite-family-decoration invite-family-decoration-top-left">
        <div className="invite-family-blob invite-family-blob-1"></div>
        <div className="invite-family-blob invite-family-blob-2"></div>
      </div>

      <div className="invite-family-decoration invite-family-decoration-bottom-right">
        <div className="invite-family-blob invite-family-blob-3"></div>
        <div className="invite-family-blob invite-family-blob-4"></div>
      </div>

      {/* コンテンツ */}
      <div className="invite-family-content">
        {/* ロゴ */}
        <div className="invite-family-logo-section">
          <div className="invite-family-logo-placeholder">
            <img src={LogoImage} alt="FamLink Logo" />
          </div>
        </div>

        {/* 説明 */}
        <div className="invite-family-description">
          <h2 className="invite-family-title">家族を招待する</h2>
          <p className="invite-family-description-text">
            この招待コードを家族に
            <br />
            共有してください
          </p>
        </div>

        {/* 招待コード表示 */}
        <div className="invite-code-section">
          <div className="invite-code-display">
            <span className="invite-code-text">{inviteCode}</span>
          </div>
          
          {/* コピーボタン */}
          <button
            type="button"
            className={`copy-button ${copied ? 'copied' : ''}`}
            onClick={handleCopyCode}
          >
            {copied ? 'コピーしました！' : 'コピーする'}
          </button>
        </div>

        {/* 完了ボタン */}
        <button
          type="button"
          className="invite-family-complete-button"
          onClick={handleComplete}
        >
          完了
        </button>

        {/* 戻るボタン */}
        <button
          type="button"
          className="invite-family-back-link"
          onClick={handleGoBack}
        >
          ← 戻る
        </button>
      </div>
    </div>
  );
};

export default InviteFamilyScreen;