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
  
  // 招待コードの状態管理（自動生成）
  const [inviteCode, setInviteCode] = useState('');
  
  // コピー完了の状態
  const [copied, setCopied] = useState(false);

  /**
   * 招待コードを生成する関数
   */
  const generateInviteCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 9; i++) {
      if (i > 0 && i % 3 === 0) {
        code += '-';
      }
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  /**
   * コンポーネントがマウントされたときに招待コードを生成
   */
  useEffect(() => {
    const code = generateInviteCode();
    setInviteCode(code);
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
  const handleComplete = () => {
    console.log('家族グループ作成完了');
    // ホーム画面に遷移
    navigate('/home');
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